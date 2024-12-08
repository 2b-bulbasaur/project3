# TransactionChart Component

A visualization component for displaying hourly transaction data using Chart.js.

## Usage

```tsx
import TransactionChart from '@/components/TransactionChart';

const data = [
  { hour: "09:00", count: 5 },
  { hour: "10:00", count: 8 }
];
```

## Props

### data
- Type: `TransactionData[]`
- Required: Yes
- Description: Array of hourly transaction data points

## Data Interface

```typescript
interface TransactionData {
  hour: string;
  count: number;
}
```

## Features
- Responsive line chart visualization
- Automatic data transformation
- Custom styling and colors
- Interactive tooltips
- Legend and title display