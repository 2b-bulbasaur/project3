# Reports API

## Overview

Provides endpoints for generating various business reports including X-Reports (daily), Z-Reports (end-of-day), Product Usage Reports, and Sales Reports.

## Endpoints

### 1. `POST /api/reports/x-report`
Generates hourly transaction reports for the current business day (9 AM - 9 PM).

#### Response Format
```typescript
interface HourlyReport {
  hour: string;    // Format: "HH:00"
  count: number;   // Transaction count
}
```

#### Example Response
```json
[
  { "hour": "9:00", "count": 5 },
  { "hour": "10:00", "count": 8 }
]
```

### 2. `POST /api/reports/z-report`
Generates end-of-day transaction summary.

#### Business Rules
- Can only be generated after 9 PM
- One Z-Report per day
- Covers transactions between 9 AM and 9 PM

#### Error Responses
- 403: Report already generated today
- 403: Too early (before 9 PM)
- 500: Generation failure

### 3. `POST /api/reports/product-usage`
Generates ingredient usage report for a specified date range.

#### Request Body
```typescript
interface ProductUsageRequest {
  input1: string;  // Start date (ISO format)
  input2: string;  // End date (ISO format)
}
```

#### Response Format
```typescript
interface ProductUsageReport {
  ingredient: string;
  count: number;
}
```

### 4. `POST /api/reports/sales-report`
Generates itemized sales report for a specified date range.

#### Request Body
```json
{
  "input1": "2024-01-01",  // Start date
  "input2": "2024-01-31"   // End date
}
```

#### Response Format
```typescript
interface SalesReport {
  item: string;    // Menu item name
  count: number;   // Number of sales
}
```

## Implementation Details

### X-Report Generation
```typescript
// Process transactions for current day
transactions.forEach(transaction => {
  if (isSameDay(transaction.date, now) && 
      isBusinessHour(transaction.date)) {
    hourlyCount[`${getHour(transaction.date)}:00`]++;
  }
});
```

### Z-Report Storage
```typescript
const REPORT_FILE = 'z-report-status.json';

interface ZReportStatus {
  lastGenerated: string;  // ISO date
}
```

## Error Handling

### Common Error Responses
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

### Status Codes
- 200: Successful report generation
- 403: Business rule violation (Z-Report)
- 500: Server/processing error

### Error Scenarios
- Invalid date range
- No data found
- Database query failures
- File system errors (Z-Report)
- Business hour violations

## Related Documentation
- [Transactions](./transactions.md)
- [Menu](./menu.md)
- [Inventory](./inventory.md)