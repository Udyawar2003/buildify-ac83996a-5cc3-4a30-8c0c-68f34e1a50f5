
import React from 'react';
import { Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvatarWithAnimation from '@/components/ui/avatar-with-animation';

interface ChatHeaderProps {
  onOpenSettings: () => void;
  onToggleSidebar?: () => void;
  isProcessing: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  onOpenSettings,
  onToggleSidebar,
  isProcessing,
}) => {
  return (
    <div className="border-b border-gray-800 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="md:hidden">
            <Menu size={20} />
          </Button>
        )}
        <AvatarWithAnimation
          fallback="A"
          isAnimating={isProcessing}
        />
        <div>
          <h2 className="font-semibold text-lg">Ameen</h2>
          <p className="text-sm text-gray-400">Your Business Assistant</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onOpenSettings}>
        <Settings size={20} />
      </Button>
    </div>
  );
};

export default ChatHeader;