
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Order, Service } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface OrderWithService extends Order {
  services: Service;
}

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<OrderWithService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            services(*)
          `)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending Payment</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
      case 'revision':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Revision</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-5 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-[120px]" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <Button onClick={() => navigate('/services')}>Browse Services</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{order.services.name}</CardTitle>
                <CardDescription>
                  Ordered {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                </CardDescription>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-gray-500 line-clamp-2">{order.requirements}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm font-medium">₹{order.services.price.toLocaleString()}</div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default OrderList;