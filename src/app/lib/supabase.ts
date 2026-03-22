import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = publicAnonKey;
export const CUSTOMER_AVATAR_BUCKET = 'make-1380c61f-products';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-1380c61f`;

export function hasCustomerSession() {
  return Boolean(localStorage.getItem('customerAccessToken'));
}

export async function resolveStorageUrl(pathOrUrl: string) {
  if (!pathOrUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const { data, error } = await supabase.storage
    .from(CUSTOMER_AVATAR_BUCKET)
    .createSignedUrl(pathOrUrl, 60 * 60 * 24 * 7);

  if (error) {
    throw error;
  }

  return data?.signedUrl || '';
}

// Helper function to make authenticated requests
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  useAuth: boolean = false
) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (useAuth) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    let token = session?.access_token;

    if (!token) {
      const storedAccessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (storedAccessToken && refreshToken) {
        const { data: restoredData, error: restoreError } = await supabase.auth.setSession({
          access_token: storedAccessToken,
          refresh_token: refreshToken,
        });

        if (!restoreError && restoredData.session?.access_token) {
          token = restoredData.session.access_token;
          localStorage.setItem('accessToken', restoredData.session.access_token);
          if (restoredData.session.refresh_token) {
            localStorage.setItem('refreshToken', restoredData.session.refresh_token);
          }
        }
      }

      if (!token && refreshToken) {
        const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

        if (!refreshError && refreshedData.session?.access_token) {
          token = refreshedData.session.access_token;
          localStorage.setItem('accessToken', refreshedData.session.access_token);
          if (refreshedData.session.refresh_token) {
            localStorage.setItem('refreshToken', refreshedData.session.refresh_token);
          }
        }
      }
    }

    token =
      token ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('customerAccessToken');

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } else {
    // Use public anon key for non-authenticated requests
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
