
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabase';
import { Order, Service } from '@/types';
import OrderDetails from '@/components/orders/OrderDetails';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<(Order & { services: Service }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!id) {
          throw new Error('Order ID is required');
        }

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login', { state: { redirect: `/orders/${id}` } });
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            services(*)
          `)
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        // Check if the order belongs to the current user
        if (data.customer_id !== user.id) {
          throw new Error('You do not have permission to view this order');
        }

        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-[300px] mb-4" />
          <Skeleton className="h-6 w-full mb-8" />
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500 mb-6">{error || 'Order not found'}</p>
        <Button onClick={() => navigate('/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Order Details - Trust Design Hub</title>
        <meta name="description" content="View details of your design order at Trust Design Hub." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <OrderDetails order={order} />
        </div>
      </div>
    </>
  );
};

export default OrderDetailsPage;