# TPS Green Enterprise E-Commerce Platform

A full-stack e-commerce web application for TPS Green Enterprise Ltd, built with React, Tailwind CSS, and Supabase backend.

## Features

### Customer-Facing Frontend
- **Home Page**: Hero section, promotional banners, flash sale section, and featured products
- **Product Listings**: Browse products by category (Tomatoes, Cucumbers, Bell Peppers)
- **Product Details**: Detailed product pages with images, videos, and add-to-cart functionality
- **Shopping Cart**: Manage cart items with quantity controls
- **Checkout**: Customer information form with order placement
- **About & Contact Pages**: Company information and contact form
- **Customer Testimonials**: Display customer reviews and ratings
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Admin Backend Panel
- **Admin Authentication**: Secure login/logout using Supabase Auth
- **Dashboard**: Overview with statistics and quick actions
- **Product Management**: Full CRUD operations for products
- **Category Management**: Create, edit, and delete product categories
- **Order Management**: View and update order status
- **Promotion Management**: Create and manage flash sales and discounts
- **Testimonial Management**: Add, edit, and delete customer testimonials
- **File Upload**: Support for product images and videos via Supabase Storage

## Technology Stack

### Frontend
- **React 18.3.1**: UI library
- **React Router 7.13.0**: Client-side routing
- **Tailwind CSS 4.1.12**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Sonner**: Toast notifications

### Backend
- **Supabase**: Backend-as-a-Service
  - PostgreSQL Database (Key-Value Store)
  - Authentication
  - Storage for images/videos
  - Edge Functions (Hono web server)

## Data Structure

The application uses a key-value store with the following data models:

### Categories
```typescript
{
  id: string;
  name: string;
  created_at: string;
}
```

### Products
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  video_url?: string;
  category_id: string;
  is_flash_sale: boolean;
  created_at: string;
}
```

### Orders
```typescript
{
  id: string;
  customer_name: string;
  customer_email: string;
  address: string;
  total_price: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
}
```

### Order Items
```typescript
{
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}
```

### Testimonials
```typescript
{
  id: string;
  name: string;
  message: string;
  rating: number;
  created_at: string;
}
```

### Promotions
```typescript
{
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  discount_percent: number;
  start_date: string;
  end_date: string;
  created_at: string;
}
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase account and project

### Installation

1. **Clone or download the project files**

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Configure Supabase**
   - The application is pre-configured with Supabase integration
   - Supabase credentials are managed by the platform environment

4. **Run the development server**
```bash
npm run dev
```

The application will be available at the development URL provided by your platform.

## Usage Guide

### For Administrators

1. **First Time Setup**
   - Navigate to `/admin/login`
   - Click on "Sign Up" tab
   - Create an admin account with email and password
   - After signup, switch to "Login" tab and sign in

2. **Seed Sample Data**
   - After logging in, go to the Dashboard
   - Click "Seed Sample Data" button to populate the database with:
     - 3 categories (Tomatoes, Cucumbers, Bell Peppers)
     - 6 sample products
     - 3 customer testimonials
     - 1 active promotion

3. **Manage Products**
   - Navigate to Products section
   - Add new products with name, description, price, image URL, category
   - Mark products as "Flash Sale" items
   - Edit or delete existing products

4. **Manage Categories**
   - Navigate to Categories section
   - Create product categories
   - Edit or delete categories

5. **Manage Orders**
   - View all customer orders
   - Click "View" to see order details
   - Update order status (pending, processing, completed, cancelled)

6. **Manage Promotions**
   - Create promotional campaigns with discount percentages
   - Set start and end dates
   - Toggle promotions active/inactive

7. **Manage Testimonials**
   - Add customer testimonials
   - Set star ratings (1-5)
   - Edit or delete testimonials

### For Customers

1. **Browse Products**
   - Visit the home page to see featured products and flash sales
   - Click on category cards to browse specific categories
   - Use the navigation menu to explore different sections

2. **Shopping**
   - Click on a product to view details
   - Add items to cart using "Add to Cart" button
   - View cart by clicking the cart icon in the header
   - Adjust quantities or remove items in the cart

3. **Checkout**
   - Click "Proceed to Checkout" from the cart
   - Fill in delivery information (name, email, address)
   - Review order summary
   - Click "Place Order" to complete purchase

4. **Other Pages**
   - Visit the About page to learn about the company
   - Use the Contact page to send inquiries

## API Endpoints

All API endpoints are prefixed with `/make-server-1380c61f/`

### Public Endpoints
- `GET /categories` - Get all categories
- `GET /products` - Get all products (optional: ?category_id=xxx)
- `GET /products/:id` - Get single product
- `GET /promotions` - Get all promotions
- `GET /testimonials` - Get all testimonials
- `POST /orders` - Create new order

