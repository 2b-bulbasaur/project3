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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [debugInfo, setDebugInfo] = useState({
    rawTranscript: '',
    extractedCommand: '',
    status: 'Ready'
  });

  const showFeedback = useCallback((message: FeedbackMessage) => {
    setFeedback(message);
    if (message.duration) {
      setTimeout(() => setFeedback(null), message.duration);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!speechSupported || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setDebugInfo(prev => ({ ...prev, status: 'Starting...' }));
      showFeedback({
        message: 'Voice recognition started',
        type: 'success',
        duration: 2000
      });
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError(err instanceof Error ? err.message : 'Failed to start voice recognition');
      showFeedback({
        message: 'Failed to start voice recognition',
        type: 'error',
        duration: 3000
      });
    }
  }, [speechSupported, showFeedback]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
      setDebugInfo(prev => ({ ...prev, status: 'Stopping...' }));
      showFeedback({
        message: 'Voice recognition stopped',
        type: 'info',
        duration: 2000
      });
    } catch (err) {
      console.error('Failed to stop recognition:', err);
      setError(err instanceof Error ? err.message : 'Failed to stop voice recognition');
    }
  }, [setIsListening, showFeedback]);

  const recoverFromError = useCallback(() => {
    stopListening();
    showFeedback({
      message: 'Attempting to recover from error...',
      type: 'info',
      duration: 2000
    });
    setTimeout(startListening, 1000);
  }, [stopListening, startListening, showFeedback]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechSupported(false);
      setError("Your browser doesn't support voice commands. Please use Chrome for the best experience.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setDebugInfo(prev => ({ ...prev, status: 'Listening...' }));
      showFeedback({
        message: 'Voice recognition started',
        type: 'info',
        duration: 2000
      });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase().trim();
      
      const command = extractCommand(transcript);
      
      setDebugInfo({
        rawTranscript: transcript,
        extractedCommand: command,
        status: 'Processing command...'
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
      console.error('Speech recognition error:', event);
      setError(`Error: ${event.error}`);
      setIsListening(false);
      setDebugInfo(prev => ({ ...prev, status: `Error: ${event.error}` }));
      showFeedback({
        message: `Recognition error: ${event.error}`,
        type: 'error',
        duration: 3000
      });
      recoverFromError();
    };

    recognition.onend = () => {
      if (isListening) {
        setTimeout(() => {
          try {
            recognition.start();
            setDebugInfo(prev => ({ ...prev, status: 'Restarting...' }));
          } catch (e) {
            console.error('Failed to restart recognition:', e);
            showFeedback({
              message: 'Failed to restart recognition',
              type: 'error',
              duration: 3000
            });
          }
        }, 300);
      } else {
        setIsListening(false);
        setDebugInfo(prev => ({ ...prev, status: 'Stopped' }));
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.stop();
      }
    };
  }, [
    isListening, 
    onCommand, 
    setIsListening, 
    showFeedback, 
    recoverFromError
  ]);

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
          disabled={isProcessing}
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