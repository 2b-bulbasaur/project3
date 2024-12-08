# MealBuilder Component

A React component for building customized meals with sides and entrées. Supports different meal sizes (bowl, plate, bigger plate) with varying numbers of allowed selections.

## Usage

```tsx
import { MealBuilder } from '@/components/MealBuilder';

// Example usage
<MealBuilder
  size="plate"
  meal={currentMeal}
  menuItems={availableItems}
  onUpdateMeal={handleUpdate}
  onComplete={handleComplete}
  onCancel={handleCancel}
/>
```

## Props

### size
- Type: `SizeEnum`
- Required: Yes
- Description: Meal size ('bowl', 'plate', 'bigger plate')

### meal
- Type: `MealInProgress`
- Required: Yes
- Description: Current state of the meal being built

### menuItems
- Type: `MenuItem[]`
- Required: Yes
- Description: Available menu items to choose from

### onUpdateMeal
- Type: `(item: MenuItem) => void`
- Required: Yes
- Description: Handler for item selection

### onComplete
- Type: `() => void`
- Required: Yes
- Description: Handler for meal completion

### onCancel
- Type: `() => void`
- Required: Yes
- Description: Handler for cancellation

## Features

- Visual progress indicator
- Side-by-side selection of sides and entrées
- Dynamic meal requirements based on size
- Real-time validation
- Responsive grid layout
- Image display for menu items
- Price formatting

## Accessibility

- Dynamic text scaling with 'dynamic-text' class
- ARIA-compliant button states
- Clear visual feedback for selected items
- Progress indicators for meal completion
- Descriptive alerts for required selections

## Example States

### Bowl
- 1 side
- 1 entrée

### Plate
- 1 side
- 2 entrées

### Bigger Plate
- 2 sides
- 3 entrées