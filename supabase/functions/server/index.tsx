import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Storage bucket name
const BUCKET_NAME = 'make-1380c61f-products';
const ORDER_STATUSES = new Set(['pending', 'processing', 'completed', 'cancelled']);
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Initialize storage bucket
async function initStorage() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: false });
      console.log('Storage bucket created:', BUCKET_NAME);
    }
  } catch (error) {
    console.log('Storage initialization error:', error);
  }
}
initStorage();

function getBearerToken(c: any) {
  return c.req.header('Authorization')?.split(' ')[1] || '';
}

function isAdmin(user: any) {
  return user?.user_metadata?.role === 'admin';
}

function isCustomer(user: any) {
  return user?.user_metadata?.account_type === 'customer' && !isAdmin(user);
}

async function authorize(c: any, role: 'admin' | 'customer') {
  const accessToken = getBearerToken(c);

  if (!accessToken) {
    return { response: c.json({ error: 'Unauthorized' }, 401) };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return { response: c.json({ error: 'Unauthorized' }, 401) };
  }

  if (role === 'admin' && !isAdmin(user)) {
    return { response: c.json({ error: 'Admin access required' }, 403) };
  }

  if (role === 'customer' && !isCustomer(user)) {
    return { response: c.json({ error: 'Customer access required' }, 403) };
  }

  return { user };
}

function sanitizeText(value: unknown, fieldName: string, maxLength = 500) {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} is required`);
  }

  const sanitized = value.trim();
  if (!sanitized) {
    throw new Error(`${fieldName} is required`);
  }

  if (sanitized.length > maxLength) {
    throw new Error(`${fieldName} is too long`);
  }

  return sanitized;
}

function sanitizeOptionalUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }

  const sanitized = value.trim();

  try {
    new URL(sanitized);
    return sanitized;
  } catch {
    throw new Error('Invalid URL provided');
  }
}

function parsePositivePrice(value: unknown, fieldName: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }

  return Number(parsed.toFixed(2));
}

function parseBoolean(value: unknown) {
  return value === true;
}

function getImageExtension(file: File) {
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  if (file.type === 'image/gif') return 'gif';
  return 'jpg';
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-1380c61f/health", (c) => {
  return c.json({ status: "ok" });
});

// ============ AUTH ROUTES ============

// Admin signup
app.post("/make-server-1380c61f/auth/signup", async (c) => {
  return c.json(
    {
      error:
        'Admin self-signup is disabled. Create admin users through a trusted internal process only.',
    },
    403,
  );
});

// Get current user
app.get("/make-server-1380c61f/auth/me", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    return c.json({ user });
  } catch (error) {
    console.log('Auth me error:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

// ============ CATEGORY ROUTES ============

// Get all categories
app.get("/make-server-1380c61f/categories", async (c) => {
  try {
    const categories = await kv.getByPrefix("category:");
    return c.json({ categories });
  } catch (error) {
    console.log('Get categories error:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// Create category
app.post("/make-server-1380c61f/categories", async (c) => {
  try {
    const auth = await authorize(c, 'admin');
    if ('response' in auth) return auth.response;

    const { name } = await c.req.json();
    const id = crypto.randomUUID();
    const category = {
      id,
      name: sanitizeText(name, 'Category name', 80),
      created_at: new Date().toISOString()
    };

    await kv.set(`category:${id}`, category);
    return c.json({ category });
  } catch (error) {
    console.log('Create category error:', error);
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

// Update category
app.put("/make-server-1380c61f/categories/:id", async (c) => {
  try {
    const auth = await authorize(c, 'admin');
    if ('response' in auth) return auth.response;

    const id = c.req.param('id');
    const { name } = await c.req.json();
    const existing = await kv.get(`category:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Category not found' }, 404);
    }

    const category = { ...existing, name: sanitizeText(name, 'Category name', 80) };
    await kv.set(`category:${id}`, category);
    return c.json({ category });
  } catch (error) {
    console.log('Update category error:', error);
    return c.json({ error: 'Failed to update category' }, 500);
  }
});

