import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import AdminLayout from '../../components/AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '../../components/ui/chart';
import {
  Package,
  ShoppingBag,
  Folder,
  Landmark,
  ArrowRight,
  TrendingUp,
  CircleDollarSign,
  ClipboardList,
} from 'lucide-react';
import { apiRequest } from '../../lib/supabase';
import { formatPrice } from '../../lib/currency';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total_price: number;
  status: string;
  created_at: string;
}

type AnalyticsView = 'daily' | 'monthly' | 'yearly';
const ORDER_TIME_ZONE = 'Indian/Mauritius';
const REVENUE_STATUSES = new Set(['pending', 'processing', 'completed']);

const salesChartConfig = {
  revenue: {
    label: 'Revenue',
    color: '#16a34a',
  },
};

const statusChartConfig = {
  pending: {
    label: 'Pending',
    color: '#f59e0b',
  },
  processing: {
    label: 'Processing',
    color: '#3b82f6',
  },
  completed: {
    label: 'Completed',
    color: '#16a34a',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#ef4444',
  },
};

function formatShortDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    weekday: 'short',
  });
}

function formatOrderDate(value: string, options?: Intl.DateTimeFormatOptions) {
  const date = getSafeDate(value);
  if (!date) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: ORDER_TIME_ZONE,
    ...options,
  }).format(date);
}

function getSafeDate(value: string | Date) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return Number.isNaN(localDate.getTime()) ? null : localDate;
  }

  const directDate = new Date(value);
  if (!Number.isNaN(directDate.getTime())) {
    return directDate;
  }

  const datePart = value.includes('T') ? value.split('T')[0] : value;
  const [year, month, day] = datePart.split('-').map(Number);
  const fallbackDate = new Date(year, (month || 1) - 1, day || 1);

  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

function formatMonthLabel(value: string) {
  const [year, month] = value.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-GB', {
    month: 'short',
    year: '2-digit',
  });
}

function formatYearLabel(value: string) {
  return value;
}

function getLastNDates(days: number, anchorDate?: string) {
  const today = anchorDate ? getSafeDate(anchorDate) || new Date() : new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));
    return toLocalDateKey(date);
  });
}

function getLastNMonths(months: number, anchorDate?: string) {
  const today = anchorDate ? getSafeDate(anchorDate) || new Date() : new Date();
  today.setDate(1);
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: months }, (_, index) => {
    const date = new Date(today);
    date.setMonth(today.getMonth() - (months - 1 - index));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });
}

function getLastNYears(years: number, anchorDate?: string) {
  const currentYear = anchorDate
    ? (getSafeDate(anchorDate) || new Date()).getFullYear()
    : new Date().getFullYear();

  return Array.from({ length: years }, (_, index) => String(currentYear - (years - 1 - index)));
}

function getOrderAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeStatus(status: string) {
  return status.trim().toLowerCase();
}

function getDatePartsInMauritius(value: string | Date) {
  const date = getSafeDate(value);
  if (!date) {
    return null;
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: ORDER_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    return null;
  }

  return { year, month, day };
}

