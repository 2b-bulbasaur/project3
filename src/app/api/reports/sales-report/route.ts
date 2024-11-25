import { NextResponse } from 'next/server'
import { query } from '@/lib/db';

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

        const transactions = await query<{
            item_name: string, 
            sale_count: number
        }>(`
            WITH ItemSales AS (
                -- Meal Entrees
                SELECT m.name AS item_name
                FROM transactionhistory t
                JOIN mealorders mo ON mo.o_id = t.id
                JOIN menu m ON m.id IN (mo.entree1, mo.entree2, mo.entree3)
                WHERE t.date >= $1 AND t.date <= $2
                AND m.name IS NOT NULL
                
                UNION ALL
                
                -- Meal Sides
                SELECT m.name AS item_name
                FROM transactionhistory t
                JOIN mealorders mo ON mo.o_id = t.id
                JOIN menu m ON m.id IN (mo.side1, mo.side2)
                WHERE t.date >= $1 AND t.date <= $2
                AND m.name IS NOT NULL
                
                UNION ALL
                
                -- Appetizer Items
                SELECT m.name AS item_name
                FROM transactionhistory t
                JOIN appetizerorders ao ON ao.o_id = t.id
                JOIN menu m ON m.id = ao.item
                WHERE t.date >= $1 AND t.date <= $2
                
                UNION ALL
                
                -- Drink Items
                SELECT m.name AS item_name
                FROM transactionhistory t
                JOIN drinkorders dr ON dr.o_id = t.id
                JOIN menu m ON m.id = dr.item
                WHERE t.date >= $1 AND t.date <= $2
            )
            SELECT 
                item_name,
                COUNT(*) AS sale_count
            FROM ItemSales
            GROUP BY item_name
            ORDER BY sale_count DESC
        `, [startDate.toISOString(), endDate.toISOString()]);

        const reportData = transactions.map(row => ({
            item: row.item_name,
            count: Number(row.sale_count)
        }));

        if(reportData.length === 0) { 
            throw new Error('No data found for the selected date range'); 
        }
    
        return NextResponse.json(reportData);    
    }
    catch (error) {
        console.error('Error in generateSalesReport:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate Sales Report', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
};