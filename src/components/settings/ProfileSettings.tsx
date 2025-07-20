
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface ProfileSettingsProps {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onNotificationsChange: (notifications: boolean) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  theme,
  notifications,
  onThemeChange,
  onNotificationsChange,
}) => {
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Your name" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="your.email@example.com" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="theme">Theme</Label>
        <Select value={theme} onValueChange={(value) => onThemeChange(value as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="notifications">Notifications</Label>
        <Switch 
          id="notifications" 
          checked={notifications}
          onCheckedChange={onNotificationsChange}
        />
      </div>
      
      <Button className="w-full">Save Changes</Button>
    </div>
  );
};

export default ProfileSettings;