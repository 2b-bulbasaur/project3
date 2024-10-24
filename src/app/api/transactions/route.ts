// src/app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import { getTransactions, addTransaction, getTransactionDetails } from '@/lib/db';

export async function GET(request: Request) {
    try {
        // Check if we're requesting details for a specific transaction
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            const transaction = await getTransactionDetails(parseInt(id));
            if (!transaction) {
                return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
            }
            return NextResponse.json(transaction);
        }

        // Otherwise return all transactions
        const transactions = await getTransactions();
        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Error in transactions GET route:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions', details: error },
            { status: 500 }
        );
    }
}

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
            drinks = 0
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
            drinks
        });

        return NextResponse.json(newTransaction);
    } catch (error) {
        console.error('Error in transactions POST route:', error);

        return NextResponse.json(
            { error: 'Failed to create transaction', details: error },
            { status: 500 }
        );
    }
}