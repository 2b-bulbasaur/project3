// /lib/menu.ts
import { query } from './db';
import { InventoryItem, MenuItem, Recipe } from '../types';

// gets all menu items with their associated ingredients
export async function getAllMenuItems(): Promise<MenuItem[]> {
  const menuItems = await query<MenuItem>('SELECT * FROM menu');
  for (const item of menuItems) {
    item.ingredients = await getIngredientsForMenuItem(item.id); // gets ingredients for each menu item
  }
  return menuItems;
}

// gets ingredients for a specific menu item
async function getIngredientsForMenuItem(menuId: number): Promise<InventoryItem[]> {
  return query<InventoryItem>(
    `SELECT i.* 
     FROM inventory i
     JOIN recipes r ON i.id = r.ingredient_id
     WHERE r.menu_id = $1`,
    [menuId]
  );
}

// adds a new menu item and associates ingredients

export async function addMenuItem(
  item_type: string,
  name: string,
  price: number,
  premium: boolean,
  ingredients: Array<{ id?: number; name: string; amount: number; unit: string; reorder: boolean }>
): Promise<MenuItem> {
  const [menuItem] = await query<MenuItem>(
    `INSERT INTO menu (item_type, name, price, premium) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [item_type, name, price, premium]
  );

  for (const ingredient of ingredients) {
    let inventoryItem;

    if (ingredient.id) {
      inventoryItem = await getInventoryById(ingredient.id);
    } else {
      inventoryItem = await getInventoryByName(ingredient.name);
    }

    // add the ingredient to inventory if it doesn't exist
    if (!inventoryItem) {
      inventoryItem = await addInventory(
        ingredient.name,
        ingredient.amount,
        ingredient.unit,
        ingredient.reorder
      );
    }

    await query(
      `INSERT INTO recipes (menu_id, ingredient_id) 
       VALUES ($1, $2)`,
      [menuItem.id, inventoryItem.id]
    );
  }

  return menuItem;
}

// gets an inventory item by name
async function getInventoryByName(name: string): Promise<InventoryItem | null> {
  const [item] = await query<InventoryItem>('SELECT * FROM inventory WHERE name = $1', [name]);
  return item || null;
}

// gets an inventory item by ID
export async function getInventoryById(id: number): Promise<InventoryItem | null> {
  const [item] = await query<InventoryItem>('SELECT * FROM inventory WHERE id = $1', [id]);
  return item || null;
}

// adds a new ingredient to inventory
async function addInventory(
  name: string,
  amount: number,
  unit: string,
  reorder: boolean
): Promise<InventoryItem> {
  const [item] = await query<InventoryItem>(
    `INSERT INTO inventory (name, amount, unit, reorder) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, amount, unit, reorder]
  );
  return item;
}

// links a menu item with an ingredient in the recipes table
async function addRecipe(menuId: number, ingredientId: number): Promise<Recipe> {
  const [recipe] = await query<Recipe>(
    `INSERT INTO recipes (menu_id, ingredient_id) 
     VALUES ($1, $2) RETURNING *`,
    [menuId, ingredientId]
  );
  return recipe;
}

// updates a menu item and its ingredients
export async function updateMenuItem(
  id: number,
  updates: Partial<Omit<MenuItem, 'id'>>,
  ingredients?: Array<{ id?: number; name: string; amount: number; unit: string; reorder: boolean }>
): Promise<MenuItem | null> {
  if (Object.keys(updates).length > 0) {
    const fields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const values = [...Object.values(updates), id];
    await query<MenuItem>(`UPDATE menu SET ${fields} WHERE id = $${values.length} RETURNING *`, values);
  }

  if (ingredients) {
    // Clear old recipes first
    await query('DELETE FROM recipes WHERE menu_id = $1', [id]);

    // Add new recipes
    for (const ingredient of ingredients) {
      let inventoryItem = ingredient.id
        ? await getInventoryById(ingredient.id)
        : await getInventoryByName(ingredient.name);

      if (!inventoryItem) {
        inventoryItem = await addInventory(
          ingredient.name,
          ingredient.amount,
          ingredient.unit,
          ingredient.reorder
        );
      }

      // Modified: Remove the id from the INSERT statement
      await query(
        `INSERT INTO recipes (menu_id, ingredient_id) 
         VALUES ($1, $2)`,
        [id, inventoryItem.id]
      );
    }
  }

  return getMenuItemById(id);
}

// delets a menu item and its associated recipes
export async function deleteMenuItem(id: number): Promise<void> {
  await query('DELETE FROM recipes WHERE menu_id = $1', [id]);
  await query('DELETE FROM menu WHERE id = $1', [id]);
}

// gets a single menu item by ID, including its ingredients
export async function getMenuItemById(id: number): Promise<MenuItem | null> {
  const [menuItem] = await query<MenuItem>('SELECT * FROM menu WHERE id = $1', [id]);
  if (menuItem) {
    menuItem.ingredients = await getIngredientsForMenuItem(menuItem.id); // Fetch ingredients
  }
  return menuItem || null;
}