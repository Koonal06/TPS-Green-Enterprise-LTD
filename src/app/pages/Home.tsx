import React, { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Star, ShoppingCart, Flame, MessageCircle, Send, Bot, User, X } from 'lucide-react';
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

interface Testimonial {
  id: string;
  name: string;
  message: string;
  rating: number;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  discount_percent: number;
}

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

const categoryCards = [
  {
    name: 'Tomatoes',
    path: '/products/tomatoes',
    image:
      'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Cucumbers',
    path: '/products/cucumbers',
    image:
      'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Bell Peppers',
    path: '/products/bell-peppers',
    image:
      'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Plants',
    path: '/products/plants',
    image:
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80',
  },
];

const homepageHighlights = [
  {
    label: 'Greenhouse Grown',
    value: 'Fresh quality with better growing control',
  },
  {
    label: 'Local Supply',
    value: 'Serving homes, markets, and hotels',
  },
  {
    label: 'Reliable Orders',
    value: 'Built for consistency and simple shopping',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-message',
      role: 'assistant',
      content:
        'Hello! I am the TPS Green assistant. Ask me about products, promotions, categories, or how to use the site.',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const heroVideoUrl =
    'https://res.cloudinary.com/dstpuchpj/video/upload/v1774131167/Website_video_hofgrq.mp4';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (testimonials.length <= 3) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveTestimonialIndex((current) => (current + 1) % testimonials.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [testimonials]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  async function loadData() {
    try {
      const [productsRes, testimonialsRes, promotionsRes] = await Promise.all([
        apiRequest('/products'),
        apiRequest('/testimonials'),
        apiRequest('/promotions'),
      ]);

      setProducts(productsRes.products || []);
      setTestimonials(testimonialsRes.testimonials || []);
      setPromotions(promotionsRes.promotions?.filter((p: Promotion) => p.is_active) || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const flashSaleProducts = products.filter(p => p.is_flash_sale).slice(0, 4);
  const featuredProducts = products.slice(0, 6);
  const showcasedTestimonials =
    testimonials.length <= 3
      ? testimonials
      : Array.from({ length: Math.min(3, testimonials.length) }, (_, offset) => {
          return testimonials[(activeTestimonialIndex + offset) % testimonials.length];
        });

  const buildSitePrompt = (history: ChatMessage[], userMessage: string) => {
    const productSummary =
      products.length > 0
        ? products
            .slice(0, 8)
            .map(product => `${product.name} (${formatPrice(product.price)}): ${product.description}`)
            .join('\n')
        : 'No product data is available right now.';

    const promotionSummary =
      promotions.length > 0
        ? promotions
            .map(
              promotion =>
                `${promotion.title} - ${promotion.discount_percent}% off. ${promotion.description}`,
            )
            .join('\n')
        : 'There are no active promotions at the moment.';

    const categorySummary = categoryCards.map(category => category.name).join(', ');

    const conversationSummary =
      history.length > 0
        ? history
            .slice(-6)
            .map(entry => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.content}`)
            .join('\n')
        : 'No previous conversation.';

    return [
      'You are a helpful AI assistant for the TPS Green Enterprise website.',
      'Help visitors understand the site, products, promotions, categories, and shopping flow.',
      'If the answer is not available from the site context, say so clearly and avoid inventing details.',
      `Site categories: ${categorySummary}`,
      `Site promotions:\n${promotionSummary}`,
      `Featured products:\n${productSummary}`,
      `Conversation so far:\n${conversationSummary}`,
      `User: ${userMessage}`,
      'Assistant:',
    ].join('\n\n');
  };

  async function sendMessage(message: string, history: ChatMessage[]) {
    const res = await fetch('http://192.168.100.63:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: buildSitePrompt(history, message),
        stream: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`Chat request failed with status ${res.status}`);
    }

    const data = await res.json();
    return data.response as string;
  }

  const handleSendMessage = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage || isSending) {
      return;
    }

    const nextUserMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: trimmedMessage,
    };

    const historyForPrompt = [...messages, nextUserMessage];
    setMessages(historyForPrompt);
    setChatInput('');
    setIsSending(true);

    try {
      const response = await sendMessage(trimmedMessage, historyForPrompt);
      setMessages(current => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: response.trim() || 'I could not generate a response just now.',
        },
      ]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      const errorMessage =
        error instanceof Error && error.message.includes('Failed to fetch')
          ? 'I could not reach the Ollama server. Make sure it is running and that CORS/network access is allowed from this site.'
          : 'Something went wrong while contacting the AI server.';

      setMessages(current => [
        ...current,
        {
          id: `${Date.now()}-assistant-error`,
          role: 'assistant',
          content: errorMessage,
        },
      ]);
      toast.error('Unable to contact the AI assistant');
    } finally {
      setIsSending(false);
    }
  };

  const handleChatKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

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

  return (
    <>
      <Layout>
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-r from-green-800 to-green-600 text-white">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={heroVideoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-green-950/45" />
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                Fresh greenhouse produce from Mauritius
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Welcome to TPS Green Enterprise Ltd
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-green-50/90">
                Farm-fresh vegetables, trusted local supply, and a cleaner shopping experience for
                customers who value quality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Button
                  size="lg"
                  className="bg-white text-green-700 hover:bg-gray-100 w-full sm:w-auto"
                  onClick={() => navigate('/products')}
                >
                  Shop All Products
                </Button>
                <Button
                  size="lg"
                  className="bg-white/10 text-white border border-white/20 hover:bg-white/20 w-full sm:w-auto"
                  onClick={() => navigate('/about')}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="container mx-auto px-4">
          <div className="-mt-8 grid gap-4 md:grid-cols-3 relative z-20">
            {homepageHighlights.map((item) => (
              <Card key={item.label} className="border-green-100 shadow-lg">
                <CardContent className="p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-700">
                    {item.label}
                  </p>
                  <p className="mt-2 text-base font-medium text-gray-700">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
              Browse Faster
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Shop by Category</h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              Start with the product group you need and jump straight into the items that match.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {categoryCards.map((categoryCard) => (
              <Card
                key={categoryCard.name}
                className="overflow-hidden cursor-pointer border-0 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                onClick={() => navigate(categoryCard.path)}
              >
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-green-200 via-green-100 to-emerald-50">
                  <ImageWithFallback
                    src={categoryCard.image}
                    alt={categoryCard.name}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-950/55 via-green-900/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-white text-3xl font-bold drop-shadow-lg">{categoryCard.name}</h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      {promotions.length > 0 && (
        <section className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 py-5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {promotions.slice(0, 2).map(promo => (
                <div
                  key={promo.id}
                  className="flex items-center gap-3 rounded-full bg-white/50 px-4 py-2 shadow-sm"
                >
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    {promo.discount_percent}% OFF
                  </Badge>
                  <span className="font-semibold">{promo.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Flash Sale Section */}
      {flashSaleProducts.length > 0 && (
        <section className="py-16 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
                Limited Offers
              </p>
              <div className="mt-3 flex items-center justify-center gap-3">
              <Flame className="w-8 h-8 text-red-500" />
              <h2 className="text-3xl md:text-4xl font-bold text-center">Flash Sale!</h2>
              <Flame className="w-8 h-8 text-red-500" />
              </div>
              <p className="mt-3 text-gray-600">
                Grab selected products at promotional prices while current offers last.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashSaleProducts.map(product => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
                  <div className="relative h-48 bg-gray-200">
                    <Badge className="absolute top-2 right-2 bg-red-500 z-10">
                      Flash Sale
                    </Badge>
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
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
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
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
              Popular Picks
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Featured Products</h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              A curated look at some of the freshest items customers can explore right now.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map(product => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
                <div className="relative h-56 bg-gray-200">
                  <ImageWithFallback
                    src={product.image_url || 'https://images.unsplash.com/photo-1649629174655-a6510a8066e6'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
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
                    Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-green-50">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                Customer Voices
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">What Our Customers Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {showcasedTestimonials.map(testimonial => (
                <Card key={testimonial.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 italic mb-4">"{testimonial.message}"</p>
                    <p className="font-semibold">- {testimonial.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {testimonials.length > 3 && (
              <div className="mt-8 flex justify-center gap-2">
                {testimonials.map((testimonial, index) => (
                  <button
                    key={testimonial.id}
                    type="button"
                    onClick={() => setActiveTestimonialIndex(index)}
                    className={`h-3 w-3 rounded-full transition ${
                      index === activeTestimonialIndex ? 'bg-green-700' : 'bg-green-200 hover:bg-green-300'
                    }`}
                    aria-label={`Show testimonial ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="bg-green-950 text-white">
        <div className="container mx-auto px-4 py-14">
          <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-100/80">
                Ready to Order
              </p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Browse fresh produce and move straight into your order
              </h2>
              <p className="mt-3 max-w-2xl text-green-100/80">
                Explore categories, catch current offers, and shop with a smoother path from product
                discovery to checkout.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-white text-green-900 hover:bg-green-50"
                onClick={() => navigate('/products')}
              >
                Browse Products
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>
      </Layout>

      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {isChatOpen && (
          <Card className="w-[calc(100vw-2rem)] max-w-[380px] border-green-200 bg-white shadow-2xl">
            <CardHeader className="rounded-t-xl bg-gradient-to-r from-green-700 to-emerald-600 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="h-5 w-5" />
                    TPS Green AI
                  </CardTitle>
                  <p className="mt-1 text-sm text-green-50/90">
                    Ask about products, offers, or using the website.
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsChatOpen(false)}
                  className="h-8 w-8 shrink-0 rounded-full text-white hover:bg-white/15 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[320px] px-4 py-4">
                <div className="space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex max-w-[88%] gap-3 rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          message.role === 'user'
                            ? 'bg-green-700 text-white'
                            : 'border border-green-100 bg-green-50 text-gray-900'
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            message.role === 'user'
                              ? 'bg-white/15 text-white'
                              : 'bg-green-700 text-white'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <p className="whitespace-pre-wrap leading-6">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {isSending && (
                    <div className="flex justify-start">
                      <div className="flex max-w-[88%] gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-gray-900 shadow-sm">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-700 text-white">
                          <Bot className="h-4 w-4" />
                        </div>
                        <p className="leading-6">Thinking...</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t border-green-100 p-4">
              <form className="flex w-full gap-2" onSubmit={handleSendMessage}>
                <Input
                  value={chatInput}
                  onChange={event => setChatInput(event.target.value)}
                  onKeyDown={handleChatKeyDown}
                  placeholder="Ask something..."
                  disabled={isSending}
                  className="h-11 border-green-200"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isSending || !chatInput.trim()}
                  className="h-11 w-11 shrink-0 bg-green-700 hover:bg-green-800"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        )}

        <Button
          type="button"
          size="icon"
          onClick={() => setIsChatOpen(current => !current)}
          className="h-14 w-14 rounded-full bg-green-700 shadow-xl hover:bg-green-800"
          aria-label={isChatOpen ? 'Close AI assistant' : 'Open AI assistant'}
        >
          {isChatOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        </Button>
      </div>
    </>
  );
}
