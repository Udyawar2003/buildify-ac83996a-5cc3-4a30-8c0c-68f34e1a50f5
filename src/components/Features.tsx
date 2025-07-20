
import React from 'react';
import { 
  Brain, 
  BarChart3, 
  ShoppingCart, 
  MessageSquare, 
  Globe, 
  RefreshCw, 
  Clock, 
  Shield 
} from 'lucide-react';

const features = [
  {
    title: 'Intelligent Business Management',
    description: 'Ameen handles sales, payments, order delivery, marketing, and reporting with advanced AI capabilities.',
    icon: <Brain className="w-8 h-8 text-blue-500 mb-4" />
  },
  {
    title: 'Multilingual Support',
    description: 'Communicate in any language with Ameen\'s global language understanding capabilities.',
    icon: <Globe className="w-8 h-8 text-blue-500 mb-4" />
  },
  {
    title: 'Sales & Order Processing',
    description: 'Track and execute sales, manage orders, and handle delivery logistics automatically.',
    icon: <ShoppingCart className="w-8 h-8 text-blue-500 mb-4" />
  },
  {
    title: 'Advanced Analytics',
    description: 'Get detailed reports and insights about your business performance and growth opportunities.',
    icon: <BarChart3 className="w-8 h-8 text-blue-500 mb-4" />
  },
  {
    title: '24/7 Availability',
    description: 'Ameen operates around the clock across web, mobile app, and messaging platforms.',
    icon: <Clock className="w-8 h-8 text-blue-500 mb-4" />
  },
  {
    title: 'Automatic Updates',
    description: 'Ameen continuously improves itself, learning from interactions and adapting to your business needs.',
    icon: <RefreshCw className="w-8 h-8 text-blue-500 mb-4" />
  },
  {
    title: 'Natural Conversations',
    description: 'Interact with Ameen through natural voice or text conversations for a seamless experience.',
    icon: <MessageSquare className="w-8 h-8 text-blue-500 mb-4" />
  },
  {
    title: 'Secure Data Management',
    description: 'All your business data is securely stored and backed up in the Infinite Vault system.',
    icon: <Shield className="w-8 h-8 text-blue-500 mb-4" />
  },
];

const Features = () => {
  return (
    <section id="features" className="py-16 ">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ameen's Capabilities</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover how Ameen can transform your business operations with these powerful features.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            // Outer container creates the gradient border and shadow
            <div key={index} className="p-[2px] bg-gradient-to-t from-purple-900 to-blue-900 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              {/* Inner container holds the content with a solid background */}
              <div className="bg-black p-6 rounded-md h-full flex flex-col items-center text-center">
                {feature.icon}
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

export default Features;
