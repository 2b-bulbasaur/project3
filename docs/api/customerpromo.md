# Customer Promotion API

## Overview

Manages customer promotional features including eligibility checking and automated email notifications for promotional offers.

## Endpoints

### `GET /api/customer_promo`

Checks promotional eligibility for authenticated customers and sends promotional emails when qualified.

## Request Requirements
- Must have valid authentication session
- Session must include user email

## Response

```typescript
interface PromoResponse {
  email: string;
  transactionCount: number;
  isEligibleForPromo: boolean;
  promoCode: string | null;
  ordersUntilNextPromo: number;
}
```

### Success Response Example
```json
{
  "email": "customer@example.com",
  "transactionCount": 5,
  "isEligibleForPromo": true,
  "promoCode": "PANDA20",
  "ordersUntilNextPromo": 0
}
```

### Error Responses

- 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

- 500 Internal Server Error
```json
{
  "message": "Internal Server Error"
}
```

## Features

### Promotional Email System
- Uses Gmail API for email delivery
- Automatically sends promo codes to eligible customers
- Tracks transaction history for eligibility

### Eligibility Rules
- Based on transaction count (every 5 transactions)
- Requires authenticated user session
- Tracks progress toward next promotion

## Configuration

### Required Environment Variables
```
GMAIL_GOOGLE_CLIENT_ID
GMAIL_GOOGLE_CLIENT_SECRET
GMAIL_GOOGLE_API_REDIRECT_URI
GMAIL_GOOGLE_REFRESH_TOKEN
```

## Error Handling
- Authentication validation
- Email sending failures
- Transaction counting errors
- API rate limiting

## Related Documentation
- [Authentication](./auth.md)
- [Transactions](./transactions.md)