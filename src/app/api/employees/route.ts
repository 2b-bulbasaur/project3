import { NextResponse } from 'next/server';
import {
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from '@/lib/employees'; 

// GET: gets all employees
export async function GET() {
  try {
    const employees = await getAllEmployees();
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

// POST: adds new employee
export async function POST(request: Request) {
  try {
    const { name, position, salary } = await request.json();

    
    if (!name || !position || salary === undefined || salary < 0) {
      return NextResponse.json(
        { error: 'Invalid input. Name, position, and salary are required.' },
        { status: 400 }
      );
    }

    const employee = await addEmployee(name, position, salary);
    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error adding employee:', error);
    return NextResponse.json(
      { error: 'Failed to add employee' },
      { status: 500 }
    );
  }
}

// PUT: upodates employee by ID
export async function PUT(request: Request) {
  try {
    const { id, name, position, salary } = await request.json();

    if (!id || !name || !position || salary === undefined || salary < 0) {
      return NextResponse.json(
        { error: 'Invalid input. All fields are required.' },
        { status: 400 }
      );
    }

    const employee = await updateEmployee(id, name, position, salary);
    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

// DELETE: deletes employee by ID
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      { error: 'Invalid or missing employee ID.' },
      { status: 400 }
    );
  }

  try {
    await deleteEmployee(parseInt(id));
    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
