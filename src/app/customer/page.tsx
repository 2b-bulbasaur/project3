'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import MealBuilder from '@/components/MealBuilder';
import OrderSummary from '@/components/OrderSummary';
import type { MenuItem, SizeEnum, ItemTypeEnum } from '@/types/db.types';
import type { OrderItem, MealInProgress } from '@/types/api.types';

const CategorySection = ({ 
  items, 
  category, 
  onItemClick 
}: { 
  items: MenuItem[], 
  category: ItemTypeEnum, 
  onItemClick: (item: MenuItem) => void 
}) => (
  <ScrollArea className="h-[calc(100vh-15rem)]">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {items
        .filter(item => item.item_type === category)
        .map(item => (
          <Button
            key={item.id}
            variant="outline"
            className="h-32 relative flex flex-col items-center justify-center text-left p-4 hover:border-primary"
            onClick={() => onItemClick(item)}
          >
            <span className="font-medium text-lg">{item.name}</span>
            <span className="text-sm text-muted-foreground mt-1">
              ${Number(item.price).toFixed(2)}
            </span>
            {item.premium && (
              <span className="absolute top-2 right-2 text-xs text-yellow-600 font-medium">
                Premium
              </span>
            )}
          </Button>
        ))}
    </div>
  </ScrollArea>
);

