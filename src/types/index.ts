
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
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
}

export interface AmeenResponse {
  response: string;
  conversationId: string;
}