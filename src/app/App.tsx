import { RouterProvider } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from './components/ui/sonner';
import { CartProvider } from './contexts/CartContext';
import { router } from './routes';

export default function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
      <Toaster />
      <Analytics />
    </CartProvider>
  );
}