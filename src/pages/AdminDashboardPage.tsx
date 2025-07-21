
import React, { useEffect } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';

const AdminDashboardPage: React.FC = () => {
  useEffect(() => {
    // Update document title and meta tags
    document.title = 'Admin Dashboard - Trust Design Hub';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Admin dashboard for Trust Design Hub.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Admin dashboard for Trust Design Hub.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <AdminDashboard />
    </div>
  );
};

export default AdminDashboardPage;