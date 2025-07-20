
import React from 'react';
import { Helmet } from 'react-helmet';
import ServiceList from '@/components/services/ServiceList';

const ServicesPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Our Services - Trust Design Hub</title>
        <meta name="description" content="Explore our range of professional design services at Trust Design Hub." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Design Services</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Professional design solutions tailored to your needs. Choose from our range of services below.
          </p>
        </div>
        
        <ServiceList />
      </div>
    </>
  );
};

export default ServicesPage;