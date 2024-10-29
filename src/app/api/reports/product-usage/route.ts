import { NextResponse } from 'next/server'
import { getTransactions } from '@/lib/transactions';
import { getIngredientsForMenuItem } from '@/lib/menu';
import { getItemsInAppOrder, getItemsInMealOrder } from '@/lib/orders';
import { getInventoryById } from '@/lib/inventory';

type IngredientCount = {
    [key: string]: number;
}

export async function POST(request: Request) {
    try {
        const { input1, input2 } = await request.json();
        const [month1, day1, year1] = input1.split('/').map(Number);
        const startDate = new Date(year1, month1-1, day1, 0, 0, 0);

        const [month2, day2, year2] = input2.split('/').map(Number);
        const endDate = new Date(year2, month2-1, day2, 23, 59, 59);

        const transactions = await getTransactions();
        const ingredientCount: IngredientCount = {};

        for (const transaction of transactions) {
            const transactionDate = new Date(transaction.date);
           
            if (transactionDate >= startDate && transactionDate <= endDate) {
                const orderId = transaction.id;
                const mealItems = await getItemsInMealOrder(orderId);

                for (const item of mealItems) {
                    const ingredients = await getIngredientsForMenuItem(item);
                    for (const ingredient of ingredients) {
                        const ingredientQuery = await getInventoryById(ingredient.id);
                        if (ingredientQuery) {
                            const ingredientName = ingredientQuery.name;
                            ingredientCount[ingredientName] = (ingredientCount[ingredientName] || 0) + 1;
                        }
                    }
                }

                const appItems = await getItemsInAppOrder(orderId);
                for (const item of appItems) {
                    const ingredients = await getIngredientsForMenuItem(item);
                    for (const ingredient of ingredients) {
                        const ingredientQuery = await getInventoryById(ingredient.id);
                        if (ingredientQuery) {
                            const ingredientName = ingredientQuery.name;
                            ingredientCount[ingredientName] = (ingredientCount[ingredientName] || 0) + 1;
                        }
                    }
                }
            }
        }
        
        const reportData = Object.keys(ingredientCount).map(ingredient => ({
            ingredient,
            count: ingredientCount[ingredient]
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