// Delete category
app.delete("/make-server-1380c61f/categories/:id", async (c) => {
  try {
    const auth = await authorize(c, 'admin');
    if ('response' in auth) return auth.response;

    const id = c.req.param('id');
    await kv.del(`category:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete category error:', error);
    return c.json({ error: 'Failed to delete category' }, 500);
  }
});

// ============ PRODUCT ROUTES ============

// Get all products
app.get("/make-server-1380c61f/products", async (c) => {
  try {
    const categoryId = c.req.query('category_id');
    const products = await kv.getByPrefix("product:");
    
    if (categoryId) {
      const filtered = products.filter((p: any) => p.category_id === categoryId);
      return c.json({ products: filtered });
    }
    
    return c.json({ products });
  } catch (error) {
    console.log('Get products error:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// Get single product
app.get("/make-server-1380c61f/products/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const product = await kv.get(`product:${id}`);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    return c.json({ product });
  } catch (error) {
    console.log('Get product error:', error);
    return c.json({ error: 'Failed to fetch product' }, 500);
  }
});

// Create product
app.post("/make-server-1380c61f/products", async (c) => {
  try {
    const auth = await authorize(c, 'admin');
    if ('response' in auth) return auth.response;

    const { name, description, price, image_url, video_url, category_id, is_flash_sale } = await c.req.json();
    const id = crypto.randomUUID();
    const product = {
      id,
      name: sanitizeText(name, 'Product name', 120),
      description: sanitizeText(description, 'Product description', 2000),
      price: parsePositivePrice(price, 'Price'),
      image_url: sanitizeOptionalUrl(image_url),
      video_url: sanitizeOptionalUrl(video_url),
      category_id: sanitizeText(category_id, 'Category', 120),
      is_flash_sale: parseBoolean(is_flash_sale),
      created_at: new Date().toISOString()
    };

    await kv.set(`product:${id}`, product);
    return c.json({ product });
  } catch (error) {
    console.log('Create product error:', error);
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

// Update product
app.put("/make-server-1380c61f/products/:id", async (c) => {
  try {
    const auth = await authorize(c, 'admin');
    if ('response' in auth) return auth.response;

    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`product:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const product = {
      ...existing,
      ...(updates.name !== undefined
        ? { name: sanitizeText(updates.name, 'Product name', 120) }
        : {}),
      ...(updates.description !== undefined
        ? { description: sanitizeText(updates.description, 'Product description', 2000) }
        : {}),
      ...(updates.price !== undefined
        ? { price: parsePositivePrice(updates.price, 'Price') }
        : {}),
      ...(updates.image_url !== undefined
        ? { image_url: sanitizeOptionalUrl(updates.image_url) }
        : {}),
      ...(updates.video_url !== undefined
        ? { video_url: sanitizeOptionalUrl(updates.video_url) }
        : {}),
      ...(updates.category_id !== undefined
        ? { category_id: sanitizeText(updates.category_id, 'Category', 120) }
        : {}),
      ...(updates.is_flash_sale !== undefined
        ? { is_flash_sale: parseBoolean(updates.is_flash_sale) }
        : {}),
    };
    await kv.set(`product:${id}`, product);
    return c.json({ product });
  } catch (error) {
    console.log('Update product error:', error);
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

// Delete product
app.delete("/make-server-1380c61f/products/:id", async (c) => {
  try {
    const auth = await authorize(c, 'admin');
    if ('response' in auth) return auth.response;

    const id = c.req.param('id');
    await kv.del(`product:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete product error:', error);
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});

// ============ ORDER ROUTES ============

// Get all orders
app.get("/make-server-1380c61f/orders", async (c) => {
  try {
    const auth = await authorize(c, 'admin');
    if ('response' in auth) return auth.response;

    const orders = await kv.getByPrefix("order:");
    return c.json({ orders });
  } catch (error) {
    console.log('Get orders error:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// Get single order
app.get("/make-server-1380c61f/orders/:id", async (c) => {
  try {
    const auth = await authorize(c, 'admin');
    if ('response' in auth) return auth.response;

    const id = c.req.param('id');
    const order = await kv.get(`order:${id}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    // Get order items
    const orderItems = await kv.getByPrefix(`order_item:${id}:`);
    
    return c.json({ order, orderItems });
  } catch (error) {
    console.log('Get order error:', error);
    return c.json({ error: 'Failed to fetch order' }, 500);
  }
});

// Create order (public route for customers)
app.post("/make-server-1380c61f/orders", async (c) => {
  try {
    const auth = await authorize(c, 'customer');
    if ('response' in auth) return auth.response;

    const { customer_name, address, items } = await c.req.json();

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return c.json({ error: 'Order must contain between 1 and 50 items' }, 400);
    }

    const normalizedItems = [];
    let totalPrice = 0;

    for (const rawItem of items) {
      const productId = sanitizeText(rawItem?.product_id, 'Product', 120);
      const quantity = Number(rawItem?.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 100) {
        return c.json({ error: 'Invalid item quantity' }, 400);
      }

      const product = await kv.get(`product:${productId}`);
      if (!product) {
        return c.json({ error: 'One or more products no longer exist' }, 400);
      }

      const trustedPrice = parsePositivePrice(product.price, 'Price');
      totalPrice += trustedPrice * quantity;
      normalizedItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity,
        price: trustedPrice,
      });
    }

    const orderId = crypto.randomUUID();
    const order = {
      id: orderId,
      customer_id: auth.user.id,
      customer_name:
        auth.user.user_metadata?.full_name ||
        sanitizeText(customer_name, 'Customer name', 120),
      customer_email: auth.user.email || '',
      address: sanitizeText(address, 'Address', 500),
      total_price: Number(totalPrice.toFixed(2)),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    await kv.set(`order:${orderId}`, order);

    // Save order items
    for (const item of normalizedItems) {
      const itemId = crypto.randomUUID();
      const orderItem = {
        id: itemId,
        order_id: orderId,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price
      };
      await kv.set(`order_item:${orderId}:${itemId}`, orderItem);
    }

    return c.json({ order, success: true });
  } catch (error) {
    console.log('Create order error:', error);
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

// Update order status
app.put("/make-server-1380c61f/orders/:id", async (c) => {
  try {
    const auth = await authorize(c, 'admin');
    if ('response' in auth) return auth.response;

    const id = c.req.param('id');
    const { status } = await c.req.json();
    const existing = await kv.get(`order:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const normalizedStatus = sanitizeText(status, 'Status', 20).toLowerCase();
    if (!ORDER_STATUSES.has(normalizedStatus)) {
      return c.json({ error: 'Invalid order status' }, 400);
    }

    const order = { ...existing, status: normalizedStatus };
    await kv.set(`order:${id}`, order);
    return c.json({ order });
  } catch (error) {
    console.log('Update order error:', error);
    return c.json({ error: 'Failed to update order' }, 500);
  }
});

// ============ PROMOTION ROUTES ============

// Get all promotions
app.get("/make-server-1380c61f/promotions", async (c) => {
  try {
    const promotions = await kv.getByPrefix("promotion:");
    return c.json({ promotions });
  } catch (error) {
    console.log('Get promotions error:', error);
    return c.json({ error: 'Failed to fetch promotions' }, 500);
  }
});

// Create promotion
app.post("/make-server-1380c61f/promotions", async (c) => {
  try {
    const auth = await authorize(c, 'admin');
    if ('response' in auth) return auth.response;

    const { title, description, is_active, discount_percent, start_date, end_date } = await c.req.json();
    const id = crypto.randomUUID();
    const promotion = {
      id,
      title: sanitizeText(title, 'Promotion title', 120),
      description: sanitizeText(description, 'Promotion description', 500),
      is_active: parseBoolean(is_active),
      discount_percent: parsePositivePrice(discount_percent, 'Discount percent'),
      start_date: sanitizeText(start_date, 'Start date', 20),
      end_date: sanitizeText(end_date, 'End date', 20),
      created_at: new Date().toISOString()
    };

    await kv.set(`promotion:${id}`, promotion);
    return c.json({ promotion });
  } catch (error) {
    console.log('Create promotion error:', error);
    return c.json({ error: 'Failed to create promotion' }, 500);
  }
});

// Update promotion
app.put("/make-server-1380c61f/promotions/:id", async (c) => {
  try {
    const auth = await authorize(c, 'admin');
    if ('response' in auth) return auth.response;

    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`promotion:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Promotion not found' }, 404);
    }

    const promotion = {
      ...existing,
      ...(updates.title !== undefined
        ? { title: sanitizeText(updates.title, 'Promotion title', 120) }
        : {}),
      ...(updates.description !== undefined
        ? { description: sanitizeText(updates.description, 'Promotion description', 500) }
        : {}),
      ...(updates.is_active !== undefined
        ? { is_active: parseBoolean(updates.is_active) }
        : {}),
      ...(updates.discount_percent !== undefined
        ? { discount_percent: parsePositivePrice(updates.discount_percent, 'Discount percent') }
        : {}),
      ...(updates.start_date !== undefined
        ? { start_date: sanitizeText(updates.start_date, 'Start date', 20) }
        : {}),
      ...(updates.end_date !== undefined
        ? { end_date: sanitizeText(updates.end_date, 'End date', 20) }
        : {}),
    };
    await kv.set(`promotion:${id}`, promotion);
    return c.json({ promotion });
  } catch (error) {
    console.log('Update promotion error:', error);
    return c.json({ error: 'Failed to update promotion' }, 500);
  }
});

// Delete promotion
app.delete("/make-server-1380c61f/promotions/:id", async (c) => {
  try {
    const auth = await authorize(c, 'admin');
    if ('response' in auth) return auth.response;

    const id = c.req.param('id');
    await kv.del(`promotion:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete promotion error:', error);
    return c.json({ error: 'Failed to delete promotion' }, 500);
  }
});

// ============ TESTIMONIAL ROUTES ============

// Get all testimonials
app.get("/make-server-1380c61f/testimonials", async (c) => {
  try {
    const testimonials = await kv.getByPrefix("testimonial:");
    return c.json({ testimonials });
  } catch (error) {
    console.log('Get testimonials error:', error);
    return c.json({ error: 'Failed to fetch testimonials' }, 500);
  }
});

// Create testimonial
app.post("/make-server-1380c61f/testimonials", async (c) => {
  try {
    const auth = await authorize(c, 'admin');
    if ('response' in auth) return auth.response;

    const { name, message, rating } = await c.req.json();
    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return c.json({ error: 'Rating must be an integer between 1 and 5' }, 400);
    }
    const id = crypto.randomUUID();
    const testimonial = {
      id,
      name: sanitizeText(name, 'Customer name', 120),
      message: sanitizeText(message, 'Message', 1000),
      rating: parsedRating,
      created_at: new Date().toISOString()
    };

    await kv.set(`testimonial:${id}`, testimonial);
    return c.json({ testimonial });
  } catch (error) {
    console.log('Create testimonial error:', error);
    return c.json({ error: 'Failed to create testimonial' }, 500);
  }
});

// Update testimonial
app.put("/make-server-1380c61f/testimonials/:id", async (c) => {
  try {
    const auth = await authorize(c, 'admin');
    if ('response' in auth) return auth.response;

    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`testimonial:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Testimonial not found' }, 404);
    }

    const nextRating =
      updates.rating !== undefined ? Number(updates.rating) : existing.rating;
    if (!Number.isInteger(nextRating) || nextRating < 1 || nextRating > 5) {
      return c.json({ error: 'Rating must be an integer between 1 and 5' }, 400);
    }

    const testimonial = {
      ...existing,
      ...(updates.name !== undefined
        ? { name: sanitizeText(updates.name, 'Customer name', 120) }
        : {}),
      ...(updates.message !== undefined
        ? { message: sanitizeText(updates.message, 'Message', 1000) }
        : {}),
      rating: nextRating,
    };
    await kv.set(`testimonial:${id}`, testimonial);
    return c.json({ testimonial });
  } catch (error) {
    console.log('Update testimonial error:', error);
    return c.json({ error: 'Failed to update testimonial' }, 500);
  }
});

// Delete testimonial
app.delete("/make-server-1380c61f/testimonials/:id", async (c) => {
  try {
    const auth = await authorize(c, 'admin');
    if ('response' in auth) return auth.response;

    const id = c.req.param('id');
    await kv.del(`testimonial:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete testimonial error:', error);
    return c.json({ error: 'Failed to delete testimonial' }, 500);
  }
});

// ============ FILE UPLOAD ROUTES ============

// Upload customer avatar
app.post("/make-server-1380c61f/profile/avatar", async (c) => {
  try {
    const auth = await authorize(c, 'customer');
    if ('response' in auth) return auth.response;

    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    if (!IMAGE_MIME_TYPES.has(file.type)) {
      return c.json({ error: 'Only image uploads are allowed' }, 400);
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return c.json({ error: 'File size exceeds 5 MB limit' }, 400);
    }

    const filePath = `avatars/${auth.user.id}-${Date.now()}.${getImageExtension(file)}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return c.json({ error: uploadError.message }, 500);
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: filePath })
      .eq('id', auth.user.id);

    if (profileError) {
      return c.json({ error: profileError.message }, 500);
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 60 * 60 * 24 * 7);

    if (signedUrlError) {
      return c.json({ error: signedUrlError.message }, 500);
    }

    return c.json({
      avatar_url: filePath,
      signed_url: signedUrlData?.signedUrl || '',
    });
  } catch (error) {
    console.log('Customer avatar upload exception:', error);
    return c.json({ error: 'Avatar upload failed' }, 500);
  }
});

// Upload file
app.post("/make-server-1380c61f/upload", async (c) => {
  try {
    const auth = await authorize(c, 'admin');
    if ('response' in auth) return auth.response;

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    if (!IMAGE_MIME_TYPES.has(file.type)) {
      return c.json({ error: 'Only image uploads are allowed' }, 400);
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return c.json({ error: 'File size exceeds 5 MB limit' }, 400);
    }

    const fileName = `${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.log('Upload error:', error);
      return c.json({ error: error.message }, 500);
    }

    // Create signed URL
    const { data: signedUrlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

    return c.json({ 
      path: data.path,
      url: signedUrlData?.signedUrl || ''
    });
  } catch (error) {
    console.log('Upload exception:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

Deno.serve(app.fetch);
