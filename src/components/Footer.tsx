
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Ameen</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">How It Works</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Testimonials</a></li>
              <li><Link to="/ameen" className="text-gray-400 hover:text-blue-500 transition-colors">Try Ameen</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Business Management</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Sales & Orders</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Marketing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Analytics</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">API</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Integration Guide</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Data Security</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Compliance</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">&copy; {new Date().getFullYear()} Ameen AI Assistant. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">LinkedIn</a>
            <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Facebook</a>
            <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
