
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'customer';
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  delivery_time: number; // in days
  revisions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  service_id: string;
  status: 'pending' | 'processing' | 'completed' | 'revision' | 'cancelled';
  requirements: string;
  attachments?: string[];
  delivery_files?: string[];
  payment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  amount_inr: number;
  status: 'pending' | 'completed' | 'refunded';
  payment_method: string;
  transaction_id?: string;
  profit_amount: number;
  growth_fund_amount: number;
  expense_amount: number;
  created_at: string;
}

export interface Wallet {
  id: string;
  balance: number;
  withdrawable_profit: number;
  business_growth_fund: number;
  expense_coverage: number;
  last_updated: string;
}

export interface PaymentMethod {
  id: string;
  type: 'googlepay' | 'phonepay' | 'paytm' | 'mobikwik';
  upi_id: string;
  is_default: boolean;
}

export interface Conversation {
  id: string;
  user_id: string;
  order_id?: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'balance' | 'zakat' | 'error' | 'order' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface BusinessData {
  id: string;
  user_id: string;
  category: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
}

export interface VoiceSettings {
  enabled: boolean;
  voice: string;
  speed: number;
  pitch: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  voice: VoiceSettings;
  notifications: boolean;
  language: string;
}

export interface AmeenResponse {
  response: string;
  conversationId: string;
}

// Digital Product Types
export interface DigitalProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  category: DigitalProductCategory;
  preview_images: string[];
  download_file: string;
  is_active: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type DigitalProductCategory = 
  | 'logo' 
  | 'poster' 
  | 'ebook' 
  | 'planner' 
  | 'notes' 
  | 'ui_ux' 
  | 'quranic_journal' 
  | 'other';

export interface DigitalProductPurchase {
  id: string;
  product_id: string;
  customer_id: string;
  payment_id: string;
  download_link: string;
  download_count: number;
  download_expiry?: string;
  created_at: string;
}

export interface DigitalProductPayment {
  id: string;
  purchase_id: string;
  amount: number;
  currency: string;
  amount_inr: number;
  status: 'completed' | 'refunded';
  payment_method: string;
  transaction_id?: string;
  profit_amount: number;
  growth_fund_amount: number;
  expense_amount: number;
  created_at: string;
}

export interface InfiniteVaultBackup {
  id: string;
  type: 'product' | 'purchase' | 'payment' | 'customer' | 'file';
  data: any;
  reference_id: string;
  created_at: string;
}

export interface MarketingContent {
  id: string;
  product_id: string;
  content_type: 'blog' | 'social' | 'email' | 'website';
  title: string;
  content: string;
  image?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Digital Product Types
export interface DigitalProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  category: DigitalProductCategory;
  preview_images: string[];
  download_file: string;
  is_active: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type DigitalProductCategory = 
  | 'logo' 
  | 'poster' 
  | 'ebook' 
  | 'planner' 
  | 'notes' 
  | 'ui_ux' 
  | 'quranic_journal' 
  | 'other';

export interface DigitalProductPurchase {
  id: string;
  product_id: string;
  customer_id: string;
  payment_id: string;
  download_link: string;
  download_count: number;
  download_expiry?: string;
  created_at: string;
}

export interface DigitalProductPayment {
  id: string;
  purchase_id: string;
  amount: number;
  currency: string;
  amount_inr: number;
  status: 'completed' | 'refunded';
  payment_method: string;
  transaction_id?: string;
  profit_amount: number;
  growth_fund_amount: number;
  expense_amount: number;
  created_at: string;
}

export interface InfiniteVaultBackup {
  id: string;
  type: 'product' | 'purchase' | 'payment' | 'customer' | 'file';
  data: any;
  reference_id: string;
  created_at: string;
}

export interface MarketingContent {
  id: string;
  product_id: string;
  content_type: 'blog' | 'social' | 'email' | 'website';
  title: string;
  content: string;
  image?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}