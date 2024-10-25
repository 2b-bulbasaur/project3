// /lib/transactions.ts
import { query } from './db';
import { Transaction } from '../types';

// fetch all transactions (limit 50)
export async function getTransactions(): Promise<Transaction[]> {
  return query<Transaction>(`
    SELECT 
      th.id, th.date, th.customer_name, th.cashier_name,
      th.sale_price, th.items, th.meals, th.appetizers, th.drinks,
      array_agg(DISTINCT m.name) AS meal_items,
      array_agg(DISTINCT a.name) AS appetizer_items,
      array_agg(DISTINCT d.name) AS drink_items
    FROM transactionhistory th
    LEFT JOIN mealorders mo ON mo.o_id = th.id
    LEFT JOIN menu m ON m.id = mo.entree1
    LEFT JOIN appetizerorders ao ON ao.o_id = th.id
    LEFT JOIN menu a ON a.id = ao.item
    LEFT JOIN drinkorders dr ON dr.o_id = th.id
    LEFT JOIN menu d ON d.id = dr.item
    GROUP BY th.id
    ORDER BY th.date DESC 
    LIMIT 50
  `);
}

// adds a new transaction
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
  const [transaction] = await query<Transaction>(
    `INSERT INTO transactionhistory (
      customer_name, cashier_name, sale_price, items, 
      meals, appetizers, drinks, date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    RETURNING *`,
    [customerName, cashierName, salePrice, items, meals, appetizers, drinks]
  );
  return transaction;
}

// gets transaction details by ID
export async function getTransactionDetails(transactionId: number): Promise<Transaction> {
  const [transaction] = await query<Transaction>(`
    SELECT 
      th.*, 
      json_agg(DISTINCT jsonb_build_object('meal_name', m.name, 'quantity', mo.size)) 
        FILTER (WHERE m.name IS NOT NULL) AS meals,
      json_agg(DISTINCT jsonb_build_object('appetizer_name', a.name, 'quantity', ao.item)) 
        FILTER (WHERE a.name IS NOT NULL) AS appetizers,
      json_agg(DISTINCT jsonb_build_object('drink_name', d.name, 'quantity', dr.item)) 
        FILTER (WHERE d.name IS NOT NULL) AS drinks
    FROM transactionhistory th
    LEFT JOIN mealorders mo ON mo.o_id = th.id
    LEFT JOIN menu m ON m.id = mo.entree1
    LEFT JOIN appetizerorders ao ON ao.o_id = th.id
    LEFT JOIN menu a ON a.id = ao.item
    LEFT JOIN drinkorders dr ON dr.o_id = th.id
    LEFT JOIN menu d ON d.id = dr.item
    WHERE th.id = $1
    GROUP BY th.id
  `, [transactionId]);

  return transaction;
}
