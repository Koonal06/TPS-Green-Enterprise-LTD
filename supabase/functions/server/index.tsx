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
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: 'admin' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
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
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name } = await c.req.json();
    const id = crypto.randomUUID();
    const category = {
      id,
      name,
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
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const { name } = await c.req.json();
    const existing = await kv.get(`category:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Category not found' }, 404);
    }

    const category = { ...existing, name };
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
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

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
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name, description, price, image_url, video_url, category_id, is_flash_sale } = await c.req.json();
    const id = crypto.randomUUID();
    const product = {
      id,
      name,
      description,
      price,
      image_url: image_url || '',
      video_url: video_url || '',
      category_id,
      is_flash_sale: is_flash_sale || false,
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
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`product:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const product = { ...existing, ...updates };
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
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

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
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

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
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

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
    const { customer_name, customer_email, address, total_price, items } = await c.req.json();
    const orderId = crypto.randomUUID();
    const order = {
      id: orderId,
      customer_name,
      customer_email,
      address,
      total_price,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    await kv.set(`order:${orderId}`, order);

    // Save order items
    for (const item of items) {
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
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const { status } = await c.req.json();
    const existing = await kv.get(`order:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const order = { ...existing, status };
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
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { title, description, is_active, discount_percent, start_date, end_date } = await c.req.json();
    const id = crypto.randomUUID();
    const promotion = {
      id,
      title,
      description,
      is_active: is_active || false,
      discount_percent,
      start_date,
      end_date,
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
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`promotion:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Promotion not found' }, 404);
    }

    const promotion = { ...existing, ...updates };
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
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

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
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name, message, rating } = await c.req.json();
    const id = crypto.randomUUID();
    const testimonial = {
      id,
      name,
      message,
      rating,
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
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`testimonial:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Testimonial not found' }, 404);
    }

    const testimonial = { ...existing, ...updates };
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
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    await kv.del(`testimonial:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete testimonial error:', error);
    return c.json({ error: 'Failed to delete testimonial' }, 500);
  }
});

// ============ FILE UPLOAD ROUTES ============

// Upload file
app.post("/make-server-1380c61f/upload", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
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