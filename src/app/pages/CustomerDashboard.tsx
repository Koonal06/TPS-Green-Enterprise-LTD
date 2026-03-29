import React, { useEffect } from 'react';
import CustomerChatBot from '../components/CustomerChatBot';
import { useNavigate } from 'react-router';
import { ArrowRight, Leaf, ShoppingBag, Sparkles, Truck, Sprout, Salad, Trees } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { supabase } from '../lib/supabase';

const categoryCards = [
  {
    title: 'Tomatoes',
    description: 'Explore fresh greenhouse tomatoes ready for homes, markets, and hotels.',
    path: '/products/tomatoes',
    accent: 'from-rose-200 via-orange-50 to-white',
    glow: 'bg-rose-500/15',
    icon: Salad,
    eyebrow: 'Fresh harvest',
  },
  {
    title: 'Cucumbers',
    description: 'Browse crisp cucumbers grown with consistent quality and freshness.',
    path: '/products/cucumbers',
    accent: 'from-emerald-200 via-lime-50 to-white',
    glow: 'bg-emerald-500/15',
    icon: Sprout,
    eyebrow: 'Cooling picks',
  },
  {
    title: 'Bell Peppers',
    description: 'Discover colorful bell peppers ideal for retail, kitchens, and special orders.',
    path: '/products/bell-peppers',
    accent: 'from-amber-200 via-orange-50 to-white',
    glow: 'bg-amber-500/15',
    icon: Sparkles,
    eyebrow: 'Colorful range',
  },
  {
    title: 'Plants',
    description: 'Browse young plants and seedlings prepared for customers looking beyond produce.',
    path: '/products/plants',
    accent: 'from-lime-200 via-green-50 to-white',
    glow: 'bg-lime-500/15',
    icon: Trees,
    eyebrow: 'Garden ready',
  },
];

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { getCartCount, getCartTotal } = useCart();

  useEffect(() => {
    async function validateCustomer() {
      const token = localStorage.getItem('customerAccessToken');

      if (!token) {
        toast.error('Please login to access your customer portal');
        navigate('/login');
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser(token);

      if (!user || user.user_metadata?.role === 'admin') {
        localStorage.removeItem('customerAccessToken');
        toast.error('Please login with a customer account');
        navigate('/login');
      }
    }

    void validateCustomer();
  }, [navigate]);

  return (
    <Layout>
      <section className="bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.2),_transparent_45%),linear-gradient(180deg,_#f4fff4_0%,_#ffffff_100%)]">
        <div className="container mx-auto px-4 py-10 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-800 shadow-sm">
                <Leaf className="h-4 w-4" />
                Customer Shopping Portal
              </div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-green-950 md:text-6xl">
                Welcome back. Your fresh produce marketplace is ready.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-green-950/70">
                This customer space is built for browsing products, shopping by category, adding
                items to cart, and moving smoothly toward checkout. It follows the e-commerce flow
                outlined in your project proposal.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-green-700 text-white hover:bg-green-800"
                  onClick={() => navigate('/products')}
                >
                  Shop All Products
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/cart')}>
                  View Cart
                </Button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-green-100 bg-white/80 p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-green-500">
                    Cart Items
                  </p>
                  <p className="mt-2 text-2xl font-black text-green-900">{getCartCount()}</p>
                </div>
                <div className="rounded-2xl border border-green-100 bg-white/80 p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-green-500">
                    Cart Total
                  </p>
                  <p className="mt-2 text-2xl font-black text-green-900">Rs{getCartTotal().toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-green-100 bg-white/80 p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-green-500">
                    Account
                  </p>
                  <Button size="sm" className="mt-2 rounded-full bg-green-600 text-white hover:bg-green-700" onClick={() => navigate('/customer/account')}>
                    Manage
                  </Button>
                </div>
              </div>
            </div>

            <Card className="border-green-100 bg-white/90 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-green-950">Quick Purchase Flow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start gap-3 rounded-2xl bg-green-50 p-4">
                  <ShoppingBag className="mt-0.5 h-5 w-5 text-green-700" />
                  <div>
                    <p className="font-semibold text-green-950">Browse and choose</p>
                    <p>Open a category, compare items, and view product details before buying.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-green-50 p-4">
                  <Sparkles className="mt-0.5 h-5 w-5 text-green-700" />
                  <div>
                    <p className="font-semibold text-green-950">Catch promotions</p>
                    <p>Take advantage of flash sales, featured items, and special offers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-green-50 p-4">
                  <Truck className="mt-0.5 h-5 w-5 text-green-700" />
                  <div>
                    <p className="font-semibold text-green-950">Move to checkout</p>
                    <p>Add products to cart and continue to checkout when your order is ready.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <CustomerChatBot />

      <section className="bg-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                Quick Browse
              </p>
              <h2 className="mt-2 text-3xl font-bold text-green-950 md:text-4xl">
                Shop by Category
              </h2>
              <p className="mt-2 max-w-2xl text-gray-600">
                Start with your main product groups and move directly into the shopping experience.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-full border-green-200 px-6 hover:border-green-300 hover:bg-green-50"
              onClick={() => navigate('/products')}
            >
              Browse Full Catalog
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {categoryCards.map((category) => (
              <Card
                key={category.title}
                className="group overflow-hidden rounded-[2rem] border-green-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_60px_-24px_rgba(22,101,52,0.35)]"
              >
                <CardContent className="p-0">
                  <div className={`relative overflow-hidden bg-gradient-to-br ${category.accent} p-6`}>
                    <div className="absolute inset-x-6 top-5 flex items-center justify-between">
                      <span className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-green-800 backdrop-blur">
                        {category.eyebrow}
                      </span>
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${category.glow} text-green-900 ring-1 ring-white/40 backdrop-blur-sm transition duration-300 group-hover:scale-110`}>
                        <category.icon className="h-7 w-7" />
                      </div>
                    </div>
                    <div className="pt-24">
                      <h3 className="text-3xl font-black tracking-tight text-green-950">
                        {category.title}
                      </h3>
                    </div>
                    <p className="mt-4 min-h-[108px] text-base leading-8 text-green-950/72">
                      {category.description}
                    </p>
                    <button
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 font-semibold text-green-800 shadow-sm transition hover:bg-white"
                      onClick={() => navigate(category.path)}
                    >
                      Shop Category
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-green-950 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold">Need help before placing your order?</h2>
              <p className="mt-3 text-green-100/80">
                Contact TPS Green Enterprise Ltd for order support, product details, or supply
                questions for homes, markets, and hotels.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-white text-green-900 hover:bg-green-50"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
                onClick={() => navigate('/checkout')}
              >
                Go to Checkout
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
