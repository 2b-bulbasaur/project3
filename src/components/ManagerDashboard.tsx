'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/card";

interface Transaction {
  id: number;
  date: string;
  customerName: string;
  cashierName: string;
  orderDescription: string;
  salePrice: number;
}

interface ManagerDashboardProps {
  cashierName: string;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ cashierName }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions');
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleSwitchToCashier = () => {
    window.location.href = `/cashier?name=${encodeURIComponent(cashierName)}`;
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">Manager View</h1>
          <p className="mt-1 text-sm text-gray-500">Logged in as: {cashierName}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => window.location.href = '/manage-menu'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Manage Menu
          </button>
          <button
            onClick={() => window.location.href = '/manage-inventory'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Manage Inventory
          </button>
          <button
            onClick={() => window.location.href = '/manage-employees'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Manage Employees
          </button>
          <button
            onClick={() => window.location.href = '/reports'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate Reports
          </button>
          <button
            onClick={handleSwitchToCashier}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Switch to Cashier View
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Transaction ID</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Customer Name</th>
                      <th className="px-4 py-2 text-left">Cashier Name</th>
                      <th className="px-4 py-2 text-left">Order</th>
                      <th className="px-4 py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{transaction.id}</td>
                        <td className="px-4 py-2">
                          {new Date(transaction.date).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">{transaction.customerName}</td>
                        <td className="px-4 py-2">{transaction.cashierName}</td>
                        <td className="px-4 py-2 whitespace-pre-line">
                          {transaction.orderDescription}
                        </td>
                        <td className="px-4 py-2 text-right">
                          ${transaction.salePrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ManagerDashboard;