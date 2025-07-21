
import { supabase } from './supabase';
import { AmeenResponse, Message, DigitalProduct, DigitalProductPurchase } from '@/types';

// Enhanced response generator with digital product management capabilities
function generateAmeenResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Digital product related responses
  if (lowerMessage.includes('create product') || lowerMessage.includes('add product') || 
      lowerMessage.includes('new product') || lowerMessage.includes('make product')) {
    return "I'll help you create a new digital product. Please provide the title, description, price, and category (logo, poster, ebook, planner, notes, ui_ux, quranic_journal, or other).";
  }
  
  if (lowerMessage.includes('digital products') || lowerMessage.includes('product list') || 
      lowerMessage.includes('list products') || lowerMessage.includes('show products')) {
    return "I'll fetch all your digital products. You can view them by category or see all products at once.";
  }
  
  if (lowerMessage.includes('sales report') || lowerMessage.includes('earnings report') || 
      lowerMessage.includes('revenue') || lowerMessage.includes('profit')) {
    return "📊 I'm generating your sales and earnings report. This will show your total sales, revenue, and profit distribution.";
  }
  
  if (lowerMessage.includes('wallet') || lowerMessage.includes('balance') || 
      lowerMessage.includes('funds') || lowerMessage.includes('money')) {
    return "💰 Here's your current wallet summary with withdrawable profit, business growth fund, and expense coverage details.";
  }
  
  if (lowerMessage.includes('withdraw') || lowerMessage.includes('transfer') || 
      lowerMessage.includes('payment') || lowerMessage.includes('upi')) {
    return "I can help you withdraw funds to your UPI account. Please specify the amount and payment method (Google Pay, PhonePe, Paytm, or Mobikwik).";
  }
  
  if (lowerMessage.includes('backup') || lowerMessage.includes('restore') || 
      lowerMessage.includes('recover') || lowerMessage.includes('vault')) {
    return "I can backup or restore your data from the Infinite Vault. All your products, purchases, and customer data are automatically backed up.";
  }
  
  if (lowerMessage.includes('marketing') || lowerMessage.includes('promote') || 
      lowerMessage.includes('advertise') || lowerMessage.includes('content')) {
    return "I can generate marketing content for your digital products, including blog posts, social media updates, and email campaigns.";
  }
  
  // Original responses
  const greetings = ['hello', 'hi', 'hey', 'greetings'];
  if (greetings.some(greeting => lowerMessage.includes(greeting))) {
    return "Hello! I'm Ameen, your digital product business assistant. I can help you create and manage digital products, process sales, track earnings, and handle withdrawals. How can I assist you today?";
  }
  
  if (lowerMessage.includes('sales') || lowerMessage.includes('order')) {
    return "I can help you manage your digital product sales and orders. Would you like me to show you the latest sales report or help you process a new order?";
  }
  
  if (lowerMessage.includes('customer') || lowerMessage.includes('client')) {
    return "I can help you manage customer relationships and track their purchases. Would you like to review customer data or handle a specific customer inquiry?";
  }
  
  // Default response
  return "I'm Ameen, your digital product business assistant. I can help you create and manage digital products like logos, eBooks, UI kits, and more. I also handle sales, marketing, and finances automatically. How can I assist you today?";
}

// Fetch all digital products
export async function fetchDigitalProducts(): Promise<DigitalProduct[]> {
  try {
    const { data, error } = await supabase
      .from('digital_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching digital products:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchDigitalProducts:', error);
    return [];
  }
}

