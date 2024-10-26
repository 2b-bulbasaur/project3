"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Plus, Save, X, ArrowLeft } from 'lucide-react';

import { useRouter } from 'next/navigation';
interface InventoryItem {
  id: number;
  name: string;
  amount: number;
  unit: string;
  reorder: boolean;
}

const GenerateReport: React.FC = () => {
  const router = useRouter();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [unit, setUnit] = useState('');
  const [reorder, setReorder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigateToManager = () => {
    router.push('/manager');
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions.');
    }
  };

  const resetForm = () => {
    setSelectedItem(null);
    setName('');
    setAmount('');
    setUnit('');
    setReorder(false);
    setError(null);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="container mx-auto py-10">
    <div className="flex items-center gap-4 mb-6">
      <Button
        variant="outline"
        onClick={() => router.push('/manager')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
      <h2 className="text-2xl font-bold">Generate Report</h2>
    </div>

    <div className="rounded-lg">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
          {error}
        </div>
        )}

        <Card className="mb-6">
            <CardContent>
                <form
                    onSubmit={(e) => {
                    e.preventDefault();
                    }}
                    style={{
                    display: 'flex',
                    justifyContent: 'center', 
                    alignItems: 'center',     
                    gap: '16px',              
                    padding: '20px',         
                    }}
                >
                    <Button
                    type="button"
                    //onClick={() => generateXReport()}
                    disabled={isLoading}
                    className="bg-primary"
                    >
                    X-Report
                    </Button>
                    <Button
                    type="button"
                    //onClick={() => generateYReport()}
                    disabled={isLoading}
                    className="bg-primary"
                    >
                    Y-Report
                    </Button>
                    <Button
                    type="button"
                    //onClick={() => generateProductUsageChart()}
                    disabled={isLoading}
                    className="bg-primary"
                    >
                    Product Usage Chart
                    </Button>
                    <Button
                    type="button"
                    //onClick={() => generateItemizedSalesReport()}
                    disabled={isLoading}
                    className="bg-primary"
                    >
                    Itemized Sales Report
                    </Button>
                </form>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Report</CardTitle>
          </CardHeader>
          

        </Card>
      </div>
    </div>
  );
};

export default GenerateReport;