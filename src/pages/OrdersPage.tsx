
import React, { useEffect } from 'react';
import OrderList from '@/components/orders/OrderList';

const OrdersPage: React.FC = () => {
  useEffect(() => {
    // Update document title and meta tags
    document.title = 'My Orders - Trust Design Hub';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'View and manage your design orders at Trust Design Hub.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'View and manage your design orders at Trust Design Hub.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <OrderList />
      </div>
    </div>
  );
};

export default OrdersPage;