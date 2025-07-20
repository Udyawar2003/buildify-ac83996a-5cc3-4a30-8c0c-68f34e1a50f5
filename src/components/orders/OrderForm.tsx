
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Service } from '@/types';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface OrderFormProps {
  service: Service;
}

const OrderForm: React.FC<OrderFormProps> = ({ service }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requirements, setRequirements] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requirements.trim()) {
      toast({
        title: 'Requirements needed',
        description: 'Please provide your design requirements',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to place an order',
          variant: 'destructive',
        });
        navigate('/login', { state: { redirect: `/order/${service.id}` } });
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          service_id: service.id,
          requirements,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Upload files if any
      let fileUrls: string[] = [];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${order.id}/${i}.${fileExt}`;
          
          const { error: uploadError, data } = await supabase.storage
            .from('order-attachments')
            .upload(fileName, file);

          if (uploadError) throw uploadError;
          
          if (data) {
            const { data: { publicUrl } } = supabase.storage
              .from('order-attachments')
              .getPublicUrl(data.path);
              
            fileUrls.push(publicUrl);
          }
        }

        // Update order with attachment URLs
        if (fileUrls.length > 0) {
          const { error: updateError } = await supabase
            .from('orders')
            .update({ attachments: fileUrls })
            .eq('id', order.id);

          if (updateError) throw updateError;
        }
      }

      // Create conversation for this order
      const { error: conversationError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          order_id: order.id,
          title: `Order for ${service.name}`,
        });

      if (conversationError) throw conversationError;

      toast({
        title: 'Order placed successfully',
        description: 'Your order has been placed. Proceed to payment to start the design process.',
      });

      // Navigate to payment page
      navigate(`/payment/${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Failed to place order',
        description: 'There was an error placing your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order {service.name}</CardTitle>
        <CardDescription>
          Please provide your requirements for the design
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requirements">Design Requirements</Label>
            <Textarea
              id="requirements"
              placeholder="Describe what you need in detail (colors, style, content, etc.)"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={6}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="attachments">Reference Files (Optional)</Label>
            <Input
              id="attachments"
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
            <p className="text-sm text-gray-500">
              Upload any reference images or documents that will help with the design
            </p>
          </div>
          
          <div className="pt-4">
            <div className="flex justify-between items-center">
              <span>Service Fee:</span>
              <span className="font-semibold">₹{service.price.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Continue to Payment'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default OrderForm;