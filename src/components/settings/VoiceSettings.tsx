
import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { VoiceSettings as VoiceSettingsType, fetchElevenLabsVoices, ElevenLabsVoice, textToSpeech } from '@/lib/elevenlabs-voice';

interface VoiceSettingsProps {
  voiceSettings: VoiceSettingsType;
  onVoiceSettingsChange: (settings: VoiceSettingsType) => void;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  voiceSettings,
  onVoiceSettingsChange,
}) => {
  const [elevenlabsVoices, setElevenlabsVoices] = useState<ElevenLabsVoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(voiceSettings.apiKey || '');

  // Fetch ElevenLabs voices when API key is available
  useEffect(() => {
    const loadVoices = async () => {
      if (voiceSettings.provider === 'elevenlabs' && voiceSettings.apiKey) {
        setIsLoading(true);
        try {
          const voices = await fetchElevenLabsVoices(voiceSettings.apiKey);
          setElevenlabsVoices(voices);
        } catch (error) {
          console.error('Failed to load ElevenLabs voices:', error);
          toast({
            title: 'Error',
            description: 'Failed to load voices from ElevenLabs',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadVoices();
  }, [voiceSettings.provider, voiceSettings.apiKey]);

  const handleVoiceToggle = (enabled: boolean) => {
    onVoiceSettingsChange({
      ...voiceSettings,
      enabled,
    });
  };

  const handleProviderChange = (provider: 'browser' | 'elevenlabs') => {
    onVoiceSettingsChange({
      ...voiceSettings,
      provider,
      // Reset voice selection when changing provider
      voice: provider === 'browser' ? 'male' : (elevenlabsVoices[0]?.voice_id || ''),
    });
  };

  const handleVoiceChange = (voice: string) => {
    const selectedVoice = elevenlabsVoices.find(v => v.voice_id === voice);
    
    onVoiceSettingsChange({
      ...voiceSettings,
      voice,
      voiceName: selectedVoice?.name || voice,
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

  const handleAutoReadToggle = (autoRead: boolean) => {
    onVoiceSettingsChange({
      ...voiceSettings,
      autoRead,
    });
  };

  const handleVoiceInputToggle = (voiceInput: boolean) => {
    onVoiceSettingsChange({
      ...voiceSettings,
      voiceInput,
    });
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKeyInput(e.target.value);
  };

  const handleApiKeySave = async () => {
    if (!apiKeyInput.trim()) {
      toast({
        title: 'Error',
        description: 'API key cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Verify the API key by fetching voices
      const voices = await fetchElevenLabsVoices(apiKeyInput);
      
      if (voices.length > 0) {
        onVoiceSettingsChange({
          ...voiceSettings,
          apiKey: apiKeyInput,
          provider: 'elevenlabs',
          voice: voices[0].voice_id,
          voiceName: voices[0].name,
        });
        
        setElevenlabsVoices(voices);
        
        toast({
          title: 'Success',
          description: 'ElevenLabs API key saved successfully',
        });
      } else {
        throw new Error('No voices found with this API key');
      }
    } catch (error) {
      console.error('Failed to verify API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify ElevenLabs API key',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestVoice = async () => {
    if (!voiceSettings.enabled) return;
    
    setIsSpeaking(true);
    await textToSpeech({
      text: "Hello, I am Ameen, your personal assistant. How can I help you today?",
      voiceSettings,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
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

      {voiceSettings.enabled && (
        <>
          <Tabs defaultValue={voiceSettings.provider} onValueChange={(value) => handleProviderChange(value as 'browser' | 'elevenlabs')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browser">Browser Voice</TabsTrigger>
              <TabsTrigger value="elevenlabs">ElevenLabs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browser">
              <Card>
                <CardHeader>
                  <CardTitle>Browser Speech Synthesis</CardTitle>
                  <CardDescription>
                    Use your browser's built-in text-to-speech capabilities.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="voice-type">Voice Type</Label>
                    <Select
                      value={voiceSettings.voice}
                      onValueChange={handleVoiceChange}
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
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="elevenlabs">
              <Card>
                <CardHeader>
                  <CardTitle>ElevenLabs Voice</CardTitle>
                  <CardDescription>
                    Use high-quality AI voices from ElevenLabs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="elevenlabs-api-key">API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="elevenlabs-api-key"
                        type="password"
                        placeholder="Enter your ElevenLabs API key"
                        value={apiKeyInput}
                        onChange={handleApiKeyChange}
                      />
                      <Button 
                        onClick={handleApiKeySave}
                        disabled={isLoading || !apiKeyInput}
                      >
                        {isLoading ? 'Verifying...' : 'Save'}
                      </Button>
                    </div>
                  </div>

                  {voiceSettings.apiKey && (
                    <div className="space-y-2">
                      <Label htmlFor="elevenlabs-voice">Voice</Label>
                      <Select
                        value={voiceSettings.voice}
                        onValueChange={handleVoiceChange}
                        disabled={isLoading || elevenlabsVoices.length === 0}
                      >
                        <SelectTrigger id="elevenlabs-voice">
                          <SelectValue placeholder={isLoading ? 'Loading voices...' : 'Select voice'} />
                        </SelectTrigger>
                        <SelectContent>
                          {elevenlabsVoices.map((voice) => (
                            <SelectItem key={voice.voice_id} value={voice.voice_id}>
                              {voice.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="elevenlabs-speed">Speed</Label>
                      <span className="text-sm text-gray-400">{voiceSettings.speed.toFixed(1)}x</span>
                    </div>
                    <Slider
                      id="elevenlabs-speed"
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={[voiceSettings.speed]}
                      onValueChange={handleSpeedChange}
                      disabled={!voiceSettings.apiKey}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-read">Auto-read responses</Label>
              <Switch
                id="auto-read"
                checked={voiceSettings.autoRead}
                onCheckedChange={handleAutoReadToggle}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="voice-input">Enable voice input</Label>
              <Switch
                id="voice-input"
                checked={voiceSettings.voiceInput}
                onCheckedChange={handleVoiceInputToggle}
              />
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleTestVoice}
            disabled={isSpeaking || (voiceSettings.provider === 'elevenlabs' && !voiceSettings.apiKey)}
          >
            {isSpeaking ? 'Speaking...' : 'Test Voice'}
          </Button>
        </>
      )}
    </div>
  );
};

export default VoiceSettings;