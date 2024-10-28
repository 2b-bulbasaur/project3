import { NextResponse } from 'next/server'
import { getTransactions } from '@/lib/transactions';
import { getIngredientsForMenuItem } from '@/lib/menu';
import { getMealOrderById } from '@/lib/orders';

export async function POST(request: Request) {
    try {
        const { input1, input2 } = await request.json();
        const [month1, day1, year1] = input1.split('/').map(Number);
        const startDate = new Date(year1, month1-1, day1, 0, 0, 0);

        const [month2, day2, year2] = input2.split('/').map(Number);
        const endDate = new Date(year2, month2-1, day2, 23, 59, 59);

        const transactions = await getTransactions();
        const ingredientMap = new Map<number, number>();

        transactions.forEach(async transaction => {
            const transactionDate = new Date(transaction.date);

            if (transactionDate >= startDate && transactionDate <= endDate) {
                const orderId = transaction.id;
                const mealsOrdered = await getMealOrderById(orderId);

                mealsOrdered.forEach(async order => {
                    if (order.entree1 != null) {
                        const ingredients = await getIngredientsForMenuItem(order.entree1);
                        ingredients.forEach(ingredient => {
                            ingredientMap.set(ingredient.id, (ingredientMap.get(ingredient.id) || 0) + 1);
                        });
                    }
                    
                });
            }
        })

    
        return NextResponse.json(ingredientMap);    
    }
    catch (error) {
        console.error('Error in generateXReport:', error);
        return NextResponse.json(
            { error: 'Failed to generate X Report', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
};