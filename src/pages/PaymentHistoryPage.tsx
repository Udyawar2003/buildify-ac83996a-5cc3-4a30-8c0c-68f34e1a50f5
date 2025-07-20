
import React from 'react';
import { Helmet } from 'react-helmet';
import PaymentHistory from '@/components/payments/PaymentHistory';

const PaymentHistoryPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Payment History - Trust Design Hub</title>
        <meta name="description" content="View your payment history at Trust Design Hub." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Payment History</h1>
          <PaymentHistory />
        </div>
      </div>
    </>
  );
};

export default PaymentHistoryPage;