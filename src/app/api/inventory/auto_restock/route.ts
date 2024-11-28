import { NextResponse } from 'next/server';
import { getReorderInventory } from '@/lib/inventory';
import { query } from '@/lib/db';

/**
 * Handles POST requests to auto-restock inventory items
 * @returns {Promise<NextResponse>} JSON response with restock results
 */
export async function POST() {
    try {
        // Get items that need restocking
        const inventory = await getReorderInventory();
        
        if (!inventory || inventory.length === 0) {
            return NextResponse.json({ 
                error: 'No items need restocking' 
            }, { status: 400 });
        }

        const results = [];
        for (const item of inventory) {
            try {
                await query(
                    'UPDATE inventory SET amount = $1, reorder = $2 WHERE name = $3',
                    [500.0, false, item.name]
                );
                results.push({ name: item.name, success: true });
            } catch (err) {
                console.error(`Error updating ${item.name}:`, err);
                results.push({ 
                    name: item.name, 
                    success: false, 
                    error: err instanceof Error ? err.message : 'Unknown error' 
                });
            }
        }

        const failedUpdates = results.filter(r => !r.success);
        
        if (failedUpdates.length > 0) {
            return NextResponse.json({ 
                error: `Failed to restock: ${failedUpdates.map(f => f.name).join(', ')}`
            }, { status: 500 });
        }

        return NextResponse.json({ 
            message: 'Inventory restocked successfully',
            itemsRestocked: results.length 
        });
        
    } catch (error) {
        console.error('Error restocking inventory:', error);
        return NextResponse.json({ 
            error: 'Failed to restock inventory' 
        }, { status: 500 });
    }
}