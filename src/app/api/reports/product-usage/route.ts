import { NextResponse } from 'next/server'
import { getTransactions } from '@/lib/transactions';
import { getIngredientsForMenuItem } from '@/lib/menu';
import { getMealOrderById } from '@/lib/orders';

type HourlyCount = {
    [key: string]: number;
};

export async function POST(request: Request) {
    try {
        const { input1, input2 } = await request.json();
        const [month1, day1, year1] = input1.split('/').map(Number);
        const startDate = new Date(year1, month1-1, day1, 0, 0, 0);

        const [month2, day2, year2] = input2.split('/').map(Number);
        const endDate = new Date(year2, month2-1, day2, 23, 59, 59);

        const transactions = await getTransactions();
        // transactions.forEach(transaction => {
        //     const transactionDate = new Date(transaction.date);

        //     if (transactionDate >= startDate && transactionDate <= endDate) {
        //         const mea
        //     }
        // })


        
    }
    catch {
        return NextResponse.json(
            { error: 'Failed to generate Product Usage Report'},
            { status: 500 }
        );
    }
};