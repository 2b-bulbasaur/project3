export type SizeEnum = 'bowl' | 'plate' | 'bigger plate';
export type ItemTypeEnum = 'entree' | 'side' | 'appetizer' | 'drink' | 'other';

export interface Employee {
    id: number;
    name: string;
    hours: number | null;
    job: string | null;
    salary: number | null;
    password: string | null;
}

export interface InventoryItem {
    id: number;
    name: string;
    amount: number;
    unit: string;
    reorder: boolean;
}

export interface SelectedIngredient extends InventoryItem {
    quantity?: number; 
}


export interface MenuItem {
    id: number;
    item_type: ItemTypeEnum;
    name: string;
    price: number;
    premium: boolean;
    ingredients?: SelectedIngredient[];

}

export interface Recipe {
    id: number;
    menu_id: number;
    ingredient_id: number;
}

export interface Transaction {
    id: number;
    date: string;
    customer_name: string;
    cashier_name: string;
    sale_price: number;
    items: number;
    meals: number;
    appetizers: number;
    drinks: number;
}

export interface MealOrder {
    id: number;
    o_id: number;
    size: SizeEnum;
    side1: number | null;
    side2: number | null;
    entree1: number | null;
    entree2: number | null;
    entree3: number | null;
}

export interface AppetizerOrder {
    id: number;
    o_id: number;
    item: number;
}

export interface DrinkOrder {
    id: number;
    o_id: number;
    item: number;
}