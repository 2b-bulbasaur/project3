'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card'; 
import Button from '../buttons'; 

const ManagerDashboard: React.FC = () => {
  const navigateTo = (path: string) => {
    window.location.href = path; 
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl mb-4">Manager Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Manage Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button label="Manage Menu" onClick={() => navigateTo('/manage-menu')} />
            <Button label="Manage Inventory" onClick={() => navigateTo('/manage-inventory')} />
            <Button label="Manage Employees" onClick={() => navigateTo('/manage-employees')} />
            <Button label="Generate Reports" onClick={() => console.log('Generating Reports')} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerDashboard;
