import type { MenuItem, SizeEnum } from './db.types';

export interface TransactionRequest {
  customer_name: string;
  cashier_name: string;
  sale_price: number;
  items: number;
  meals: number;
  appetizers: number;
  drinks: number;
  date: string;
  orderItems: OrderItem[];
}

export interface MealInProgress {
  id: string;
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