'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ScrollArea,
  ScrollBar 
} from "@/components/ui/scroll-area";
import { 
  MenuIcon, 
  Package, 
  Users, 
  FileText, 
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';
import { Transaction } from '@/types/db.types';

interface TransactionWithSummary extends Transaction {
  order_summary: string;
}

const ManagerDashboard = () => {
  const [transactions, setTransactions] = useState<TransactionWithSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions?summary=true');
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data: TransactionWithSummary[] = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMessage);
      }
    };
    fetchTransactions();
  }, []);

  const switchToCashierView = () => {
    router.push('/cashier');
  }

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Top Navigation Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <CardTitle>Manager Dashboard</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-2">
                    Quick Actions <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <MenuIcon className="mr-2 h-4 w-4" /> Manage Menu
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Package className="mr-2 h-4 w-4" /> Manage Inventory
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push('/manager/manage-employees')}>
                    <Users className="mr-2 h-4 w-4" /> Manage Employees
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" /> Generate Reports
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={switchToCashierView}>
                <Settings className="mr-2 h-4 w-4" />
                Switch to Cashier View
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Order Details</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      #{transaction.id}
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.date).toLocaleString()}
                    </TableCell>
                    <TableCell>{transaction.customer_name}</TableCell>
                    <TableCell>{transaction.cashier_name}</TableCell>
                    <TableCell>{transaction.order_summary}</TableCell>
                    <TableCell className="text-right">
                      ${Number(transaction.sale_price).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerDashboard;