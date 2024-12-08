# Inventory API

## Overview

Manages restaurant inventory, including item tracking, reordering alerts, and automatic restocking functionality.

## Core Endpoints

### `GET /api/inventory`

Retrieves inventory items. Can fetch all items or a specific item by ID.

#### Query Parameters
- `id` (optional): Specific inventory item ID

#### Response
```typescript
interface InventoryItem {
  id: number;
  name: string;
  amount: number;
  unit: string;
  reorder: boolean;
}
```

### `POST /api/inventory`

Creates a new inventory item.

#### Request Body
```typescript
{
  "name": "Item Name",
  "amount": 100,
  "unit": "kg",
  "reorder": false
}
```

### `PUT /api/inventory`

Updates an existing inventory item.

#### Request Body
```typescript
{
  "id": 1,
  "name": "Updated Item Name",
  "amount": 150,
  "unit": "kg",
  "reorder": true
}
```

### `DELETE /api/inventory?id={id}`

Deletes an inventory item.

## Reorder Management Endpoints

### `GET /api/inventory/reorder_alert`

Retrieves items that need reordering.

#### Response Example
```json
[
  {
    "name": "Rice",
    "amount": 10,
    "unit": "kg",
    "reorder": true
  }
]
```

### `POST /api/inventory/auto_restock`

Automatically restocks items flagged for reordering.

#### Response Example
```json
{
  "message": "Inventory restocked successfully",
  "itemsRestocked": 3
}
```

## Error Responses

### Invalid Input (400)
```json
{
  "error": "Invalid input. All fields are required."
}
```

### Conflict (409)
```json
{
  "error": "Inventory item 'Rice' already exists."
}
```

### Not Found (404)
```json
{
  "error": "Inventory item not found"
}
```

### Server Error (500)
```json
{
  "error": "Failed to [operation] inventory item"
}
```

## Validation Rules

### Required Fields
- name (string, unique)
- amount (number)
- unit (string)
- reorder (boolean)

### Business Rules
- Item names must be unique (case-insensitive)
- Amount must be non-negative
- Reorder flag indicates low stock status
- Auto-restock sets amount to 500.0 by default

## Auto-Restock Process

1. System checks for items flagged for reorder
2. For each flagged item:
   - Updates amount to 500.0
   - Sets reorder flag to false
3. Returns success/failure status for each item

### Example Auto-Restock Response
```json
{
  "message": "Inventory restocked successfully",
  "itemsRestocked": 3
}
```

## Error Handling

The API handles various error cases:
- Duplicate item names
- Invalid input validation
- Database operation failures
- Missing required fields
- Not found items
- Restock operation failures

## Implementation Notes

### Duplicate Check
```typescript
const nameExists = existingItems.some(item => 
  item.name.toLowerCase() === name.toLowerCase()
);
```

### Restock Operation
```typescript
await query(
  'UPDATE inventory SET amount = $1, reorder = $2 WHERE name = $3',
  [500.0, false, item.name]
);
```

## Related pages
- [Menu](./menu.md)
- [Transactions](./transactions.md)