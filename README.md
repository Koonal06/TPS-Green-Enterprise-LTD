📘 TPS Green E-commerce Website — Full Documentation

1. Project Overview
   Name: TPS Green Enterprise Ltd E-commerce storefront
   Framework: React + Vite + TypeScript
   Routing: react-router (browser router)
   UI: Tailwind CSS + Radix UI + Lucide icons + custom components
   State: Local React state + CartContext
   Backend: Supabase (auth, storage, functions)
   Purpose: Online retail platform (Products, Cart, Checkout, Customer and Admin areas)

2. Important Files & Folders
   main.tsx — app mount and providers
   App.tsx — root layout and core wrappers
   routes.tsx — route definitions
   Layout.tsx — header/footer + site layout + social icon
   CartContext.tsx — cart data + actions + localStorage
   supabase.ts — supabase client, helper API stuff
   src/app/pages/_ — visible app page components
   src/app/pages/admin/_ — admin dashboard pages
   src/styles/\* — CSS config and theme

3. Routes (Public + Auth + Admin)
   Public
   / → Home
   /products → Products list
   /products/:category → Products filtered by category
   /product/:id → Product details
   /cart → Cart view
   /checkout → Checkout process
   /about → About page
   /our-work → Same as About
   /contact → Contact page
   /our-service → Same as Contact
   /login → Customer login
   Customer authenticated
   /customer/dashboard
   /customer/account
   Admin
   /admin/login
   /admin/dashboard
   /admin/products
   /admin/categories
   /admin/orders
   /admin/promotions
   /admin/testimonials
   Fallback

- → NotFound page

4. Cart System
   CartContext (in CartContext.tsx)

cart state persisted to localStorage under cart
actions:
addToCart(item) (requires hasCustomerSession; toast error if not logged in)
removeFromCart(id)
updateQuantity(id, quantity)
clearCart()
getCartTotal()
getCartCount()
useCart() hook for components 5. Supabase Integration
supabase.ts

config:
projectId and publicAnonKey from info.tsx
helpers:
hasCustomerSession() checks localStorage.customerAccessToken
resolveStorageUrl(pathOrUrl) signed URL retrieval from bucket
apiRequest(endpoint, options, useAuth) request wrapper
tokens from auth session or localStorage
uses API_URL from supabase function endpoint

6. Admin and Login
   AdminLogin for admin auth
   AdminDashboard with navigation to products/categories/orders/promotions/testimonials
   No detailed server auth flow in this code; likely operated through Supabase functions plus localStorage tokens.
   Customer login path uses same patterns (localStorage tokens + customer-auth-changed event support in CartContext).

7. UI Components and Shared Design
   Layout.tsx includes:
   top navigation (logo, products, about, contact, cart count)
   footer (info, quick links, contacts, social icons)
   social info includes:
   Facebook (currently href="#")
   Instagram now linked to: https://www.instagram.com/tpsgreen.enterprise_ltd?igsh=MWx5eHZlYXJnejE3NA%3D%3D (saved)
   TikTok placeholder icon href="#"
   Shared UI components in ui (button, card, badge, etc.)

8. Style & Theme
   Tailwind CSS config via:
   postcss.config.mjs
   tailwind.config inside styles maybe in Vite plugin (no file shown but likely in root)
   main styles:
   index.css, theme.css, fonts.css
   Uses @tailwindcss/vite plugin and tailwind-merge

9. Run / Build / Deploy
   Prerequisites
   Node.js >= 18, pnpm/yarn/npm
   Supabase project keys configured in info.tsx
   Commands
   npm install (or pnpm install)
   npm run dev starts Vite (local dev server)
   npm run build generates production output (dist)
   host on Vercel/Netlify/Static server with build step

10. Data Flow
    Client → Supabase
    apiRequest hits API_URL function routes
    Supabase storage for images via resolveStorageUrl
    CartContext in-memory + localStorage + user session gating
    Validation
    UI restrictions:
    addToCart fails if not logged in
    protected route behavior likely implicit in pages by auth checks (not explicit in router)
    should add navigation guards (currently not enforced in routes)

11. What to Improve (next steps)
    Add actual Facebook/TikTok links in footer
    Add stronger route protection (admin and customer routes)
    Add backend user/auth sync for cart persistence (Supabase table)
    Add tests (Vitest, Cypress)
    Add complete README.md and release notes

12. Snapshot of change made (fulfilled request)
    In Layout.tsx:
    Instagram icon anchor updated:
    href="https://www.instagram.com/tpsgreen.enterprise_ltd?igsh=MWx5eHZlYXJnejE3NA%3D%3D"
    target="\_blank"
    rel="noopener noreferrer"

\*13. Optional useful command guide
npm run dev
npm run build
npm lint (if set up)
npm test (if added)
