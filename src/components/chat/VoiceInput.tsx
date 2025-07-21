
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { initVoiceInput } from '@/lib/elevenlabs-voice';
import { toast } from '@/components/ui/use-toast';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  enabled: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, enabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [recognition, setRecognition] = useState<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    if (!enabled && isListening) {
      stopListening();
    }
  }, [enabled]);

  const initializeRecognition = () => {
    if (!enabled) return;
    
    setIsInitializing(true);
    
    const recognitionInstance = initVoiceInput(
      (text) => {
        onTranscript(text);
      },
      () => {
        setIsListening(true);
        setIsInitializing(false);
      },
      () => {
        setIsListening(false);
      },
      (error) => {
        console.error('Voice input error:', error);
        setIsListening(false);
        setIsInitializing(false);
        
        // Show error toast only for real exceptions
        if (error instanceof Error && error.message !== 'Speech recognition not supported') {
          toast({
            title: 'Voice Input Error',
            description: error.message || 'Failed to process voice input',
            variant: 'destructive',
          });
        }
      }
    );
    
    setRecognition(recognitionInstance);
    return recognitionInstance;
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    try {
      if (!recognition) {
        const recognitionInstance = initializeRecognition();
        recognitionInstance?.start();
      } else {
        recognition.start();
      }
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      setIsListening(false);
      setIsInitializing(false);
      
      toast({
        title: 'Voice Input Error',
        description: 'Failed to start voice recognition',
        variant: 'destructive',
      });
    }
  };

  const stopListening = () => {
    try {
      recognition?.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Failed to stop voice recognition:', error);
    }
  };

  if (!enabled) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleListening}
      disabled={isInitializing}
      className={`rounded-full ${isListening ? 'bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600' : ''}`}
      title={isListening ? 'Stop listening' : 'Start voice input'}
    >
      {isInitializing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
};

export default VoiceInput;