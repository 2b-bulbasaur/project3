'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/card';
import Button from '../app/buttons';

interface Employee {
  id: number;
  name: string;
  position: string;
  salary: number;
}

const ManageEmployees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState<number | ''>('');

  // Fetch employees from the API
  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Handle adding a new employee
  const handleAddEmployee = async () => {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, position, salary }),
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
    setPosition(employee.position);
    setSalary(employee.salary);
  };

  // Handle updating the selected employee
  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await fetch(`/api/employees`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedEmployee.id,
          name,
          position,
          salary,
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

  // Reset the form and clear the selected employee
  const resetForm = () => {
    setSelectedEmployee(null);
    setName('');
    setPosition('');
    setSalary('');
  };

  // Load employees on component mount
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
              placeholder="Position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Salary"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value) || '')}
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
                  {employee.name} - {employee.position} (${employee.salary})
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
