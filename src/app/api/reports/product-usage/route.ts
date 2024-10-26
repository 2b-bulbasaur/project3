import { NextResponse } from 'next/server'
import { getTransactions } from '@/lib/transactions';
import { getIngredientsForMenuItem } from '@/lib/menu';

type HourlyCount = {
    [key: string]: number;
};

// export async function POST(Request) {
//     try {
        
//     }
// };