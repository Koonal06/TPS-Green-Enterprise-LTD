import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      if (data.user?.user_metadata?.role !== 'admin') {
        await supabase.auth.signOut();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw new Error('This account is not authorized for the admin portal');
      }

      if (data.session?.access_token && data.session.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        localStorage.setItem('accessToken', data.session.access_token);
        localStorage.setItem('refreshToken', data.session.refresh_token);
        toast.success('Login successful');
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-700 to-green-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <ShieldCheck className="mx-auto mb-4 h-16 w-16 text-white" />
          <h1 className="mb-2 text-3xl font-bold text-white">Admin Portal</h1>
          <p className="text-green-100">TPS Green Enterprise Management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="admin@tpsgreen.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>

              <p className="text-sm text-gray-500">
                Admin accounts are managed internally. Public self-signup is disabled.
              </p>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/')}
              >
                Back to Store
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
