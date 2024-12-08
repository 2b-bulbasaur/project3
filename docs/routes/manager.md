# Manager Interface

The Manager Interface provides a comprehensive dashboard for restaurant managers to oversee operations, manage inventory, employees, menu items, and generate reports. This interface includes real-time transaction monitoring, weather-based business insights, and inventory management capabilities.

## Overview

The manager interface consists of five main components:
- Dashboard
- Menu Management
- Inventory Management
- Employee Management
- Report Generation

## Features

### Dashboard Features
- Real-time transaction monitoring
- Weather-based business insights
- Inventory alerts
- Quick action navigation
- Transaction history

### Management Features
- Menu item creation and editing
- Inventory tracking and reordering
- Employee management
- Report generation and visualization

## Component Structure

### Main Dashboard Component
```typescript
const ManagerDashboard: React.FC = () => {
  // Manages dashboard state and integrations
}
```

### Management Components
```typescript
const ManageMenu: React.FC = () => {
  // Handles menu item management
}

const ManageInventory: React.FC = () => {
  // Handles inventory management
}

const ManageEmployees: React.FC = () => {
  // Handles employee management
}

const GenerateReport: React.FC = () => {
  // Handles report generation
}
```

## State Management

```typescript
interface State {
  transactions: TransactionWithSummary[]    // Transaction history
  reorderInventory: string[]               // Items needing reorder
  showAlerts: boolean                      // Inventory alert visibility
  showWeatherBoard: boolean                // Weather info visibility
  error: string | null                     // Error state
  loading: boolean                         // Loading state
}
```

## Key Features

### 1. Weather Integration

```typescript
const WeatherDialog = () => {
  const [weatherData, setWeatherData] = useState({
    cityName: '',
    temperature: 0,
    description: '',
    icon: ''
  });

  // Fetches weather data and provides business insights
}
```

### 2. Inventory Management

```typescript
const handleAutoRestock = async () => {
  // Handles automatic inventory restocking
};

const handleAlertToggle = (checked: boolean) => {
  // Toggles inventory alert visibility
};
```

### 3. Menu Management

#### Menu Item Types
```typescript
interface MenuItem {
  id: number;
  name: string;
  price: number;
  item_type: ItemTypeEnum;
  premium: boolean;
  ingredients?: SelectedIngredient[];
}
```

#### Adding/Updating Items
```typescript
const handleAddMenuItem = async () => {
  // Handles adding new menu items
};

const handleUpdateMenuItem = async () => {
  // Handles updating existing menu items
};
```

### 4. Report Generation

The interface supports multiple report types:
- X Reports (current day transactions)
- Z Reports (end-of-day summary)
- Product Usage Reports
- Sales Reports

```typescript
interface ReportData {
  hour: string;
  count: number;
}

const generateXReport = async () => {
  // Generates X report
};

const generateZReport = async () => {
  // Generates Z report
};
```

## API Integration

### Transactions
```typescript
GET /api/transactions?summary=true
```

### Inventory Management
```typescript
GET /api/inventory/reorder_alert
POST /api/inventory/auto_restock
```

### Menu Management
```typescript
GET /api/menu
POST /api/menu
PUT /api/menu
DELETE /api/menu
```

### Employee Management
```typescript
GET /api/employees
POST /api/employees
PUT /api/employees
DELETE /api/employees
```

### Reports
```typescript
POST /api/reports/x-report
POST /api/reports/z-report
POST /api/reports/product-usage
POST /api/reports/sales-report
```

## Visualization Components

### Transaction Chart
```typescript
const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: {
      display: true,
      text: 'Report Visualization'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: { text: 'Count' }
    }
  }
};
```

## Security Features

### Authentication
- Role-based access control
- Session management
- Secure password handling

```typescript
const handleLogout = () => {
  router.push("/");
};

const switchToCashierView = () => {
  router.push("/cashier");
};
```

## Error Handling

The interface handles various error cases:
- Failed API calls
- Invalid data inputs
- Network issues
- Authentication errors

```typescript
try {
  // API operations
} catch (error) {
  setError(error instanceof Error ? error.message : 'An error occurred');
  console.error('Operation failed:', error);
}
```

## Local Storage Management

The interface persists certain preferences:
- Alert visibility settings
- Weather board visibility
- User session information

```typescript
localStorage.setItem("showInventoryAlerts", checked.toString());
localStorage.setItem("showWeatherBoard", checked.toString());
```

## UI Sections

### 1. Top Navigation
- Quick action dropdown
- Alert toggles
- User information
- View switching controls

### 2. Main Content Area
- Transaction history
- Alert dialogs
- Weather information
- Management forms

### 3. Data Visualization
- Transaction charts
- Sales reports
- Usage statistics
- Inventory status

## Related Components
- [MealBuilder](./components/meal-builder.md)
- [TransactionChart](./components/transactionchart.md)
- [WeatherDialog](./components/weatherdialog.md)
- [InventoryManager](./components/inventorymanager.md)