"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000); // Hide after 3 seconds
  };

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!name || !job || hours === '' || salary === '') {
      setError('All fields are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, job, hours, salary, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add employee');
      }

      await fetchEmployees();
      resetForm();
      showSuccessMessage('Employee added successfully');
    } catch (error) {
      console.error('Error adding employee:', error);
      setError(error instanceof Error ? error.message : 'Failed to add employee');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee || !name || !job || hours === '' || salary === '') {
      setError('All fields are required');
      return;
    }

    setIsLoading(true);
    setError(null);

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update employee');
      }

      await fetchEmployees();
      resetForm();
      showSuccessMessage('Employee updated successfully');
    } catch (error) {
      console.error('Error updating employee:', error);
      setError(error instanceof Error ? error.message : 'Failed to update employee');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/employees?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete employee');
      }

      await fetchEmployees();
      showSuccessMessage('Employee deleted successfully');
    } catch (error) {
      console.error('Error deleting employee:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete employee');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setName(employee.name);
    setJob(employee.job);
    setHours(employee.hours);
    setSalary(Number(employee.salary) || '');
    setPassword(employee.password);
    setError(null);
  };

  const resetForm = () => {
    setSelectedEmployee(null);
    setName('');
    setJob('');
    setHours('');
    setSalary('');
    setPassword('');
    setError(null);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Manage Employees</h2>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 text-green-700 px-4 py-3 rounded-md mb-4">
          {successMessage}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{selectedEmployee ? 'Update Employee' : 'Add New Employee'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            selectedEmployee ? handleUpdateEmployee() : handleAddEmployee();
          }} className="space-y-4">
            <div className="grid gap-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 border rounded-md"
                disabled={isLoading}
              />
              <input
                type="text"
                placeholder="Job"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                className="p-2 border rounded-md"
                disabled={isLoading}
              />
              <input
                type="number"
                placeholder="Hours"
                value={hours}
                onChange={(e) => setHours(e.target.value ? Number(e.target.value) : '')}
                className="p-2 border rounded-md"
                disabled={isLoading}
              />
              <input
                type="number"
                placeholder="Salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value === '' ? '' : Number(e.target.value))}
                className="p-2 border rounded-md"
                disabled={isLoading}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 border rounded-md"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                variant={selectedEmployee ? "secondary" : "default"}
              >
                {isLoading ? 'Processing...' : (selectedEmployee ? <><Save className="h-4 w-4" /> Update Employee</> : <><Plus className="h-4 w-4" /> Add Employee</>)}
              </Button>
              {selectedEmployee && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={resetForm}
                >
                  <X className="h-4 w-4" /> Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No employees found.</p>
          ) : (
            <ul className="divide-y">
              {employees.map((employee) => (
                <li key={employee.id} className="py-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {employee.job} • {employee.hours} hours • ${Number(employee.salary).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(employee)}
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteEmployee(employee.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageEmployees;