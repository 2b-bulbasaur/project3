"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Edit, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InventoryItem {
  id: number;
  name: string;
  amount: number;
  unit: string;
  reorder: boolean;
}

const InventoryItemSkeleton = () => (
  <div className="flex items-center justify-between p-3">
    <div className="space-y-2 flex-1">
      <Skeleton className="h-5 w-[180px]" />
      <Skeleton className="h-4 w-[240px]" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

const ManageInventory: React.FC = () => {
  const router = useRouter();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [unit, setUnit] = useState('');
  const [reorder, setReorder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      const data = await response.json();
      setInventory(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to load inventory.');
    }
  };

  const handleAddItem = async () => {
    if (!name || amount === '' || !unit) {
      setError('All fields are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          amount: Number(amount),
          unit,
          reorder
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add item');
      }

      await fetchInventory();
      resetForm();
    } catch (error) {
      console.error('Error adding item:', error);
      setError(error instanceof Error ? error.message : 'Failed to add item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedItem || !name || amount === '' || !unit) {
      setError('All fields are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/inventory`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedItem.id,
          name,
          amount: Number(amount),
          unit,
          reorder
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update item');
      }

      await fetchInventory();
      resetForm();
    } catch (error) {
      console.error('Error updating item:', error);
      setError(error instanceof Error ? error.message : 'Failed to update item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/inventory?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete item');
      }

      await fetchInventory();
    } catch (error) {
      console.error('Error deleting item:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setName(item.name);
    setAmount(item.amount);
    setUnit(item.unit);
    setReorder(item.reorder);
    setError(null);
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
    fetchInventory();
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
        <h2 className="text-2xl font-bold">Manage Inventory</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inventory List - Takes up 2/3 of the space */}
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-8rem)] flex flex-col">
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
              {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              {isLoading ? (
                <div className="divide-y divide-border rounded-md border">
                  {[...Array(5)].map((_, i) => (
                    <InventoryItemSkeleton key={i} />
                  ))}
                </div>
              ) : inventory.length === 0 ? (
                <p className="text-center text-muted-foreground">No inventory items found.</p>
              ) : (
                <div className="divide-y divide-border rounded-md border">
                  {inventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 hover:bg-secondary/10">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.amount} {item.unit} • {item.reorder ? 'Reorder needed' : 'Stock OK'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(item)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
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
              <CardTitle>{selectedItem ? 'Update Item' : 'Add New Item'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (selectedItem) {
                  handleUpdateItem();
                }
                else {
                  handleAddItem();
                }
              }} className="space-y-3">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  disabled={isLoading}
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    disabled={isLoading}
                  />
                </div>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={reorder}
                    onChange={(e) => setReorder(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Reorder Needed</span>
                </label>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary"
                  >
                    {isLoading ? 'Processing...' : selectedItem ? 'Update' : 'Add'}
                  </Button>
                  {selectedItem && (
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

export default ManageInventory;