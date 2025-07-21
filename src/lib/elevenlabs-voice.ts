
import { toast } from "@/components/ui/use-toast";

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category?: string;
}

export interface VoiceSettings {
  enabled: boolean;
  provider: 'browser' | 'elevenlabs';
  voice: string;
  voiceName?: string;
  speed: number;
  pitch: number;
  apiKey?: string;
  autoRead: boolean;
  voiceInput: boolean;
}

export interface SpeechOptions {
  text: string;
  voiceSettings: VoiceSettings;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

// Cache for available voices
let cachedVoices: ElevenLabsVoice[] | null = null;

/**
 * Fetch available voices from ElevenLabs API
 */
export async function fetchElevenLabsVoices(apiKey: string): Promise<ElevenLabsVoice[]> {
  try {
    if (!apiKey) {
      throw new Error("API key is required");
    }

    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "xi-api-key": apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.statusText}`);
    }

    const data = await response.json();
    cachedVoices = data.voices || [];
    return cachedVoices;
  } catch (error) {
    console.error("Error fetching ElevenLabs voices:", error);
    toast({
      title: "Voice Service Error",
      description: `Failed to fetch voices: ${error instanceof Error ? error.message : "Unknown error"}`,
      variant: "destructive"
    });
    return [];
  }
}

/**
 * Get a specific voice by ID or name
 */
export async function getVoice(voiceId: string, apiKey: string): Promise<ElevenLabsVoice | null> {
  try {
    // Try to use cached voices first
    if (cachedVoices) {
      const voice = cachedVoices.find(v => v.voice_id === voiceId || v.name === voiceId);
      if (voice) return voice;
    }

    // Fetch voices if not cached or not found
    const voices = await fetchElevenLabsVoices(apiKey);
    return voices.find(v => v.voice_id === voiceId || v.name === voiceId) || null;
  } catch (error) {
    console.error("Error getting voice:", error);
    return null;
  }
}

/**
 * Convert text to speech using ElevenLabs API
 */
export async function textToSpeech(options: SpeechOptions): Promise<void> {
  const { text, voiceSettings, onStart, onEnd, onError } = options;
  
  if (!text || !voiceSettings.enabled) return;
  
  try {
    // Use browser's built-in speech synthesis if provider is browser or no API key
    if (voiceSettings.provider === 'browser' || !voiceSettings.apiKey) {
      speakWithBrowser(text, voiceSettings, onStart, onEnd);
      return;
    }

    // Otherwise use ElevenLabs
    onStart?.();
    
    const voice = await getVoice(voiceSettings.voice, voiceSettings.apiKey);
    if (!voice) {
      throw new Error("Selected voice not found");
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.voice_id}/stream`, {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": voiceSettings.apiKey
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
          speaking_rate: voiceSettings.speed
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      onEnd?.();
    };
    
    audio.onerror = (err) => {
      URL.revokeObjectURL(audioUrl);
      onError?.(err);
    };
    
    await audio.play();
  } catch (error) {
    console.error("Text-to-speech error:", error);
    onError?.(error);
    toast({
      title: "Voice Error",
      description: error instanceof Error ? error.message : "Failed to speak text",
      variant: "destructive"
    });
  }
}

/**
 * Use browser's built-in speech synthesis
 */
function speakWithBrowser(
  text: string, 
  settings: VoiceSettings,
  onStart?: () => void,
  onEnd?: () => void
): void {
  try {
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Set voice based on settings
    if (settings.voice && voices.length > 0) {
      const selectedVoice = voices.find(v => 
        v.name === settings.voice || 
        (settings.voice === 'male' && v.name.includes('Male')) ||
        (settings.voice === 'female' && v.name.includes('Female'))
      );
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    // Set other properties
    utterance.rate = settings.speed;
    utterance.pitch = settings.pitch;
    
    // Set event handlers
    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      toast({
        title: "Voice Error",
        description: "Browser speech synthesis failed",
        variant: "destructive"
      });
    };
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error("Browser speech synthesis error:", error);
    toast({
      title: "Voice Error",
      description: "Browser speech synthesis is not supported",
      variant: "destructive"
    });
  }
}

/**
 * Initialize speech recognition for voice input
 */
export function initVoiceInput(
  onResult: (text: string) => void,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: any) => void
): { start: () => void; stop: () => void } {
  // Check if browser supports speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    toast({
      title: "Voice Input Error",
      description: "Speech recognition is not supported in this browser",
      variant: "destructive"
    });
    
    return {
      start: () => {
        onError?.(new Error("Speech recognition not supported"));
      },
      stop: () => {}
    };
  }
  
  // Create speech recognition instance
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US'; // Default to English, can be made configurable
  
  // Set up event handlers
  recognition.onstart = () => {
    onStart?.();
  };
  
  recognition.onend = () => {
    onEnd?.();
  };
  
  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event);
    
    // Handle permission denied errors specially
    if (event.error === 'not-allowed') {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice input",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Voice Input Error",
        description: `Speech recognition error: ${event.error}`,
        variant: "destructive"
      });
    }
    
    onError?.(event);
  };
  
  let finalTranscript = '';
  
  recognition.onresult = (event) => {
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    
    // Only send final results to callback
    if (finalTranscript) {
      onResult(finalTranscript);
      finalTranscript = '';
    }
  };
  
  return {
    start: () => {
      try {
        recognition.start();
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        onError?.(error);
        
        // Try to restart if already running
        if (error instanceof DOMException && error.name === 'InvalidStateError') {
          recognition.stop();
          setTimeout(() => recognition.start(), 200);
        }
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (error) {
        console.error("Failed to stop speech recognition:", error);
      }
    }
  };
}