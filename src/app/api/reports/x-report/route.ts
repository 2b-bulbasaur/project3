import { NextResponse } from 'next/server';
import { getTransactions } from '@/lib/transactions';

type HourlyCount = {
  [key: string]: number;
};

export async function POST(request: Request) {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0); // 9 AM
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0); // Next hour
    let hour = now.getHours();

    const transactions = await getTransactions();
    const hourlyCount: HourlyCount = {};

    // Initialize the hourly count from 9 AM to current hour
    if(hour > 21) hour = 21;
    for (let hours = 9; hours <= hour; hours++) {
      const hourKey = `${hours}:00`;
      hourlyCount[hourKey] = 0;
    }

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const transactionHour = transactionDate.getHours();

      if (transactionDate >= startDate && transactionDate < endDate && transactionHour >= 9) {
        hourlyCount[`${transactionHour}:00`] = (hourlyCount[`${transactionHour}:00`] || 0) + 1;
      }
    });

    const reportData = Object.keys(hourlyCount).map(hour => ({
      hour,
      count: hourlyCount[hour],
    }));

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error in generateXReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate X Report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}