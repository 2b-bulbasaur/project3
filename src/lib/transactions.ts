import { query } from './db';
import type { Transaction } from '@/types/db.types';
import type { OrderItem } from '@/types/api.types';

interface CreateTransactionInput {
  customer_name: string;
  cashier_name: string;
  sale_price: number;
  items: number;
  meals: number;
  appetizers: number;
  drinks: number;
  orderItems: OrderItem[];
}

export async function addTransaction(input: CreateTransactionInput): Promise<Transaction> {
  await query('BEGIN');

  try {
    const [transaction] = await query<Transaction>(`
      INSERT INTO transactionhistory (
        date, customer_name, cashier_name, sale_price, 
        items, meals, appetizers, drinks
      ) VALUES (
        CURRENT_TIMESTAMP, $1, $2, $3, $4, $5, $6, $7
      )
      RETURNING *;
    `, [
      input.customer_name,
      input.cashier_name,
      input.sale_price,
      input.items,
      input.meals,
      input.appetizers,
      input.drinks
    ]);

    for (const item of input.orderItems) {
      if (item.type === 'meal' && item.meal) {
        await query(`
          INSERT INTO mealorders (
            o_id, size, side1, side2, entree1, entree2, entree3
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id;
        `, [
          transaction.id,
          item.meal.size,
          item.meal.side1?.id || null,
          item.meal.side2?.id || null,
          item.meal.entree1?.id || null,
          item.meal.entree2?.id || null,
          item.meal.entree3?.id || null
        ]);
      } else if (item.type === 'appetizer' && item.item) {
        for (let i = 0; i < item.item.quantity; i++) {
          await query(`
            INSERT INTO appetizerorders (
              o_id, item
            ) VALUES ($1, $2)
            RETURNING id;
          `, [transaction.id, item.item.id]);
        }
      } else if (item.type === 'drink' && item.item) {
        for (let i = 0; i < item.item.quantity; i++) {
          await query(`
            INSERT INTO drinkorders (
              o_id, item
            ) VALUES ($1, $2)
            RETURNING id;
          `, [transaction.id, item.item.id]);
        }
      }
    }

    await query('COMMIT');
    return transaction;
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
}

export async function getTransactions(withSummary: boolean = false): Promise<Transaction[]> {
  if (withSummary) {
    const result = await query<Transaction>(`
      SELECT 
        t.*,
        STRING_AGG(DISTINCT m.name, ', ') as meal_items,
        STRING_AGG(DISTINCT a.name, ', ') as appetizer_items,
        STRING_AGG(DISTINCT d.name, ', ') as drink_items
      FROM transactionhistory t
      LEFT JOIN mealorders mo ON t.id = mo.o_id
      LEFT JOIN menu m ON m.id IN (mo.entree1, mo.entree2, mo.entree3, mo.side1, mo.side2)
      LEFT JOIN appetizerorders ao ON t.id = ao.o_id
      LEFT JOIN menu a ON a.id = ao.item
      LEFT JOIN drinkorders do ON t.id = do.o_id
      LEFT JOIN menu d ON d.id = do.item
      GROUP BY t.id
      ORDER BY t.date DESC 
      LIMIT 50
    `);
    return result;
  }
  
  const result = await query<Transaction>(`
    SELECT * FROM transactionhistory 
    ORDER BY date DESC 
    LIMIT 50
  `);
  return result;
}