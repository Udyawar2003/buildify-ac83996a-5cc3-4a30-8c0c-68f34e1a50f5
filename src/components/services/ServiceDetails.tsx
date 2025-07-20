
import React from 'react';
import { Service } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Check, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface ServiceDetailsProps {
  service: Service;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ service }) => {
  const navigate = useNavigate();

  const handleOrderNow = () => {
    navigate(`/order/${service.id}`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">{service.name}</CardTitle>
        <CardDescription>
          {service.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold">₹{service.price.toLocaleString()}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-sm">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              <span>Delivery in {service.delivery_time} days</span>
            </div>
            <div className="flex items-center text-sm">
              <Check className="w-5 h-5 mr-2 text-green-500" />
              <span>{service.revisions} revision{service.revisions > 1 ? 's' : ''} included</span>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-2">What you'll get:</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="w-5 h-5 mr-2 text-green-500 mt-0.5" />
                <span>Professional {service.name.toLowerCase()} tailored to your requirements</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 mr-2 text-green-500 mt-0.5" />
                <span>Source files in industry-standard formats</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 mr-2 text-green-500 mt-0.5" />
                <span>Commercial usage rights</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 mr-2 text-green-500 mt-0.5" />
                <span>{service.revisions} round{service.revisions > 1 ? 's' : ''} of revisions</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
          size="lg"
          onClick={handleOrderNow}
        >
          Order Now <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceDetails;