
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Check } from "lucide-react";
import { Service } from '@/types';
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const navigate = useNavigate();

  const handleOrderNow = () => {
    navigate(`/order/${service.id}`);
  };

  return (
    <Card className="h-full flex flex-col transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">{service.name}</CardTitle>
        <CardDescription>
          {service.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">₹{service.price.toLocaleString()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>Delivery in {service.delivery_time} days</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Check className="w-4 h-4 mr-1" />
            <span>{service.revisions} revision{service.revisions > 1 ? 's' : ''} included</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
          onClick={handleOrderNow}
        >
          Order Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;