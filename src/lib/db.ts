// /lib/db.ts
import { Pool } from 'pg';

// create a new pool instance
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

// query function with logging
export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const client = await pool.connect();
  
  // logs for debugging
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
