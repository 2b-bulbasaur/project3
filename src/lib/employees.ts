import { query } from './db';
import { Employee } from '@/types';

// fetched all employees
export async function getAllEmployees(): Promise<Employee[]> {
  return query<Employee>('SELECT * FROM employees');
}

// adds a new employee
export async function addEmployee(
  name: string,
  job: string,
  hours: number,
  salary: number,
  password: string
): Promise<Employee> {
  const [employee] = await query<Employee>(
    `INSERT INTO employees (name, job, hours, salary, password) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [name, job, hours, salary, password]
  );
  return employee;
}

// updates employee by ID
export async function updateEmployee(
  id: number,
  name: string,
  job: string,
  hours: number,
  salary: number,
  password: string
): Promise<Employee> {
  const [employee] = await query<Employee>(
    `UPDATE employees 
     SET name = $1, job = $2, hours = $3, salary = $4, password = $5 
     WHERE id = $6 
     RETURNING *`,
    [name, job, hours, salary, password, id]
  );
  return employee;
}

// delets employee by ID
export async function deleteEmployee(id: number): Promise<void> {
  await query('DELETE FROM employees WHERE id = $1', [id]);
}
