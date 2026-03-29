import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, Mail, Settings, Upload, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { API_URL, resolveStorageUrl, supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  avatarPath: string;
  avatarUrl: string;
}

export default function CustomerAccount() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CustomerProfile>({
    id: '',
    name: 'Customer',
    email: '',
    avatarPath: '',
    avatarUrl: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || localStorage.getItem('customerAccessToken');

      if (!token) {
        toast.error('Please login to access account settings');
        navigate('/login');
        return;
      }

      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user || user.user_metadata?.role === 'admin') {
        localStorage.removeItem('customerAccessToken');
        toast.error('Unable to load your account');
        navigate('/login');
        return;
      }

      const { data: profileRow } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      const avatarPath = profileRow?.avatar_url || user.user_metadata?.avatar_url || '';
      const avatarUrl = avatarPath ? await resolveStorageUrl(avatarPath) : '';

      setProfile({
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
        email: user.email || '',
        avatarPath,
        avatarUrl,
      });
    }

    loadProfile();
  }, [navigate]);

  const initial = profile.name.charAt(0).toUpperCase();

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

      if (!file) {
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        e.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Profile picture must be 5 MB or smaller');
        e.target.value = '';
        return;
      }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token || localStorage.getItem('customerAccessToken');

    if (!token) {
      toast.error('Please login to upload a profile picture');
      return;
    }

    setUploading(true);

    try {
      if (!profile.id) {
        throw new Error('Unable to find customer profile');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/profile/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload profile picture');
      }

      setProfile((current) => ({
        ...current,
        avatarPath: result.avatar_url,
        avatarUrl: result.signed_url || current.avatarUrl,
      }));
      window.dispatchEvent(new Event('customer-auth-changed'));
      toast.success('Profile picture updated');
    } catch (error: any) {
      console.error('Profile photo upload error:', error);
      toast.error(error.message || 'Failed to update profile picture');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <Layout>
      <section className="bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_45%),linear-gradient(180deg,_#f5fff4_0%,_#ffffff_100%)]">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-800 shadow-sm">
              <Settings className="h-4 w-4" />
              Account Settings
            </div>
            <h1 className="text-4xl font-black tracking-tight text-green-950 md:text-5xl">
              Manage your customer account
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-green-950/70">
              Review your profile details and continue shopping from your customer portal.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="border-green-100 shadow-lg">
              <CardContent className="flex flex-col items-center px-6 py-10 text-center">
                <Avatar className="mb-5 h-28 w-28 border-4 border-green-100 shadow-lg">
                  <AvatarImage src={profile.avatarUrl} alt={profile.name} className="object-cover" />
                  <AvatarFallback className="bg-green-100 text-4xl font-black text-green-700">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold text-green-950">{profile.name}</h2>
                <p className="mt-2 text-sm text-gray-500">Customer account</p>
                <div className="mt-6 w-full rounded-2xl border border-dashed border-green-200 bg-white p-4 text-left">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                    Profile Picture
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Upload a customer profile photo to personalize the account menu and account
                    page.
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    className="mt-4"
                    onChange={handleProfilePhotoChange}
                    disabled={uploading}
                  />
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading profile picture...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Recommended: square image for the best result
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-6 w-full rounded-2xl bg-green-50 p-4 text-left">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-green-700" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Email</p>
                      <p className="font-medium text-green-950">{profile.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-green-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-green-950">Profile Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-600">
                  <div className="rounded-2xl border border-green-100 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Display Name</p>
                    <p className="mt-2 text-lg font-semibold text-green-950">{profile.name}</p>
                  </div>
                  <div className="rounded-2xl border border-green-100 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Sign-in Email</p>
                    <p className="mt-2 text-lg font-semibold text-green-950">{profile.email}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-green-950">Next Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row">
                  <Button className="bg-green-700 hover:bg-green-800" onClick={() => navigate('/products')}>
                    Continue Shopping
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/customer/dashboard')}>
                    Back to Portal
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
