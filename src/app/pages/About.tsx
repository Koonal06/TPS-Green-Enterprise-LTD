import React, { useEffect, useState } from 'react';  
import { useLocation } from 'react-router';
import Layout from '../components/Layout';
import { Card, CardContent } from '../components/ui/card';
import {
  Leaf,
  Award,
  Truck,
  Heart,
  Sprout,
  ShieldCheck,
  Building2,
  BarChart3,
  CalendarRange,
  MapPin,
  Users,
  ChevronRight,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

function CountUpNumber({
  end,
  duration = 1600,
  suffix = '',
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.max(1, Math.round(duration / frameDuration));
    const increment = end / totalFrames;

    const timer = window.setInterval(() => {
      start += increment;

      if (start >= end) {
        setCount(end);
        window.clearInterval(timer);
        return;
      }

      setCount(Math.floor(start));
    }, frameDuration);

    return () => window.clearInterval(timer);
  }, [duration, end]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function About() {
  const { pathname } = useLocation();
  const isOurWorkPage = pathname === '/our-work';

  const values = [
    {
      title: 'Sustainability',
      description:
        'Responsible greenhouse practices that support long-term agricultural sustainability',
      icon: Leaf,
    },
    {
      title: 'Quality',
      description:
        'Carefully grown vegetables that meet high standards of freshness and presentation',
      icon: Award,
    },
    {
      title: 'Freshness',
      description:
        'Reliable supply of freshly harvested produce for customers, retailers, and hotels',
      icon: Truck,
    },
    {
      title: 'Care',
      description:
        'A people-first approach built on trust, service, and local community support',
      icon: Heart,
    },
  ];

  const workHighlights = [
    {
      title: 'Greenhouse Cultivation',
      description:
        'We use protected greenhouse farming to manage crop conditions more precisely and produce consistent, high-quality vegetables.',
      icon: Sprout,
    },
    {
      title: 'Quality Control',
      description:
        'From irrigation and crop care to harvest handling, our process is designed around freshness, appearance, and dependable standards.',
      icon: ShieldCheck,
    },
    {
      title: 'Market Supply',
      description:
        'Our produce supports households, retailers, markets, and hospitality businesses that depend on steady local supply.',
      icon: Building2,
    },
    {
      title: 'Growth Focus',
      description:
        'We continue expanding production capacity and exploring new crops to better serve evolving demand in Mauritius.',
      icon: BarChart3,
    },
  ];

  const aboutStats = [
    {
      label: 'Founded',
      value: '2018',
      icon: CalendarRange,
    },
    {
      label: 'Location',
      value: 'Providence, Mauritius',
      icon: MapPin,
    },
    {
      label: 'Customer Focus',
      value: 'Homes to Hotels',
      icon: Users,
    },
  ];

  const animatedStats = [
    {
      label: 'Growing Customers',
      value: 500,
      suffix: '+',
    },
    {
      label: 'Years Since Founded',
      value: new Date().getFullYear() - 2018,
      suffix: '+',
    },
    {
      label: 'Greenhouse Focus',
      value: 100,
      suffix: '%',
    },
  ];

  const milestones = [
    {
      year: '2018',
      title: 'Company Established',
      description:
        'TPS Green Enterprise Ltd began with a clear goal: produce high-quality greenhouse vegetables for the local market.',
    },
    {
      year: 'Growth Phase',
      title: 'Expanded Operations',
      description:
        'The business grew from a single tomato greenhouse into a broader operation serving more customers with stronger production capacity.',
    },
    {
      year: 'Today',
      title: 'Focused on Long-Term Supply',
      description:
        'The company continues investing in quality, consistency, and future crop expansion for the Mauritian market.',
    },
  ];

  const workStats = [
    {
      label: 'Production Style',
      value: 'Greenhouse Managed',
      icon: Sprout,
    },
    {
      label: 'Supply Reach',
      value: 'Homes to Hotels',
      icon: Building2,
    },
    {
      label: 'Operating Goal',
      value: 'Fresh + Reliable',
      icon: ShieldCheck,
    },
  ];

  const workProcess = [
    {
      step: '01',
      title: 'Controlled Growing',
      description:
        'Vegetables are grown in protected greenhouse conditions to improve consistency, crop care, and environmental control.',
    },
    {
      step: '02',
      title: 'Careful Monitoring',
      description:
        'Daily attention to irrigation, plant health, and growing conditions helps maintain quality throughout the production cycle.',
    },
    {
      step: '03',
      title: 'Harvest and Handling',
      description:
        'Produce is handled with freshness in mind so vegetables move from harvest toward customers in better condition.',
    },
    {
      step: '04',
      title: 'Customer Supply',
      description:
        'Orders support households, retailers, markets, and hospitality clients that depend on dependable local produce.',
    },
  ];

  const workOutcomes = [
    'Better protection from weather-related disruptions',
    'Stronger consistency in quality and presentation',
    'More dependable supply for local customers',
    'A practical foundation for future crop expansion',
  ];

  const pageTitle = isOurWorkPage ? 'Our Work at TPS Green Enterprise' : 'About TPS Green Enterprise';
  const pageSubtitle = isOurWorkPage
    ? 'A closer look at how we grow, manage, and deliver greenhouse vegetables with care and consistency'
    : 'Delivering premium greenhouse-grown vegetables across Mauritius with consistency, freshness, and care';
  const storyTitle = isOurWorkPage ? 'How We Work' : 'Our Story';
  const storyParagraphs = isOurWorkPage
    ? [
        'Our work begins inside carefully managed greenhouse environments where tomatoes, cucumbers, bell peppers, and other crops are cultivated under more controlled conditions. This allows TPS Green Enterprise Ltd to reduce exposure to unpredictable weather, improve crop protection, and support stronger production consistency throughout the year.',
        'We focus on practical agricultural discipline: monitored irrigation, attentive crop care, and harvest planning that protects quality from the growing stage through to delivery. That day-to-day work helps us serve households, retailers, markets, and hotels with vegetables that are fresher, cleaner, and more dependable.',
        'Beyond production itself, our work is also about building a stronger local food supply. By investing in greenhouse farming and steady operational improvement, TPS Green Enterprise Ltd is creating a more resilient model for fresh vegetable production in Mauritius.',
      ]
    : [
        'TPS GREEN ENTERPRISE LTD was established in 2018 in Providence Mauritius, with a clear vision to supply the local market with fresh, high-quality greenhouse-grown vegetables. What began with a single tomato greenhouse has grown into a larger operation in Mont-Ida, allowing the company to increase production and serve households, markets, and hotels more effectively.',
        'By focusing on greenhouse farming, TPS Green Enterprise Ltd benefits from greater control over temperature, irrigation, and crop protection. This approach supports more reliable harvests, stronger quality standards, and better protection from unpredictable weather and pest-related challenges often faced in open-field farming.',
        'Even during the COVID-19 period, the business remained resilient and continued moving forward. Today, TPS Green Enterprise Ltd operates full-time and is looking ahead to further expansion, improved production capacity, and the introduction of new crops to meet evolving customer needs.',
      ];
  const heroImageSrc = isOurWorkPage
    ? 'https://res.cloudinary.com/dstpuchpj/image/upload/v1774175061/Whisk_c86a9217b1d6d948bc14aecc276c3179dr_wpn5nj.png'
    : 'https://res.cloudinary.com/dstpuchpj/image/upload/v1774132399/High-resolution_gree_lt00dn.png';

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="container mx-auto px-4 py-8">
        <div
          className={`mb-12 overflow-hidden rounded-[2rem] ${
            isOurWorkPage
              ? 'bg-white'
              : 'bg-gradient-to-br from-green-950 via-green-900 to-lime-800 text-white shadow-2xl'
          }`}
        >
          {isOurWorkPage ? (
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-950 via-emerald-900 to-lime-800 text-white shadow-2xl">
              <div className="absolute inset-0 opacity-20">
                <ImageWithFallback
                  src={heroImageSrc}
                  alt="Our work background"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="relative grid gap-10 px-6 py-10 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:py-12">
                <div className="flex flex-col justify-center">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-green-100/85">
                    Our Work
                  </p>
                  <h1 className="mb-5 text-4xl font-bold leading-tight md:text-6xl">{pageTitle}</h1>
                  <p className="max-w-2xl text-base leading-7 text-green-50/90 md:text-lg">
                    {pageSubtitle}
                  </p>
                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    {workStats.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                        >
                          <Icon className="mb-3 h-5 w-5 text-green-100" />
                          <p className="text-sm text-green-100/80">{item.label}</p>
                          <p className="mt-1 font-semibold">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="overflow-hidden rounded-[1.75rem] border border-white/10 shadow-xl">
                  <ImageWithFallback
                    src={heroImageSrc}
                    alt="Greenhouse operations"
                    className="h-full min-h-[320px] w-full object-cover"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-10 px-6 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-10 md:py-12">
              <div className="flex flex-col justify-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-green-100/85">
                  About TPS Green
                </p>
                <h1 className="mb-5 text-4xl font-bold leading-tight md:text-6xl">
                  Growing freshness with purpose, discipline, and local pride
                </h1>
                <p className="max-w-2xl text-base leading-7 text-green-50/90 md:text-lg">
                  TPS Green Enterprise Ltd is a Mauritian greenhouse farming business focused on
                  quality vegetables, dependable supply, and sustainable agricultural growth for
                  households, retailers, markets, and hotels.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {aboutStats.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                      >
                        <Icon className="mb-3 h-5 w-5 text-green-100" />
                        <p className="text-sm text-green-100/80">{item.label}</p>
                        <p className="mt-1 font-semibold">{item.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="overflow-hidden rounded-[1.75rem] border border-white/10 shadow-xl">
                <ImageWithFallback
                  src={heroImageSrc}
                  alt="TPS Green greenhouse farm"
                  className="h-full min-h-[320px] w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {!isOurWorkPage && (
            <div className="rounded-[1.75rem] overflow-hidden shadow-lg">
              <ImageWithFallback
                src={heroImageSrc}
                alt="Our farm"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {isOurWorkPage && (
            <div className="rounded-lg overflow-hidden">
              <ImageWithFallback
                src={heroImageSrc}
                alt="Greenhouse operations"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4">{storyTitle}</h2>
            {storyParagraphs.map(paragraph => (
              <p key={paragraph} className="text-gray-700 mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {!isOurWorkPage && (
          <div className="mb-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-0 bg-green-50 shadow-none">
              <CardContent className="p-8">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                  Why We Exist
                </p>
                <h2 className="mb-4 text-3xl font-bold text-gray-900">A business built for better local supply</h2>
                <p className="mb-4 text-gray-700 leading-7">
                  TPS Green Enterprise Ltd was built around a practical belief: local customers deserve
                  fresher vegetables, stronger consistency, and a farming model that can adapt to changing
                  environmental and market conditions.
                </p>
                <p className="text-gray-700 leading-7">
                  Greenhouse cultivation gives us more control over crop performance, helps reduce common
                  open-field risks, and supports dependable output that can better serve the Mauritian market.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100">
              <CardContent className="p-8">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                  Company Snapshot
                </p>
                <div className="space-y-4">
                  {milestones.map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-700">{item.year}</p>
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!isOurWorkPage && (
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            {animatedStats.map((item) => (
              <Card key={item.label} className="border-green-100 bg-white shadow-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-4xl font-bold text-green-700 md:text-5xl">
                    <CountUpNumber end={item.value} suffix={item.suffix} />
                  </p>
                  <p className="mt-3 text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
                    {item.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isOurWorkPage && (
          <div className="mb-12 space-y-12">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="border-0 bg-green-50 shadow-none">
                <CardContent className="p-8">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                    Work Philosophy
                  </p>
                  <h2 className="mb-4 text-3xl font-bold text-gray-900">
                    Practical farming work guided by consistency
                  </h2>
                  <p className="mb-4 text-gray-700 leading-7">
                    Our work is not only about growing vegetables, but about creating a dependable
                    system behind them. Every stage of cultivation, monitoring, and handling is
                    designed to support quality and reduce disruption.
                  </p>
                  <p className="text-gray-700 leading-7">
                    That discipline allows TPS Green Enterprise Ltd to serve customers with greater
                    confidence while building a more resilient local production model.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-100">
                <CardContent className="p-8">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                    Outcomes We Aim For
                  </p>
                  <div className="space-y-4">
                    {workOutcomes.map((item) => (
                      <div key={item} className="flex gap-4">
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                        <p className="text-sm leading-6 text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-center mb-8">How Our Work Moves</h2>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {workProcess.map((item) => (
                  <Card key={item.step} className="border-green-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <CardContent className="p-6">
                      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                        Step {item.step}
                      </p>
                      <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
                      <p className="text-sm leading-6 text-gray-600">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
            <h2 className="text-3xl font-bold text-center mb-8">What We Focus On</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {workHighlights.map((item, index) => {
                const Icon = item.icon;

                return (
                  <Card
                    key={item.title}
                    className="group border-green-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                    style={{
                      opacity: 0,
                      animation: 'fadeUp 0.7s ease-out forwards',
                      animationDelay: `${index * 0.12}s`,
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 transition-transform duration-300 group-hover:scale-110 group-hover:bg-green-200">
                        <Icon className="h-8 w-8 text-green-700" />
                      </div>
                      <h3 className="font-bold mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            </div>
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            {isOurWorkPage ? 'The Standards Behind Our Work' : 'Our Values'}
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <Card
                  key={value.title}
                  className="group border-green-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  style={{
                    opacity: 0,
                    animation: 'fadeUp 0.7s ease-out forwards',
                    animationDelay: `${index * 0.15}s`,
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 transition-transform duration-300 group-hover:scale-110 group-hover:bg-green-200">
                      <Icon className="h-8 w-8 text-green-700" />
                    </div>
                    <h3 className="font-bold mb-2">{value.title}</h3>
                    <p className="text-sm text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg bg-green-50 p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {isOurWorkPage ? 'Why Our Work Matters' : 'Our Mission'}
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            {isOurWorkPage
              ? 'Our work is built around producing dependable, greenhouse-grown vegetables for the Mauritian market while improving freshness, supply stability, and long-term agricultural resilience.'
              : 'To grow and deliver high-quality vegetables through efficient greenhouse farming, combining modern agricultural methods with a strong commitment to freshness, reliability, and sustainable growth for the Mauritian market.'}
          </p>
        </div>

        {isOurWorkPage && (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card className="border-green-100 bg-white">
              <CardContent className="p-8">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                  Local Impact
                </p>
                <h2 className="mb-4 text-3xl font-bold">Supporting a stronger food supply chain</h2>
                <p className="text-gray-700 leading-7">
                  Our work helps strengthen local access to fresh vegetables by combining disciplined
                  production with a practical understanding of market demand in Mauritius.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-green-800 to-lime-700 text-white shadow-xl">
              <CardContent className="p-8">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-green-100">
                  Future Direction
                </p>
                <h2 className="mb-4 text-3xl font-bold">Expanding capacity with purpose</h2>
                <p className="leading-7 text-green-50/90">
                  As the business grows, our work remains focused on improving production standards,
                  serving customers more effectively, and preparing for the introduction of new crops.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!isOurWorkPage && (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card className="border-green-100 bg-white">
              <CardContent className="p-8">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                  Our Vision
                </p>
                <h2 className="mb-4 text-3xl font-bold">Looking ahead with confidence</h2>
                <p className="text-gray-700 leading-7">
                  We aim to keep strengthening greenhouse production, expand crop variety over time,
                  and build a lasting reputation for reliable fresh produce in Mauritius.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-green-800 to-lime-700 text-white shadow-xl">
              <CardContent className="p-8">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-green-100">
                  Our Commitment
                </p>
                <h2 className="mb-4 text-3xl font-bold">Fresh produce, grown with accountability</h2>
                <p className="leading-7 text-green-50/90">
                  Every step of our work is guided by quality, care, and a commitment to serving
                  customers with vegetables they can trust.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
