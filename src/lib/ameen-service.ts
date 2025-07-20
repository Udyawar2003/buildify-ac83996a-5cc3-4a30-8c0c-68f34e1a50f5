
import { supabase } from './supabase';
import { AmeenResponse, Message } from '@/types';

// This is a simple response generator
// In a real implementation, this would call an AI model API
function generateAmeenResponse(message: string): string {
  const greetings = ['hello', 'hi', 'hey', 'greetings'];
  const lowerMessage = message.toLowerCase();
  
  if (greetings.some(greeting => lowerMessage.includes(greeting))) {
    return "Hello! I'm Ameen, your business assistant. How can I help you today?";
  }
  
  if (lowerMessage.includes('sales') || lowerMessage.includes('order')) {
    return "I can help you manage your sales and orders. Would you like me to show you the latest sales report or help you process a new order?";
  }
  
  if (lowerMessage.includes('marketing') || lowerMessage.includes('campaign')) {
    return "I can assist with your marketing efforts. Would you like to review current campaigns or create a new marketing strategy?";
  }
  
  if (lowerMessage.includes('report') || lowerMessage.includes('analytics')) {
    return "I can generate various business reports for you. What specific data would you like to analyze?";
  }
  
  if (lowerMessage.includes('customer') || lowerMessage.includes('client')) {
    return "I can help you manage customer relationships. Would you like to review customer data or handle a specific customer inquiry?";
  }
  
  // Default response
  return "I'm here to help with your business needs. You can ask me about sales, marketing, reports, customer management, or any other business operation you'd like assistance with.";
}

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