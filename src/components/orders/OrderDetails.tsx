
import React, { useState } from 'react';
import { Order, Service } from '@/types';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Download, MessageSquare } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface OrderDetailsProps {
  order: Order & { services: Service };
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [revisionRequest, setRevisionRequest] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending Payment</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
      case 'revision':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Revision</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRevisionRequest = async () => {
    if (!revisionRequest.trim()) {
      toast({
        title: 'Revision details required',
        description: 'Please describe what changes you need',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingRevision(true);

    try {
      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'revision' })
        .eq('id', order.id);

      if (updateError) throw updateError;

      // Add message to conversation
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('order_id', order.id)
        .single();

      if (conversation) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            content: `Revision Request: ${revisionRequest}`,
            role: 'user'
          });
      }

      toast({
        title: 'Revision requested',
        description: 'Your revision request has been submitted',
      });

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast({
        title: 'Failed to request revision',
        description: 'There was an error submitting your revision request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingRevision(false);
    }
  };

  const handleChatClick = async () => {
    try {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('order_id', order.id)
        .single();

      if (conversation) {
        navigate(`/chat/${conversation.id}`);
      }
    } catch (error) {
      console.error('Error navigating to chat:', error);
      toast({
        title: 'Failed to open chat',
        description: 'There was an error opening the chat. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{order.services.name}</CardTitle>
            <CardDescription>
              Order #{order.id.substring(0, 8)}
            </CardDescription>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Ordered On</h3>
            <p>{format(new Date(order.created_at), 'PPP')}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Price</h3>
            <p>₹{order.services.price.toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Delivery Time</h3>
            <p>{order.services.delivery_time} days</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Revisions</h3>
            <p>{order.services.revisions} included</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Requirements</h3>
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
            <p className="whitespace-pre-line">{order.requirements}</p>
          </div>
        </div>

        {order.attachments && order.attachments.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Your Attachments</h3>
            <div className="flex flex-wrap gap-2">
              {order.attachments.map((url, index) => (
                <a 
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Attachment {index + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {order.delivery_files && order.delivery_files.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Delivered Files</h3>
            <div className="flex flex-wrap gap-2">
              {order.delivery_files.map((url, index) => (
                <a 
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-blue-100 dark:bg-blue-900 px-3 py-2 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download File {index + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {order.status === 'completed' && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Request Revision</h3>
            <Textarea
              placeholder="Describe what changes you need..."
              value={revisionRequest}
              onChange={(e) => setRevisionRequest(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Note: You are entitled to {order.services.revisions} revision(s). No refunds after revision.
            </p>
            <Button 
              onClick={handleRevisionRequest}
              disabled={submittingRevision || !revisionRequest.trim()}
              className="mt-2"
              variant="outline"
            >
              {submittingRevision ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Revision Request'
              )}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/orders')}
        >
          Back to Orders
        </Button>
        <Button 
          onClick={handleChatClick}
          className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Chat About Order
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderDetails;