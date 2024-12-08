import { NextResponse } from 'next/server';
import {
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from '@/lib/employees';

/**
 * GET route handler to retrieve all employees
 * @route GET /api/employees
 * @returns {Promise<NextResponse>} JSON response containing array of employees or error
 */
export async function GET() {
  try {
    const employees = await getAllEmployees();
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

/**
 * POST route handler to create a new employee
 * @route POST /api/employees
 * @param {Request} request - Contains employee data in JSON body
 * @param {string} request.name - Employee name
 * @param {string} request.job - Job title
 * @param {number} request.hours - Working hours
 * @param {number} request.salary - Employee salary
 * @param {string} request.password - Employee password
 * @returns {Promise<NextResponse>} JSON response with created employee or error
 */
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

/**
 * PUT route handler to update an existing employee
 * @route PUT /api/employees
 * @param {Request} request - Contains employee data in JSON body
 * @param {number} request.id - Employee ID
 * @param {string} request.name - Updated employee name
 * @param {string} request.job - Updated job title
 * @param {number} request.hours - Updated working hours
 * @param {number} request.salary - Updated employee salary
 * @param {string} request.password - Updated employee password
 * @returns {Promise<NextResponse>} JSON response with updated employee or error
 */
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

/**
 * DELETE route handler to remove an employee
 * @route DELETE /api/employees?id={id}
 * @param {Request} request - Contains employee ID in query params
 * @param {string} request.searchParams.id - Employee ID to delete
 * @returns {Promise<NextResponse>} JSON response with success message or error
 */
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


