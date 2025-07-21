
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import VoiceInput from './VoiceInput';
import { VoiceSettings } from '@/lib/elevenlabs-voice';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  voiceSettings?: VoiceSettings;
}

const ChatInput: React