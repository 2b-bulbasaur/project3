# Authentication API

## Overview

Handles authentication using NextAuth, supporting both Google OAuth and employee login flows.

## Endpoints

### `GET|POST /api/auth/[...nextauth]`

NextAuth authentication handler that manages all auth-related routes.

## Implementation

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

## Configuration

Authentication is configured through `authOptions` which includes:
- Google OAuth provider
- JWT session handling
- Custom callbacks for session management

## Usage

### Client-Side Authentication

```typescript
import { signIn, signOut, useSession } from "next-auth/react";

// Login
await signIn('google');

// Logout
await signOut();

// Get session
const { data: session } = useSession();
```

### Protected API Routes

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
if (!session) {
  return new Response("Unauthorized", { status: 401 });
}
```

## Error Handling

- Returns appropriate HTTP status codes for authentication failures
- Handles OAuth callback errors
- Manages session validation errors

## Related Documentation
- [Employee Authentication](./employeeauth.md)
- [Customer Promotions](./customerpromo.md)