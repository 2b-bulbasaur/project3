import { query } from './db';
import { InventoryItem, MenuItem, Recipe } from '../types';

// type for the joined query result
interface MenuItemJoinResult extends MenuItem {
  ingredient_id: number | null;
  ingredient_name: string | null;
  ingredient_amount: number | null;
  ingredient_unit: string | null;
  ingredient_reorder: boolean | null;
}

export async function getAllMenuItems(): Promise<MenuItem[]> {
  const result = await query<MenuItemJoinResult>(
    `SELECT 
      m.*,
      i.id as ingredient_id,
      i.name as ingredient_name,
      i.amount as ingredient_amount,
      i.unit as ingredient_unit,
      i.reorder as ingredient_reorder
     FROM menu m
     LEFT JOIN recipes r ON m.id = r.menu_id
     LEFT JOIN inventory i ON r.ingredient_id = i.id
     ORDER BY m.id`
  );


  const menuItemsMap = new Map<number, MenuItem>();

  for (const row of result) {
    if (!menuItemsMap.has(row.id)) {
      menuItemsMap.set(row.id, {
        id: row.id,
        item_type: row.item_type,
        name: row.name,
        price: row.price,
        premium: row.premium,
        ingredients: []
      });
    }

    if (row.ingredient_id) {
      const menuItem = menuItemsMap.get(row.id)!;
      if (!menuItem.ingredients!.some(ing => ing.id === row.ingredient_id)) {
        menuItem.ingredients!.push({
          id: row.ingredient_id,
          name: row.ingredient_name!,
          amount: row.ingredient_amount!,
          unit: row.ingredient_unit!,
          reorder: row.ingredient_reorder!
        });
      }
    }
  }

  return Array.from(menuItemsMap.values());
}

export async function getMenuNameById(id: number) : Promise<MenuItem[]> {
  return query('SELECT * FROM menu WHERE id = $1', [id]);
}

export async function getMenuItemById(id: number): Promise<MenuItem | null> {
  const result = await query<MenuItemJoinResult>(
    `SELECT 
      m.*,
      i.id as ingredient_id,
      i.name as ingredient_name,
      i.amount as ingredient_amount,
      i.unit as ingredient_unit,
      i.reorder as ingredient_reorder
     FROM menu m
     LEFT JOIN recipes r ON m.id = r.menu_id
     LEFT JOIN inventory i ON r.ingredient_id = i.id
     WHERE m.id = $1`,
    [id]
  );

  if (result.length === 0) {
    return null;
  }

  const menuItem: MenuItem = {
    id: result[0].id,
    item_type: result[0].item_type,
    name: result[0].name,
    price: result[0].price,
    premium: result[0].premium,
    ingredients: []
  };

  for (const row of result) {
    if (row.ingredient_id && !menuItem.ingredients!.some(ing => ing.id === row.ingredient_id)) {
      menuItem.ingredients!.push({
        id: row.ingredient_id,
        name: row.ingredient_name!,
        amount: row.ingredient_amount!,
        unit: row.ingredient_unit!,
        reorder: row.ingredient_reorder!
      });
    }
  }

  return menuItem;
}

// gets ingredients for a specific menu item
export async function getIngredientsForMenuItem(menuId: number): Promise<InventoryItem[]> {
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
export async function addRecipe(menuId: number, ingredientId: number): Promise<Recipe> {
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