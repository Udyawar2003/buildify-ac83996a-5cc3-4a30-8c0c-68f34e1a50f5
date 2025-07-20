
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, Service, User } from '@/types';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Loader2, AlertCircle, Search, FileText, Download, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface OrderWithDetails extends Order {
  service: Service;
  customer: User;
}

interface AdminOrderListProps {
  limit?: number;
}

const AdminOrderList: React.FC<AdminOrderListProps> = ({ limit }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [deliveryFiles, setDeliveryFiles] = useState<File[]>([]);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login', { state: { redirectTo: '/admin' } });
          return;
        }
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (userError || userData?.role !== 'admin') {
          navigate('/');
          return;
        }

        let query = supabase
          .from('orders')
          .select(`
            *,
            service:service_id (*),
            customer:customer_id (*)
          `)
          .order('created_at', { ascending: false });
          
        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate, limit]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Payment</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'revision':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Revision</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setDeliveryFiles(prev => [...prev, ...fileList]);
    }
  };

  const removeFile = (index: number) => {
    setDeliveryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeliverOrder = async () => {
    if (!selectedOrder || deliveryFiles.length === 0) return;
    
    setSubmitting(true);
    
    try {
      // Upload files
      const fileUrls: string[] = [];
      
      for (const file of deliveryFiles) {
        const fileName = `${selectedOrder.id}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('order-deliveries')
          .upload(fileName, file);
          
        if (error) throw error;
        
        const fileUrl = supabase.storage
          .from('order-deliveries')
          .getPublicUrl(data.path).data.publicUrl;
          
        fileUrls.push(fileUrl);
      }
      
      // Update order status and add delivery files
      const { error: updateError } = await supabase.rpc('update_order_status', {
        p_order_id: selectedOrder.id,
        p_status: 'completed',
        p_delivery_files: fileUrls
      });
      
      if (updateError) throw updateError;
      
      // Refresh orders list
      const { data: updatedOrders } = await supabase
        .from('orders')
        .select(`
          *,
          service:service_id (*),
          customer:customer_id (*)
        `)
        .order('created_at', { ascending: false });
        
      if (updatedOrders) {
        setOrders(updatedOrders);
      }
      
      toast({
        title: "Order delivered successfully",
        description: "The customer has been notified and can now download the files.",
      });
      
      setDeliveryDialogOpen(false);
      setDeliveryFiles([]);
      setSelectedOrder(null);
      
    } catch (err) {
      console.error('Error delivering order:', err);
      toast({
        title: "Failed to deliver order",
        description: "There was an error delivering the order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (order: OrderWithDetails, newStatus: string) => {
    try {
      const { error } = await supabase.rpc('update_order_status', {
        p_order_id: order.id,
        p_status: newStatus
      });
      
      if (error) throw error;
      
      // Refresh orders list
      const { data: updatedOrders } = await supabase
        .from('orders')
        .select(`
          *,
          service:service_id (*),
          customer:customer_id (*)
        `)
        .order('created_at', { ascending: false });
        
      if (updatedOrders) {
        setOrders(updatedOrders);
      }
      
      toast({
        title: "Order status updated",
        description: `Order status changed to ${newStatus}.`,
      });
      
    } catch (err) {
      console.error('Error updating order status:', err);
      toast({
        title: "Failed to update status",
        description: "There was an error updating the order status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service.name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No orders found</p>
      </div>
    );
  }

  return (
    <div>
      {!limit && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search orders..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending Payment</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="revision">Revision</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.id.substring(0, 8)}...
                </TableCell>
                <TableCell>{order.service.name}</TableCell>
                <TableCell>{order.customer.name || order.customer.email}</TableCell>
                <TableCell>{format(new Date(order.created_at), 'MMM d, yyyy')}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // View order details
                        console.log("View order:", order);
                      }}
                    >
                      View
                    </Button>
                    
                    {order.status === 'processing' && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setDeliveryDialogOpen(true);
                        }}
                      >
                        Deliver
                      </Button>
                    )}
                    
                    {order.status === 'revision' && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setDeliveryDialogOpen(true);
                        }}
                      >
                        Complete Revision
                      </Button>
                    )}
                    
                    {order.status === 'pending' && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleUpdateStatus(order, 'processing')}
                      >
                        Start Processing
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deliver Order</DialogTitle>
            <DialogDescription>
              Upload the completed design files to deliver to the customer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Input
                id="deliveryFiles"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                multiple
              />
              <label htmlFor="deliveryFiles" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium">Click to upload files</span>
                <span className="text-xs text-gray-500 mt-1">
                  Upload the final design files for delivery
                </span>
              </label>
            </div>
            
            {deliveryFiles.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Files to deliver:</p>
                <ul className="space-y-2">
                  {deliveryFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFile(index)}
                        className="text-red-500 h-auto py-1"
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Message (Optional)</label>
              <Textarea 
                placeholder="Add a message to the customer..."
                className="resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeliveryDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeliverOrder}
              disabled={deliveryFiles.length === 0 || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Deliver Order'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrderList;