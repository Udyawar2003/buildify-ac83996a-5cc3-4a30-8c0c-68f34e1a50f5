
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BusinessSettings: React.FC = () => {
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="business-name">Business Name</Label>
        <Input id="business-name" placeholder="Your Business Name" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="business-type">Business Type</Label>
        <Select>
          <SelectTrigger id="business-type">
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="service">Service</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="business-description">Business Description</Label>
        <Textarea 
          id="business-description" 
          placeholder="Describe your business..."
          className="min-h-[100px]"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="business-goals">Business Goals</Label>
        <Textarea 
          id="business-goals" 
          placeholder="What are your business goals?"
          className="min-h-[100px]"
        />
      </div>
      
      <Button className="w-full">Save Business Settings</Button>
    </div>
  );
};

export default BusinessSettings;