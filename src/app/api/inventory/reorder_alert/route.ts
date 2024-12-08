/**
 * @fileoverview API route handler for inventory reorder information
 * @module route
 */

import { NextResponse } from 'next/server'
import { getReorderInventory } from '@/lib/inventory'

/**
 * Handles GET requests to retrieve inventory items that need reordering
 * @async
 * @function GET
 * @returns {Promise<NextResponse>} JSON response containing inventory reorder data
 * @throws {Error} When inventory data cannot be retrieved
 * @example
 * // Successful response
 * {
 *   // Array of inventory items needing reorder
 * }
 * 
 * // Error response
 * {
 *   status: 500,
 *   message: "Error message"
 * }
 */
export async function GET() {
    try {
        const inventory = await getReorderInventory();
        return NextResponse.json(inventory);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ status: 500, message: errorMessage }, { status: 500 });
    }
}