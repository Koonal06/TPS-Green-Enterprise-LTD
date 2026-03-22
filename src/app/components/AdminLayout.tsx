import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Package, 
  Folder, 
  ShoppingBag, 
  Megaphone, 
  MessageSquare, 
  LogOut,
  ArrowLeft,
  Leaf
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token || localStorage.getItem('accessToken');

    if (!token) {
      toast.error('Please login to access admin panel');
      navigate('/admin/login');
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  }

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/categories', label: 'Categories', icon: Folder },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/admin/promotions', label: 'Promotions', icon: Megaphone },
    { path: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_30%),linear-gradient(180deg,_#f6fbf7_0%,_#eef6f0_100%)] flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-green-900/10 bg-green-950 text-white flex flex-col shadow-2xl">
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <Leaf className="h-5 w-5 text-green-200" />
            </div>
            <div>
              <h1 className="text-xl font-bold">TPS Green Admin</h1>
              <p className="text-sm text-green-100/70">Store management workspace</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <p className="px-4 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-green-100/50">
            Navigation
          </p>
          <div className="space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                    isActive
                      ? 'bg-white text-green-950 shadow-lg'
                      : 'text-green-100 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            className="w-full justify-start rounded-2xl text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start rounded-2xl text-white hover:bg-white/10"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-3 h-5 w-5" />
            Back to Store
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
