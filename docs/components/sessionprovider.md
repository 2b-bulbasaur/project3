# SessionProvider Component

A wrapper component that provides authentication session context using NextAuth.js.

## Usage

```tsx
import SessionProvider from '@/components/SessionProvider';
```

## Props

### children
- Type: `React.ReactNode`
- Required: Yes
- Description: Child components to render within the authentication context

## Features
- Provides authentication context to the application
- Configures NextAuth.js with custom base path
- Handles session management automatically