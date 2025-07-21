
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { toast } from '../components/ui/use-toast';
import { supabase } from '../lib/supabase';
import SystemMonitor from '../components/system/SystemMonitor';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

const CustomerInterface = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showSystemMonitor, setShowSystemMonitor] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: '',
    email: '',
    phone: '',
    serviceId: '',
    productId: '',
    message: ''
  });

  useEffect(() => {
    fetchServices();
    fetchProducts();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        variant: "destructive",
        title: "Failed to load services",
        description: "Please try again later."
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('digital_products')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        variant: "destructive",
        title: "Failed to load digital products",
        description: "Please try again later."
      });
    }
  };

  const handleOrderFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceSelect = (serviceId: string) => {
    setOrderForm(prev => ({ ...prev, serviceId, productId: '' }));
  };

  const handleProductSelect = (productId: string) => {
    setOrderForm(prev => ({ ...prev, productId, serviceId: '' }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderForm.name || !orderForm.email || (!orderForm.serviceId && !orderForm.productId)) {
      toast({
        variant: "destructive",
        title: "Incomplete form",
        description: "Please fill in all required fields."
      });
      return;
    }
    
    try {
      // Determine if this is a service or product order
      const isServiceOrder = !!orderForm.serviceId;
      const itemId = isServiceOrder ? orderForm.serviceId : orderForm.productId;
      const itemType = isServiceOrder ? 'service' : 'product';
      
      // Get the price from the selected item
      const selectedItem = isServiceOrder 
        ? services.find(s => s.id === itemId)
        : products.find(p => p.id === itemId);
      
      if (!selectedItem) {
        throw new Error(`Selected ${itemType} not found`);
      }
      
      // Create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          [isServiceOrder ? 'service_i