"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Edit, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Employee {
  id: number;
  name: string;
  job: string;
  hours: number;
  salary: number | string;
  password: string;
}

/**
 * Skeleton component for displaying a loading state for an employee.
 * @returns {JSX.Element} The Employee Skeleton UI.
 */
const EmployeeSkeleton = () => (
  <div className="flex items-center justify-between p-3">
    <div className="space-y-2 flex-1">
      <Skeleton className="h-5 w-[160px]" />
      <Skeleton className="h-4 w-[260px]" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

/**
 * ManageEmployees component handles the employee management, including adding,
 * updating, and deleting employees. It also handles the display of employee
 * data and loading states.
 * @returns {JSX.Element} The Manage Employees UI.
 */
const ManageEmployees: React.FC = () => {
  const router = useRouter();

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

  /**
   * Displays a success message for a short duration.
   * @param {string} message - The success message to display.
   */
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000); // Hide after 3 seconds
  };

  /**
   * Fetches the list of employees from the server and updates the state.
   */
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

  /**
   * Handles adding a new employee.
   * Validates the input and sends a POST request to the server.
   */
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

  /**
   * Handles updating an existing employee.
   * Validates the input and sends a PUT request to the server.
   */
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

  /**
   * Handles deleting an employee.
   * Prompts the user for confirmation and sends a DELETE request to the server.
   * @param {number} id - The unique identifier of the employee to delete.
   */
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

  /**
   * Handles the click on the edit button to populate the form with the selected employee's details.
   * @param {Employee} employee - The employee whose details to edit.
   */
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
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="outline"
          onClick={() => router.push('/manager')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold">Manage Employees</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Employee List - Takes up 2/3 of the space */}
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-8rem)] flex flex-col">
            <CardHeader>
              <CardTitle>Employee List</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
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

              {isLoading ? (
                <div className="divide-y divide-border rounded-md border">
                  {[...Array(5)].map((_, i) => (
                    <EmployeeSkeleton key={i} />
                  ))}
                </div>
              ) : employees.length === 0 ? (
                <p className="text-center text-muted-foreground">No employees found.</p>
              ) : (
                <div className="divide-y divide-border rounded-md border">
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-3 hover:bg-secondary/10">
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {employee.job} • {employee.hours} hours • ${Number(employee.salary).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(employee)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Form - Takes up 1/3 of the space */}
        <div className="md:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle>{selectedEmployee ? 'Update Employee' : 'Add New Employee'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (selectedEmployee) {
                  handleUpdateEmployee();
                } else {
                  handleAddEmployee();
                }
              }} className="space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  disabled={isLoading}
                />
                
                <input
                  type="text"
                  placeholder="Job"
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  disabled={isLoading}
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Hours"
                    value={hours}
                    onChange={(e) => setHours(e.target.value ? Number(e.target.value) : '')}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    disabled={isLoading}
                  />
                  <input
                    type="number"
                    placeholder="Salary"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value === '' ? '' : Number(e.target.value))}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    disabled={isLoading}
                  />
                </div>

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  disabled={isLoading}
                />

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary"
                  >
                    {isLoading ? 'Processing...' : selectedEmployee ? 'Update' : 'Add'}
                  </Button>
                  {selectedEmployee && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManageEmployees;