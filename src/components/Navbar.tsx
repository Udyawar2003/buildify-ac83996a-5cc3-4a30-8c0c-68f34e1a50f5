
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Brain, ShoppingBag } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Brain className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Ameen</span>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="text-gray-200 hover:text-blue-500 transition-colors">Home</Link>
          <Link to="/services" className="text-gray-200 hover:text-blue-500 transition-colors">Services</Link>
          <Link to="/digital-products" className="text-gray-200 hover:text-blue-500 transition-colors">Digital Products</Link>
          <Link to="/my-digital-products" className="text-gray-200 hover:text-blue-500 transition-colors">My Purchases</Link>
        </nav>
        
        <div className="flex items-center">
          <Button variant="outline" className="mr-2 hidden md:inline-flex">Log in</Button>
          <Button className="px-8 rounded-md bg-gradient-to-br from-blue-700 to-blue-900 text-white hover:from-blue-600 hover:to-purple-600 transition-colors" asChild>
            <Link to="/ameen">Try Ameen</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
};

export default Navbar;
