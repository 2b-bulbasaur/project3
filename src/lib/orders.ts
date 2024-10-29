import { query } from './db';
import { MealOrder } from '../types';
import { AppetizerOrder } from '../types';
import { DrinkOrder } from '../types';

export async function getMealOrderById(orderId: number) {
    const result = await query<MealOrder>(
        'SELECT * FROM mealorders WHERE o_id = $1;',
        [orderId]
    );

    return result;
}

export async function getItemsInMealOrder(orderId: number) {
    const result = await query<MealOrder>(
        'SELECT * FROM mealorders WHERE o_id = $1;',
        [orderId]
    );

    const items: Array<number> = [];

    result.forEach(async order => {
        if (order.entree1 != null) items.push(order.entree1);
        console.log(order.entree1);
        if (order.entree2 != null) items.push(order.entree2);
        if (order.entree3 != null) items.push(order.entree3);
        if (order.side1 != null) items.push(order.side1);
        if (order.side2 != null) items.push(order.side2);
    });

    return items;
}

export async function getAppetizerOrderById(orderId: number) {
    const result = await query<AppetizerOrder>(
        'SELECT * FROM appetizerorders WHERE o_id = $1;',
        [orderId]
    );

    return result;
}

export async function getItemsInAppOrder(orderId: number) {
    const result = await query<AppetizerOrder>(
        'SELECT * FROM appetizerorders WHERE o_id = $1;',
        [orderId]
    );

    const items: Array<number> = [];

    result.forEach(async order => {
        if (order.item != null) items.push(order.item);
    });

    return items;
}
export async function getDrinkOrderById(orderId: number) {
    const result = await query<DrinkOrder>(
        'SELECT * FROM drinkorders WHERE o_id = $1;',
        [orderId]
    );

    return result;
}