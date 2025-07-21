
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl mx-4 my-8">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to transform your business?</h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Let Ameen handle your business operations while you focus on growth and innovation.
        </p>
        <Button size="lg" className="px-8 rounded-md bg-gradient-to-br from-blue-700 to-blue-900 text-white hover:from-blue-600 hover:to-fuchsia-600 transition-colors" asChild>
          <Link to="/ameen">Experience Ameen Now</Link>
        </Button>
      </div>
    </section>
  );
};

export default CTA;
