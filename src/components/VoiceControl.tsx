import React, { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, AlertTriangle, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { extractCommand } from '@/lib/VoiceCommands';

type VoiceControlProps = {
  onCommand: (command: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
};

const DEBUG = true; // Enable detailed console logging

const VoiceControl = ({ onCommand, isListening, setIsListening }: VoiceControlProps) => {
  const [speechSupported, setSpeechSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<{
    rawTranscript: string;
    extractedCommand: string;
    status: string;
  }>({ rawTranscript: '', extractedCommand: '', status: 'Ready' });

  const logDebug = (...args: any[]) => {
    if (DEBUG) {
      console.log('%c[Voice Control]', 'color: #4CAF50; font-weight: bold;', ...args);
    }
  };

  const logError = (...args: any[]) => {
    if (DEBUG) {
      console.error('%c[Voice Control Error]', 'color: #f44336; font-weight: bold;', ...args);
    }
  };

  // Available commands help text
  const availableCommands = [
    "create bowl",
    "create plate",
    "create bigger plate",
    "add orange chicken",
    "add chow mein",
    "add super greens",
    "complete meal",
    "checkout"
  ];

  useEffect(() => {
    logDebug('Initializing voice control...');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      logError('Speech recognition not supported in this browser');
      setSpeechSupported(false);
      setError("Your browser doesn't support voice commands. Please use Chrome for the best experience.");
      return;
    }

    // Initialize recognition instance
    // @ts-ignore - Speech Recognition API types
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'en-US';
    
    logDebug('Speech recognition instance created with settings:', {
      continuous: recognitionInstance.continuous,
      interimResults: recognitionInstance.interimResults,
      lang: recognitionInstance.lang
    });

    recognitionInstance.onstart = () => {
      logDebug('Recognition started');
      setIsListening(true);
      setError(null);
      setDebugInfo(prev => ({ ...prev, status: 'Listening...' }));
    };

    recognitionInstance.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase().trim();
      logDebug('Raw transcript received:', transcript);
      logDebug('Confidence level:', event.results[last][0].confidence);

      const command = extractCommand(transcript);
      logDebug('Extracted command:', command);
      
      setDebugInfo({
        rawTranscript: transcript,
        extractedCommand: command,
        status: 'Processing command...'
      });

      if (command) {
        logDebug('Executing command:', command);
        onCommand(command);
      } else {
        logDebug('No valid command found in transcript');
      }
    };

    recognitionInstance.onerror = (event: any) => {
      logError('Recognition error:', event.error);
      console.error('Speech recognition error:', {
        error: event.error,
        message: event.message,
        timeStamp: event.timeStamp
      });
      setError(`Error: ${event.error}`);
      setIsListening(false);
      setDebugInfo(prev => ({ ...prev, status: `Error: ${event.error}` }));
    };

    recognitionInstance.onend = () => {
      logDebug('Recognition ended. isListening:', isListening);
      if (isListening) {
        logDebug('Restarting recognition...');
        recognitionInstance.start();
        setDebugInfo(prev => ({ ...prev, status: 'Restarting...' }));
      } else {
        setIsListening(false);
        setDebugInfo(prev => ({ ...prev, status: 'Stopped' }));
      }
    };

    setRecognition(recognitionInstance);

    return () => {
      logDebug('Cleaning up recognition instance');
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [isListening, onCommand, setIsListening]);

  const startListening = useCallback(() => {
    if (!speechSupported || !recognition) {
      logError('Cannot start - speech not supported or recognition not initialized');
      return;
    }
    try {
      logDebug('Starting recognition...');
      recognition.start();
      setDebugInfo(prev => ({ ...prev, status: 'Starting...' }));
    } catch (err) {
      logError('Failed to start recognition:', err);
      setError(String(err));
    }
  }, [speechSupported, recognition]);

  const stopListening = useCallback(() => {
    if (!recognition) {
      logError('Cannot stop - recognition not initialized');
      return;
    }
    try {
      logDebug('Stopping recognition...');
      recognition.stop();
      setIsListening(false);
      setDebugInfo(prev => ({ ...prev, status: 'Stopping...' }));
    } catch (err) {
      logError('Failed to stop recognition:', err);
      setError(String(err));
    }
  }, [recognition, setIsListening]);

  // Log component re-renders
  useEffect(() => {
    logDebug('VoiceControl component state updated:', {
      isListening,
      error,
      debugInfo
    });
  }, [isListening, error, debugInfo]);

  if (!speechSupported) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Voice control is not supported in your browser</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
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

        <span className="text-sm text-muted-foreground">
          Status: {debugInfo.status}
        </span>
      </div>

      {isListening && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="text-sm">
              <strong>Raw Transcript:</strong> {debugInfo.rawTranscript}
            </div>
            <div className="text-sm">
              <strong>Extracted Command:</strong> {debugInfo.extractedCommand}
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Info className="h-4 w-4" />
                Available Commands:
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                {availableCommands.map((cmd, i) => (
                  <div key={i} className="bg-secondary rounded px-2 py-1">{cmd}</div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default VoiceControl;