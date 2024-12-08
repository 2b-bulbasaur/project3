# Menu API

## Overview

Manages menu items for the restaurant POS system, including CRUD operations for menu items and their ingredients.

## Endpoints

### `GET /api/menu`
Retrieves menu items. Can fetch all items or a specific item by ID.

#### Query Parameters
- `id` (optional): Fetch specific menu item

### `POST /api/menu`
Creates a new menu item.

### `PUT /api/menu`
Updates an existing menu item.

### `DELETE /api/menu?id={id}`
Deletes a menu item.

## Request/Response Formats

### Menu Item Structure
```typescript
interface MenuItem {
  id: number;
  item_type: string;
  name: string;
  price: number;
  premium: boolean;
  ingredients?: string[];
}
```

### POST Request Example
```json
{
  "item_type": "main",
  "name": "Pizza",
  "price": 12.99,
  "premium": false,
  "ingredients": ["cheese", "tomato"]
}
```

### PUT Request Example
```json
{
  "id": 1,
  "name": "Updated Pizza",
  "price": 14.99,
  "ingredients": ["cheese", "tomato", "basil"]
}
```

## Response Examples

### Successful GET Response
```json
[
  {
    "id": 1,
    "item_type": "main",
    "name": "Pizza",
    "price": 12.99,
    "premium": false,
    "ingredients": ["cheese", "tomato"]
  }
]
```

### Error Responses

#### Not Found (404)
```json
{
  "error": "Menu item not found."
}
```

#### Invalid Input (400)
```json
{
  "error": "Invalid input. All fields are required."
}
```

#### Server Error (500)
```json
{
  "error": "Failed to fetch menu items."
}
```

## Validation Rules

### Required Fields
- item_type
- name
- price (must be valid number)
- premium status

### Optional Fields
- ingredients (array)

## Error Handling

The API handles various error cases:
- Invalid input validation
- Database operation failures
- Missing required fields
- Invalid price formats
- Not found items
- Server errors

## Implementation Notes

### Price Validation
```typescript
if (typeof price !== 'number' || isNaN(price)) {
  return NextResponse.json(
    { error: 'Price must be a valid number.' },
    { status: 400 }
  );
}
```

### Ingredient Management
- Ingredients are stored and updated atomically with menu items
- Supports bulk ingredient updates
- Maintains referential integrity

## Related Documentation
- [Inventory](./inventory.md)
- [Transactions](./transactions.md)