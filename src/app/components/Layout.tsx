import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Facebook, Instagram, LogOut, Menu, Settings, ShoppingCart, UserRound, X } from 'lucide-react';
import { toast } from 'sonner';
import { resolveStorageUrl, supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(
    Boolean(localStorage.getItem('customerAccessToken'))
  );
  const [customerName, setCustomerName] = useState('Customer');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAvatarUrl, setCustomerAvatarUrl] = useState('');
  const brandLogo =
    'https://res.cloudinary.com/dstpuchpj/image/upload/v1774132759/logo_mpnrhz.png';
  const loginIcon =
    'https://res.cloudinary.com/dstpuchpj/image/upload/v1774133089/user-interface_1_z73isw.png';
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/our-work', label: 'Our Work' },
    { to: '/our-service', label: 'Our Service' },
    { to: '/contact', label: 'Contact' },
  ];

  useEffect(() => {
    async function loadCustomer() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || localStorage.getItem('customerAccessToken');

      if (session?.access_token) {
        localStorage.setItem('customerAccessToken', session.access_token);
      }

      setIsCustomerLoggedIn(Boolean(token));

      if (!token) {
        setCustomerName('Customer');
        setCustomerEmail('');
        setCustomerAvatarUrl('');
        return;
      }

      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        setCustomerName('Customer');
        setCustomerEmail('');
        setCustomerAvatarUrl('');
        return;
      }

      const { data: profileRow } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      const avatarPath = profileRow?.avatar_url || user.user_metadata?.avatar_url || '';
      const avatarUrl = avatarPath ? await resolveStorageUrl(avatarPath) : '';

      setCustomerName(
        user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer'
      );
      setCustomerEmail(user.email || '');
      setCustomerAvatarUrl(avatarUrl);
    }

    loadCustomer();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        const token = session?.access_token || localStorage.getItem('customerAccessToken');

        if (session?.access_token) {
          localStorage.setItem('customerAccessToken', session.access_token);
        } else if (!session) {
          localStorage.removeItem('customerAccessToken');
        }

        setIsCustomerLoggedIn(Boolean(token));

        if (!session?.user) {
          setCustomerName('Customer');
          setCustomerEmail('');
          setCustomerAvatarUrl('');
          return;
        }

        const { data: profileRow } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .maybeSingle();
        const avatarPath = profileRow?.avatar_url || session.user.user_metadata?.avatar_url || '';
        const avatarUrl = avatarPath ? await resolveStorageUrl(avatarPath) : '';

        setCustomerName(
          session.user.user_metadata?.full_name ||
            session.user.email?.split('@')[0] ||
            'Customer'
        );
        setCustomerEmail(session.user.email || '');
        setCustomerAvatarUrl(avatarUrl);
      })();
    });

    const syncCustomerState = () => {
      loadCustomer();
    };

    window.addEventListener('customer-auth-changed', syncCustomerState);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('customer-auth-changed', syncCustomerState);
    };
  }, [location.pathname]);

  async function handleCustomerLogout() {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('customerAccessToken');
      window.dispatchEvent(new Event('customer-auth-changed'));
      setIsCustomerLoggedIn(false);
      setCustomerName('Customer');
      setCustomerEmail('');
      setCustomerAvatarUrl('');
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Customer logout error:', error);
      toast.error('Logout failed');
    }
  }

  const customerInitial = customerName.charAt(0).toUpperCase();
  const cartCount = getCartCount();
  const showFloatingCart =
    isCustomerLoggedIn && cartCount > 0 && location.pathname !== '/cart' && location.pathname !== '/checkout';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-green-800/60 bg-green-700/95 text-white shadow-lg backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 py-3">
            <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-95">
              <img
                src={brandLogo}
                alt="TPS Green Enterprise Ltd logo"
                className="h-14 w-auto object-contain drop-shadow-md"
              />
              <div className="leading-tight">
                <span className="block text-lg font-extrabold tracking-tight text-white md:text-2xl">
                  TPS Green Enterprise Ltd
                </span>
                <span className="hidden text-xs uppercase tracking-[0.28em] text-green-100/80 md:block">
                  Fresh Greenhouse Produce
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center rounded-full border border-white/15 bg-white/10 px-3 py-2 md:flex">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-green-700 shadow-sm'
                        : 'text-white/90 hover:bg-white/12 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Login and Mobile Menu */}
            <div className="flex items-center gap-4">
              {isCustomerLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 py-2 pl-2 pr-3 text-white transition hover:bg-white/20"
                      aria-label="Open account menu"
                    >
                      <Avatar className="h-10 w-10 border border-white/20 bg-white">
                        <AvatarImage
                          src={customerAvatarUrl}
                          alt={customerName}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-white text-sm font-bold text-green-800">
                          {customerInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden text-left md:block">
                        <p className="max-w-32 truncate text-sm font-semibold">{customerName}</p>
                        <p className="max-w-32 truncate text-xs text-green-100/80">
                          My account
                        </p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 rounded-2xl border-green-100 p-2" align="end">
                    <DropdownMenuLabel className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 border border-green-100">
                          <AvatarImage
                            src={customerAvatarUrl}
                            alt={customerName}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-green-100 font-bold text-green-700">
                            {customerInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">{customerName}</p>
                          <p className="truncate text-xs text-gray-500">{customerEmail}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="rounded-xl px-3 py-2"
                      onClick={() => navigate('/customer/account')}
                    >
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-xl px-3 py-2"
                      onClick={() => navigate('/customer/dashboard')}
                    >
                      <UserRound className="h-4 w-4" />
                      Customer Portal
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      className="rounded-xl px-3 py-2"
                      onClick={handleCustomerLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="relative rounded-full border border-white/20 bg-white/10 p-3.5 text-white transition hover:bg-white/20"
                  aria-label="Open login"
                >
                  <img src={loginIcon} alt="Login" className="h-8 w-8 object-contain" />
                </button>
              )}

              <button
                className="rounded-full border border-white/20 bg-white/10 p-3 text-white transition hover:bg-white/20 md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="mb-4 flex flex-col gap-2 rounded-3xl border border-white/15 bg-white/10 p-3 md:hidden">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-2xl px-4 py-3 font-medium transition ${
                      isActive
                        ? 'bg-white text-green-700'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {showFloatingCart && (
        <button
          onClick={() => navigate('/cart')}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-green-700 px-5 py-4 text-white shadow-2xl transition hover:scale-105 hover:bg-green-800"
          aria-label="Open shopping cart"
        >
          <span className="relative">
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-green-700">
              {cartCount}
            </span>
          </span>
          <span className="text-sm font-semibold">View Cart</span>
        </button>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">TPS Green Enterprise Ltd</h3>
              <p className="text-gray-400">
                Greenhouse-grown vegetables for households, markets, retailers, and hotels across Mauritius.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2">
                <Link to="/about" className="text-gray-400 hover:text-white transition">
                  About Us
                </Link>
                <Link to="/contact" className="text-gray-400 hover:text-white transition">
                  Contact
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact Info</h4>
              <p className="text-gray-400">Email: tpsgreenenterpriseltd@gmail.com</p>
              <p className="text-gray-400">Phone: +230-58059112</p>
              <p className="text-gray-400">Phone: +230-59290713</p>
              <p className="text-gray-400">Address: Providence, Mauritius</p>
              <div className="mt-4 flex items-center gap-3">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="rounded-full border border-gray-700 p-2 text-gray-400 transition hover:border-white hover:text-white"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/tpsgreen.enterprise_ltd?igsh=MWx5eHZlYXJnejE3NA%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="rounded-full border border-gray-700 p-2 text-gray-400 transition hover:border-white hover:text-white"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  aria-label="TikTok"
                  className="rounded-full border border-gray-700 p-2 text-gray-400 transition hover:border-white hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.195V2h-3.136v13.766c0 1.303-1.039 2.365-2.34 2.365a2.365 2.365 0 0 1 0-4.731c.288 0 .564.052.82.145v-3.2a5.54 5.54 0 0 0-.82-.061A5.506 5.506 0 0 0 4.84 15.79 5.506 5.506 0 0 0 10.343 21.3a5.506 5.506 0 0 0 5.503-5.509V8.78a7.93 7.93 0 0 0 4.644 1.49V7.134a4.73 4.73 0 0 1-.901-.448Z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2026 TPS Green Enterprise Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
