
import React, { useEffect } from 'react';
import AdminWallet from '@/components/admin/AdminWallet';

const AdminWalletPage: React.FC = () => {
  useEffect(() => {
    // Update document title and meta tags
    document.title = 'Wallet Management - Trust Design Hub';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Manage your business wallet at Trust Design Hub.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Manage your business wallet at Trust Design Hub.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Wallet Management</h1>
      <AdminWallet />
    </div>
  );
};

export default AdminWalletPage;