// /app/api/inventory/route.ts
import { NextResponse } from 'next/server';
import {
  getAllInventory,
  getInventoryById,
  addInventory,
  updateInventory,
  deleteInventory,
} from '@/lib/inventory';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      const item = await getInventoryById(parseInt(id));
      if (!item) {
        return NextResponse.json(
          { error: 'Inventory item not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(item);
    }

    const inventory = await getAllInventory();
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, amount, unit, reorder } = body;

    if (!name || amount === undefined || !unit || reorder === undefined) {
      return NextResponse.json(
        { error: 'Invalid input. All fields are required.' },
        { status: 400 }
      );
    }

    // Check for existing items by name instead of ID
    const existingItems = await getAllInventory();
    const nameExists = existingItems.some(item => 
      item.name.toLowerCase() === name.toLowerCase()
    );
    
    if (nameExists) {
      return NextResponse.json(
        { error: `Inventory item '${name}' already exists.` },
        { status: 409 }
      );
    }

    const newItem = await addInventory(name, amount, unit, reorder);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error adding inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to add inventory item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, amount, unit, reorder } = await request.json();

    if (!id || !name || amount === undefined || !unit || reorder === undefined) {
      return NextResponse.json(
        { error: 'Invalid input. All fields are required.' },
        { status: 400 }
      );
    }

    const existingItem = await getInventoryById(id);
    if (!existingItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    const updatedItem = await updateInventory(id, name, amount, unit, reorder);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      { error: 'Invalid or missing inventory ID.' },
      { status: 400 }
    );
  }

  try {
    const item = await getInventoryById(parseInt(id));
    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    await deleteInventory(parseInt(id));
    return NextResponse.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}