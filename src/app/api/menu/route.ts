// /app/api/menu/route.ts
import { NextResponse } from 'next/server';
import {
  getAllMenuItems,
  getMenuItemById,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '@/lib/menu';

// GET: gets all menu items or a specific one by ID
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id'); // Optional: Fetch menu item by ID

  try {
    if (id) {
      const menuItem = await getMenuItemById(parseInt(id));
      if (!menuItem) {
        return NextResponse.json({ error: 'Menu item not found.' }, { status: 404 });
      }
      return NextResponse.json(menuItem);
    }

    const menuItems = await getAllMenuItems();
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items.' },
      { status: 500 }
    );
  }
}

// POST: adds a new menu item with ingredients
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { item_type, name, price, premium, ingredients = [] } = body;

    if (!item_type || !name || price === undefined || premium === undefined) {
      return NextResponse.json(
        { error: 'Invalid input. All fields are required.' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || isNaN(price)) {
      return NextResponse.json(
        { error: 'Price must be a valid number.' },
        { status: 400 }
      );
    }

    const newItem = await addMenuItem(item_type, name, price, premium, ingredients);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error adding menu item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to add menu item';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT: updates an existing menu item with ingredients
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ingredients, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required to update the menu item.' },
        { status: 400 }
      );
    }

    if (updates.price !== undefined && (typeof updates.price !== 'number' || isNaN(updates.price))) {
      return NextResponse.json(
        { error: 'Price must be a valid number.' },
        { status: 400 }
      );
    }

    const updatedItem = await updateMenuItem(id, updates, ingredients || []);
    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Menu item not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update menu item';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE: deletes a menu item by ID
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      { error: 'Invalid or missing menu item ID.' },
      { status: 400 }
    );
  }

  try {
    const menuItem = await getMenuItemById(parseInt(id));
    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found.' },
        { status: 404 }
      );
    }

    await deleteMenuItem(parseInt(id));
    return NextResponse.json({ message: 'Menu item deleted successfully.' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete menu item';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}