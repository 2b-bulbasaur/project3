// /lib/employees.ts
import { query } from './db';

interface Employee {
  id: number;
  name: string;
  position: string;
  salary: number;
}

// fetches all employees
export async function getAllEmployees(): Promise<Employee[]> {
  return query<Employee>('SELECT * FROM employees');
}

// adds a new employee
export async function addEmployee(
  name: string, 
  position: string, 
  salary: number
): Promise<Employee> {
  const [employee] = await query<Employee>(
    'INSERT INTO employees (name, position, salary) VALUES ($1, $2, $3) RETURNING *',
    [name, position, salary]
  );
  return employee;
}

// updates employee by ID
export async function updateEmployee(
  id: number, 
  name: string, 
  position: string, 
  salary: number
): Promise<Employee> {
  const [employee] = await query<Employee>(
    'UPDATE employees SET name = $1, position = $2, salary = $3 WHERE id = $4 RETURNING *',
    [name, position, salary, id]
  );
  return employee;
}

// deletes employee by ID
export async function deleteEmployee(id: number): Promise<void> {
  await query('DELETE FROM employees WHERE id = $1', [id]);
}
