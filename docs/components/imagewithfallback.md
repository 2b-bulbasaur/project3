# ImageWithFallback Component

A wrapper around Next.js's Image component that automatically handles image loading failures by displaying a fallback image.

## Usage

```tsx
import ImageWithFallback from '@/components/ImageWithFallback';

<ImageWithFallback
  src="/menu/orange-chicken.jpg"
  alt="Orange Chicken"
  width={300}
  height={200}
/>
```

# ImageWithFallback Props

### src
- Type: `string`
- Required: Yes
- Description: Primary image source URL

### alt
- Type: `string`
- Required: Yes
- Description: Alternative text for the image

### width
- Type: `number`
- Required: No
- Description: Image width in pixels

### height
- Type: `number`
- Required: No
- Description: Image height in pixels

### fill
- Type: `boolean`
- Required: No
- Description: Whether image should fill container

### priority
- Type: `boolean`
- Required: No
- Description: Whether to prioritize loading

### loading
- Type: `"lazy" | "eager"`
- Required: No
- Description: Image loading behavior

### className
- Type: `string`
- Required: No
- Description: CSS classes to apply

# SessionProvider Props

### children
- Type: `React.ReactNode`
- Required: Yes
- Description: Child components to render

# TransactionChart Props

### data
- Type: `TransactionData[]`
- Required: Yes
- Description: Array of hour/count data points for visualization

# VoiceControl Props

### onCommand
- Type: `(command: string) => void`
- Required: Yes
- Description: Handler for processing voice commands

### isListening
- Type: `boolean`
- Required: Yes
- Description: Current listening state of the voice control

### setIsListening
- Type: `(listening: boolean) => void`
- Required: Yes
- Description: Function to update listening state

## Features
- Automatic fallback to default image on load failure
- Maintains all Next.js Image component functionality
- Type-safe props interface