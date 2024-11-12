"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ItemTypeEnum, MenuItem, InventoryItem } from '@/types/db.types';
import { Trash2, Edit, Plus, X, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SelectedIngredient extends InventoryItem {
  quantity?: number;
}

interface MenuItemWithIngredients extends MenuItem {
  ingredients?: SelectedIngredient[];
}

const itemTypes: ItemTypeEnum[] = ['entree', 'side', 'appetizer', 'drink', 'other'];

const ManageMenu: React.FC = () => {
  const router = useRouter();

  const [menuItems, setMenuItems] = useState<MenuItemWithIngredients[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItemWithIngredients | null>(null);
  const [ingredients, setIngredients] = useState<InventoryItem[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [name, setName] = useState('');
  const [itemType, setItemType] = useState<ItemTypeEnum>('entree');
  const [price, setPrice] = useState<number | ''>('');
  const [premium, setPremium] = useState(false);
  
  // New ingredient form states
  const [showNewIngredient, setShowNewIngredient] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    amount: '',
    unit: '',
    reorder: false
  });

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const data = await response.json();
      setMenuItems(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setError('Failed to load menu items.');
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/inventory');
      if (!response.ok) throw new Error('Failed to fetch ingredients');
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      setError('Failed to load ingredients.');
    }
  };

  const handleAddMenuItem = async () => {
    if (!name || price === '') {
      setError('Name and price are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          item_type: itemType,
          price: Number(price),
          premium,
          ingredients: selectedIngredients.map(ing => ({
            id: ing.id,
            name: ing.name,
            amount: ing.quantity || 1,
            unit: ing.unit,
            reorder: ing.reorder
          }))
        }),
      });

      const data = await response.json();
      
      // Always try to fetch menu items, regardless of response status
      await fetchMenuItems();

      // Only throw error if response wasn't successful
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add menu item');
      }

      resetForm();
    } catch (error) {
      console.error('Error adding menu item:', error);
      setError(error instanceof Error ? error.message : 'Failed to add menu item');
    } finally {
      setIsLoading(false);
    }
  };


  const handleUpdateMenuItem = async () => {
    if (!selectedItem || !name || price === '') {
      setError('Name and price are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/menu`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedItem.id,
          name,
          item_type: itemType,
          price: Number(price),
          premium,
          ingredients: selectedIngredients.map(ing => ({
            id: ing.id,
            name: ing.name,
            amount: ing.quantity || 1,
            unit: ing.unit,
            reorder: ing.reorder
          }))
        }),
      });

      const data = await response.json();
      
      // Always try to fetch menu items, regardless of response status
      await fetchMenuItems();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update menu item');
      }

      resetForm();
    } catch (error) {
      console.error('Error updating menu item:', error);
      setError(error instanceof Error ? error.message : 'Failed to update menu item');
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteMenuItem = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/menu?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete menu item');
      }

      await fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete menu item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIngredient = async () => {
    if (!newIngredient.name || !newIngredient.amount || !newIngredient.unit) {
      setError('Name, amount, and unit are required for new ingredients');
      return;
    }
  
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newIngredient,
          amount: Number(newIngredient.amount)
        }),
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add ingredient');
      }
      
      await fetchIngredients();
      setShowNewIngredient(false);
      setNewIngredient({ name: '', amount: '', unit: '', reorder: false });
      setError(null);
    } catch (error) {
      console.error('Error adding ingredient:', error);
      setError(error instanceof Error ? error.message : 'Failed to add ingredient');
    }
  };

  const handleEditClick = (item: MenuItemWithIngredients) => {
    setSelectedItem(item);
    setName(item.name);
    setItemType(item.item_type);
    setPrice(item.price);
    setPremium(item.premium);
    setSelectedIngredients(item.ingredients || []);
    setError(null);
  };

  const resetForm = () => {
    setSelectedItem(null);
    setName('');
    setItemType('entree');
    setPrice('');
    setPremium(false);
    setSelectedIngredients([]);
    setError(null);
  };

  useEffect(() => {
    fetchMenuItems();
    fetchIngredients();
  }, []);

  const MenuItemSkeleton = () => (
    <div className="flex items-center justify-between p-3">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
        <Skeleton className="h-4 w-[250px]" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );

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
        <h2 className="text-2xl font-bold">Manage Menu</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-8rem)] flex flex-col">
            <CardHeader>
              <CardTitle>Menu Items</CardTitle>
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
                    <MenuItemSkeleton key={i} />
                  ))}
                </div>
              ) : menuItems.length === 0 ? (
                <p className="text-center text-muted-foreground">No menu items found.</p>
              ) : (
                <div className="divide-y divide-border rounded-md border">
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 hover:bg-secondary/10">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.item_type} • ${Number(item.price).toFixed(2)} • {item.premium ? 'Premium' : 'Standard'}
                        </div>
                        {item.ingredients && item.ingredients.length > 0 && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Ingredients: {item.ingredients.map(ing => `${ing.name} (${ing.quantity})`).join(', ')}
                          </div>
                        )}
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
                          onClick={() => handleDeleteMenuItem(item.id)}
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
              <CardTitle>{selectedItem ? 'Update Menu Item' : 'Add New Menu Item'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (selectedItem) {
                  handleUpdateMenuItem();
                } else {
                  handleAddMenuItem();
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
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value as ItemTypeEnum)}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    disabled={isLoading}
                  >
                    {itemTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                    step="0.01"
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    disabled={isLoading}
                  />
                </div>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={premium}
                    onChange={(e) => setPremium(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Premium Item</span>
                </label>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Ingredients</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewIngredient(true)}
                      disabled={isLoading}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      New
                    </Button>
                  </div>

                  <select
                    onChange={(e) => {
                      const ingredient = ingredients.find(i => i.id === Number(e.target.value));
                      if (ingredient && !selectedIngredients.some(si => si.id === ingredient.id)) {
                        setSelectedIngredients([...selectedIngredients, { ...ingredient, quantity: 1 }]);
                      }
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    disabled={isLoading}
                  >
                    <option value="">Select Ingredient</option>
                    {ingredients.map(ingredient => (
                      <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name} ({ingredient.unit})
                      </option>
                    ))}
                  </select>

                  {selectedIngredients.length > 0 && (
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {selectedIngredients.map((ingredient, index) => (
                        <div key={ingredient.id} className="flex items-center gap-1 bg-secondary/20 p-1 rounded-md text-sm">
                          <span className="flex-grow truncate">{ingredient.name}</span>
                          <input
                            type="number"
                            value={ingredient.quantity || 1}
                            onChange={(e) => {
                              const newIngredients = [...selectedIngredients];
                              newIngredients[index] = {
                                ...ingredient,
                                quantity: Number(e.target.value)
                              };
                              setSelectedIngredients(newIngredients);
                            }}
                            className="w-16 h-6 rounded border px-1"
                            min="1"
                          />
                          <span className="text-xs w-8">{ingredient.unit}</span>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedIngredients(selectedIngredients.filter(i => i.id !== ingredient.id));
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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

      {/* New Ingredient Modal */}
      {showNewIngredient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Ingredient</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Ingredient Name"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newIngredient.amount}
                  onChange={(e) => setNewIngredient({...newIngredient, amount: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={newIngredient.unit}
                  onChange={(e) => setNewIngredient({...newIngredient, unit: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newIngredient.reorder}
                    onChange={(e) => setNewIngredient({...newIngredient, reorder: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Reorder Needed</span>
                </label>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewIngredient(false)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddIngredient}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Ingredient
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageMenu;