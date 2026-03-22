# API Reference - TPS Green Enterprise E-Commerce

Complete API documentation for the TPS Green Enterprise e-commerce platform backend.

## Base URL

```
https://{projectId}.supabase.co/functions/v1/make-server-1380c61f
```

## Authentication

### Public Endpoints
Public endpoints use the Supabase anonymous key in the Authorization header:
```
Authorization: Bearer {publicAnonKey}
```

### Protected Endpoints
Protected endpoints require an admin access token obtained from login:
```
Authorization: Bearer {accessToken}
```

---

## Authentication Endpoints

### POST /auth/signup
Create a new admin account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "admin@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "user_metadata": {
      "name": "John Doe",
      "role": "admin"
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "User already exists"
}
```

---

### GET /auth/me
Get current authenticated user details.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "user_metadata": {
      "name": "John Doe",
      "role": "admin"
    }
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

---

## Category Endpoints

### GET /categories
Get all categories.

**Public:** Yes

**Response (200 OK):**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Tomatoes",
      "created_at": "2026-03-21T10:00:00Z"
    }
  ]
}
```

---

### POST /categories
Create a new category.

**Protected:** Yes

**Request Body:**
```json
{
  "name": "Tomatoes"
}
```

**Response (200 OK):**
```json
{
  "category": {
    "id": "uuid",
    "name": "Tomatoes",
    "created_at": "2026-03-21T10:00:00Z"
  }
}
```

---

### PUT /categories/:id
Update an existing category.

**Protected:** Yes

**Request Body:**
```json
{
  "name": "Fresh Tomatoes"
}
```

**Response (200 OK):**
```json
{
  "category": {
    "id": "uuid",
    "name": "Fresh Tomatoes",
    "created_at": "2026-03-21T10:00:00Z"
  }
}
```

---

### DELETE /categories/:id
Delete a category.

**Protected:** Yes

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Product Endpoints

### GET /products
Get all products, optionally filtered by category.

**Public:** Yes

**Query Parameters:**
- `category_id` (optional): Filter products by category ID

**Examples:**
```
GET /products
GET /products?category_id=uuid
```

