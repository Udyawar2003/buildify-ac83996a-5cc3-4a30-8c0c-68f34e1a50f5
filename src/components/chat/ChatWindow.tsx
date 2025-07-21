
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../../types';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { sendMessageToAmeen, getConversationMessages } from '../../lib/ameen-service';

interface ChatWindowProps {
  conversationId?: string;
  userId?: string;
  onOpenSettings: () => void;
  onToggleSidebar?: () => void;
  voiceEnabled?: boolean;
  onConversationChange?: (conversationId: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  userId,
  onOpenSettings,
  onToggleSidebar,
  voiceEnabled = false,
  onConversationChange,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    } else {
      setMessages([
        {
          id: 'welcome',
          conversation_id: '',
          content: "Hello! I'm Ameen, your digital product business assistant. I can help you create and manage digital products, process sales, track earnings, and handle withdrawals. How can I assist you today?",
          role: 'assistant',
          created_at: new Date().toISOString(),
        },
      ]);
    }
  }, [conversationId]);

  const loadMessages = async (convoId: string) => {
    try {
      const fetchedMessages = await getConversationMessages(convoId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    // Add user message to UI immediately
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId || '',
      content,
      role: 'user',
      created_at: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      // Send message to Ameen service
      const response = await sendMessageToAmeen(content, conversationId, userId);
      
      // If this is a new conversation, update the conversationId
      if (!conversationId && response.conversationId) {
        onConversationChange?.(response.conversationId);
      }
      
      // Add assistant response to UI
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        conversation_id: response.conversationId,
        content: response.response,
        role: 'assistant',
        created_at: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        conversation_id: conversationId || '',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        role: 'assistant',
        created_at: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        onOpenSettings={onOpenSettings} 
        onToggleSidebar={onToggleSidebar}
        isProcessing={isProcessing}
      />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isLatest={index === messages.length - 1 && message.role === 'assistant'}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isProcessing={isProcessing}
        voiceEnabled={voiceEnabled}
      />
    </div>
  );
};

export default ChatWindow;

export default ChatWindow;