
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingBag, Palette } from 'lucide-react';

const Hero = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-normal py-3 mb-6 bg-gradient-to-br from-blue-500 to-fuchsia-500 bg-clip-text text-transparent">
          Ameen Digital Product Store
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Your one-stop shop for premium digital products. From ready-made logos to UI/UX mockups, we've got everything you need for your creative projects.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="px-8 rounded-md bg-gradient-to-br from-blue-700 to-blue-900 text-white hover:from-blue-600 hover:to-fuchsia-600 transition-colors" asChild>
            <Link to="/digital-products">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Browse Products
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="px-8 rounded-md" asChild>
            <Link to="/services">
              <Palette className="w-5 h-5 mr-2" />
              Custom Services
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
};

export default Hero;
