# OrderSummary Component

A dynamic order summary component that displays the current order items, allows quantity adjustments, and handles checkout. Supports both individual items and meal combinations.

## Usage

```tsx
import OrderSummary from '@/components/OrderSummary';

<OrderSummary
  order={currentOrder}
  total={orderTotal}
  onRemoveItem={handleRemoveItem}
  onUpdateQuantity={handleUpdateQuantity}
  onCheckout={handleCheckout}
/>
```

## Props

### order
- Type: `OrderItem[]`
- Required: Yes
- Description: Array of items in the current order

### total
- Type: `number`
- Required: Yes
- Description: Total cost of the order

### onRemoveItem
- Type: `(index: number) => void`
- Required: Yes
- Description: Handler function called when removing items from the order

### onUpdateQuantity
- Type: `(index: number, change: number) => void`
- Required: Yes
- Description: Handler function for updating item quantities

### onCheckout
- Type: `() => void`
- Required: Yes
- Description: Handler function called when proceeding to checkout

## Types

```typescript
interface OrderItem {
  type: 'meal' | 'item';
  meal?: {
    size: string;
    side1?: { name: string };
    side2?: { name: string };
    entree1?: { name: string };
    entree2?: { name: string };
  };
  item?: {
    name: string;
    price: number;
    quantity: number;
  };
}
```

## Features
- Empty state handling with user guidance
- Separate display formats for meals and individual items
- Quantity adjustment controls for individual items
- Item removal functionality
- Real-time price formatting
- Scrollable item list for long orders
- Clear total display and checkout button

## UI Components Used
- Card from shadcn/ui
- ScrollArea for long order lists
- Button components with various styles
- Lucide icons for interactive elements

## States
- Empty order
- Order with meals
- Order with individual items
- Order with mixed content