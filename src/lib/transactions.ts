import { query } from './db';
import type { Transaction } from '@/types/db.types';
import type { OrderItem, TransactionWithSummary } from '@/types/api.types';

interface CreateTransactionInput {
  customer_name: string;
  customer_email: string; // Added customer_email
  cashier_name: string;
  sale_price: number;
  items: number;
  meals: number;
  appetizers: number;
  drinks: number;
  orderItems: OrderItem[];
}

export async function getTransactions(withSummary: boolean = false): Promise<Transaction[] | TransactionWithSummary[]> {
  if (withSummary) {
    const result = await query<TransactionWithSummary>(`
      WITH MealInfo AS (
        SELECT 
          mo.o_id,
          COUNT(DISTINCT mo.id) as meal_count,
          STRING_AGG(
            CASE 
              WHEN m.item_type = 'entree' THEN m.name 
              WHEN m.item_type = 'side' THEN m.name
            END,
            ', '
            ORDER BY m.item_type DESC, m.name
          ) as items
        FROM mealorders mo
        LEFT JOIN menu m ON m.id IN (mo.entree1, mo.entree2, mo.entree3, mo.side1, mo.side2)
        WHERE m.name IS NOT NULL
        GROUP BY mo.o_id
      ),
      AppInfo AS (
        SELECT 
          ao.o_id,
          COUNT(DISTINCT ao.id) as app_count,
          STRING_AGG(DISTINCT m.name, ', ' ORDER BY m.name) as items
        FROM appetizerorders ao
        JOIN menu m ON m.id = ao.item
        GROUP BY ao.o_id
      ),
      DrinkInfo AS (
        SELECT 
          dr.o_id,
          COUNT(DISTINCT dr.id) as drink_count,
          STRING_AGG(DISTINCT m.name, ', ' ORDER BY m.name) as items
        FROM drinkorders dr
        JOIN menu m ON m.id = dr.item
        GROUP BY dr.o_id
      )
      SELECT 
        t.*,
        CONCAT(
          COALESCE(mi.meal_count, 0) + COALESCE(ai.app_count, 0) + COALESCE(di.drink_count, 0),
          ' items: ',
          CASE 
            WHEN mi.meal_count > 0 THEN 
              mi.meal_count || ' meal' || 
              CASE WHEN mi.meal_count > 1 THEN 's' ELSE '' END ||
              ' (' || mi.items || ')'
            ELSE ''
          END,
          CASE 
            WHEN ai.app_count > 0 THEN 
              CASE WHEN mi.meal_count > 0 THEN ', ' ELSE '' END ||
              ai.app_count || ' appetizer' ||
              CASE WHEN ai.app_count > 1 THEN 's' ELSE '' END ||
              ' (' || ai.items || ')'
            ELSE ''
          END,
          CASE 
            WHEN di.drink_count > 0 THEN 
              CASE WHEN mi.meal_count > 0 OR ai.app_count > 0 THEN ', ' ELSE '' END ||
              di.drink_count || ' drink' ||
              CASE WHEN di.drink_count > 1 THEN 's' ELSE '' END ||
              ' (' || di.items || ')'
            ELSE ''
          END
        ) as order_summary
      FROM transactionhistory t
      LEFT JOIN MealInfo mi ON t.id = mi.o_id
      LEFT JOIN AppInfo ai ON t.id = ai.o_id
      LEFT JOIN DrinkInfo di ON t.id = di.o_id
      ORDER BY t.date DESC 
      LIMIT 50;
    `);

    return result.map(row => ({
      ...row,
      order_summary: row.order_summary || `0 items: `
    }));
  }
  
  return await query<Transaction>(`
    SELECT 
      id,
      date,
      customer_name,
      customer_email, -- Added customer_email
      cashier_name,
      sale_price,
      items,
      meals,
      appetizers,
      drinks
    FROM transactionhistory 
    ORDER BY date DESC 
    LIMIT 50;
  `);
}

export async function addTransaction(input: CreateTransactionInput): Promise<Transaction> {
  await query('BEGIN');

  try {
    const [transaction] = await query<Transaction>(`
      INSERT INTO transactionhistory (
        date, customer_name, customer_email, cashier_name, sale_price, 
        items, meals, appetizers, drinks
      ) VALUES (
        CURRENT_TIMESTAMP, $1, $2, $3, $4, $5, $6, $7, $8
      )
      RETURNING *;
    `, [
      input.customer_name,
      input.customer_email, // Insert customer_email
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
