// components/VoiceControl.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type VoiceControlProps = {
  onCommand: (command: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
};

const VoiceControl = ({ onCommand, isListening, setIsListening }: VoiceControlProps) => {
  const [speechSupported, setSpeechSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechSupported(false);
      setError("Your browser doesn't support voice commands. Please use Chrome for the best experience.");
    }
  }, []);

  const recognition = useCallback(() => {
    // @ts-ignore - Speech Recognition API types
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    return recognition;
  }, []);

  const startListening = useCallback(() => {
    if (!speechSupported) return;

    const speechRecognition = recognition();
    
    speechRecognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    speechRecognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase();
      onCommand(transcript);
    };

    speechRecognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    speechRecognition.onend = () => {
      setIsListening(false);
      if (isListening) {
        speechRecognition.start(); // Restart if we're supposed to be listening
      }
    };

    speechRecognition.start();
  }, [speechSupported, recognition, setIsListening, isListening, onCommand]);

  const stopListening = useCallback(() => {
    const speechRecognition = recognition();
    speechRecognition.stop();
    setIsListening(false);
  }, [recognition, setIsListening]);

  if (!speechSupported) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Voice control is not supported in your browser</AlertDescription>
      </Alert>
    );
  }

  return (
    <Button
      variant={isListening ? "destructive" : "default"}
      onClick={isListening ? stopListening : startListening}
      className="gap-2"
    >
      {isListening ? (
        <>
          <MicOff className="h-4 w-4" />
          Stop Voice
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          Start Voice
        </>
      )}
    </Button>
  );
};

export default VoiceControl;