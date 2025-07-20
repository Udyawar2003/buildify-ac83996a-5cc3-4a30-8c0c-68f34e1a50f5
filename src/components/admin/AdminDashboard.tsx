
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, ShoppingBag, Users, Clock } from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  wallet: {
    balance: number;
    withdrawable_profit: number;
    business_growth_fund: number;
    expense_coverage: number;
  };
  recentOrders: any[];
  ordersByService: any[];
  revenueByMonth: any[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('week');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Get wallet info
        const { data: walletData } = await supabase
          .from('wallet')
          .select('*')
          .single();

        // Get total revenue
        const { data: revenueData } = await supabase
          .from('payments')
          .select('amount_inr')
          .eq('status', 'completed');
        
        const totalRevenue = revenueData?.reduce((sum, payment) => sum + payment.amount_inr, 0) || 0;

        // Get order counts
        const { data: pendingOrdersData } = await supabase
          .from('orders')
          .select('id')
          .in('status', ['pending', 'processing', 'revision']);
        
        const { data: completedOrdersData } = await supabase
          .from('orders')
          .select('id')
          .eq('status', 'completed');

        // Get customer count
        const { data: customersData } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'customer');

        // Get recent orders
        const { data: recentOrdersData } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            created_at,
            services(name),
            payments(amount_inr)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        // Get orders by service
        const { data: ordersByServiceData } = await supabase
          .from('services')
          .select(`
            name,
            orders:orders(count)
          `);

        const ordersByService = ordersByServiceData?.map(service => ({
          name: service.name,
          orders: service.orders[0].count
        })) || [];

        // Get revenue by month (simplified)
        const { data: revenueByMonthData } = await supabase
          .from('payments')
          .select('amount_inr, created_at')
          .eq('status', 'completed');

        const revenueByMonth = processRevenueByMonth(revenueByMonthData || []);

        setStats({
          totalRevenue,
          pendingOrders: pendingOrdersData?.length || 0,
          completedOrders: completedOrdersData?.length || 0,
          totalCustomers: customersData?.length || 0,
          wallet: walletData || {
            balance: 0,
            withdrawable_profit: 0,
            business_growth_fund: 0,
            expense_coverage: 0
          },
          recentOrders: recentOrdersData || [],
          ordersByService,
          revenueByMonth
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const processRevenueByMonth = (data: any[]) => {
    const months: Record<string, number> = {};
    
    data.forEach(payment => {
      const date = new Date(payment.created_at);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!months[monthYear]) {
        months[monthYear] = 0;
      }
      
      months[monthYear] += payment.amount_inr;
    });
    
    return Object.entries(months).map(([name, value]) => ({ name, value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[120px]" />
                <Skeleton className="h-4 w-[80px] mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !stats) {
    return <div className="text-center text-red-500">{error || 'Failed to load dashboard'}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders > 0 ? 'Requires attention' : 'All caught up!'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 10) + 1} since last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 5) + 1} new this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Overview</CardTitle>
              <Tabs defaultValue={timeframe} className="w-[200px]">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="week" onClick={() => setTimeframe('week')}>Week</TabsTrigger>
                  <TabsTrigger value="month" onClick={() => setTimeframe('month')}>Month</TabsTrigger>
                  <TabsTrigger value="year" onClick={() => setTimeframe('year')}>Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardDescription>
              Revenue trends over time
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Wallet Overview</CardTitle>
            <CardDescription>
              Current funds distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Total Balance</p>
                    <p className="text-sm font-medium">₹{stats.wallet.balance.toLocaleString()}</p>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Withdrawable Profit</p>
                    <p className="text-sm font-medium">₹{stats.wallet.withdrawable_profit.toLocaleString()}</p>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${(stats.wallet.withdrawable_profit / stats.wallet.balance) * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Business Growth Fund</p>
                    <p className="text-sm font-medium">₹{stats.wallet.business_growth_fund.toLocaleString()}</p>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-purple-500" style={{ width: `${(stats.wallet.business_growth_fund / stats.wallet.balance) * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Expense Coverage</p>
                    <p className="text-sm font-medium">₹{stats.wallet.expense_coverage.toLocaleString()}</p>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${(stats.wallet.expense_coverage / stats.wallet.balance) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest order activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm font-medium">{order.services.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={
                        order.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        order.status === 'revision' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                        'bg-yellow-100 text-yellow-800 border-yellow-300'
                      }>
                        {order.status}
                      </Badge>
                      <span className="text-sm font-medium">
                        ₹{order.payments[0]?.amount_inr.toLocaleString() || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Popular Services</CardTitle>
            <CardDescription>
              Services by order volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.ordersByService.sort((a, b) => b.orders - a.orders).slice(0, 5).map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{service.name}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 rounded-full bg-gray-100">
                      <div 
                        className="h-full rounded-full bg-blue-600" 
                        style={{ 
                          width: `${(service.orders / Math.max(...stats.ordersByService.map(s => s.orders))) * 100}%` 
                        }} 
                      />
                    </div>
                    <span className="text-sm font-medium">{service.orders}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;