
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Send, MicOff } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  voiceEnabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isProcessing,
  voiceEnabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSendMessage = () => {
    if (message.trim() && !isProcessing) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    // In a real implementation, this would use the Web Speech API
    setIsRecording(!isRecording);
    if (isRecording) {
      // Stop recording
      setMessage(message + " (Voice recording simulation)");
    } else {
      // Start recording
    }
  };

  return (
    <div className="border-t border-gray-800 p-4">
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message to Ameen..."
          className="min-h-[60px] resize-none bg-gray-900 border-gray-700"
          disabled={isProcessing}
        />
        <div className="flex flex-col gap-2">
          {voiceEnabled && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleRecording}
              disabled={isProcessing}
              className={isRecording ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>
          )}
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isProcessing}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;