function getDateKeyFromValue(value: string | Date) {
  const parts = getDatePartsInMauritius(value);
  if (parts) {
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  return toLocalDateKey(value);
}

function toLocalDateKey(value: string | Date) {
  const date = getSafeDate(value);
  if (!date) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [analyticsView, setAnalyticsView] = useState<AnalyticsView>('daily');

  const normalizedOrders = useMemo(
    () =>
      orders.map((order) => ({
        ...order,
        normalizedStatus: normalizeStatus(order.status),
        dateKey: getDateKeyFromValue(order.created_at),
        amount: getOrderAmount(order.total_price),
      })),
    [orders]
  );

  const revenueOrders = useMemo(
    () => normalizedOrders.filter((order) => REVENUE_STATUSES.has(order.normalizedStatus)),
    [normalizedOrders]
  );

  useEffect(() => {
    loadStats();

    const interval = window.setInterval(() => {
      loadStats();
    }, 60000);

    const handleWindowFocus = () => {
      loadStats();
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  async function loadStats() {
    try {
      const [productsRes, ordersRes, categoriesRes] = await Promise.all([
        apiRequest('/products'),
        apiRequest('/orders', {}, true),
        apiRequest('/categories'),
      ]);

      const loadedOrders = (ordersRes.orders || []) as Order[];
      const activeOrders = loadedOrders.filter((order) =>
        REVENUE_STATUSES.has(normalizeStatus(order.status))
      );
      const totalRevenue = activeOrders.reduce(
        (sum: number, order: Order) => sum + getOrderAmount(order.total_price),
        0
      );

      setOrders(
        [...loadedOrders].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
      setStats({
        totalProducts: productsRes.products?.length || 0,
        totalOrders: loadedOrders.length,
        totalCategories: categoriesRes.categories?.length || 0,
        totalRevenue,
        averageOrderValue: activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  const salesTrend = useMemo(() => {
    const validOrderDateKeys = revenueOrders
      .map((order) => order.dateKey)
      .filter(Boolean)
      .sort();

    const latestOrderDate =
      validOrderDateKeys.length > 0
        ? validOrderDateKeys[validOrderDateKeys.length - 1]
        : undefined;

    if (analyticsView === 'daily') {
      const grouped = new Map<string, { period: string; revenue: number; orders: number }>();

      revenueOrders.forEach((order) => {
        const dateKey = order.dateKey;
        if (!dateKey) {
          return;
        }
        const current = grouped.get(dateKey) || { period: dateKey, revenue: 0, orders: 0 };
        current.revenue += order.amount;
        current.orders += 1;
        grouped.set(dateKey, current);
      });

      return getLastNDates(7, latestOrderDate).map((date) => {
        const current = grouped.get(date) || { period: date, revenue: 0, orders: 0 };

        return {
          ...current,
          label: formatShortDate(date),
        };
      });
    }

    if (analyticsView === 'monthly') {
      const grouped = new Map<string, { period: string; revenue: number; orders: number }>();

      revenueOrders.forEach((order) => {
        if (!order.dateKey) {
          return;
        }
        const monthKey = order.dateKey.slice(0, 7);
        const current = grouped.get(monthKey) || { period: monthKey, revenue: 0, orders: 0 };
        current.revenue += order.amount;
        current.orders += 1;
        grouped.set(monthKey, current);
      });

      return getLastNMonths(6, latestOrderDate).map((month) => {
        const current = grouped.get(month) || { period: month, revenue: 0, orders: 0 };

        return {
          ...current,
          label: formatMonthLabel(month),
        };
      });
    }

    const grouped = new Map<string, { period: string; revenue: number; orders: number }>();

    revenueOrders.forEach((order) => {
      if (!order.dateKey) {
        return;
      }
      const yearKey = order.dateKey.slice(0, 4);
      const current = grouped.get(yearKey) || { period: yearKey, revenue: 0, orders: 0 };
      current.revenue += order.amount;
      current.orders += 1;
      grouped.set(yearKey, current);
    });

    return getLastNYears(5, latestOrderDate).map((year) => {
      const current = grouped.get(year) || { period: year, revenue: 0, orders: 0 };

      return {
        ...current,
        label: formatYearLabel(year),
      };
    });
  }, [analyticsView, revenueOrders]);

  const analyticsSummaryLabel = useMemo(() => {
    if (analyticsView === 'daily') {
      return '7-day revenue';
    }
    if (analyticsView === 'monthly') {
      return '6-month revenue';
    }
    return '5-year revenue';
  }, [analyticsView]);

  const revenueMax = useMemo(() => {
    const maxValue = Math.max(...salesTrend.map((item) => item.revenue), 0);
    return maxValue === 0 ? 4 : Math.ceil(maxValue * 1.15);
  }, [salesTrend]);

  const analyticsTitle = useMemo(() => {
    if (analyticsView === 'daily') {
      return 'Sales Trend (7 Days)';
    }
    if (analyticsView === 'monthly') {
      return 'Sales Trend (6 Months)';
    }
    return 'Sales Trend (5 Years)';
  }, [analyticsView]);

  const analyticsSubtitle = useMemo(() => {
    if (analyticsView === 'daily') {
      return 'Daily revenue and order volume';
    }
    if (analyticsView === 'monthly') {
      return 'Monthly revenue and order volume';
    }
    return 'Yearly revenue and order volume';
  }, [analyticsView]);

  const orderStatusData = useMemo(() => {
    const statusMap = new Map<string, number>();

    normalizedOrders.forEach((order) => {
      statusMap.set(order.normalizedStatus, (statusMap.get(order.normalizedStatus) || 0) + 1);
    });

    return Array.from(statusMap.entries()).map(([status, value]) => ({
      status,
      value,
      fill:
        status === 'pending'
          ? '#f59e0b'
          : status === 'processing'
            ? '#3b82f6'
            : status === 'completed'
              ? '#16a34a'
              : '#ef4444',
    }));
  }, [normalizedOrders]);

  const recentOrders = orders.slice(0, 5);
  const totalStatusOrders = orderStatusData.reduce((sum, item) => sum + item.value, 0);
  const leadingStatus = orderStatusData.reduce(
    (best, current) => (current.value > best.value ? current : best),
    orderStatusData[0] || { status: 'none', value: 0, fill: '#16a34a' }
  );
  const priorityStatuses = ['pending', 'processing', 'completed', 'cancelled'].map((status) => {
    const found = orderStatusData.find((item) => item.status === status);
    return {
      status,
      value: found?.value || 0,
      fill:
        found?.fill ||
        (status === 'pending'
          ? '#f59e0b'
          : status === 'processing'
            ? '#3b82f6'
            : status === 'completed'
              ? '#16a34a'
              : '#ef4444'),
      priority:
        status === 'pending'
          ? 'Needs attention'
          : status === 'processing'
            ? 'In progress'
            : status === 'completed'
              ? 'Done'
              : 'Review issue',
    };
  });
  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'text-emerald-700',
      bg: 'bg-emerald-100',
      note: 'Available in your catalog',
    },
    {
      title: 'Orders Received',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'text-blue-700',
      bg: 'bg-blue-100',
      note: 'Across all tracked statuses',
    },
    {
      title: 'Categories',
      value: stats.totalCategories.toString(),
      icon: Folder,
      color: 'text-amber-700',
      bg: 'bg-amber-100',
      note: 'Product groups currently active',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: Landmark,
      color: 'text-green-700',
      bg: 'bg-green-100',
      note: `Avg order ${formatPrice(stats.averageOrderValue)}`,
    },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] bg-gradient-to-br from-green-950 via-green-900 to-lime-700 p-8 text-white shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-green-100/80">
              TPS Green Admin
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
              Store performance and sales analytics at a glance
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-green-50/85">
              Monitor products, orders, revenue, and customer activity from a cleaner admin
              dashboard built for daily decision-making.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/admin/orders"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 font-semibold text-green-950 transition hover:bg-green-50"
              >
                Review Orders
              </Link>
              <Link
                to="/admin/products"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
              >
                Manage Products
              </Link>
            </div>
          </div>

          <Card className="border-green-100 shadow-lg">
            <CardHeader>
              <CardTitle>Admin Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-green-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-green-100 p-2 text-green-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{analyticsSummaryLabel}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(salesTrend.reduce((sum, item) => sum + item.revenue, 0))}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-green-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-lime-100 p-2 text-lime-700">
                    <CircleDollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average order value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(stats.averageOrderValue)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-green-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Most recent activity</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {recentOrders.length > 0
                        ? `${recentOrders[0].customer_name} placed an order on ${formatOrderDate(
                            recentOrders[0].created_at
                          )}`
                        : 'No recent order activity yet'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card className="border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  href: '/admin/products',
                  title: 'Manage Products',
                  description: 'Add, edit, or remove items from the catalog.',
                },
                {
                  href: '/admin/orders',
                  title: 'View Orders',
                  description: 'Review customer purchases and update statuses.',
                },
                {
                  href: '/admin/promotions',
                  title: 'Create Promotions',
                  description: 'Launch discounts and flash sales quickly.',
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="flex items-center justify-between rounded-2xl border border-green-100 p-4 transition hover:bg-green-50"
                >
                  <div>
                    <div className="font-semibold text-gray-900">{action.title}</div>
                    <div className="text-sm text-gray-600">{action.description}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-green-700" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-green-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  <div className={`rounded-2xl p-2 ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-950">{stat.value}</div>
                  <p className="mt-2 text-sm text-gray-500">{stat.note}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <Card className="border-green-100 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold tracking-tight text-gray-950">
                    {analyticsTitle}
                  </CardTitle>
                  <p className="mt-1 text-base text-gray-600">{analyticsSubtitle}</p>
                </div>
                <div className="inline-flex rounded-full border border-green-100 bg-green-50 p-1">
                  {(['daily', 'monthly', 'yearly'] as AnalyticsView[]).map((view) => (
                    <Button
                      key={view}
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setAnalyticsView(view)}
                      className={`rounded-full px-4 capitalize ${
                        analyticsView === view
                          ? 'bg-white text-green-800 shadow-sm hover:bg-white'
                          : 'text-gray-600 hover:bg-transparent hover:text-green-800'
                      }`}
                    >
                      {view}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {salesTrend.length > 0 ? (
                <ChartContainer config={salesChartConfig} className="h-[300px] w-full md:h-[320px]">
                  <LineChart data={salesTrend} margin={{ left: 8, right: 8, top: 20, bottom: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 4" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis
                      yAxisId="revenue"
                      tickLine={false}
                      axisLine={false}
                      domain={[0, revenueMax]}
                      tickFormatter={(value) => String(value)}
                      width={56}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          indicator="line"
                          formatter={(value, name) => (
                            <div className="flex w-full items-center justify-between gap-6">
                              <span className="text-muted-foreground">
                                {name === 'revenue' ? 'Revenue' : String(name)}
                              </span>
                                <span className="font-mono font-medium">
                                  {formatPrice(Number(value))}
                                </span>
                              </div>
                            )}
                          />
                        }
                      />
                    <Line
                      yAxisId="revenue"
                      type="monotone"
                      dataKey="revenue"
                      name="revenue"
                      stroke="var(--color-revenue)"
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      dot={{
                        r: 6,
                        fill: 'var(--color-revenue)',
                        stroke: '#ffffff',
                        strokeWidth: 3,
                      }}
                      activeDot={{
                        r: 8,
                        fill: 'var(--color-revenue)',
                        stroke: '#ffffff',
                        strokeWidth: 4,
                      }}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[280px] items-center justify-center rounded-2xl bg-green-50 text-sm text-gray-500 md:h-[300px]">
                  Sales analytics will appear here once orders are available.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-green-100 shadow-sm">
            <CardHeader>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-gray-950">
                  Order Status Overview
                </CardTitle>
                <p className="mt-1 text-sm text-gray-600">
                  A quick look at how current orders are distributed across statuses.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {orderStatusData.length > 0 ? (
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-green-50 p-4">
                      <p className="text-sm text-gray-500">Tracked orders</p>
                      <p className="mt-1 text-3xl font-bold text-gray-950">{totalStatusOrders}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-green-100">
                      <p className="text-sm text-gray-500">Leading status</p>
                      <p className="mt-1 text-lg font-bold capitalize leading-tight text-green-700 md:text-[1.35rem] break-words">
                        {leadingStatus.status}
                      </p>
                    </div>
                  </div>

                  <ChartContainer config={statusChartConfig} className="mx-auto h-[280px] max-w-[320px]">
                    <PieChart>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            nameKey="status"
                            formatter={(value, name) => (
                              <div className="flex w-full items-center justify-between gap-6">
                                <span className="text-muted-foreground capitalize">{String(name)}</span>
                                <span className="font-mono font-medium">{Number(value)}</span>
                              </div>
                            )}
                          />
                        }
                      />
                      <Pie
                        data={orderStatusData}
                        dataKey="value"
                        nameKey="status"
                        innerRadius={68}
                        outerRadius={104}
                        paddingAngle={4}
                        cornerRadius={8}
                        stroke="#ffffff"
                        strokeWidth={4}
                      />
                      <ChartLegend
                        content={<ChartLegendContent nameKey="status" />}
                        verticalAlign="bottom"
                      />
                    </PieChart>
                  </ChartContainer>

                  <div className="space-y-3">
                    {orderStatusData.map((item) => (
                      <div
                        key={item.status}
                        className="flex items-center justify-between rounded-2xl border border-green-100 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.fill }}
                          />
                          <span className="font-medium capitalize text-gray-900">{item.status}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-950">{item.value}</p>
                          <p className="text-xs text-gray-500">
                            {totalStatusOrders > 0
                              ? `${Math.round((item.value / totalStatusOrders) * 100)}%`
                              : '0%'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
                      Status Priority Guide
                    </p>
                    <div className="space-y-2">
                      {priorityStatuses.map((item) => (
                        <div
                          key={`priority-${item.status}`}
                          className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                            item.status === 'pending'
                              ? 'bg-amber-50'
                              : item.status === 'processing'
                                ? 'bg-blue-50'
                                : item.status === 'completed'
                                  ? 'bg-green-50'
                                  : 'bg-red-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: item.fill }}
                            />
                            <div>
                              <p className="font-medium capitalize text-gray-900">{item.status}</p>
                              <p className="text-xs text-gray-500">{item.priority}</p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-[320px] items-center justify-center rounded-2xl bg-green-50 text-sm text-gray-500">
                  No order statuses to analyze yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col gap-2 rounded-2xl border border-green-100 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">{order.customer_email}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-400">
                          {order.status}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="font-semibold text-green-700">{formatPrice(order.total_price)}</p>
                        <p className="text-sm text-gray-500">
                          {formatOrderDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-green-50 p-6 text-sm text-gray-500">
                    No recent orders found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
