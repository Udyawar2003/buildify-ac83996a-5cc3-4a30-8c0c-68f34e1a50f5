
import React, { useState } from 'react';
import ChatWindow from '@/components/chat/ChatWindow';
import SettingsDialog from '@/components/settings/SettingsDialog';
import AuthForm from '@/components/auth/AuthForm';

const AmeenApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    // For demo purposes, set a dummy user ID
    setUserId('00000000-0000-0000-0000-000000000000');
  };

  const handleConversationChange = (newConversationId: string) => {
    setConversationId(newConversationId);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <ChatWindow
        conversationId={conversationId}
        userId={userId}
        onOpenSettings={() => setSettingsOpen(true)}
        voiceEnabled={voiceEnabled}
        onConversationChange={handleConversationChange}
      />
      
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
};

export default AmeenApp;