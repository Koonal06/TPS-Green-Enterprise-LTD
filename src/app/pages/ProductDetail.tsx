import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ShoppingCart, ArrowLeft, Plus, Minus } from 'lucide-react';
import { apiRequest, hasCustomerSession } from '../lib/supabase';
import { formatPrice } from '../lib/currency';
import { useCart } from '../contexts/CartContext';
import { ImageWithFallback } from '../components/Img/ImageWithFallback';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  video_url?: string;
  category_id: string;
  is_flash_sale: boolean;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  async function loadProduct() {
    try {
      const res = await apiRequest(`/products/${id}`);
      setProduct(res.product);
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = () => {
    if (product) {
      const added = addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image_url: product.image_url,
      });

      if (added) {
        toast.success(`Added ${quantity} item(s) to cart!`);
        return;
      }

      if (!hasCustomerSession()) {
        navigate('/login');
      }
    }
  };

  const handleShopNow = () => {
    if (!hasCustomerSession()) {
      toast.error('Please log in to continue to checkout');
      navigate('/login');
      return;
    }

    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 mb-4">Product not found</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image/Video */}
          <div>
            {product.video_url ? (
              <div className="rounded-lg overflow-hidden bg-gray-100 mb-4">
                <video
                  controls
                  className="w-full h-auto"
                  poster={product.image_url}
                >
                  <source src={product.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden bg-gray-100 mb-4">
                <ImageWithFallback
                  src={product.image_url || 'https://images.unsplash.com/photo-1649629174655-a6510a8066e6'}
                  alt={product.name}
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              {product.is_flash_sale && (
                <Badge className="bg-red-500 mb-2">Flash Sale</Badge>
              )}
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-3xl font-bold text-green-700">{formatPrice(product.price)}</p>
            </div>

            <div className="mb-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={handleShopNow}
              >
                Shop Now
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold mb-2">Why Choose Our Products?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Farm fresh quality guaranteed</li>
                <li>✓ Organic and pesticide-free</li>
                <li>✓ Delivered within 24 hours</li>
                <li>✓ 100% satisfaction guarantee</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
