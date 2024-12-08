# Employees API

## Overview

Manages employee data including CRUD operations for employee records in the POS system.

## Endpoints

### `GET /api/employees`

Retrieves all employees.

#### Response
```typescript
interface Employee[] {
  id: number;
  name: string;
  job: string;
  hours: number;
  salary: number;
}
```

### `POST /api/employees`

Creates a new employee record.

#### Request Body
```typescript
interface CreateEmployeeRequest {
  name: string;
  job: string;
  hours: number;
  salary: number;
  password: string;
}
```

### `PUT /api/employees`

Updates an existing employee record.

#### Request Body
```typescript
interface UpdateEmployeeRequest {
  id: number;
  name: string;
  job: string;
  hours: number;
  salary: number;
  password: string;
}
```

### `DELETE /api/employees?id={id}`

Deletes an employee record.

## Response Examples

### Successful GET Response
```json
[
  {
    "id": 1,
    "name": "John Smith",
    "job": "Cashier",
    "hours": 40,
    "salary": 15.00
  }
]
```

### Successful POST/PUT Response
```json
{
  "id": 1,
  "name": "John Smith",
  "job": "Cashier",
  "hours": 40,
  "salary": 15.00
}
```

### Successful DELETE Response
```json
{
  "message": "Employee deleted successfully"
}
```

## Error Responses

### Invalid Input (400)
```json
{
  "error": "Invalid input"
}
```

### Server Error (500)
```json
{
  "error": "Failed to [operation] employee"
}
```

## Validation Rules

- Name is required
- Job title is required
- Hours must be non-negative
- Salary must be non-negative
- Password is required for new employees

## Security Considerations

- Password handling
- Role-based access control
- Data sanitization
- Error message security

## Related Documentation
- [Employee Authentication](./employeeauth.md)
- [Authentication](./auth.md)