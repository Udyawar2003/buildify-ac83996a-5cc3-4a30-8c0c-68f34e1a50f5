
import React from 'react';
import { Helmet } from 'react-helmet';
import OrderList from '@/components/orders/OrderList';

const OrdersPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>My Orders - Trust Design Hub</title>
        <meta name="description" content="View and manage your design orders at Trust Design Hub." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          <OrderList />
        </div>
      </div>
    </>
  );
};

export default OrdersPage;