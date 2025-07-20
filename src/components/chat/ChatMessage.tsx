
import React from 'react';
import { Message } from '@/types';
import AvatarWithAnimation from '@/components/ui/avatar-with-animation';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLatest }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex w-full gap-3 p-4',
        isUser ? 'justify-end' : 'justify-start',
        isLatest && !isUser && 'animate-fade-in'
      )}
    >
      {!isUser && (
        <AvatarWithAnimation
          fallback="A"
          isAnimating={isLatest}
          className="mt-1"
        />
      )}
      <div
        className={cn(
          'rounded-lg px-4 py-2 max-w-[80%]',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-white border border-gray-700'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
      {isUser && (
        <AvatarWithAnimation
          fallback="U"
          className="mt-1"
        />
      )}
    </div>
  );
};

export default ChatMessage;