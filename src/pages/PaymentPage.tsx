
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Order, Service } from '@/types';
import PaymentForm from '@/components/payments/PaymentForm';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<(Order & { services: Service }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update document title and meta tags
    document.title = 'Complete Payment - Trust Design Hub';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Complete your payment for design services at Trust Design Hub.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Complete your payment for design services at Trust Design Hub.';
      document.head.appendChild(meta);
    }
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!id) {
          throw new Error('Order ID is required');
        }

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login', { state: { redirect: `/payment/${id}` } });
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
          throw new Error('You do not have permission to access this payment');
        }

        // Check if the order is in pending status
        if (data.status !== 'pending') {
          throw new Error('This order has already been paid for');
        }

        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load payment details. Please try again later.');
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
          <Skeleton className="h-[400px] w-full rounded-xl" />
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
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <PaymentForm order={order} />
      </div>
    </div>
  );
};

export default PaymentPage;