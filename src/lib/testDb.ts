import { query } from './db';

interface NowResult {
  now: Date;
}

async function testConnection() {
  try {
    const [result] = await query<NowResult>('SELECT NOW()');
    console.log('Database connection successful:', result.now);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export default testConnection;