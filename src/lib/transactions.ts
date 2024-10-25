// /lib/transactions.ts
import { query } from './db';

interface Transaction {
  id: number;
  date: Date;
  customer_name: string;
  cashier_name: string;
  sale_price: number;
  items: number;
  meals: number;
  appetizers: number;
  drinks: number;
  meal_items?: string[];      // Optional, only used when needed
  appetizer_items?: string[]; // Optional, only used when needed
  drink_items?: string[];     // Optional, only used when needed
  order_summary?: string;     // Optional derived field for summary
}

// helper to format the order summary when needed
function formatOrderSummary(
  mealItems: string[] | null = [], 
  appetizerItems: string[] | null = [], 
  drinkItems: string[] | null = []
): string {
  const meals = mealItems || []; 
  const appetizers = appetizerItems || [];
  const drinks = drinkItems || [];

  const parts: string[] = [];

  if (meals.length > 0) {
    parts.push(`${meals.length} meal${meals.length > 1 ? 's' : ''} (${meals.join(', ')})`);
  }
  if (appetizers.length > 0) {
    parts.push(`${appetizers.length} appetizer${appetizers.length > 1 ? 's' : ''} (${appetizers.join(', ')})`);
  }
  if (drinks.length > 0) {
    parts.push(`${drinks.length} drink${drinks.length > 1 ? 's' : ''} (${drinks.join(', ')})`);
  }

  const totalItems = meals.length + appetizers.length + drinks.length;
  return `${totalItems} items: ${parts.join(', ')}`;
}


// gets transactions: Raw or with order summary based on flag (default: raw)
export async function getTransactions(
  withSummary: boolean = false
): Promise<Transaction[]> {
  const results = await query<any>(`
    SELECT 
      th.id, th.date, th.customer_name, th.cashier_name,
      th.sale_price, th.items, th.meals, th.appetizers, th.drinks,
      array_agg(DISTINCT m.name) FILTER (WHERE m.name IS NOT NULL) AS meal_items,
      array_agg(DISTINCT a.name) FILTER (WHERE a.name IS NOT NULL) AS appetizer_items,
      array_agg(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL) AS drink_items
    FROM transactionhistory th
    LEFT JOIN mealorders mo ON mo.o_id = th.id
    LEFT JOIN menu m ON m.id = mo.entree1
    LEFT JOIN appetizerorders ao ON ao.o_id = th.id
    LEFT JOIN menu a ON a.id = ao.item
    LEFT JOIN drinkorders dr ON dr.o_id = th.id
    LEFT JOIN menu d ON d.id = dr.item
    GROUP BY th.id
    ORDER BY th.date DESC
    LIMIT 50;
  `);

  if (withSummary) {
    //  order summary if requested
    return results.map((transaction: any) => ({
      ...transaction,
      order_summary: formatOrderSummary(
        transaction.meal_items,
        transaction.appetizer_items,
        transaction.drink_items
      ),
    }));
  }

  // Return raw transaction attributes without summary
  return results.map((transaction: any) => ({
    id: transaction.id,
    date: transaction.date,
    customer_name: transaction.customer_name,
    cashier_name: transaction.cashier_name,
    sale_price: transaction.sale_price,
    items: transaction.items,
    meals: transaction.meals,
    appetizers: transaction.appetizers,
    drinks: transaction.drinks,
  }));
}

// add a new transaction (only using database attributes)
export async function addTransaction({
  customerName,
  cashierName,
  salePrice,
  items,
  meals,
  appetizers,
  drinks,
}: {
  customerName: string;
  cashierName: string;
  salePrice: number;
  items: number;
  meals: number;
  appetizers: number;
  drinks: number;
}): Promise<Transaction> {
  const [transaction] = await query<Transaction>(`
    INSERT INTO transactionhistory (
      customer_name, cashier_name, sale_price, items, 
      meals, appetizers, drinks, date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    RETURNING *;
  `, [customerName, cashierName, salePrice, items, meals, appetizers, drinks]);

  return transaction;
}