**Response (200 OK):**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Cherry Tomatoes",
      "description": "Sweet and juicy cherry tomatoes",
      "price": 4.99,
      "image_url": "https://example.com/image.jpg",
      "video_url": "https://example.com/video.mp4",
      "category_id": "uuid",
      "is_flash_sale": true,
      "created_at": "2026-03-21T10:00:00Z"
    }
  ]
}
```

---

### GET /products/:id
Get a single product by ID.

**Public:** Yes

**Response (200 OK):**
```json
{
  "product": {
    "id": "uuid",
    "name": "Cherry Tomatoes",
    "description": "Sweet and juicy cherry tomatoes",
    "price": 4.99,
    "image_url": "https://example.com/image.jpg",
    "video_url": "https://example.com/video.mp4",
    "category_id": "uuid",
    "is_flash_sale": true,
    "created_at": "2026-03-21T10:00:00Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Product not found"
}
```

---

### POST /products
Create a new product.

**Protected:** Yes

**Request Body:**
```json
{
  "name": "Cherry Tomatoes",
  "description": "Sweet and juicy cherry tomatoes",
  "price": 4.99,
  "image_url": "https://example.com/image.jpg",
  "video_url": "https://example.com/video.mp4",
  "category_id": "uuid",
  "is_flash_sale": true
}
```

**Response (200 OK):**
```json
{
  "product": {
    "id": "uuid",
    "name": "Cherry Tomatoes",
    "description": "Sweet and juicy cherry tomatoes",
    "price": 4.99,
    "image_url": "https://example.com/image.jpg",
    "video_url": "https://example.com/video.mp4",
    "category_id": "uuid",
    "is_flash_sale": true,
    "created_at": "2026-03-21T10:00:00Z"
  }
}
```

---

### PUT /products/:id
Update an existing product.

**Protected:** Yes

**Request Body:**
```json
{
  "name": "Fresh Cherry Tomatoes",
  "price": 5.99,
  "is_flash_sale": false
}
```

**Response (200 OK):**
```json
{
  "product": {
    "id": "uuid",
    "name": "Fresh Cherry Tomatoes",
    "description": "Sweet and juicy cherry tomatoes",
    "price": 5.99,
    "image_url": "https://example.com/image.jpg",
    "category_id": "uuid",
    "is_flash_sale": false,
    "created_at": "2026-03-21T10:00:00Z"
  }
}
```

---

### DELETE /products/:id
Delete a product.

**Protected:** Yes

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Order Endpoints

### GET /orders
Get all orders.

**Protected:** Yes

**Response (200 OK):**
```json
{
  "orders": [
    {
      "id": "uuid",
      "customer_name": "Jane Smith",
      "customer_email": "jane@example.com",
      "address": "123 Main St, City, State 12345",
      "total_price": 29.97,
      "status": "pending",
      "created_at": "2026-03-21T10:00:00Z"
    }
  ]
}
```

---

### GET /orders/:id
Get a single order with its items.

**Protected:** Yes

**Response (200 OK):**
```json
{
  "order": {
    "id": "uuid",
    "customer_name": "Jane Smith",
    "customer_email": "jane@example.com",
    "address": "123 Main St, City, State 12345",
    "total_price": 29.97,
    "status": "pending",
    "created_at": "2026-03-21T10:00:00Z"
  },
  "orderItems": [
    {
      "id": "uuid",
      "order_id": "uuid",
      "product_id": "uuid",
      "product_name": "Cherry Tomatoes",
      "quantity": 3,
      "price": 4.99
    }
  ]
}
```

---

### POST /orders
Create a new order (customer checkout).

**Public:** Yes

**Request Body:**
```json
{
  "customer_name": "Jane Smith",
  "customer_email": "jane@example.com",
  "address": "123 Main St, City, State 12345",
  "total_price": 29.97,
  "items": [
    {
      "product_id": "uuid",
      "product_name": "Cherry Tomatoes",
      "quantity": 3,
      "price": 4.99
    },
    {
      "product_id": "uuid",
      "product_name": "English Cucumbers",
      "quantity": 2,
      "price": 2.99
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "order": {
    "id": "uuid",
    "customer_name": "Jane Smith",
    "customer_email": "jane@example.com",
    "address": "123 Main St, City, State 12345",
    "total_price": 29.97,
    "status": "pending",
    "created_at": "2026-03-21T10:00:00Z"
  },
  "success": true
}
```

---

### PUT /orders/:id
Update order status.

**Protected:** Yes

**Request Body:**
```json
{
  "status": "processing"
}
```

**Valid Status Values:**
- `pending`
- `processing`
- `completed`
- `cancelled`

**Response (200 OK):**
```json
{
  "order": {
    "id": "uuid",
    "customer_name": "Jane Smith",
    "customer_email": "jane@example.com",
    "address": "123 Main St, City, State 12345",
    "total_price": 29.97,
    "status": "processing",
    "created_at": "2026-03-21T10:00:00Z"
  }
}
```

---

## Promotion Endpoints

### GET /promotions
Get all promotions.

**Public:** Yes

**Response (200 OK):**
```json
{
  "promotions": [
    {
      "id": "uuid",
      "title": "Spring Sale",
      "description": "Fresh vegetables at amazing prices!",
      "is_active": true,
      "discount_percent": 20,
      "start_date": "2026-03-01",
      "end_date": "2026-03-31",
      "created_at": "2026-03-21T10:00:00Z"
    }
  ]
}
```

---

### POST /promotions
Create a new promotion.

**Protected:** Yes

**Request Body:**
```json
{
  "title": "Summer Sale",
  "description": "Beat the heat with cool discounts!",
  "is_active": true,
  "discount_percent": 15,
  "start_date": "2026-06-01",
  "end_date": "2026-06-30"
}
```

**Response (200 OK):**
```json
{
  "promotion": {
    "id": "uuid",
    "title": "Summer Sale",
    "description": "Beat the heat with cool discounts!",
    "is_active": true,
    "discount_percent": 15,
    "start_date": "2026-06-01",
    "end_date": "2026-06-30",
    "created_at": "2026-03-21T10:00:00Z"
  }
}
```

---

### PUT /promotions/:id
Update a promotion.

**Protected:** Yes

**Request Body:**
```json
{
  "is_active": false,
  "discount_percent": 25
}
```

**Response (200 OK):**
```json
{
  "promotion": {
    "id": "uuid",
    "title": "Summer Sale",
    "description": "Beat the heat with cool discounts!",
    "is_active": false,
    "discount_percent": 25,
    "start_date": "2026-06-01",
    "end_date": "2026-06-30",
    "created_at": "2026-03-21T10:00:00Z"
  }
}
```

---

### DELETE /promotions/:id
Delete a promotion.

**Protected:** Yes

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Testimonial Endpoints

### GET /testimonials
Get all testimonials.

**Public:** Yes

**Response (200 OK):**
```json
{
  "testimonials": [
    {
      "id": "uuid",
      "name": "Sarah Johnson",
      "message": "The freshest vegetables I've ever ordered!",
      "rating": 5,
      "created_at": "2026-03-21T10:00:00Z"
    }
  ]
}
```

---

### POST /testimonials
Create a new testimonial.

**Protected:** Yes

**Request Body:**
```json
{
  "name": "Michael Chen",
  "message": "Amazing quality and great service!",
  "rating": 5
}
```

**Response (200 OK):**
```json
{
  "testimonial": {
    "id": "uuid",
    "name": "Michael Chen",
    "message": "Amazing quality and great service!",
    "rating": 5,
    "created_at": "2026-03-21T10:00:00Z"
  }
}
```

---

### PUT /testimonials/:id
Update a testimonial.

**Protected:** Yes

**Request Body:**
```json
{
  "message": "Updated review text",
  "rating": 4
}
```

**Response (200 OK):**
```json
{
  "testimonial": {
    "id": "uuid",
    "name": "Michael Chen",
    "message": "Updated review text",
    "rating": 4,
    "created_at": "2026-03-21T10:00:00Z"
  }
}
```

---

### DELETE /testimonials/:id
Delete a testimonial.

**Protected:** Yes

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## File Upload Endpoint

### POST /upload
Upload a file (image or video) to Supabase Storage.

**Protected:** Yes

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: The file to upload

**Response (200 OK):**
```json
{
  "path": "1711010000000-image.jpg",
  "url": "https://{projectId}.supabase.co/storage/v1/object/sign/make-1380c61f-products/..."
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "No file provided"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently, there are no rate limits enforced. For production use, implement rate limiting to prevent abuse.

Recommended limits:
- Public endpoints: 100 requests per minute
- Protected endpoints: 60 requests per minute
- File uploads: 10 requests per minute

---

## CORS

The API is configured to accept requests from any origin (`*`). For production, restrict to your domain:

```javascript
cors({
  origin: "https://yourdomain.com",
  // ... other options
})
```

---

## Code Examples

### JavaScript/Fetch

**Public Request:**
```javascript
const response = await fetch(
  'https://{projectId}.supabase.co/functions/v1/make-server-1380c61f/products',
  {
    headers: {
      'Authorization': 'Bearer {publicAnonKey}'
    }
  }
);
const data = await response.json();
```

**Protected Request:**
```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch(
  'https://{projectId}.supabase.co/functions/v1/make-server-1380c61f/products',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      name: 'New Product',
      price: 9.99,
      // ... other fields
    })
  }
);
const data = await response.json();
```

### cURL

**Get Products:**
```bash
curl -X GET \
  'https://{projectId}.supabase.co/functions/v1/make-server-1380c61f/products' \
  -H 'Authorization: Bearer {publicAnonKey}'
```

**Create Product:**
```bash
curl -X POST \
  'https://{projectId}.supabase.co/functions/v1/make-server-1380c61f/products' \
  -H 'Authorization: Bearer {accessToken}' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Cherry Tomatoes",
    "description": "Sweet and juicy",
    "price": 4.99,
    "category_id": "uuid",
    "is_flash_sale": false
  }'
```

---

## Support

For API issues or questions:
- Check the browser console for detailed error messages
- Verify authentication headers are correct
- Ensure request body matches expected format
- Review the backend logs in Supabase dashboard

---

**Version:** 1.0.0  
**Last Updated:** March 21, 2026
