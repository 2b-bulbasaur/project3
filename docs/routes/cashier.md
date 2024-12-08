# Cashier Interface

The Cashier Interface provides a comprehensive point-of-sale system for restaurant employees to manage customer orders efficiently.

## Overview

The cashier interface is a React-based component that enables employees to:
- Create and customize meals
- Add individual items to orders
- Calculate prices including premium items
- Process transactions
- Manage customer information

## Component Structure

### Main Component
```typescript
const CashierPage: React.FC = () => {
  // Implementation details
}
```

### State Management
```typescript
interface State {
  menuItems: MenuItem[]                  // Available menu items
  currentOrder: OrderItem[]              // Current order items
  selectedCategory: string               // Active menu category filter
  customerName: string                   // Customer identifier
  employeeName: string                   // Logged-in employee
  currentMeal: MealInProgress | null     // Current meal being built
  loading: boolean                       // Loading state
  error: string                          // Error state
}
```

## Key Features

### 1. Order Management

#### Starting a New Order
```typescript
const startNewMeal = (size: SizeEnum) => {
  setCurrentMeal({
    id: Math.random().toString(36).slice(2, 11),
    size,
    side1: null,
    side2: null,
    entree1: null,
    entree2: null,
    entree3: null,
  });
}
```

#### Adding Items
```typescript
const addSimpleItem = (item: MenuItem) => {
  // Adds individual items like appetizers or drinks
}

const addToMeal = (item: MenuItem) => {
  // Adds items to a meal in progress
}
```

### 2. Price Calculation

The system automatically calculates prices based on:
- Meal size (bowl, plate, bigger plate)
- Premium items (+$1.50 each)
- Quantity of items

```typescript
const getMealPrice = (meal: MealInProgress) => {
  let basePrice = 0;
  if (meal.size === "bowl") basePrice = 8.99;
  else if (meal.size === "plate") basePrice = 10.99;
  else if (meal.size === "bigger plate") basePrice = 12.99;

  const premiumAddons = [
    meal.entree1,
    meal.entree2,
    meal.entree3,
    meal.side1,
    meal.side2,
  ].filter((item) => item?.premium).length;

  return basePrice + premiumAddons * 1.5;
}
```

### 3. Order Submission

```typescript
const submitOrder = async () => {
  const orderData = {
    customer_name: customerName || "Guest",
    cashier_name: employeeName,
    sale_price: getOrderTotal(),
    items: currentOrder.length,
    date: new Date(),
    orderItems: currentOrder
  };

  // API submission
  await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
}
```

## User Interface Sections

### 1. Menu Selection Area (Left Panel)
- Category filters
- Item grid with images and prices
- Premium item indicators
- Meal builder interface

### 2. Order Summary (Right Panel)
- Current order items
- Quantity adjustments
- Price calculations
- Order submission controls

## Meal Constraints

Different meal sizes have different constraints:

```typescript
const getMealConstraints = (size: SizeEnum) => {
  switch (size) {
    case "bowl":
      return { maxSides: 1, maxEntrees: 1 };
    case "plate":
      return { maxSides: 1, maxEntrees: 2 };
    case "bigger plate":
      return { maxSides: 2, maxEntrees: 3 };
    default:
      return { maxSides: 0, maxEntrees: 0 };
  }
}
```

## Security and Session Management

The interface includes:
- Employee session tracking
- Logout functionality
- Order validation
- Error handling

```typescript
const handleLogout = () => {
  localStorage.removeItem("employeeName");
  router.push("/login");
}
```

## Error Handling

The interface handles various error cases:
- Failed API calls
- Invalid meal combinations
- Missing required items
- Network issues

```typescript
try {
  // API operations
} catch (err) {
  setError("Failed to submit order");
  console.error(err);
}
```

## API Integration

The cashier interface integrates with several backend endpoints:

### Menu Items
```typescript
GET /api/menu
```

### Transactions
```typescript
POST /api/transactions
Body: {
  customer_name: string
  cashier_name: string
  sale_price: number
  items: number
  date: Date
  orderItems: OrderItem[]
}
```

## Types and Interfaces

### MenuItem
```typescript
interface MenuItem {
  id: string
  name: string
  price: number
  item_type: 'entree' | 'side' | 'appetizer' | 'drink'
  premium?: boolean
}
```

### OrderItem
```typescript
interface OrderItem {
  type: 'meal' | 'appetizer' | 'drink'
  meal?: MealInProgress
  item?: {
    id: string
    name: string
    price: number
    quantity: number
  }
}
```

### MealInProgress
```typescript
interface MealInProgress {
  id?: string
  size: SizeEnum
  side1: MenuItem | null
  side2: MenuItem | null
  entree1: MenuItem | null
  entree2: MenuItem | null
  entree3: MenuItem | null
}
```

## Best Practices

1. Always validate meal combinations before completion
2. Maintain clear error messages for user feedback
3. Update order totals after any change
4. Save order state to prevent loss during page refreshes
5. Clear session data on logout

## Related Components
- [OrderSummary](../components/ordersummary.md)
- [MealBuilder](../components/meal-builder.md)