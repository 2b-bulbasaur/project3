import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Employee {
  id: number;
  name: string;
  job: string;
  hours: number;
  salary: number;
  password: string;
}

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json();

    // query to check employee credentials by name // can change to id
    const [employee] = await query<Employee>(
      'SELECT id, name, job, hours FROM employees WHERE name = $1 AND password = $2',
      [name, password]
    );

    if (!employee) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: employee.id,
      name: employee.name,
      job: employee.job,
      hours: employee.hours
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}