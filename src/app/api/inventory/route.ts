// /app/api/inventory/route.ts
import { NextResponse } from 'next/server';
import {
  getAllInventory,
  getInventoryById,
  addInventory,
  updateInventory,
  deleteInventory,
} from '@/lib/inventory';

// GET: gets all inventory items
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id'); // optional parameter to get a single item via id

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

// POST: adds a new inventory item
export async function POST(request: Request) {
  try {
    const { name, amount, unit, reorder } = await request.json();

    if (!name || amount === undefined || !unit || reorder === undefined) {
      return NextResponse.json(
        { error: 'Invalid input. All fields are required.' },
        { status: 400 }
      );
    }

    const existingItem = await getInventoryById(name);
    if (existingItem) {
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

// PUT: updates an existing inventory item
export async function PUT(request: Request) {
  try {
    const { id, name, amount, unit, reorder } = await request.json();

    if (
      !id ||
      !name ||
      amount === undefined ||
      !unit ||
      reorder === undefined
    ) {
      return NextResponse.json(
        { error: 'Invalid input. All fields are required.' },
        { status: 400 }
      );
    }

    const updatedItem = await updateInventory(
      id,
      name,
      amount,
      unit,
      reorder
    );

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

// DELETE: removes an inventory item by ID
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
