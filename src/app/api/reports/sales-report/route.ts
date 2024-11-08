import { NextResponse } from 'next/server'
import { getTransactions } from '@/lib/transactions';
import { getItemsInAppOrder, getItemsInMealOrder } from '@/lib/orders';
import { getMenuNameById } from '@/lib/menu';

type SalesCount = {
    [key: string]: number;
}

export async function POST(request: Request) {
    try {
        const { input1, input2 } = await request.json();
        const year1 = input1.substring(0, 4);
        const month1 = input1.substring(5, 7);
        const day1 = input1.substring(8, 10);
        //const [month1, day1, year1] = input1.split('/').map(Number);
        const startDate = new Date(year1, month1-1, day1, 0, 0, 0);

        const year2= input2.substring(0, 4);
        const month2 = input2.substring(5, 7);
        const day2 = input2.substring(8, 10);
        //const [month2, day2, year2] = input2.split('/').map(Number);
        const endDate = new Date(year2, month2-1, day2, 23, 59, 59);

        const transactions = await getTransactions();
        const salesCount: SalesCount = {};

        for (const transaction of transactions) {
            const transactionDate = new Date(transaction.date);
           
            if (transactionDate >= startDate && transactionDate <= endDate) {
                const orderId = transaction.id;
                const mealItems = await getItemsInMealOrder(orderId);

                for (const item of mealItems) {
                    const itemNames = await getMenuNameById(item);
                    for (const itemName of itemNames) {
                        salesCount[itemName.name] = (salesCount[itemName.name] || 0) + 1;
                    }
                }

                const appItems = await getItemsInAppOrder(orderId);
                for (const item of appItems) {
                    const itemNames = await getMenuNameById(item);
                    for (const itemName of itemNames) {
                        salesCount[itemName.name] = (salesCount[itemName.name] || 0) + 1;
                    }
                }
            }
        }
        
        const reportData = Object.keys(salesCount).map(item => ({
            item,
            count: salesCount[item]
        }));
    
        return NextResponse.json(reportData);    
    }
    catch (error) {
        console.error('Error in generateProductUsage:', error);
        return NextResponse.json(
            { error: 'Failed to generate Product Usage', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
};