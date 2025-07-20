
import React from 'react';
import { Helmet } from 'react-helmet';
import AdminWallet from '@/components/admin/AdminWallet';

const AdminWalletPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Wallet Management - Trust Design Hub</title>
        <meta name="description" content="Manage your business wallet at Trust Design Hub." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Wallet Management</h1>
        <AdminWallet />
      </div>
    </>
  );
};

export default AdminWalletPage;