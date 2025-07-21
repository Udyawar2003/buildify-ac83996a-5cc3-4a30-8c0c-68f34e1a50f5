
import React, { useEffect } from 'react';
import PaymentHistory from '@/components/payments/PaymentHistory';

const PaymentHistoryPage: React.FC = () => {
  useEffect(() => {
    // Update document title and meta tags
    document.title = 'Payment History - Trust Design Hub';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'View your payment history at Trust Design Hub.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'View your payment history at Trust Design Hub.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Payment History</h1>
        <PaymentHistory />
      </div>
    </div>
  );
};

export default PaymentHistoryPage;