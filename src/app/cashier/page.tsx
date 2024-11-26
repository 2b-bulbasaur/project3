"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus } from 'lucide-react';
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

/**
 * CashierPage component for handling the entire process of placing an order
 * in a cashier system. It allows adding items to an order, building meals
 * with specific sides and entrees, calculating prices, and submitting orders.
 *
 * @component
 * @example
 * return (
 *   <CashierPage />
 * )
 */
const CashierPage = () => {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("side");
  const [customerName, setCustomerName] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMeal, setCurrentMeal] = useState<MealInProgress | null>(null);

  /**
   * Handles the logout process by clearing the employee's name from local storage
   * and redirecting the user to the login page.
   */
  const handleLogout = () => {
    localStorage.removeItem("employeeName");
    router.push("/login");
  };

  /**
   * Fetches the menu items from the API and updates the state with the menu data.
   * Also, loads the employee's name from local storage.
   */
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

    const name = localStorage.getItem("employeeName");
    if (name) setEmployeeName(name);
  }, []);

  /**
   * Returns the meal constraints based on the size.
   *
   * @param {SizeEnum} size - The size of the meal (bowl, plate, bigger plate).
   * @returns {Object} - An object containing maxSides and maxEntrees for the meal.
   */
  const getMealConstraints = (size: SizeEnum) => {
    switch (size) {
      case "bowl":
        return { maxSides: 1, maxEntrees: 1 };
      case "plate":
        return { maxSides: 1, maxEntrees: 2 };
      case "bigger plate":
        return { maxSides: 2, maxEntrees: 3 };
      default:
        return { maxSides: 0, maxEntrees: 0 };
    }
  };

  /**
   * Gets the count of sides and entrees in the current meal.
   *
   * @param {MealInProgress} meal - The current meal being built.
   * @returns {Object} - An object containing sideCount and entreeCount.
   */
  const getCurrentMealCounts = (meal: MealInProgress) => {
    const sideCount = [meal.side1, meal.side2].filter(Boolean).length;
    const entreeCount = [meal.entree1, meal.entree2, meal.entree3].filter(Boolean).length;
    return { sideCount, entreeCount };
  };

  /**
   * Determines whether an item can be added to the current meal based on the
   * meal's size constraints and the item's type (side or entree).
   *
   * @param {MealInProgress} meal - The current meal being built.
   * @param {MenuItem} item - The menu item to check.
   * @returns {boolean} - True if the item can be added, otherwise false.
   */
  const canAddItemToMeal = (meal: MealInProgress, item: MenuItem) => {
    const constraints = meal.size ? getMealConstraints(meal.size) : { maxSides: 0, maxEntrees: 0 };
    const counts = getCurrentMealCounts(meal);

    if (item.item_type === "side") {
      return counts.sideCount < constraints.maxSides;
    }
    if (item.item_type === "entree") {
      return counts.entreeCount < constraints.maxEntrees;
    }
    return false;
  };

  /**
   * Starts a new meal with the specified size.
   *
   * @param {SizeEnum} size - The size of the meal (bowl, plate, bigger plate).
   */
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

  /**
   * Adds a menu item (side or entree) to the current meal if it's allowed
   * based on the meal's constraints.
   *
   * @param {MenuItem} item - The item to add to the meal.
   */
  const addToMeal = (item: MenuItem) => {
    if (!currentMeal) return;

    if (!canAddItemToMeal(currentMeal, item)) {
      //setError(`Cannot add more ${item.item_type}s to this ${currentMeal.size}`);
      //setTimeout(() => setError(""), 3000); // Clear error after 3 seconds
      return;
    }

    setCurrentMeal((prev) => {
      if (!prev) return prev;

      if (item.item_type === "side") {
        if (!prev.side1) return { ...prev, side1: item };
        if (!prev.side2 && prev.size === "bigger plate") return { ...prev, side2: item };
        return prev;
      }

      if (item.item_type === "entree") {
        if (!prev.entree1) return { ...prev, entree1: item };
        if (!prev.entree2 && (prev.size === "plate" || prev.size === "bigger plate")) 
          return { ...prev, entree2: item };
        if (!prev.entree3 && prev.size === "bigger plate") 
          return { ...prev, entree3: item };
        return prev;
      }

      return prev;
    });
  };

  /**
   * Checks whether the current meal is complete based on the size and item constraints.
   *
   * @param {MealInProgress} meal - The current meal being built.
   * @returns {boolean} - True if the meal is complete, otherwise false.
   */
  const isMealComplete = (meal: MealInProgress) => {
    const constraints = meal.size ? getMealConstraints(meal.size) : { maxSides: 0, maxEntrees: 0 };
    const counts = getCurrentMealCounts(meal);
    return counts.sideCount === constraints.maxSides && 
           counts.entreeCount === constraints.maxEntrees;
  };

  /**
   * Completes the current meal and adds it to the current order.
   * Resets the current meal after completing.
   */
  const completeMeal = () => {
    if (!currentMeal || !isMealComplete(currentMeal)) return;
    setCurrentOrder((prev) => [...prev, { type: "meal", meal: currentMeal }]);
    setCurrentMeal(null);
  };

  /**
   * Adds a simple item (appetizer or drink) to the order.
   *
   * @param {MenuItem} item - The item to add.
   */
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

  /**
   * Calculates the price of a complete meal based on the size and any premium items added.
   *
   * @param {MealInProgress} meal - The completed meal.
   * @returns {number} - The total price of the meal.
   */
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

  /**
   * Calculates the total price of the current order.
   * It considers both meals and individual items, adding their prices and quantities.
   * 
   * @returns {number} The total price of the current order.
   */
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

  /**
   * Checks if a given item is already selected in the current meal.
   * 
   * @param {MenuItem} item - The item to check for selection.
   * @returns {boolean} True if the item is selected in the current meal, otherwise false.
   */
  const isItemSelected = (item: MenuItem) => {
    if (!currentMeal) return false;
    
    if (item.item_type === "side") {
      return currentMeal.side1?.id === item.id || currentMeal.side2?.id === item.id;
    }
    
    if (item.item_type === "entree") {
      return currentMeal.entree1?.id === item.id || 
             currentMeal.entree2?.id === item.id || 
             currentMeal.entree3?.id === item.id;
    }
    
    return false;
  };

  /**
   * Removes a menu item (side or entree) from the current meal.
   * If the item exists as side1, side2, entree1, entree2, or entree3, it will be removed from the meal.
   * 
   * @param {MenuItem} item - The item to remove from the current meal.
   */
  const removeFromMeal = (item: MenuItem) => {
    if (!currentMeal) return;

    setCurrentMeal(prev => {
      if (!prev) return prev;

      if (item.item_type === "side") {
        if (prev.side1?.id === item.id) return { ...prev, side1: null };
        if (prev.side2?.id === item.id) return { ...prev, side2: null };
      }

      if (item.item_type === "entree") {
        if (prev.entree1?.id === item.id) return { ...prev, entree1: null };
        if (prev.entree2?.id === item.id) return { ...prev, entree2: null };
        if (prev.entree3?.id === item.id) return { ...prev, entree3: null };
      }

      return prev;
    });
  };

  /**
   * Handles a click on a menu item. If the item is a side or entree, it will either add or remove the item 
   * from the current meal based on its current selection state. If the item is an appetizer or drink, 
   * it will be added to the order as a simple item.
   * 
   * @param {MenuItem} item - The menu item that was clicked.
   */
  const handleItemClick = (item: MenuItem) => {
    if (currentMeal && (item.item_type === "entree" || item.item_type === "side")) {
      if (isItemSelected(item)) {
        removeFromMeal(item);
      } else {
        addToMeal(item);
      }
    } else if (item.item_type === "appetizer" || item.item_type === "drink") {
      addSimpleItem(item);
    }
  };

  /**
   * Removes an item from the current order based on its index.
   * 
   * @param {number} index - The index of the item to remove from the order.
   */
  const removeOrderItem = (index: number) => {
    setCurrentOrder((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Updates the quantity of an item in the current order. The `delta` value determines 
   * whether the quantity is increased or decreased.
   * 
   * @param {number} index - The index of the order item to update.
   * @param {number} delta - The amount to change the item's quantity by (positive or negative).
   */
  const onUpdateQuantity = (index: number, delta: number) => {
    setCurrentOrder((prev) =>
      prev
        .map((orderItem, i) =>
          i === index && orderItem.item
            ? {
                ...orderItem,
                item: {
                  ...orderItem.item,
                  quantity: orderItem.item.quantity + delta,
                },
              }
            : orderItem
        )
        .filter((orderItem) => 
          orderItem.meal || 
          (orderItem.item?.quantity ?? 0) > 0
        )
    );
  };

  /**
   * Clears the current order, current meal, and resets the customer name.
   */
  const clearOrder = () => {
    setCurrentOrder([]);
    setCurrentMeal(null);
    setCustomerName("");
  };

  /**
   * Submits the current order by sending it to the API. The order data includes the 
   * customer name, cashier name, total sale price, and other details of the order.
   * 
   * @async
   * @function
   * @returns {Promise<void>} Resolves when the order has been successfully submitted.
   */
  const submitOrder = async () => {
    try {
      const orderData = {
        customer_name: customerName || "Guest",
        cashier_name: employeeName || "Current Cashier",
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

  /**
   * Renders the current meal builder UI if a meal is selected. 
   * It retrieves the constraints for the current meal based on its size and calculates 
   * the counts for the current meal's sides and entrees.
   * 
   * @returns {JSX.Element | null} A JSX element representing the meal builder UI, 
   * or null if there is no current meal selected.
   */
  const renderCurrentMealBuilder = () => {
    if (!currentMeal) return null;

    const constraints = currentMeal.size ? getMealConstraints(currentMeal.size) : { maxSides: 0, maxEntrees: 0 };
    const counts = getCurrentMealCounts(currentMeal);

    return (
      <div className="mb-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-medium mb-2">Building {currentMeal.size}</h3>
        <div className="space-y-2">
          <div>
            Sides: {currentMeal.side1?.name} {currentMeal.side2?.name}
            <span className="text-sm text-gray-500 ml-2">
              ({counts.sideCount}/{constraints.maxSides})
            </span>
          </div>
          <div>
            Entrees: {currentMeal.entree1?.name} {currentMeal.entree2?.name}{" "}
            {currentMeal.entree3?.name}
            <span className="text-sm text-gray-500 ml-2">
              ({counts.entreeCount}/{constraints.maxEntrees})
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Price: ${getMealPrice(currentMeal).toFixed(2)}
          </div>
          <Button
            onClick={completeMeal}
            disabled={!isMealComplete(currentMeal)}
            className="w-full"
          >
            Complete Meal
          </Button>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
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
                        variant={isItemSelected(item) ? "default" : "outline"}
                        className={`h-24 flex flex-col items-center justify-center transition-all ${
                          isItemSelected(item) ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => handleItemClick(item)}
                      >
                        <span className={`font-medium ${isItemSelected(item) ? "text-primary-foreground" : ""}`}>
                          {item.name}
                        </span>
                        <span className={`text-sm ${isItemSelected(item) ? "text-primary-foreground/80" : "text-gray-500"}`}>
                          ${Number(item.price).toFixed(2)}
                        </span>
                        {item.premium && (
                          <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full mt-1">
                            Premium
                          </span>
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
            <CardContent className="flex-grow flex flex-col overflow-y-auto max-h-[calc(100vh-200px)]"> {/* Added scroll and height constraint */}
              <ScrollArea className="flex-grow">
                <div className="space-y-4">
                  {currentOrder.map((orderItem, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      {orderItem.type === "meal" && orderItem.meal && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-lg">{orderItem.meal.size}</span>
                            <span className="font-medium">${getMealPrice(orderItem.meal).toFixed(2)}</span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            {(orderItem.meal.side1 || orderItem.meal.side2) && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Sides:</span>
                                {orderItem.meal.side1?.name}
                                {orderItem.meal.side2?.name && `, ${orderItem.meal.side2.name}`}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Entrées:</span>
                              {[orderItem.meal.entree1?.name, orderItem.meal.entree2?.name, orderItem.meal.entree3?.name]
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          </div>
                        </div>
                      )}
                      {orderItem.type !== "meal" && orderItem.item && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{orderItem.item.name}</span>
                            <span className="font-medium">
                              ${(orderItem.item.price * orderItem.item.quantity).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateQuantity(index, -1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {orderItem.item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateQuantity(index, 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOrderItem(index)}
                        className="w-full mt-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-4 space-y-4 border-t pt-4">
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
