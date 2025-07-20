
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ShoppingBag, CreditCard, User, LogOut } from 'lucide-react';
import OrderList from '@/components/orders/OrderList';
import PaymentHistory from '@/components/payments/PaymentHistory';
import AdminDashboard from '@/components/admin/AdminDashboard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const