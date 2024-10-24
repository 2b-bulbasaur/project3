import { Pool } from 'pg';

// Create a new pool instance
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  ssl: {
    rejectUnauthorized: false // Required for some university databases
  }
});

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
}

// Query function with logging
export async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  const client = await pool.connect();
  
  // Log the query and parameters for debugging
  console.log('Executing SQL Query:', sql);
  console.log('With Parameters:', params);

  try {
    const result = await client.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all transactions
export async function getTransactions(): Promise<Transaction[]> {
  try {
    return await query<Transaction>(`
      SELECT 
        th.id,
        th.date,
        th.customer_name,
        th.cashier_name,
        th.sale_price,
        th.items,
        th.meals,
        th.appetizers,
        th.drinks,
        array_agg(DISTINCT m.name) AS meal_items,
        array_agg(DISTINCT a.name) AS appetizer_items,
        array_agg(DISTINCT d.name) AS drink_items
      FROM transactionhistory th
      LEFT JOIN mealorders mo ON mo.o_id = th.id
      LEFT JOIN menu m ON m.id = mo.entree1
      LEFT JOIN appetizerorders ao ON ao.o_id = th.id
      LEFT JOIN menu a ON a.id = ao.item
      LEFT JOIN drinkorders dr ON dr.o_id = th.id  -- Renamed alias from do to dr
      LEFT JOIN menu d ON d.id = dr.item           -- Updated reference to dr
      GROUP BY th.id, th.date, th.customer_name, th.cashier_name, 
               th.sale_price, th.items, th.meals, th.appetizers, th.drinks
      ORDER BY th.date DESC 
      LIMIT 50
    `);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

// Add a new transaction
export async function addTransaction({
  customerName,
  cashierName,
  salePrice,
  items,
  meals,
  appetizers,
  drinks
}: {
  customerName: string;
  cashierName: string;
  salePrice: number;
  items: number;
  meals: number;
  appetizers: number;
  drinks: number;
}): Promise<Transaction> {
  try {
    const [result] = await query<Transaction>(
      `INSERT INTO transactionhistory (
        customer_name,
        cashier_name,
        sale_price,
        items,
        meals,
        appetizers,
        drinks,
        date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING *`,
      [customerName, cashierName, salePrice, items, meals, appetizers, drinks]
    );
    return result;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
}

// Get detailed transaction information
export async function getTransactionDetails(transactionId: number): Promise<Transaction> {
  try {
    const [result] = await query<Transaction>(`
      SELECT 
        th.*,
        json_agg(DISTINCT jsonb_build_object(
          'meal_name', m.name,
          'quantity', mo.size
        )) FILTER (WHERE m.name IS NOT NULL) AS meals,
        json_agg(DISTINCT jsonb_build_object(
          'appetizer_name', a.name,
          'quantity', ao.item
        )) FILTER (WHERE a.name IS NOT NULL) AS appetizers,
        json_agg(DISTINCT jsonb_build_object(
          'drink_name', d.name,
          'quantity', dr.item
        )) FILTER (WHERE d.name IS NOT NULL) AS drinks
      FROM transactionhistory th
      LEFT JOIN mealorders mo ON mo.o_id = th.id
      LEFT JOIN menu m ON m.id = mo.entree1
      LEFT JOIN appetizerorders ao ON ao.o_id = th.id
      LEFT JOIN menu a ON a.id = ao.item
      LEFT JOIN drinkorders dr ON dr.o_id = th.id  -- Renamed alias from do to dr
      LEFT JOIN menu d ON d.id = dr.item           -- Updated reference to dr
      WHERE th.id = $1
      GROUP BY th.id
    `, [transactionId]);
    
    return result;
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    throw error;
  }
}
