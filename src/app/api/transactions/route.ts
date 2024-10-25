// src/app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import { getTransactions, addTransaction } from '@/lib/transactions';

// GET: gets all transactions with or without summaries
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const withSummary = searchParams.get('summary') === 'true'; // checks if summary flag is present

    const transactions = await getTransactions(withSummary);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error in transactions GET route:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST: adds a new transaction to the database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      cashierName,
      salePrice,
      items = 0,
      meals = 0,
      appetizers = 0,
      drinks = 0,
    } = body;

    if (!customerName || !cashierName || salePrice === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newTransaction = await addTransaction({
      customerName,
      cashierName,
      salePrice: Number(salePrice),
      items,
      meals,
      appetizers,
      drinks,
    });

    return NextResponse.json(newTransaction);
  } catch (error) {
    console.error('Error in transactions POST route:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: 'Failed to create transaction', details: errorMessage },
      { status: 500 }
    );
  }
}
