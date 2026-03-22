import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { apiRequest } from '../../lib/supabase';
import { formatPrice } from '../../lib/currency';
import { toast } from 'sonner';
import { ImageWithFallback } from '../../components/Img/ImageWithFallback';

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

interface Category {
  id: string;
  name: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    video_url: '',
    category_id: '',
    is_flash_sale: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiRequest('/products'),
        apiRequest('/categories'),
      ]);
      setProducts(productsRes.products || []);
      setCategories(categoriesRes.categories || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  }

  function openDialog(product?: Product) {
    if (product) {
      setEditing(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        image_url: product.image_url,
        video_url: product.video_url || '',
        category_id: product.category_id,
        is_flash_sale: product.is_flash_sale,
      });
    } else {
      setEditing(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        image_url: '',
        video_url: '',
        category_id: '',
        is_flash_sale: false,
      });
    }
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (!formData.category_id) {
        toast.error('Please select a category');
        return;
      }

      const parsedPrice = parseFloat(formData.price);

      if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      const productData = {
        ...formData,
        price: parsedPrice,
      };

      if (editing) {
        await apiRequest(`/products/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(productData),
        }, true);
        toast.success('Product updated successfully');
      } else {
        await apiRequest('/products', {
          method: 'POST',
          body: JSON.stringify(productData),
        }, true);
        toast.success('Product created successfully');
      }

      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await apiRequest(`/products/${id}`, { method: 'DELETE' }, true);
      toast.success('Product deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Products</h1>
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="mb-3 h-40 bg-gray-200 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={product.image_url || 'https://images.unsplash.com/photo-1649629174655-a6510a8066e6'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                <p className="text-lg font-bold text-green-700 mb-3">{formatPrice(product.price)}</p>
                {product.is_flash_sale && (
                  <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded mb-3">
                    Flash Sale
                  </span>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openDialog(product)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Product Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (Rs) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No categories found. Create one in Admin Categories first.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="video_url">Video URL (optional)</Label>
                <Input
                  id="video_url"
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="flash_sale"
                  checked={formData.is_flash_sale}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_flash_sale: checked })}
                />
                <Label htmlFor="flash_sale">Flash Sale</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editing ? 'Update' : 'Create'} Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
