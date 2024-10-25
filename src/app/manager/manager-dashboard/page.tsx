"use client";

import React, { useEffect, useState } from 'react';
import '@/app/globals.css'; 
import { useRouter } from 'next/navigation';


import Button from '../../buttons';

interface Transaction {
  id: number;
  date: string;
  customer_name: string;
  cashier_name: string;
  sale_price: number;
  order_summary: string;
}

const ManagerDashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null); 
  const router = useRouter(); 

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions?summary=true'); // fetch with summary
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data: Transaction[] = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMessage); // stire the error message
      }
    };
    fetchTransactions();
  }, []);

  const handleLogout = () => {
    router.push('/'); 
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground p-4">
      {/* top Navigation Buttons */}
      <div className="flex justify-between items-center mb-4 space-x-2">
        <Button label="Manage Menu" onClick={() => {}} />
        <Button label="Manage Inventory" onClick={() => {}} />
        <Button label="Manage Employees" onClick={() => {}} />
        <Button label="Generate Reports" onClick={() => {}} />
        <Button label="Switch to Cashier View" onClick={() => {}} />
        <Button label="Logout" onClick={handleLogout} variant="danger" />

      </div>

      {/* error handling */}
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
          Error: {error}
        </div>
      )}

      {/* transaction table with formated order summary */}
      <div className="flex-1 overflow-auto">
        <table className="w-full table-auto border-collapse border border-border">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th className="border border-border p-2">ID</th>
              <th className="border border-border p-2">Date</th>
              <th className="border border-border p-2">Customer</th>
              <th className="border border-border p-2">Cashier</th>
              <th className="border border-border p-2">Order</th>
              <th className="border border-border p-2">Total Price</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="even:bg-muted odd:bg-accent">
                <td className="border border-border p-2">{transaction.id}</td>
                <td className="border border-border p-2">
                  {new Date(transaction.date).toLocaleString()}
                </td>
                <td className="border border-border p-2">{transaction.customer_name}</td>
                <td className="border border-border p-2">{transaction.cashier_name}</td>
                <td className="border border-border p-2">{transaction.order_summary}</td>
                <td className="border border-border p-2">
                  ${Number(transaction.sale_price || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerDashboard;