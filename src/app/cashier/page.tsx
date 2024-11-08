"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import type { MealInProgress, MenuItem, OrderItem, SizeEnum } from "@/types/";

const CashierPage = () => {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("side");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMeal, setCurrentMeal] = useState<MealInProgress | null>(null);

  const handleLogout = () => {
    router.push("/login");
  };

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch("/api/menu");
        if (!response.ok) throw new Error("Failed to fetch menu items");
        const data = await response.json();
        setMenuItems(data);
      } catch (err) {
        setError("Failed to load menu items");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, []);

  const startNewMeal = (size: SizeEnum) => {
    setCurrentMeal({
      id: Math.random().toString(36).slice(2, 11),
      size,
      side1: null,
      side2: null,
      entree1: null,
      entree2: null,
      entree3: null,
    });
  };

  const addToMeal = (item: MenuItem) => {
    if (!currentMeal) return;

    setCurrentMeal((prev) => {
      if (!prev) return prev;

      if (item.item_type === "side") {
        if (!prev.side1) return { ...prev, side1: item };
        if (!prev.side2) return { ...prev, side2: item };
        return prev;
      }

      if (item.item_type === "entree") {
        if (!prev.entree1) return { ...prev, entree1: item };
        if (!prev.entree2) return { ...prev, entree2: item };
        if (!prev.entree3) return { ...prev, entree3: item };
        return prev;
      }

      return prev;
    });
  };

  const completeMeal = () => {
    if (!currentMeal) return;
    setCurrentOrder((prev) => [...prev, { type: "meal", meal: currentMeal }]);
    setCurrentMeal(null);
  };

  const addSimpleItem = (item: MenuItem) => {
    if (item.item_type !== "appetizer" && item.item_type !== "drink") return;

    setCurrentOrder((prev) => {
      const existingItemIndex = prev.findIndex(
        (orderItem) =>
          orderItem.type !== "meal" && orderItem.item?.id === item.id
      );

      if (existingItemIndex >= 0) {
        return prev.map((orderItem, index) =>
          index === existingItemIndex && orderItem.item
            ? {
                ...orderItem,
                item: {
                  ...orderItem.item,
                  quantity: orderItem.item.quantity + 1,
                },
              }
            : orderItem
        );
      }

      return [
        ...prev,
        {
          type: item.item_type === "appetizer" ? "appetizer" : "drink",
          item: { ...item, quantity: 1 },
        },
      ];
    });
  };

  const getMealPrice = (meal: MealInProgress) => {
    let basePrice = 0;
    if (meal.size === "bowl") basePrice = 8.99;
    else if (meal.size === "plate") basePrice = 10.99;
    else if (meal.size === "bigger plate") basePrice = 12.99;

    const premiumAddons = [
      meal.entree1,
      meal.entree2,
      meal.entree3,
      meal.side1,
      meal.side2,
    ].filter((item) => item?.premium).length;

    return basePrice + premiumAddons * 1.5;
  };

  const getOrderTotal = () => {
    return currentOrder.reduce((total, orderItem) => {
      if (orderItem.type === "meal" && orderItem.meal) {
        return total + getMealPrice(orderItem.meal);
      }
      if (orderItem.item) {
        return total + Number(orderItem.item.price) * orderItem.item.quantity;
      }
      return total;
    }, 0);
  };

  const removeOrderItem = (index: number) => {
    setCurrentOrder((prev) => prev.filter((_, i) => i !== index));
  };

  const clearOrder = () => {
    setCurrentOrder([]);
    setCurrentMeal(null);
    setCustomerName("");
  };

  const submitOrder = async () => {
    try {
      const orderData = {
        customer_name: customerName || "Guest",
        cashier_name: "Current Cashier",
        sale_price: getOrderTotal(),
        items: currentOrder.reduce((sum, item) => {
          if (item.type === "meal") return sum + 1;
          return sum + (item.item?.quantity || 0);
        }, 0),
        meals: currentOrder.filter((item) => item.type === "meal").length,
        appetizers: currentOrder.reduce(
          (sum, item) =>
            item.type === "appetizer" ? sum + (item.item?.quantity || 0) : sum,
          0
        ),
        drinks: currentOrder.reduce(
          (sum, item) =>
            item.type === "drink" ? sum + (item.item?.quantity || 0) : sum,
          0
        ),
        date: new Date(),
        orderItems: currentOrder
      };

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Failed to submit order");
      clearOrder();
    } catch (err) {
      setError("Failed to submit order");
      console.error(err);
    }
  };

  const renderCurrentMealBuilder = () => {
    if (!currentMeal) return null;

    return (
      <div className="mb-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-medium mb-2">Building {currentMeal.size}</h3>
        <div className="space-y-2">
          <div>
            Sides: {currentMeal.side1?.name} {currentMeal.side2?.name}
          </div>
          <div>
            Entrees: {currentMeal.entree1?.name} {currentMeal.entree2?.name}{" "}
            {currentMeal.entree3?.name}
          </div>
          <div className="text-sm text-gray-600">
            Price: ${getMealPrice(currentMeal).toFixed(2)}
          </div>
          <Button
            onClick={completeMeal}
            disabled={!currentMeal.side1 || !currentMeal.entree1}
            className="w-full"
          >
            Complete Meal
          </Button>
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="w-2/3 p-4 bg-gray-50">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Add Items</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="entree">Entrées</SelectItem>
                    <SelectItem value="side">Sides</SelectItem>
                    <SelectItem value="appetizer">Appetizers</SelectItem>
                    <SelectItem value="drink">Drinks</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            {!currentMeal && (
              <div className="mb-4 grid grid-cols-3 gap-2">
                <Button onClick={() => startNewMeal("bowl")}>New Bowl</Button>
                <Button onClick={() => startNewMeal("plate")}>New Plate</Button>
                <Button onClick={() => startNewMeal("bigger plate")}>
                  New Bigger Plate
                </Button>
              </div>
            )}

            {renderCurrentMealBuilder()}

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-3 gap-4">
                {menuItems
                  .filter(
                    (item) =>
                      selectedCategory === "all" ||
                      item.item_type === selectedCategory
                  )
                  .map((item) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center"
                      onClick={() => {
                        if (
                          currentMeal &&
                          (item.item_type === "entree" ||
                            item.item_type === "side")
                        ) {
                          addToMeal(item);
                        } else if (
                          item.item_type === "appetizer" ||
                          item.item_type === "drink"
                        ) {
                          addSimpleItem(item);
                        }
                      }}
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-500">
                        ${Number(item.price).toFixed(2)}
                      </span>
                      {item.premium && (
                        <span className="text-xs text-yellow-600">Premium</span>
                      )}
                    </Button>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-1/3 p-4 bg-white border-l">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Current Order</CardTitle>
            <Input
              placeholder="Customer Name (Optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            <ScrollArea className="flex-grow">
              <div className="space-y-4">
                {currentOrder.map((orderItem, index) => (
                  <div key={index} className="p-2 border rounded">
                    {orderItem.type === "meal" && orderItem.meal && (
                      <div>
                        <div className="font-medium">{orderItem.meal.size}</div>
                        <div className="text-sm">
                          Sides: {orderItem.meal.side1?.name}{" "}
                          {orderItem.meal.side2?.name}
                        </div>
                        <div className="text-sm">
                          Entrees: {orderItem.meal.entree1?.name}{" "}
                          {orderItem.meal.entree2?.name}{" "}
                          {orderItem.meal.entree3?.name}
                        </div>
                        <div className="text-right">
                          ${getMealPrice(orderItem.meal).toFixed(2)}
                        </div>
                      </div>
                    )}
                    {orderItem.type !== "meal" && orderItem.item && (
                      <div className="flex justify-between">
                        <span>
                          {orderItem.item.name} x{orderItem.item.quantity}
                        </span>
                        <span>
                          $
                          {(
                            orderItem.item.price * orderItem.item.quantity
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOrderItem(index)}
                      className="w-full mt-2"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-4 space-y-4">
              <div className="flex justify-between text-lg font-medium">
                <span>Total</span>
                <span>${getOrderTotal().toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearOrder}
                  disabled={currentOrder.length === 0}
                >
                  Clear Order
                </Button>
                {/* <Button
                  className="w-full"
                  onClick={submitOrder}
                  disabled={currentOrder.length === 0}
                >
                  Complete Order
                </Button> */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      onClick={submitOrder}
                      disabled={currentOrder.length === 0}
                      >
                        Complete Order
                      </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Order Submitted</DialogTitle>
                      <DialogDescription>
                        Order has been placed successfully.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CashierPage;
