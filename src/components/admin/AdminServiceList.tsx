
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Service } from '@/types';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Loader2, AlertCircle, Plus, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const AdminServiceList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    delivery_time: 1,
    revisions: 1,
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
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

        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        setServices(data || []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'delivery_time' || name === 'revisions' 
        ? parseFloat(value) 
        : value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  const handleAddService = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      delivery_time: 1,
      revisions: 1,
      is_active: true
    });
    setDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      delivery_time: service.delivery_time,
      revisions: service.revisions,
      is_active: service.is_active
    });
    setDialogOpen(true);
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);
        
      if (error) throw error;
      
      // Update local state
      setServices(prev => 
        prev.map(s => 
          s.id === service.id ? { ...s, is_active: !s.is_active } : s
        )
      );
      
      toast({
        title: `Service ${!service.is_active ? 'activated' : 'deactivated'}`,
        description: `${service.name} has been ${!service.is_active ? 'activated' : 'deactivated'}.`,
      });
      
    } catch (err) {
      console.error('Error toggling service status:', err);
      toast({
        title: "Failed to update service",
        description: "There was an error updating the service status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || formData.price <= 0) {
      toast({
        title: "Invalid form data",
        description: "Please fill in all required fields with valid values.",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            delivery_time: formData.delivery_time,
            revisions: formData.revisions,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingService.id);
          
        if (error) throw error;
        
        // Update local state
        setServices(prev => 
          prev.map(s => 
            s.id === editingService.id 
              ? { 
                  ...s, 
                  name: formData.name,
                  description: formData.description,
                  price: formData.price,
                  delivery_time: formData.delivery_time,
                  revisions: formData.revisions,
                  is_active: formData.is_active,
                  updated_at: new Date().toISOString()
                } 
              : s
          )
        );
        
        toast({
          title: "Service updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        // Create new service
        const { data, error } = await supabase
          .from('services')
          .insert({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            delivery_time: formData.delivery_time,
            revisions: formData.revisions,
            is_active: formData.is_active
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Update local state
        setServices(prev => [...prev, data]);
        
        toast({
          title: "Service created",
          description: `${formData.name} has been created successfully.`,
        });
      }
      
      setDialogOpen(false);
      
    } catch (err) {
      console.error('Error saving service:', err);
      toast({
        title: "Failed to save service",
        description: "There was an error saving the service. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2">Loading services...</span>
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

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={handleAddService}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Delivery Time</TableHead>
              <TableHead>Revisions</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>₹{service.price.toLocaleString()}</TableCell>
                <TableCell>{service.delivery_time} days</TableCell>
                <TableCell>{service.revisions}</TableCell>
                <TableCell>
                  <Switch 
                    checked={service.is_active} 
                    onCheckedChange={() => handleToggleActive(service)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditService(service)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {editingService 
                ? 'Update the service details below.' 
                : 'Fill in the details to create a new service.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Name</label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Logo Design"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this service includes..."
                className="resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹)</label>
                <Input 
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  min={0}
                  step={100}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Time (days)</label>
                <Input 
                  name="delivery_time"
                  type="number"
                  value={formData.delivery_time}
                  onChange={handleInputChange}
                  min={1}
                  max={30}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Revisions</label>
                <Input 
                  name="revisions"
                  type="number"
                  value={formData.revisions}
                  onChange={handleInputChange}
                  min={0}
                  max={10}
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Switch 
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={handleSwitchChange}
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Active
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                editingService ? 'Update Service' : 'Create Service'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServiceList;