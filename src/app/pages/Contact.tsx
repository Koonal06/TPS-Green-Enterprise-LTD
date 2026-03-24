import React, { useState } from 'react';
import { useLocation } from 'react-router';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Mail,
  Phone,
  MapPin,
  Truck,
  Sprout,
  Building2,
  ShieldCheck,
  Clock3,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const { pathname } = useLocation();
  const isOurServicePage = pathname === '/our-service';
  const formAction = 'https://formspree.io/f/mgonbban';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const serviceHighlights = [
    {
      title: 'Fresh Vegetable Supply',
      description:
        'Consistent greenhouse-grown vegetable supply for households, shops, markets, and hospitality businesses.',
      icon: Sprout,
    },
    {
      title: 'Reliable Delivery Support',
      description:
        'A service approach built around timely handling, freshness preservation, and dependable order fulfillment.',
      icon: Truck,
    },
    {
      title: 'Business Supply Solutions',
      description:
        'Support for retailers, resellers, and hotels looking for a stable local source of quality vegetables.',
      icon: Building2,
    },
    {
      title: 'Quality-Focused Operations',
      description:
        'Careful greenhouse production and crop handling practices that help maintain strong quality standards.',
      icon: ShieldCheck,
    },
  ];

  const serviceBenefits = [
    {
      title: 'Responsive Service',
      description: 'We aim to make communication simple, clear, and helpful for every customer type.',
      icon: Users,
    },
    {
      title: 'Seasonal Consistency',
      description: 'Protected growing conditions help us manage quality and supply more reliably.',
      icon: Clock3,
    },
    {
      title: 'Local Market Focus',
      description: 'Our services are shaped around the real needs of the Mauritian fresh produce market.',
      icon: MapPin,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(formAction, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send form');
      }

      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast.error('Unable to send your message right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            {isOurServicePage ? 'Our Services' : 'Contact Us'}
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            {isOurServicePage
              ? 'Explore how TPS Green supports customers, retailers, markets, and hospitality businesses with dependable greenhouse-grown produce services.'
              : "We'd love to hear from you. Reach out with questions, requests, or partnership enquiries."}
          </p>
        </div>

        {isOurServicePage && (
          <div className="mb-12 space-y-12">
            <div className="rounded-3xl bg-gradient-to-r from-green-800 via-emerald-700 to-lime-600 px-6 py-10 text-white md:px-10">
              <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-green-100">
                    Service Overview
                  </p>
                  <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                    Built to deliver freshness, consistency, and trust
                  </h2>
                  <p className="max-w-2xl text-base leading-7 text-green-50/90 md:text-lg">
                    TPS Green Enterprise combines greenhouse farming discipline with practical customer
                    service, helping clients receive vegetables that are fresh, reliable, and ready for
                    everyday use or business supply.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/12 p-5 backdrop-blur-sm">
                    <p className="text-sm text-green-100">Supply Focus</p>
                    <p className="mt-2 text-2xl font-bold">Retail + Hotels</p>
                  </div>
                  <div className="rounded-2xl bg-white/12 p-5 backdrop-blur-sm">
                    <p className="text-sm text-green-100">Production Model</p>
                    <p className="mt-2 text-2xl font-bold">Greenhouse Grown</p>
                  </div>
                  <div className="rounded-2xl bg-white/12 p-5 backdrop-blur-sm">
                    <p className="text-sm text-green-100">Core Promise</p>
                    <p className="mt-2 text-2xl font-bold">Fresh + Dependable</p>
                  </div>
                  <div className="rounded-2xl bg-white/12 p-5 backdrop-blur-sm">
                    <p className="text-sm text-green-100">Market</p>
                    <p className="mt-2 text-2xl font-bold">Mauritius</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-8 text-center text-3xl font-bold">What We Offer</h2>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {serviceHighlights.map(service => {
                  const Icon = service.icon;

                  return (
                    <Card
                      key={service.title}
                      className="border-green-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                    >
                      <CardContent className="p-6">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
                          <Icon className="h-7 w-7 text-green-700" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold">{service.title}</h3>
                        <p className="text-sm leading-6 text-gray-600">{service.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {serviceBenefits.map(item => {
                const Icon = item.icon;

                return (
                  <Card key={item.title} className="border-0 bg-green-50 shadow-none">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                        <Icon className="h-6 w-6 text-green-700" />
                      </div>
                      <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                      <p className="text-sm leading-6 text-gray-600">{item.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid max-w-5xl gap-8 mx-auto md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{isOurServicePage ? 'Request a Service Enquiry' : 'Send us a Message'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={formAction}
                method="POST"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder={isOurServicePage ? 'What service do you need?' : 'What is this about?'}
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder={
                      isOurServicePage
                        ? 'Tell us about your business, quantity needs, or delivery requirements...'
                        : 'Your message...'
                    }
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : isOurServicePage ? 'Send Enquiry' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isOurServicePage ? 'Service Contact Details' : 'Contact Information'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="mb-1 font-semibold">Email</h3>
                    <p className="text-gray-600">tpsgreenenterpriseltd@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="mt-1 h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="mb-1 font-semibold">Phone</h3>
                    <p className="text-gray-600">+230-58059112</p>
                    <p className="text-gray-600">+230-59290713</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="mb-1 font-semibold">Address</h3>
                    <p className="text-gray-600">
                      Providence
                      <br />
                      Mauritius
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isOurServicePage ? 'Availability' : 'Business Hours'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-semibold">8:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-semibold">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-semibold">Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
