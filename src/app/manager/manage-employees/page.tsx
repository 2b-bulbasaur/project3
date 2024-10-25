'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '../../buttons';

interface Employee {
  id: number;
  name: string;
  job: string;
  hours: number;
  salary: number | string;
  password: string;
}

const ManageEmployees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [name, setName] = useState('');
  const [job, setJob] = useState('');
  const [hours, setHours] = useState<number | ''>('');
  const [salary, setSalary] = useState<number | ''>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch employees from the API
  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees.');
    }
  };

  // Handle adding a new employee
  const handleAddEmployee = async () => {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, job, hours, salary, password }),
      });

      if (response.ok) {
        fetchEmployees();
        resetForm();
      } else {
        console.error('Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  // Handle selecting an employee for editing
  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setName(employee.name);
    setJob(employee.job);
    setHours(employee.hours);
    setSalary(Number(employee.salary) || '');
    setPassword(employee.password);
  };

  // Handle updating an employee
  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await fetch(`/api/employees`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedEmployee.id,
          name,
          job,
          hours,
          salary,
          password,
        }),
      });

      if (response.ok) {
        fetchEmployees();
        resetForm();
      } else {
        console.error('Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  // Handle deleting an employee
  const handleDeleteEmployee = async (id: number) => {
    try {
      const response = await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });

      if (response.ok) {
        fetchEmployees();
      } else {
        console.error('Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  // Reset the form after add/update
  const resetForm = () => {
    setSelectedEmployee(null);
    setName('');
    setJob('');
    setHours('');
    setSalary('');
    setPassword('');
  };

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Manage Employees</h2>

      <Card>
        <CardHeader>
          <CardTitle>{selectedEmployee ? 'Edit Employee' : 'Add Employee'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Job"
              value={job}
              onChange={(e) => setJob(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Hours"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value) || '')}
              className="p-2 border rounded"
            />
            <input
            type="number"
            placeholder="Salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value === '' ? '' : Number(e.target.value))}
            className="p-2 border rounded"
          />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 border rounded"
            />
            <div className="flex gap-4">
              {selectedEmployee ? (
                <>
                  <Button label="Update Employee" onClick={handleUpdateEmployee} />
                  <Button label="Cancel" onClick={resetForm} variant="secondary" />
                </>
              ) : (
                <Button label="Add Employee" onClick={handleAddEmployee} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {employees.map((employee) => (
              <li key={employee.id} className="flex justify-between items-center mb-2">
                <span>
                  {employee.name} - {employee.job} ({employee.hours} hours, ${Number(employee.salary).toFixed(2)})
                </span>
                <div className="flex gap-2">
                  <Button label="Edit" onClick={() => handleEditClick(employee)} />
                  <Button
                    label="Delete"
                    onClick={() => handleDeleteEmployee(employee.id)}
                    variant="danger"
                  />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageEmployees;
