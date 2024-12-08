# VoiceControl Component

A speech recognition component for handling voice commands.

## Usage

```tsx
import VoiceControl from '@/components/VoiceControl';

const handleCommand = (command: string) => {
  console.log('Received command:', command);
};
```

## Props

### onCommand
- Type: `(command: string) => void`
- Required: Yes
- Description: Handler function called when a voice command is recognized

### isListening
- Type: `boolean`
- Required: Yes
- Description: Current state indicating if voice recognition is active

### setIsListening
- Type: `(listening: boolean) => void`
- Required: Yes
- Description: Function to update the listening state of the component

## Features
- Browser compatibility checking
- Continuous speech recognition
- Error handling and user feedback
- Start/stop control
- Visual feedback for listening state
- Automatic restart on interruption

## Browser Support
- Primary support for Chrome browser
- Fallback alert for unsupported browsers
- Uses Web Speech API