### Protected Endpoints (Require Admin Authentication)
- `POST /auth/signup` - Create admin account
- `GET /auth/me` - Get current user
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order details
- `PUT /orders/:id` - Update order status
- `POST /promotions` - Create promotion
- `PUT /promotions/:id` - Update promotion
- `DELETE /promotions/:id` - Delete promotion
- `POST /testimonials` - Create testimonial
- `PUT /testimonials/:id` - Update testimonial
- `DELETE /testimonials/:id` - Delete testimonial
- `POST /upload` - Upload file to storage

## Project Structure

```
/src
  /app
    /components
      /ui               # Reusable UI components
      AdminLayout.tsx   # Admin panel layout
      Layout.tsx        # Customer-facing layout
      SeedData.tsx      # Database seeding utility
    /contexts
      CartContext.tsx   # Shopping cart state management
    /lib
      supabase.ts      # Supabase client and API utilities
    /pages
      /admin
        AdminLogin.tsx
        AdminDashboard.tsx
        AdminProducts.tsx
        AdminCategories.tsx
        AdminOrders.tsx
        AdminPromotions.tsx
        AdminTestimonials.tsx
      Home.tsx
      Products.tsx
      ProductDetail.tsx
      Cart.tsx
      Checkout.tsx
      About.tsx
      Contact.tsx
      NotFound.tsx
    routes.tsx         # React Router configuration
    App.tsx            # Main app component
  /styles
    theme.css          # Theme variables
    index.css          # Global styles
/supabase
  /functions
    /server
      index.tsx        # Hono web server with all API routes
      kv_store.tsx     # Key-value store utilities (protected)
```

## Key Features Explained

### State Management
- **Cart Context**: React Context API manages shopping cart state across the application
- **Local Storage**: Cart persists between sessions using browser localStorage

### Authentication
- **Supabase Auth**: Secure admin authentication
- **Access Tokens**: Stored in localStorage for authenticated API requests
- **Protected Routes**: Admin routes check for valid authentication

### File Upload
- **Supabase Storage**: Private bucket for product images and videos
- **Signed URLs**: Generated for accessing private files
- **Admin Only**: File uploads restricted to authenticated admin users

### Order Management
- **Status Tracking**: Orders have status workflow (pending → processing → completed)
- **Order Items**: Associated items stored separately for detailed tracking
- **Customer Info**: Order includes customer name, email, and delivery address

### Responsive Design
- **Mobile-First**: Tailwind CSS responsive utilities
- **Breakpoints**: Optimized layouts for mobile, tablet, and desktop
- **Touch-Friendly**: Appropriate button sizes and spacing for mobile devices

## Important Notes

### Payment Processing
This is a **demonstration/prototype** application with simulated payment processing. It does NOT include real payment gateway integration. For production use, integrate a payment processor like Stripe, PayPal, or Square.

### Security Considerations
- This application is designed for prototyping and demonstration
- For production deployment handling real customer data:
  - Implement additional security measures
  - Add GDPR/privacy compliance features
  - Use HTTPS for all communications
  - Implement rate limiting
  - Add comprehensive error handling
  - Set up proper monitoring and logging

### Data Storage
- Uses Supabase's key-value store for flexibility
- Perfect for prototyping but consider relational tables for production
- All data is stored in the cloud via Supabase

## Customization

### Styling
- Modify `/src/styles/theme.css` for global theme variables
- Update Tailwind classes in components for visual changes
- Color scheme is based on green theme (TPS Green branding)

### Product Categories
- Add new categories via the admin panel
- Update navigation menu in `Layout.tsx` to include new categories

### Images
- Product images use URLs (can be from any source)
- Unsplash is used for demo images
- Upload feature available in admin panel for custom images

## Troubleshooting

### Cannot Login to Admin
- Ensure you've created an admin account via signup
- Check browser console for error messages
- Verify Supabase connection is working

### Products Not Showing
- Use the "Seed Sample Data" button in admin dashboard
- Or manually add products via admin panel
- Check that products have valid category assignments

### Cart Not Persisting
- Check browser localStorage is enabled
- Ensure not in private/incognito mode

### API Errors
- Check browser console for detailed error messages
- Verify authentication token is present for protected routes
- Ensure Supabase backend is running

## Support

For issues or questions:
- Check browser console for error messages
- Verify all dependencies are installed
- Ensure Supabase project is properly configured

## License

This project is created for TPS Green Enterprise Ltd.

---

**Built with ❤️ using React, Tailwind CSS, and Supabase**
#   T P S - G r e e n - E n t e r p r i s e - L T D  
 #   T P S - G r e e n - E n t e r p r i s e - L T D  
 