# Employee Authentication API

## Overview

Handles employee-specific authentication, providing secure login functionality for staff members accessing the POS system.

## Endpoints

### `POST /api/employeeauth`

Authenticates employees using name and password credentials.

## Request

```typescript
interface EmployeeAuthRequest {
  name: string;
  password: string;
}
```

### Example Request Body
```json
{
  "name": "Akash Jothi",
  "password": "ermwhatthesigma"
}
```

## Response

### Success Response
```typescript
interface EmployeeAuthResponse {
  id: number;
  name: string;
  job: string;
  hours: number;
}
```

### Example Success Response
```json
{
  "id": 1,
  "name": "Akash Jothi",
  "job": "sigma",
  "hours": 500
}
```

### Error Responses

- 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

- 500 Internal Server Error
```json
{
  "error": "Login failed"
}
```

## Implementation Details

### Database Query
```sql
SELECT id, name, job, hours 
FROM employees 
WHERE name = $1 AND password = $2
```

### Security Considerations
- Credentials validated against secure database
- Sensitive data (password) excluded from response
- Error messages designed to prevent information leakage

## Error Handling
- Invalid credentials
- Database connection failures
- Malformed requests

## Related Documentation
- [Authentication](./auth.md)
- [Employees](./employees.md)