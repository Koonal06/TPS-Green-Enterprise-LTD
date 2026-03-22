# Quick Setup Guide - TPS Green Enterprise E-Commerce

Welcome! Follow these steps to get your e-commerce platform up and running.

## Step 1: Create Admin Account (First Time Only)

1. Navigate to **Admin Login** (link in footer or go to `/admin/login`)
2. Click on the **"Sign Up"** tab
3. Fill in your details:
   - Full Name: Your name
   - Email: Your email address
   - Password: Choose a secure password
4. Click **"Create Account"**
5. You'll see a success message

## Step 2: Login to Admin Panel

1. Switch to the **"Login"** tab
2. Enter your email and password
3. Click **"Login"**
4. You'll be redirected to the Admin Dashboard

## Step 3: Populate Database with Sample Data

1. On the Dashboard, you'll see a **"Quick Setup"** card
2. Click the **"Seed Sample Data"** button
3. Wait for the success message
4. This creates:
   - ✅ 3 Categories (Tomatoes, Cucumbers, Bell Peppers)
   - ✅ 6 Sample Products
   - ✅ 3 Customer Testimonials
   - ✅ 1 Active Promotion

## Step 4: Explore the Platform

### Customer Side (Storefront)
- Click **"Back to Store"** button in the admin panel
- Or navigate to the home page (`/`)
- You'll now see:
  - Featured products on the home page
  - Flash sale items
  - Active promotions
  - Customer testimonials
  - Browse products by category

### Try Shopping
1. Click on any product to view details
2. Click **"Add to Cart"**
3. View your cart by clicking the cart icon in the header
4. Proceed to checkout
5. Fill in customer information
6. Place a test order

### Admin Side (Management)
Navigate through the admin sections:
- **Products**: Add, edit, or delete products
- **Categories**: Manage product categories
- **Orders**: View and update order status
- **Promotions**: Create flash sales and discounts
- **Testimonials**: Manage customer reviews

## Step 5: Customize Your Store

### Add Your Own Products
1. Go to **Admin → Products**
2. Click **"Add Product"**
3. Fill in:
   - Product name
   - Description
   - Price
   - Category
   - Image URL (you can use Unsplash or your own hosted images)
   - Optional: Video URL for product showcase
   - Toggle "Flash Sale" if applicable
4. Click **"Create Product"**

### Create Categories
1. Go to **Admin → Categories**
2. Click **"Add Category"**
3. Enter category name
4. Click **"Create Category"**

### Add Promotions
1. Go to **Admin → Promotions**
2. Click **"Add Promotion"**
3. Fill in:
   - Title
   - Description
   - Discount percentage
   - Start and end dates
   - Toggle "Active" to make it live
4. Click **"Create Promotion"**

## Common Tasks

### Manage an Order
1. Customer places an order
2. Go to **Admin → Orders**
3. Click **"View"** on any order
4. Review order details
5. Update status using dropdown:
   - Pending → Processing → Completed
   - Or mark as Cancelled if needed

### Update Product
1. Go to **Admin → Products**
2. Click **"Edit"** on any product
3. Make your changes
4. Click **"Update Product"**

### Add Testimonials
1. Go to **Admin → Testimonials**
2. Click **"Add Testimonial"**
3. Enter customer name, message, and rating
4. Click **"Create Testimonial"**

## Tips & Best Practices

### Product Images
- Use high-quality images (minimum 500x500px)
- Use consistent aspect ratios for better visual appeal
- Free stock photos: https://unsplash.com/
- Image formats: JPG, PNG, WebP

### Product Descriptions
- Be detailed and descriptive
- Highlight key features and benefits
- Include relevant keywords
- Mention quality, origin, or special characteristics

### Pricing
- Be consistent with pricing format
- Consider promotional pricing strategies
- Use flash sales sparingly for maximum impact

### Order Management
- Check orders regularly
- Update status promptly
- Mark completed orders as "Completed"
- Use "Processing" for orders being prepared

### Promotions
- Don't overlap too many promotions
- Set realistic discount percentages (10-30% typical)
- Use clear, compelling titles
- Set appropriate date ranges

## Troubleshooting

### "No products showing on home page"
- Make sure you've clicked "Seed Sample Data" or added products manually
- Check that products have valid categories assigned

### "Cannot add to cart"
- Ensure you're viewing a valid product with a price
- Check browser console for errors

### "Checkout not working"
- Fill in all required fields (name, email, address)
- Make sure cart is not empty

### "Cannot login to admin"
- Verify you've created an account via signup first
- Check email and password are correct
- Try the forgot password feature (if implemented)

## Security Notes

⚠️ **Important for Production Use:**
- Change all default credentials
- Use strong passwords
- Enable 2FA if available
- Use HTTPS only
- Regularly backup your data
- Monitor for suspicious activity

## Next Steps

Once comfortable with the basics:
1. Customize the branding and colors
2. Add your own product catalog
3. Set up email notifications (future enhancement)
4. Configure payment gateway (for real transactions)
5. Implement analytics tracking
6. Add more customer features (wishlists, reviews, etc.)

## Support

Need help?
- Check the main README.md for detailed documentation
- Review the browser console for error messages
- Ensure Supabase backend is connected

---

**Congratulations!** Your TPS Green Enterprise e-commerce platform is ready to use. Start by exploring the admin panel and customizing your store!
