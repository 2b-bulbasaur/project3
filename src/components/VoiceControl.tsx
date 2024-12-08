//components/VoiceControl.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { extractCommand } from '@/lib/VoiceCommands';
import type { 
  FeedbackMessage, 
  SpeechRecognition, 
  SpeechRecognitionEvent, 
  SpeechRecognitionErrorEvent 
} from '@/types/voice.types';

interface VoiceControlProps {
  onCommand: (command: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ 
  onCommand, 
  isListening, 
  setIsListening 
}) => {
  const [speechSupported, setSpeechSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [debugInfo, setDebugInfo] = useState({
    rawTranscript: '',
    extractedCommand: '',
    status: 'Ready'
  });

  const showFeedback = useCallback((message: FeedbackMessage) => {
    console.log('Feedback:', message);
    setFeedback(message);
    if (message.duration) {
      setTimeout(() => setFeedback(null), message.duration);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setDebugInfo(prev => ({ ...prev, status: 'Stopped' }));
    }
  }, [setIsListening]);

  const checkMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Clean up the stream
      setHasMicPermission(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Microphone permission error:', err);
      setHasMicPermission(false);
      setError("Please allow microphone access to use voice commands");
      return false;
    }
  }, []);

  const initializeRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechSupported(false);
      setError("Your browser doesn't support voice commands. Please use Chrome for the best experience.");
      return false;
    }

    try {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognitionRef.current = recognition;
      return true;
    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      setSpeechSupported(false);
      setError("Failed to initialize speech recognition");
      return false;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!speechSupported) return;

    // Check/request microphone permission
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) return;

    // Initialize recognition if needed
    if (!recognitionRef.current && !initializeRecognition()) return;

    const recognition = recognitionRef.current!;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setDebugInfo(prev => ({ ...prev, status: 'Listening...' }));
      showFeedback({
        message: 'Voice recognition started',
        type: 'success',
        duration: 2000
      });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      console.log('Transcript received:', transcript);

      const command = extractCommand(transcript);
      console.log('Extracted command:', command);

      setDebugInfo({
        rawTranscript: transcript,
        extractedCommand: command || '',
        status: command ? 'Processing command...' : 'No command found'
      });

      if (command) {
        setIsProcessing(true);
        try {
          onCommand(command);
          showFeedback({
            message: `Command executed: ${command}`,
            type: 'success',
            duration: 2000
          });
        } catch (err) {
          showFeedback({
            message: err instanceof Error ? err.message : 'Command failed',
            type: 'error',
            duration: 3000
          });
        } finally {
          setIsProcessing(false);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Recognition error:', event);
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        setHasMicPermission(false);
        setError("Microphone access denied. Please allow microphone access and try again.");
      } else {
        setError(`Recognition error: ${event.error}`);
      }
      setIsListening(false);
      stopListening();
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
          stopListening();
        }
      } else {
        setIsListening(false);
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError('Failed to start voice recognition. Please try again.');
      setIsListening(false);
    }
  }, [
    speechSupported,
    checkMicrophonePermission,
    initializeRecognition,
    isListening,
    onCommand,
    showFeedback,
    stopListening,
    setIsListening
  ]);

  useEffect(() => {
    const init = async () => {
      await checkMicrophonePermission();
      initializeRecognition();
    };
    init();
  }, [checkMicrophonePermission, initializeRecognition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  if (!speechSupported) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Voice control is not supported in your browser. Please use Chrome.</AlertDescription>
      </Alert>
    );
  }

  if (hasMicPermission === false) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Microphone access is required. Please allow microphone access in your browser settings and refresh the page.
        </AlertDescription>
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
          disabled={isProcessing || !hasMicPermission}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Stop Voice'}
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

      {feedback && (
        <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isListening && debugInfo.rawTranscript && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="text-sm">
              <strong>Heard:</strong> {debugInfo.rawTranscript}
            </div>
            {debugInfo.extractedCommand && (
              <div className="text-sm">
                <strong>Command:</strong> {debugInfo.extractedCommand}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default VoiceControl;