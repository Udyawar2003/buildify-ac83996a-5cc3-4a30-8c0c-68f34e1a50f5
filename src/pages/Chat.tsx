
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatInput } from '@/components/chat/ChatInput';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { Message } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch user data and conversation history on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get the most recent conversation or create a new one
        const { data: conversations } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1);
        
        if (conversations && conversations.length > 0) {
          const currentConversation = conversations[0];
          setConversationId(currentConversation.id);
          
          // Fetch messages for this conversation
          const { data: messageData } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', currentConversation.id)
            .order('created_at', { ascending: true });
            
          if (messageData) {
            setMessages(messageData);
          }
        } else {
          // Create a new conversation
          const { data: newConversation } = await supabase
            .from('conversations')
            .insert({ user_id: user.id, title: 'New Conversation' })
            .select()
            .single();
            
          if (newConversation) {
            setConversationId(newConversation.id);
          }
        }
      }
    };
    
    fetchInitialData();
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a temporary user message to show immediately
    const tempUserMessage: Message = {
      id: uuidv4(),
      conversation_id: conversationId || '',
      content,
      role: 'user',
      created_at: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);
    
    try {
      // Save the user message to the database
      const { data: savedMessage, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content,
          role: 'user',
        })
        .select()
        .single();
        
      if (messageError) throw messageError;
      
      // In a real implementation, this would call an AI service or edge function
      // For now, we'll simulate a response with a timeout
      setTimeout(async () => {
        // Generate a simple response based on the message
        const responseText = generateSimpleResponse(content);
        
        // Save the assistant response to the database
        const { data: assistantMessage, error: assistantError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            content: responseText,
            role: 'assistant',
          })
          .select()
          .single();
          
        if (assistantError) throw assistantError;
        
        // Update the messages state with the real saved messages
        setMessages((prev) => [
          ...prev.filter(m => m.id !== tempUserMessage.id),
          savedMessage,
          assistantMessage,
        ]);
        
        setIsLoading(false);
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, title: 'New Conversation' })
        .select()
        .single();
        
      if (error) throw error;
      
      setConversationId(newConversation.id);
      setMessages([]);
      
      toast({
        title: "New conversation started",
        description: "You can now start a fresh chat with Ameen.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create new conversation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader 
        onNewChat={handleNewChat} 
        onOpenSettings={() => setSettingsOpen(true)} 
      />
      <ChatWindow messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

// Simple response generator function
function generateSimpleResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
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

export default Chat;