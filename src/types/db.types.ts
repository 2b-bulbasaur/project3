export type size = 'bowl' | 'plate' | 'bigger plate';
export type item = 'entree' | 'side' | 'drink' | 'appetizer' | 'other';

export interface Employee {
    id: number;
    name: string;
    job: string;
    hours: number;
    salary: number;
    password: string;
}

export interface Inventory {
    id: number;
    name: string;
    amount: number;
    unit: string;
    reorder: boolean;
}

export interface MenuItem {
    id: number;
    item_type: item;
    name: string;
    price: number;
    premium: boolean;
}

export interface Recipe {
    id: number;
    menu_id: number;
    ingredient_id: number;
}

export interface Transaction {
    id: number;
    date: Date;
    customer_name: string;
    cashier_name: string;
    sale_price: number;
    items: number;
    meals: number;
    appetizers: number;
    drinks: number;
}