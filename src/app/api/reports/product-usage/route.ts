import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface ProductUsageResult {
    ingredient_name: string;
    usage_count: number;
}

/**
 * Handles the POST request to generate a product usage report based on the given date range.
 * The function extracts two dates (input1, input2), parses them, and retrieves ingredient usage
 * for each menu item sold between the specified dates.
 * 
 * @param {Request} request - The incoming request object containing the date range in JSON format.
 * @returns {Promise<NextResponse>} - A JSON response with the product usage report or an error message.
 * 
 * @throws {Error} Throws an error if the date range is invalid or no product usage data is found.
 */
export async function POST(request: Request) {
    try {
        const { input1, input2 } = await request.json();
        const startDate = new Date(input1);
        const endDate = new Date(input2);
        endDate.setHours(23, 59, 59);

        const result = await query<ProductUsageResult>(`
            WITH all_menu_items AS (
                -- Get all menu items from meal orders
                SELECT mo.entree1 AS menu_id
                FROM mealorders mo
                WHERE mo.o_id IN (
                    SELECT id 
                    FROM transactionhistory 
                    WHERE date >= $1 AND date <= $2
                )
                AND mo.entree1 IS NOT NULL
                
                UNION ALL
                
                SELECT mo.entree2 AS menu_id
                FROM mealorders mo
                WHERE mo.o_id IN (
                    SELECT id 
                    FROM transactionhistory 
                    WHERE date >= $1 AND date <= $2
                )
                AND mo.entree2 IS NOT NULL
                
                UNION ALL
                
                SELECT mo.entree3 AS menu_id
                FROM mealorders mo
                WHERE mo.o_id IN (
                    SELECT id 
                    FROM transactionhistory 
                    WHERE date >= $1 AND date <= $2
                )
                AND mo.entree3 IS NOT NULL
                
                UNION ALL
                
                SELECT mo.side1 AS menu_id
                FROM mealorders mo
                WHERE mo.o_id IN (
                    SELECT id 
                    FROM transactionhistory 
                    WHERE date >= $1 AND date <= $2
                )
                AND mo.side1 IS NOT NULL
                
                UNION ALL
                
                SELECT mo.side2 AS menu_id
                FROM mealorders mo
                WHERE mo.o_id IN (
                    SELECT id 
                    FROM transactionhistory 
                    WHERE date >= $1 AND date <= $2
                )
                AND mo.side2 IS NOT NULL
                
                UNION ALL
                
                -- Get all menu items from appetizer orders
                SELECT ao.item AS menu_id
                FROM appetizerorders ao
                WHERE ao.o_id IN (
                    SELECT id 
                    FROM transactionhistory 
                    WHERE date >= $1 AND date <= $2
                )
                AND ao.item IS NOT NULL
            )
            SELECT 
                i.name AS ingredient_name,
                COUNT(*) AS usage_count
            FROM all_menu_items ami
            JOIN recipes r ON r.menu_id = ami.menu_id
            JOIN inventory i ON i.id = r.ingredient_id
            GROUP BY i.name
            ORDER BY usage_count DESC;
        `, [startDate.toISOString(), endDate.toISOString()]);

        const reportData = result.map(row => ({
            ingredient: row.ingredient_name,
            count: Number(row.usage_count)
        }));

        if(reportData.length === 0) { throw new Error('No data found for the selected date range'); }

        return NextResponse.json(reportData);

    } catch (error) {
        console.error('Error in generateProductUsage:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate Product Usage', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}