import type { Transaction, MenuItem, SizeEnum } from './db.types';

export interface TransactionWithItems extends Transaction {
  meal_items: string[] | null;
  appetizer_items: string[] | null;
  drink_items: string[] | null;
}

export interface TransactionWithSummary extends Transaction {
  order_summary?: string;
}

export interface MealInProgress {
  id?: string;
  size: SizeEnum | null;
  side1: MenuItem | null;
  side2: MenuItem | null;
  entree1: MenuItem | null;
  entree2: MenuItem | null;
  entree3: MenuItem | null;
}

export interface SimpleOrderItem extends MenuItem {
  quantity: number;
}

export interface OrderItem {
  type: 'meal' | 'appetizer' | 'drink';
  meal?: MealInProgress;
  item?: SimpleOrderItem;
}

export interface ApiError {
  error: string;
  details?: string;
}