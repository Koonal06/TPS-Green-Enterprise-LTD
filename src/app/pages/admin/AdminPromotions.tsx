import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { apiRequest } from '../../lib/supabase';
import { toast } from 'sonner';

interface Promotion {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  discount_percent: number;
  start_date: string;
  end_date: string;
}

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_active: false,
    discount_percent: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  async function loadPromotions() {
    try {
      const res = await apiRequest('/promotions');
      setPromotions(res.promotions || []);
    } catch (error) {
      console.error('Error loading promotions:', error);
      toast.error('Failed to load promotions');
    }
  }

  function openDialog(promotion?: Promotion) {
    if (promotion) {
      setEditing(promotion);
      setFormData({
        title: promotion.title,
        description: promotion.description,
        is_active: promotion.is_active,
        discount_percent: promotion.discount_percent.toString(),
        start_date: promotion.start_date,
        end_date: promotion.end_date,
      });
    } else {
      setEditing(null);
      setFormData({
        title: '',
        description: '',
        is_active: false,
        discount_percent: '',
        start_date: '',
        end_date: '',
      });
    }
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const promotionData = {
        ...formData,
        discount_percent: parseFloat(formData.discount_percent),
      };

      if (editing) {
        await apiRequest(`/promotions/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(promotionData),
        }, true);
        toast.success('Promotion updated successfully');
      } else {
        await apiRequest('/promotions', {
          method: 'POST',
          body: JSON.stringify(promotionData),
        }, true);
        toast.success('Promotion created successfully');
      }

      setDialogOpen(false);
      loadPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error('Failed to save promotion');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    try {
      await apiRequest(`/promotions/${id}`, { method: 'DELETE' }, true);
      toast.success('Promotion deleted successfully');
      loadPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Failed to delete promotion');
    }
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Promotions</h1>
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Promotion
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map(promotion => (
            <Card key={promotion.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">{promotion.title}</h3>
                  <Badge variant={promotion.is_active ? "default" : "secondary"}>
                    {promotion.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{promotion.description}</p>
                <div className="mb-3">
                  <div className="text-2xl font-bold text-green-700">
                    {promotion.discount_percent}% OFF
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  <div>Start: {new Date(promotion.start_date).toLocaleDateString()}</div>
                  <div>End: {new Date(promotion.end_date).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openDialog(promotion)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(promotion.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Promotion Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Promotion' : 'Add Promotion'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

              <div>
                <Label htmlFor="discount">Discount Percentage *</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editing ? 'Update' : 'Create'} Promotion
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
