import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Leaf, Loader2, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      if (data.session?.access_token) {
        localStorage.setItem('customerAccessToken', data.session.access_token);
        window.dispatchEvent(new Event('customer-auth-changed'));
        toast.success('Welcome back!');
        navigate('/customer/dashboard');
      }
    } catch (error: any) {
      console.error('Customer login error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.name,
            account_type: 'customer',
          },
        },
      });

      if (error) throw error;

      toast.success('Account created successfully. You can now log in.');
      setSignupData({ name: '', email: '', password: '' });
    } catch (error: any) {
      console.error('Customer signup error:', error);
      toast.error(error.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.22),_transparent_45%),linear-gradient(180deg,_#f3fff6_0%,_#e4f6e8_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden lg:block">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-4 py-2 text-sm font-medium text-green-800 shadow-sm">
                <Leaf className="h-4 w-4" />
                Customer Portal
              </div>
              <h1 className="mb-4 text-5xl font-black tracking-tight text-green-950">
                Fresh produce, faster orders, and a smoother customer experience.
              </h1>
              <p className="mb-8 text-lg leading-8 text-green-900/75">
                Sign in to manage your account as a customer of TPS Green Enterprise Ltd. This
                portal is separate from the admin dashboard and is designed for shoppers only.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-green-200 bg-white/75 p-5 shadow-sm">
                  <h2 className="mb-2 text-base font-bold text-green-900">Customer Access</h2>
                  <p className="text-sm text-green-900/70">
                    Keep shopping access separate from internal admin management.
                  </p>
                </div>
                <div className="rounded-3xl border border-green-200 bg-white/75 p-5 shadow-sm">
                  <h2 className="mb-2 text-base font-bold text-green-900">Secure Sign-In</h2>
                  <p className="text-sm text-green-900/70">
                    Log in with your email and password to access your customer account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 text-center lg:hidden">
              <UserRound className="mx-auto mb-3 h-14 w-14 text-green-700" />
              <h1 className="text-3xl font-black text-green-950">Customer Login</h1>
              <p className="mt-2 text-green-900/70">
                Access the TPS Green customer portal.
              </p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card className="border-green-100 bg-white/95 shadow-xl">
                  <CardHeader>
                    <CardTitle>Customer Login</CardTitle>
                    <CardDescription>
                      Use your customer account to continue shopping with TPS Green Enterprise Ltd.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="customer-login-email">Email</Label>
                        <Input
                          id="customer-login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="customer-login-password">Password</Label>
                        <Input
                          id="customer-login-password"
                          type="password"
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({ ...loginData, password: e.target.value })
                          }
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          'Login as Customer'
                        )}
                      </Button>

                      <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/')}>
                        Back to Store
                      </Button>

                      <p className="text-center text-sm text-gray-500">
                        Admin team?
                        {' '}
                        <Link to="/admin/login" className="font-semibold text-green-700 hover:text-green-800">
                          Go to admin login
                        </Link>
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="signup">
                <Card className="border-green-100 bg-white/95 shadow-xl">
                  <CardHeader>
                    <CardTitle>Create Customer Account</CardTitle>
                    <CardDescription>
                      Register as a customer to keep your access separate from the admin portal.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div>
                        <Label htmlFor="customer-signup-name">Full Name</Label>
                        <Input
                          id="customer-signup-name"
                          type="text"
                          placeholder="Your full name"
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="customer-signup-email">Email</Label>
                        <Input
                          id="customer-signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="customer-signup-password">Password</Label>
                        <Input
                          id="customer-signup-password"
                          type="password"
                          placeholder="Create a password"
                          value={signupData.password}
                          onChange={(e) =>
                            setSignupData({ ...signupData, password: e.target.value })
                          }
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          'Create Customer Account'
                        )}
                      </Button>

                      <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/')}>
                        Back to Store
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
