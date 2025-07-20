
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { VoiceSettings as VoiceSettingsType } from '@/types';

interface VoiceSettingsProps {
  voiceSettings: VoiceSettingsType;
  onVoiceSettingsChange: (settings: VoiceSettingsType) => void;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  voiceSettings,
  onVoiceSettingsChange,
}) => {
  const handleVoiceToggle = (enabled: boolean) => {
    onVoiceSettingsChange({
      ...voiceSettings,
      enabled,
    });
  };

  const handleVoiceChange = (voice: string) => {
    onVoiceSettingsChange({
      ...voiceSettings,
      voice,
    });
  };

  const handleSpeedChange = (value: number[]) => {
    onVoiceSettingsChange({
      ...voiceSettings,
      speed: value[0],
    });
  };

  const handlePitchChange = (value: number[]) => {
    onVoiceSettingsChange({
      ...voiceSettings,
      pitch: value[0],
    });
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="voice-enabled">Enable Voice</Label>
        <Switch
          id="voice-enabled"
          checked={voiceSettings.enabled}
          onCheckedChange={handleVoiceToggle}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="voice-type">Voice Type</Label>
        <Select
          value={voiceSettings.voice}
          onValueChange={handleVoiceChange}
          disabled={!voiceSettings.enabled}
        >
          <SelectTrigger id="voice-type">
            <SelectValue placeholder="Select voice" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="voice-speed">Speed</Label>
          <span className="text-sm text-gray-400">{voiceSettings.speed.toFixed(1)}x</span>
        </div>
        <Slider
          id="voice-speed"
          min={0.5}
          max={2}
          step={0.1}
          value={[voiceSettings.speed]}
          onValueChange={handleSpeedChange}
          disabled={!voiceSettings.enabled}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="voice-pitch">Pitch</Label>
          <span className="text-sm text-gray-400">{voiceSettings.pitch.toFixed(1)}</span>
        </div>
        <Slider
          id="voice-pitch"
          min={0.5}
          max={1.5}
          step={0.1}
          value={[voiceSettings.pitch]}
          onValueChange={handlePitchChange}
          disabled={!voiceSettings.enabled}
        />
      </div>

      <Button className="w-full" disabled={!voiceSettings.enabled}>
        Test Voice
      </Button>
    </div>
  );
};

export default VoiceSettings;