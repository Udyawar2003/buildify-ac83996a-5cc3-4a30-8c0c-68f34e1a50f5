
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabase';
import { Service } from '@/types';
import OrderForm from '@/components/orders/OrderForm';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

const OrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        if (!id) {
          throw new Error('Service ID is required');
        }

        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setService(data);
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('Failed to load service details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

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

  if (error || !service) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500 mb-6">{error || 'Service not found'}</p>
        <Button onClick={() => navigate('/services')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Order {service.name} - Trust Design Hub</title>
        <meta name="description" content={`Place your order for ${service.name} at Trust Design Hub.`} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate(`/service/${id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Service Details
          </Button>
          
          <OrderForm service={service} />
        </div>
      </div>
    </>
  );
};

export default OrderPage;