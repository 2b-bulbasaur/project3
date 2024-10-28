import { query } from './db';
import { MealOrder } from '../types';
import { AppetizerOrder } from '../types';
import { DrinkOrder } from '../types';

export async function getMealOrderById(orderId: number) {
    const result = await query<MealOrder>(
        'SELECT * FROM mealorders WHERE o_id = orderId'
    );

    return result;
}

export async function getAppetizerOrderById(orderId: number) {
    const result = await query<AppetizerOrder>(
        'SELECT * FROM appetizerorders WHERE o_id = orderId'
    );

    return result;
}

export async function getDrinkOrderById(orderId: number) {
    const result = await query<DrinkOrder>(
        'SELECT * FROM drinkorders WHERE o_id = orderId'
    );

    return result;
}