# Customer Interface

The Customer Interface provides a self-service kiosk experience for restaurant patrons to place their orders independently. This interface includes accessibility features, meal customization, and order management capabilities.

## Overview

The customer interface consists of three main components:
- Customer Login Page
- Order Creation Interface
- Checkout Process

## Features

### Accessibility Features
- Voice command support
- Multi-language support via Google Translate
- Screen reader compatibility
- High contrast visual elements

### Order Management
- Meal customization
- Real-time price calculation
- Promo code application
- Order persistence using localStorage
- Cart management

## Component Structure

### Customer Login Component
```typescript
const CustomerLoginPage: React.FC = () => {
  // Manages authentication state and login/logout flows
}
```

### Main Order Interface
```typescript
const CustomerPage: React.FC = () => {
  // Handles order creation and management
}
```

### CategorySection Component
```typescript
interface CategorySectionProps {
  items: MenuItem[];
  category: ItemTypeEnum;
  onItemClick: (item: MenuItem) => void;
}
```

## State Management

```typescript
interface State {
  menuItems: MenuItem[]                  // Available menu items
  currentOrder: OrderItem[]              // Current order items
  currentMeal: MealInProgress | null     // Current meal being built
  orderTotal: number                     // Original order total
  discountedTotal: number               // Total after promo code
  promoCode: string                     // Applied promo code
  isPromoValid: boolean                 // Promo validation status
  showMealBuilder: boolean              // Meal builder visibility
  textSize: number                      // Current text size
  isListening: boolean                  // Voice control status
}
```

## Key Features

### 1. Voice Control Integration

```typescript
const handleVoiceCommand = useCallback((transcript: string) => {
  const command = extractCommand(transcript);
  const commandHandler = new VoiceCommandHandler(
    menuItems,
    {
      startNewMeal,
      addSimpleItem,
      handleMealUpdate,
      completeMeal,
      cancelMeal,
      handleCheckout,
      validatePromoCode
    },
    currentMeal
  );
});
```

### 2. Dynamic Text Sizing

```typescript
const increaseTextSize = () => {
  setTextSize(prevSize => Math.min(prevSize + 3, 23));
};

const decreaseTextSize = () => {
  setTextSize(prevSize => Math.max(prevSize - 3, 12));
};
```

### 3. Order Management

#### Starting a New Meal
```typescript
const startNewMeal = (size: SizeEnum) => {
  setCurrentMeal({
    size,
    side1: null,
    side2: null,
    entree1: null,
    entree2: null,
    entree3: null,
  });
  setShowMealBuilder(true);
};
```

#### Adding Items
```typescript
const addSimpleItem = (item: MenuItem) => {
  // Adds individual items like appetizers or drinks
  if (item.item_type !== "appetizer" && item.item_type !== "drink") return;
  
  setCurrentOrder(prev => {
    const existingIndex = prev.findIndex(
      orderItem => orderItem.type !== "meal" && orderItem.item?.id === item.id
    );

    if (existingIndex >= 0) return prev;

    return [...prev, {
      type: item.item_type as "appetizer" | "drink",
      item: { ...item, quantity: 1 },
    }];
  });
};
```

### 4. Price Calculation and Promo Codes

```typescript
const calculateTotal = useCallback(() => {
  const total = currentOrder.reduce((sum, item) => {
    // Calculate total based on meal sizes and premium items
    // Apply promo code discount if valid
  }, 0);

  setOrderTotal(total);
  setDiscountedTotal(isPromoValid ? total * 0.8 : total);
}, [currentOrder, isPromoValid]);
```

## Authentication Flow

The customer interface supports:
- Google OAuth login
- Guest checkout
- Session persistence
- Secure logout

```typescript
const handleLogin = async () => {
  setIsLoading(true);
  await signIn('google');
  setIsLoading(false);
};

const handleGuestAccess = () => {
  router.push('/customer');
};
```

## Local Storage Management

The interface persists order data across sessions:
- Current order items
- Order totals
- Applied promo codes
- Text size preferences

```typescript
// Saving order state
localStorage.setItem("currentOrder", JSON.stringify(updatedOrder));
localStorage.setItem("orderTotal", discountedTotal.toString());
localStorage.setItem("originalTotal", orderTotal.toString());
localStorage.setItem("promoCode", isPromoValid ? promoCode : "");
```

## UI Sections

### 1. Main Order Interface
- Meal type selection
- Item category tabs
- Dynamic item grid
- Accessibility controls

### 2. Cart Summary
- Order items list
- Quantity controls
- Promo code input
- Total calculation display

## Error Handling

The interface handles various error cases:
- Failed API calls
- Invalid promo codes
- Missing required selections
- Network issues

```typescript
try {
  const response = await fetch("/api/menu");
  if (!response.ok) throw new Error("Failed to fetch menu items");
  const data = await response.json();
  setMenuItems(data);
} catch (err) {
  setError("Failed to load menu items");
  console.error(err);
}
```

## API Integration

### Menu Items
```typescript
GET /api/menu
```

### Transactions
```typescript
POST /api/transactions
Body: {
  customer_name: string
  sale_price: number
  items: number
  date: Date
  orderItems: OrderItem[]
  promo_code?: string
}
```

## Related Components
- [MealBuilder](./components/meal-builder.md)
- [OrderSummary](./components/ordersummary.md)
- [VoiceControl](./components/voicecontrol.md)
- [Translation](./components/translation.md)