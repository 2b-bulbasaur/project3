import { NextResponse } from 'next/server';
import { getTransactions } from '@/lib/transactions';
import * as fs from 'fs/promises';
import * as path from 'path';

type HourlyCount = {
  hour: string;
  count: number;
};

const REPORT_FILE = path.join(process.cwd(), 'z-report-status.json');

async function getLastGeneratedDate(): Promise<string | null> {
  try {
    const data = await fs.readFile(REPORT_FILE, 'utf-8');
    const status = JSON.parse(data);
    return status.lastGenerated;
  } catch (error) {
    return null;
  }
}

async function setLastGeneratedDate(date: string): Promise<void> {
  await fs.writeFile(
    REPORT_FILE,
    JSON.stringify({ lastGenerated: date }),
    'utf-8'
  );
}

export async function POST(request: Request) {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const today = now.toISOString().split('T')[0];

    // Check if it's before 9 PM
    if (currentHour < 21) {
      return NextResponse.json(
        { error: 'Z Report can only be generated after 9 PM' },
        { status: 403 }
      );
    }

    // Check if report was already generated today
    const lastGeneratedDate = await getLastGeneratedDate();
    if (lastGeneratedDate === today) {
      return NextResponse.json(
        { error: 'Z Report has already been generated today' },
        { status: 403 }
      );
    }

    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0, 0);

    const transactions = await getTransactions();
    const hourlyData: HourlyCount[] = [];

    // Initialize hourly data from 9 AM to 9 PM
    for (let hour = 9; hour <= 21; hour++) {
      hourlyData.push({
        hour: `${hour}:00`,
        count: 0
      });
    }

    // Count transactions
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const transactionHour = transactionDate.getHours();
      
      if (transactionDate >= startDate && 
          transactionDate < endDate && 
          transactionHour >= 9 && 
          transactionHour <= 21) {
        const index = transactionHour - 9; // Adjust index to match array
        hourlyData[index].count++;
      }
    });

    // Store the generation date
    await setLastGeneratedDate(today);

    // Return the data in the format expected by the component
    return NextResponse.json(hourlyData);

  } catch (error) {
    console.error('Error in generateZReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate Z Report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}