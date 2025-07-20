
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Payment, Order, Service } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface PaymentWithDetails extends Payment {
  orders: Order & { services: Service };
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return;
        }

        const { data, error } = await supabase
          .from('payments')
          .select(`
            *,
            orders!inner(
              *,
              services(*)
            )
          `)
          .eq('orders.customer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setPayments(data || []);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Failed to load payment history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Refunded</Badge>;
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
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No payment history available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                {payment.orders.services.name}
              </CardTitle>
              {getStatusBadge(payment.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="font-medium">
                  {payment.currency} {payment.amount.toLocaleString()}
                </p>
                {payment.currency !== 'INR' && (
                  <p className="text-xs text-gray-500">
                    (₹{payment.amount_inr.toLocaleString()})
                  </p>
                )}
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">
                  {format(new Date(payment.created_at), 'PP')}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Payment Method</p>
                <p className="font-medium capitalize">
                  {payment.payment_method}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Transaction ID</p>
                <p className="font-medium truncate">
                  {payment.transaction_id || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PaymentHistory;