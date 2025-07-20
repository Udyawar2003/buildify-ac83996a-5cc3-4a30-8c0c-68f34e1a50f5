
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSettings from './ProfileSettings';
import VoiceSettings from './VoiceSettings';
import BusinessSettings from './BusinessSettings';
import { UserSettings, VoiceSettings as VoiceSettingsType } from '@/types';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  voice: {
    enabled: false,
    voice: 'male',
    speed: 1,
    pitch: 1,
  },
  notifications: true,
};

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  const handleVoiceSettingsChange = (voiceSettings: VoiceSettingsType) => {
    setSettings((prev) => ({
      ...prev,
      voice: voiceSettings,
    }));
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setSettings((prev) => ({
      ...prev,
      theme,
    }));
  };

  const handleNotificationsChange = (notifications: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <ProfileSettings 
              theme={settings.theme}
              notifications={settings.notifications}
              onThemeChange={handleThemeChange}
              onNotificationsChange={handleNotificationsChange}
            />
          </TabsContent>
          <TabsContent value="voice">
            <VoiceSettings 
              voiceSettings={settings.voice}
              onVoiceSettingsChange={handleVoiceSettingsChange}
            />
          </TabsContent>
          <TabsContent value="business">
            <BusinessSettings />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;