// Create a new digital product
export async function createDigitalProduct(
  product: Omit<DigitalProduct, 'id' | 'created_at' | 'updated_at'>
): Promise<DigitalProduct | null> {
  try {
    const { data, error } = await supabase
      .from('digital_products')
      .insert({
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating digital product:', error);
      throw error;
    }

    // Generate marketing content
    await generateMarketingContent(data.id, data.title, data.description, data.price);
    
    // Backup to infinite vault
    await backupToInfiniteVault('product', data, data.id);

    return data;
  } catch (error) {
    console.error('Error in createDigitalProduct:', error);
    return null;
  }
}

// Generate marketing content for a product
async function generateMarketingContent(
  productId: string, 
  title: string, 
  description: string, 
  price: number
): Promise<void> {
  try {
    // Blog content
    await supabase
      .from('marketing_content')
      .insert({
        product_id: productId,
        content_type: 'blog',
        title: `Introducing: ${title}`,
        content: `We are excited to introduce our latest digital product: ${title}. ${description} This premium digital asset is available now for just ${price} INR. Perfect for professionals looking to enhance their projects with high-quality design elements.`,
        is_published: true
      });

    // Social content
    await supabase
      .from('marketing_content')
      .insert({
        product_id: productId,
        content_type: 'social',
        title: `New Release: ${title}`,
        content: `🚀 Just launched! ${title} - ${description.substring(0, 100)}... Get yours now at a special price of ${price} INR! #DigitalProducts #Design`,
        is_published: true
      });

    // Email content
    await supabase
      .from('marketing_content')
      .insert({
        product_id: productId,
        content_type: 'email',
        title: `Exclusive New Release: ${title}`,
        content: `Dear Valued Customer,\n\nWe are thrilled to announce the release of our latest digital product: ${title}.\n\n${description}\n\nThis premium digital asset is available now for just ${price} INR.\n\nClick here to purchase and download instantly!\n\nThank you for your continued support.\n\nBest regards,\nThe Digital Products Team`,
        is_published: true
      });
  } catch (error) {
    console.error('Error generating marketing content:', error);
  }
}

// Backup to infinite vault
async function backupToInfiniteVault(
  type: 'product' | 'purchase' | 'payment' | 'customer' | 'file',
  data: any,
  referenceId: string
): Promise<void> {
  try {
    await supabase
      .from('infinite_vault_backups')
      .insert({
        type,
        data,
        reference_id: referenceId,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error backing up to infinite vault:', error);
  }
}

// Process a purchase
export async function purchaseDigitalProduct(
  productId: string,
  customerId: string,
  amount: number,
  currency: string,
  paymentMethod: string
): Promise<DigitalProductPurchase | null> {
  try {
    // Convert to INR if needed
    const amountInr = convertToInr(amount, currency);
    
    // Calculate profit distribution (60% profit, 30% growth, 10% expenses)
    const profitAmount = amountInr * 0.6;
    const growthAmount = amountInr * 0.3;
    const expenseAmount = amountInr * 0.1;
    
    // Create a purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('digital_product_purchases')
      .insert({
        product_id: productId,
        customer_id: customerId,
        download_link: `download-${Math.random().toString(36).substring(2, 15)}`,
        download_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Error creating purchase:', purchaseError);
      throw purchaseError;
    }

    // Create a payment record
    const { data: payment, error: paymentError } = await supabase
      .from('digital_product_payments')
      .insert({
        purchase_id: purchase.id,
        amount,
        currency,
        amount_inr: amountInr,
        status: 'completed',
        payment_method: paymentMethod,
        profit_amount: profitAmount,
        growth_fund_amount: growthAmount,
        expense_amount: expenseAmount
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      throw paymentError;
    }

    // Update purchase with payment ID
    await supabase
      .from('digital_product_purchases')
      .update({ payment_id: payment.id })
      .eq('id', purchase.id);

    // Update wallet
    const { data: wallet } = await supabase
      .from('wallet')
      .select('*')
      .limit(1)
      .single();

    if (wallet) {
      await supabase
        .from('wallet')
        .update({
          balance: wallet.balance + amountInr,
          withdrawable_profit: wallet.withdrawable_profit + profitAmount,
          business_growth_fund: wallet.business_growth_fund + growthAmount,
          expense_coverage: wallet.expense_coverage + expenseAmount,
          last_updated: new Date().toISOString()
        })
        .eq('id', wallet.id);
    }

    // Backup to infinite vault
    await backupToInfiniteVault('purchase', { ...purchase, payment }, purchase.id);

    // Create notification for admin
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (adminUser) {
      await supabase
        .from('notifications')
        .insert({
          user_id: adminUser.id,
          title: 'New Digital Product Sale',
          message: `Product was purchased for ${currency} ${amount} (${amountInr} INR)`,
          type: 'balance',
          is_read: false
        });
    }

    return purchase;
  } catch (error) {
    console.error('Error in purchaseDigitalProduct:', error);
    return null;
  }
}

// Convert currency to INR
function convertToInr(amount: number, currency: string): number {
  const conversionRates: Record<string, number> = {
    USD: 83.5,
    EUR: 90.2,
    GBP: 105.8,
    AED: 22.7,
    AUD: 54.3,
    CAD: 60.5,
    INR: 1.0
  };
  
  const rate = conversionRates[currency] || 1;
  return amount * rate;
}

// Get wallet summary
export async function getWalletSummary() {
  try {
    const { data, error } = await supabase
      .from('wallet')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching wallet:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getWalletSummary:', error);
    return null;
  }
}

// Withdraw from wallet
export async function withdrawFromWallet(amount: number, paymentMethod: string) {
  try {
    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('*')
      .limit(1)
      .single();

    if (walletError) {
      console.error('Error fetching wallet:', walletError);
      throw walletError;
    }

    if (wallet.withdrawable_profit < amount) {
      throw new Error(`Insufficient funds. Available: ${wallet.withdrawable_profit} INR`);
    }

    const { error: updateError } = await supabase
      .from('wallet')
      .update({
        withdrawable_profit: wallet.withdrawable_profit - amount,
        balance: wallet.balance - amount,
        last_updated: new Date().toISOString()
      })
      .eq('id', wallet.id);

    if (updateError) {
      console.error('Error updating wallet:', updateError);
      throw updateError;
    }

    // Create notification for admin
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (adminUser) {
      await supabase
        .from('notifications')
        .insert({
          user_id: adminUser.id,
          title: 'Wallet Withdrawal',
          message: `${amount} INR has been withdrawn to ${paymentMethod}`,
          type: 'balance',
          is_read: false
        });
    }

    return {
      amount,
      payment_method: paymentMethod,
      timestamp: new Date().toISOString(),
      remaining_balance: wallet.withdrawable_profit - amount
    };
  } catch (error) {
    console.error('Error in withdrawFromWallet:', error);
    throw error;
  }
}

// Original Ameen chat functions
export async function sendMessageToAmeen(
  message: string,
  conversationId?: string,
  userId?: string
): Promise<AmeenResponse> {
  try {
    if (!userId) {
      // If no user ID is provided, use a default one for demo purposes
      userId = '00000000-0000-0000-0000-000000000000';
    }

    let currentConversationId = conversationId;

    // If no conversation ID is provided, create a new conversation
    if (!currentConversationId) {
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({ user_id: userId, title: 'New Conversation' })
        .select('id')
        .single();

      if (conversationError) {
        throw conversationError;
      }

      currentConversationId = newConversation.id;
    }

    // Store the user message
    const { error: userMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        content: message,
        role: 'user'
      });

    if (userMessageError) {
      throw userMessageError;
    }

    // Generate Ameen's response
    const assistantResponse = generateAmeenResponse(message);

    // Store the assistant message
    const { error: assistantMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        content: assistantResponse,
        role: 'assistant'
      });

    if (assistantMessageError) {
      throw assistantMessageError;
    }

    return {
      response: assistantResponse,
      conversationId: currentConversationId
    };
  } catch (error) {
    console.error('Error sending message to Ameen:', error);
    throw error;
  }
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    throw error;
  }
}

export async function getUserConversations(userId: string) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    throw error;
  }
}