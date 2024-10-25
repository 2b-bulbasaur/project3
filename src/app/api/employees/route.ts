import { NextResponse } from 'next/server';
import {
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from '@/lib/employees';

// GET: Retrieve all employees
export async function GET() {
  try {
    const employees = await getAllEmployees();
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

// POST: Add new employee
export async function POST(request: Request) {
  try {
    const { name, job, hours, salary, password } = await request.json();

    if (!name || !job || hours < 0 || salary < 0 || !password) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const employee = await addEmployee(name, job, hours, salary, password);
    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error adding employee:', error);
    return NextResponse.json({ error: 'Failed to add employee' }, { status: 500 });
  }
}

// PUT: Update employee
export async function PUT(request: Request) {
  try {
    const { id, name, job, hours, salary, password } = await request.json();

    if (!id || !name || !job || hours < 0 || salary < 0 || !password) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const employee = await updateEmployee(id, name, job, hours, salary, password);
    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}


// DELETE: delets an employee
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const idString = searchParams.get('id'); 

  if (!idString) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
  }

  const id = Number(idString); 

  if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid Employee ID' }, { status: 400 });
  }

  try {
      await deleteEmployee(id); 
      return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
      console.error('Error deleting employee:', error);
      return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}


