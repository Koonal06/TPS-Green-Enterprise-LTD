import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { apiRequest } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function SeedData() {
  const [loading, setLoading] = useState(false);

  async function seedDatabase() {
    setLoading(true);
    try {
      // Create categories
      const categories = [
        { name: 'Tomatoes' },
        { name: 'Cucumbers' },
        { name: 'Bell Peppers' },
      ];

      const createdCategories = [];
      for (const cat of categories) {
        const res = await apiRequest('/categories', {
          method: 'POST',
          body: JSON.stringify(cat),
        }, true);
        createdCategories.push(res.category);
      }

      // Create products
      const products = [
        {
          name: 'Tomatoes',
          description: 'Fresh greenhouse tomatoes at Rs 160 per kg.',
          price: 160,
          image_url: 'https://images.unsplash.com/photo-1649629174655-a6510a8066e6?w=500',
          category_id: createdCategories[0].id,
          is_flash_sale: true,
        },
        {
          name: 'Cherry Tomato',
          description: 'Sweet cherry tomatoes at Rs 250 per half kg.',
          price: 250,
          image_url: 'https://images.unsplash.com/photo-1649629174655-a6510a8066e6?w=500',
          category_id: createdCategories[0].id,
          is_flash_sale: false,
        },
        {
          name: 'White Cucumber',
          description: 'Fresh white cucumber available at Rs 60.',
          price: 60,
          image_url: 'https://images.unsplash.com/photo-1601906451998-bb5e51856e45?w=500',
          category_id: createdCategories[1].id,
          is_flash_sale: false,
        },
        {
          name: 'English Cucumber',
          description: 'Crisp English cucumber available at Rs 40.',
          price: 40,
          image_url: 'https://images.unsplash.com/photo-1601906451998-bb5e51856e45?w=500',
          category_id: createdCategories[1].id,
          is_flash_sale: false,
        },
        {
          name: 'Bell Peppers',
          description: 'Fresh bell peppers available at Rs 115.',
          price: 115,
          image_url: 'https://images.unsplash.com/photo-1509377244-b9820f59c12f?w=500',
          category_id: createdCategories[2].id,
          is_flash_sale: false,
        },
      ];

      for (const product of products) {
        await apiRequest('/products', {
          method: 'POST',
          body: JSON.stringify(product),
        }, true);
      }

      // Create testimonials
      const testimonials = [
        {
          name: 'Sarah Johnson',
          message: 'The freshest vegetables I\'ve ever ordered online! Delivered on time and in perfect condition.',
          rating: 5,
        },
        {
          name: 'Michael Chen',
          message: 'Amazing quality and great customer service. I order from TPS Green every week now.',
          rating: 5,
        },
        {
          name: 'Emily Rodriguez',
          message: 'Love the organic produce! You can really taste the difference in quality.',
          rating: 4,
        },
      ];

      for (const testimonial of testimonials) {
        await apiRequest('/testimonials', {
          method: 'POST',
          body: JSON.stringify(testimonial),
        }, true);
      }

      // Create promotions
      const promotions = [
        {
          title: 'Spring Sale',
          description: 'Fresh vegetables at amazing prices!',
          is_active: true,
          discount_percent: 20,
          start_date: '2026-03-01',
          end_date: '2026-03-31',
        },
      ];

      for (const promotion of promotions) {
        await apiRequest('/promotions', {
          method: 'POST',
          body: JSON.stringify(promotion),
        }, true);
      }

      toast.success('Database seeded successfully!');
    } catch (error) {
      console.error('Error seeding database:', error);
      toast.error('Failed to seed database');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Quick Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Click below to populate the database with sample products, categories, testimonials, and promotions.
          This is useful for testing and demonstration purposes.
        </p>
        <Button onClick={seedDatabase} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Seeding Database...
            </>
          ) : (
            'Seed Sample Data'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
