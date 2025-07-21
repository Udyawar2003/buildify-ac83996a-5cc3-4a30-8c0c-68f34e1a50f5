
import React, { useEffect } from 'react';
import AdminNotifications from '@/components/admin/AdminNotifications';

const AdminNotificationsPage: React.FC = () => {
  useEffect(() => {
    // Update document title and meta tags
    document.title = 'Notifications - Trust Design Hub';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'View your business notifications at Trust Design Hub.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'View your business notifications at Trust Design Hub.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNotifications />
    </div>
  );
};

export default AdminNotificationsPage;