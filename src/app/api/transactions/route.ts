import { NextResponse } from 'next/server';
import { getTransactions, addTransaction } from '@/lib/transactions';

/**
 * Handles GET requests for transactions.
 * 
 * Fetches transactions from the database. If the `summary` query parameter is set to `true`,
 * it fetches a summarized version of the transactions.
 * 
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} The response containing the transactions or an error message.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const withSummary = searchParams.get('summary') === 'true';

    const transactions = await getTransactions(withSummary);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error in transactions GET route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests for transactions.
 * 
 * Adds a new transaction to the database. The request body must contain `customer_name`, `cashier_name`,
 * and `sale_price` fields.
 * 
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} The response containing the created transaction or an error message.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.customer_name || !body.cashier_name || body.sale_price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transaction = await addTransaction(body);
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error in transactions POST route:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}