const CustomerPage = () => {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [currentMeal, setCurrentMeal] = useState<MealInProgress | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMealBuilder, setShowMealBuilder] = useState(false);

  const calculateTotal = useCallback(() => {
    const total = currentOrder.reduce((sum, item) => {
      if (item.type === 'meal' && item.meal) {
        const basePrice = 
          item.meal.size === 'bowl' ? 8.99 :
          item.meal.size === 'plate' ? 10.99 : 12.99;
        
        const premiumItems = [
          item.meal.entree1,
          item.meal.entree2,
          item.meal.entree3,
          item.meal.side1,
          item.meal.side2
        ].filter(i => i?.premium).length;
        
        return sum + basePrice + (premiumItems * 1.50);
      } else if (item.item) {
        return sum + (item.item.price * item.item.quantity);
      }
      return sum;
    }, 0);
    
    setOrderTotal(total);
  }, [currentOrder]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('/api/menu');
        if (!response.ok) throw new Error('Failed to fetch menu items');
        const data = await response.json();
        setMenuItems(data);
      } catch (err) {
        setError('Failed to load menu items');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [calculateTotal]);

  useEffect(() => {
    const savedOrder = localStorage.getItem('currentOrder');
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        setCurrentOrder(parsedOrder);
      } catch (err) {
        console.error('Failed to parse saved order:', err);
        localStorage.removeItem('currentOrder');
      }
    }
  }, []);

  const startNewMeal = (size: SizeEnum) => {
    setCurrentMeal({
      size,
      side1: null,
      side2: null,
      entree1: null,
      entree2: null,
      entree3: null
    });
    setShowMealBuilder(true);
  };

  const handleMealUpdate = (item: MenuItem) => {
    if (!currentMeal) return;
    
    setCurrentMeal(prev => {
      if (!prev) return prev;
      
      if (item.item_type === 'side') {
        if (prev.size === 'bowl' || prev.size === 'plate') {
          return { ...prev, side1: item, side2: null };
        } else {
          if (!prev.side1) return { ...prev, side1: item };
          if (!prev.side2) return { ...prev, side2: item };
        }
        return prev;
      }
      
      if (item.item_type === 'entree') {
        if (prev.size === 'bowl') {
          return { ...prev, entree1: item, entree2: null, entree3: null };
        } else if (prev.size === 'plate') {
          if (!prev.entree1) return { ...prev, entree1: item };
          if (!prev.entree2) return { ...prev, entree2: item };
        } else {
          if (!prev.entree1) return { ...prev, entree1: item };
          if (!prev.entree2) return { ...prev, entree2: item };
          if (!prev.entree3) return { ...prev, entree3: item };
        }
        return prev;
      }
      
      return prev;
    });
  };

  const addSimpleItem = (item: MenuItem) => {
    if (item.item_type !== 'appetizer' && item.item_type !== 'drink') return;
    
    setCurrentOrder(prev => {
      const existingIndex = prev.findIndex(
        orderItem => orderItem.type !== 'meal' && 
        orderItem.item?.id === item.id
      );

      if (existingIndex >= 0) {
        return prev.map((orderItem, index) => 
          index === existingIndex && orderItem.item
            ? {
                ...orderItem,
                item: {
                  ...orderItem.item,
                  quantity: (orderItem.item.quantity || 1) + 1
                }
              }
            : orderItem
        );
      }

      const newOrderItem: OrderItem = {
        type: item.item_type as 'appetizer' | 'drink',
        item: { ...item, quantity: 1 }
      };

      return [...prev, newOrderItem];
    });
  };

  const handleItemClick = (item: MenuItem) => {
    if (showMealBuilder) {
      handleMealUpdate(item);
    } else {
      addSimpleItem(item);
    }
  };

  const cancelMeal = () => {
    setCurrentMeal(null);
    setShowMealBuilder(false);
  };

  const cancelOrder = () => {
    setCurrentOrder([]);
    setCurrentMeal(null);
    setShowMealBuilder(false);
    localStorage.removeItem('currentOrder');
    localStorage.removeItem('orderTotal');
    router.push('/');
  };

  const completeMeal = () => {
    if (!currentMeal) return;
    const newMealItem: OrderItem = { type: 'meal', meal: currentMeal };
    const updatedOrder = [...currentOrder, newMealItem];
    setCurrentOrder(updatedOrder);
    localStorage.setItem('currentOrder', JSON.stringify(updatedOrder));
    setCurrentMeal(null);
    setShowMealBuilder(false);
  };

  const removeOrderItem = (index: number) => {
    setCurrentOrder(prev => {
      const updatedOrder = prev.filter((_, i) => i !== index);
      localStorage.setItem('currentOrder', JSON.stringify(updatedOrder));
      return updatedOrder;
    });
  };

  const updateItemQuantity = (index: number, change: number) => {
    setCurrentOrder(prev => {
      const updatedOrder = prev.map((item, i) => {
        if (i !== index || item.type === 'meal' || !item.item) return item;
        
        const newQuantity = (item.item.quantity || 1) + change;
        if (newQuantity < 1) return null;
        
        return {
          ...item,
          item: { ...item.item, quantity: newQuantity }
        };
      }).filter(Boolean) as OrderItem[];
      
      localStorage.setItem('currentOrder', JSON.stringify(updatedOrder));
      return updatedOrder;
    });
  };

  const handleCheckout = () => {
    if (currentOrder.length === 0) {
      setError('Please add items to your order before checking out');
      return;
    }
    
    localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
    localStorage.setItem('orderTotal', orderTotal.toString());
    
    router.push('/customer/checkout');
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;

  return (
    <div className="h-screen flex">
      <div className="w-2/3 flex flex-col">
        <Card className="m-4 flex-grow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Place Your Order</CardTitle>
            <Button 
              variant="destructive"
              onClick={cancelOrder}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Cancel Order
            </Button>
          </CardHeader>
          <CardContent>
            {!showMealBuilder ? (
              <Tabs defaultValue="meals" className="h-full">
                <TabsList>
                  <TabsTrigger value="meals">Create a Meal</TabsTrigger>
                  <TabsTrigger value="appetizers">Appetizers</TabsTrigger>
                  <TabsTrigger value="drinks">Drinks</TabsTrigger>
                </TabsList>

                <TabsContent value="meals" className="h-full">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <Button onClick={() => startNewMeal('bowl')}>
                      Create bowl
                    </Button>
                    <Button onClick={() => startNewMeal('plate')}>
                      Create plate
                    </Button>
                    <Button onClick={() => startNewMeal('bigger plate')}>
                      Create bigger plate
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="appetizers">
                  <CategorySection 
                    items={menuItems} 
                    category="appetizer" 
                    onItemClick={handleItemClick} 
                  />
                </TabsContent>

                <TabsContent value="drinks">
                  <CategorySection 
                    items={menuItems} 
                    category="drink" 
                    onItemClick={handleItemClick} 
                  />
                </TabsContent>
              </Tabs>
            ) : currentMeal ? (
              <MealBuilder
                size={currentMeal.size || 'bowl'}
                meal={currentMeal}
                menuItems={menuItems}
                onUpdateMeal={handleMealUpdate}
                onComplete={completeMeal}
                onCancel={cancelMeal}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="w-1/3 p-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderSummary
              order={currentOrder}
              total={orderTotal}
              onRemoveItem={removeOrderItem}
              onUpdateQuantity={updateItemQuantity}
              onCheckout={handleCheckout}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerPage;