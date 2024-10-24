import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Adjust this based on your structure

// get: fetch all employees
export async function GET() {
  try {
    const employees = await query('SELECT * FROM employees');
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

// post: add new employee
export async function POST(request: Request) {
  const { name, position, salary } = await request.json();
  try {
    const result = await query(
      'INSERT INTO employees (name, position, salary) VALUES ($1, $2, $3) RETURNING *',
      [name, position, salary]
    );
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error adding employee:', error);
    return NextResponse.json({ error: 'Failed to add employee' }, { status: 500 });
  }
}

// put: update employee by ID
export async function PUT(request: Request) {
  const { id, name, position, salary } = await request.json();
  try {
    const result = await query(
      'UPDATE employees SET name = $1, position = $2, salary = $3 WHERE id = $4 RETURNING *',
      [name, position, salary, id]
    );
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

// delete: delete employee by ID
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    await query('DELETE FROM employees WHERE id = $1', [id]);
    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}
