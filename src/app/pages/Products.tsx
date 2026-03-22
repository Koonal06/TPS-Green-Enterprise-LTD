import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ShoppingCart } from 'lucide-react';
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
  category_id: string;
  is_flash_sale: boolean;
}

interface Category {
  id: string;
  name: string;
}

function toCategorySlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getCategoryKeywords(slug: string) {
  const keywordMap: Record<string, string[]> = {
    tomatoes: ['tomato', 'tomatoes', 'cherry tomato'],
    cucumbers: ['cucumber', 'cucumbers', 'english cucumber', 'white cucumber'],
    'bell-peppers': ['bell pepper', 'bell peppers', 'pepper', 'peppers', 'capsicum'],
    plants: ['plant', 'plants', 'seedling', 'seedlings', 'nursery'],
  };

  return keywordMap[slug] || slug.split('-');
}

export default function Products() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [category]);

  async function loadData() {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiRequest('/products'),
        apiRequest('/categories'),
      ]);

      setCategories(categoriesRes.categories || []);
      
      const allProducts = productsRes.products || [];
      const categorySlug = category ? toCategorySlug(category) : '';

      if (!categorySlug) {
        setProducts(allProducts);
      } else {
        const matchedCategoryIds =
          categoriesRes.categories
            ?.filter((c: Category) => toCategorySlug(c.name) === categorySlug)
            .map((c: Category) => c.id) || [];

        const categoryKeywords = getCategoryKeywords(categorySlug);

        const filtered = allProducts.filter((p: Product) => {
          const productText = `${p.name} ${p.description}`.toLowerCase();
          const matchesCategoryId = matchedCategoryIds.includes(p.category_id);
          const matchesText = categoryKeywords.some((keyword) =>
            productText.includes(keyword.toLowerCase())
          );

          return matchesCategoryId || matchesText;
        });
        setProducts(filtered);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = (product: Product) => {
    const added = addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
    });

    if (added) {
      toast.success('Added to cart!');
      return;
    }

    if (!hasCustomerSession()) {
      navigate('/login');
    }
  };

  const matchedCategory = category
    ? categories.find((item) => toCategorySlug(item.name) === toCategorySlug(category))
    : null;
  const categoryTitle = matchedCategory?.name
    ? matchedCategory.name
    : category
      ? category
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      : 'All Products';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{categoryTitle}</h1>
          <p className="text-gray-600">
            {categoryTitle === 'All Products'
              ? 'Browse all available categories and fresh produce.'
              : `Browse our selection of fresh ${categoryTitle.toLowerCase()}.`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No products found in this category.</p>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
                <div className="relative h-56 bg-gray-200">
                  {product.is_flash_sale && (
                    <Badge className="absolute top-2 right-2 bg-red-500 z-10">
                      Flash Sale
                    </Badge>
                  )}
                  <ImageWithFallback
                    src={product.image_url || 'https://images.unsplash.com/photo-1649629174655-a6510a8066e6'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-700">{formatPrice(product.price)}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{product.description}</p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    View
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
