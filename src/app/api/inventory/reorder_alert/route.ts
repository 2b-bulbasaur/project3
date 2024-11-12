import { NextResponse } from 'next/server'
import { getReorderInventory } from '@/lib/inventory'

export async function GET(request: Request) {
    try {
        const inventory = await getReorderInventory();
        return NextResponse.json(inventory);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ status: 500, message: errorMessage }, { status: 500 });
    }
}