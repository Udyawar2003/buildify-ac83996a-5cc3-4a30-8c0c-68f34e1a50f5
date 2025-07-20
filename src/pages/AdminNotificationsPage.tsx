
import React from 'react';
import { Helmet } from 'react-helmet';
import AdminNotifications from '@/components/admin/AdminNotifications';

const AdminNotificationsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Notifications - Trust Design Hub</title>
        <meta name="description" content="View your business notifications at Trust Design Hub." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <AdminNotifications />
      </div>
    </>
  );
};

export default AdminNotificationsPage;