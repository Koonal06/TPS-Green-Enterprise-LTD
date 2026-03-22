import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import CustomerAccount from "./pages/CustomerAccount";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

export const router = createBrowserRouter([
  {
    Component: ScrollToTop,
    children: [
      {
        path: "/",
        Component: Home,
      },
      {
        path: "/products",
        Component: Products,
      },
      {
        path: "/products/:category",
        Component: Products,
      },
      {
        path: "/product/:id",
        Component: ProductDetail,
      },
      {
        path: "/cart",
        Component: Cart,
      },
      {
        path: "/checkout",
        Component: Checkout,
      },
      {
        path: "/about",
        Component: About,
      },
      {
        path: "/our-work",
        Component: About,
      },
      {
        path: "/our-service",
        Component: Contact,
      },
      {
        path: "/contact",
        Component: Contact,
      },
      {
        path: "/login",
        Component: Login,
      },
      {
        path: "/customer/dashboard",
        Component: CustomerDashboard,
      },
      {
        path: "/customer/account",
        Component: CustomerAccount,
      },
      {
        path: "/admin/login",
        Component: AdminLogin,
      },
      {
        path: "/admin/dashboard",
        Component: AdminDashboard,
      },
      {
        path: "/admin/products",
        Component: AdminProducts,
      },
      {
        path: "/admin/categories",
        Component: AdminCategories,
      },
      {
        path: "/admin/orders",
        Component: AdminOrders,
      },
      {
        path: "/admin/promotions",
        Component: AdminPromotions,
      },
      {
        path: "/admin/testimonials",
        Component: AdminTestimonials,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);
