
import React, { useEffect } from 'react';
import ServiceList from '@/components/services/ServiceList';

const ServicesPage: React.FC = () => {
  useEffect(() => {
    // Update document title and meta tags
    document.title = 'Our Services - Trust Design Hub';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Explore our range of professional design services at Trust Design Hub.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Explore our range of professional design services at Trust Design Hub.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Design Services</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Professional design solutions tailored to your needs. Choose from our range of services below.
        </p>
      </div>
      
      <ServiceList />
    </div>
  );
};

export default ServicesPage;