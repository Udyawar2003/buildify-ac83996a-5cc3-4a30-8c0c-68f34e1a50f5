
import React from 'react';
import { Helmet } from 'react-helmet';
import AdminDashboard from '@/components/admin/AdminDashboard';

const AdminDashboardPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Trust Design Hub</title>
        <meta name="description" content="Admin dashboard for Trust Design Hub." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <AdminDashboard />
      </div>
    </>
  );
};

export default AdminDashboardPage;