"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, XCircle, Home, ZoomOut, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import MealBuilder from "@/components/MealBuilder";
import OrderSummary from "@/components/OrderSummary";
import type { MenuItem, SizeEnum, ItemTypeEnum } from "@/types/db.types";
import type { OrderItem, MealInProgress } from "@/types/api.types";

import GoogleTranslate from "@/components/Translation";


import VoiceControl from "@/components/VoiceControl";
import { VoiceCommandHandler, extractCommand } from '@/lib/VoiceCommands';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, AlertTriangle } from 'lucide-react';
/**
 * CategorySection component renders a list of menu items categorized by type (e.g., appetizer, drink).
 *
 * @param {Object} props - The props for CategorySection component.
 * @param {MenuItem[]} props.items - Array of menu items.
 * @param {ItemTypeEnum} props.category - The category type to filter items (e.g., "appetizer", "drink").
 * @param {Function} props.onItemClick - Callback function when an item is clicked.
 * 
 * @returns {JSX.Element} The CategorySection component rendering a list of items.
 */
const CategorySection = ({
  items,
  category,
  onItemClick,
}: {
  items: MenuItem[];
  category: ItemTypeEnum;
  onItemClick: (item: MenuItem) => void;
}) => (
  <ScrollArea className="h-[calc(100vh-15rem)] dynamic-text">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 dynamic-text">
      {items
        .filter((item) => item.item_type === category)
        .map((item) => (
          <Button
            key={item.id}
            variant="outline"
            className="h-auto relative flex flex-col items-center justify-center text-left p-4 hover:border-primary dynamic-text"
            onClick={() => onItemClick(item)}
          >
             <div className="flex flex-col items-center w-full gap-2 dynamic-text">
              <Image
                src={`/images/${item.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                alt={item.name}
                width={400}
                height={224}
                className="w-full h-56 object-cover rounded-md"
              />
                        
            <span className="font-medium text-lg dynamic-text">{item.name}</span>
            <span className="text-sm text-muted-foreground mt-1 dynamic-text">
              ${Number(item.price).toFixed(2)}
            </span>
            {item.premium && (
              <span className="absolute top-2 right-2 text-xs text-yellow-600 font-medium">
                Premium
              </span>
            )}
            </div>
          </Button>
        ))}
    </div>
  </ScrollArea>
);

/**
 * CustomerPage component allows the customer to place an order, including building meals, adding appetizers, drinks,
 * and applying promo codes.
 *
 * @returns {JSX.Element} The main CustomerPage rendering the order creation and order summary.
 */
const CustomerPage = () => {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [currentMeal, setCurrentMeal] = useState<MealInProgress | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [discountedTotal, setDiscountedTotal] = useState(orderTotal);
  const [promoCode, setPromoCode] = useState(""); // Promo code input
  const [isPromoValid, setIsPromoValid] = useState(false); // Promo validation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMealBuilder, setShowMealBuilder] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState<{message: string, isError: boolean} | null>(null);
  
  const goToHome = () => {
    router.push("/");
  };
  const [textSize, setTextSize] = useState(16);

  const increaseTextSize = () => {
    setTextSize(prevSize => Math.min(prevSize + 3, 23)); // Maximum size of 32px
  };

  const decreaseTextSize = () => {
    setTextSize(prevSize => Math.max(prevSize - 3, 12)); // Minimum size of 12px
  };

  useEffect(() => {
    localStorage.setItem('textSize', textSize.toString());
    document.documentElement.style.setProperty('--dynamic-text-size', `${textSize}px`);
    document.documentElement.style.setProperty('--dynamic-button-text-size', `${textSize}px`);
  }, [textSize]);

  useEffect(() => {
    const savedTextSize = localStorage.getItem('textSize');
    if (savedTextSize) {
      setTextSize(parseInt(savedTextSize, 10));
    }
  }, []);

  /**
   * Calculates the total price of the current order, considering meal size and premium items.
   */
  const calculateTotal = useCallback(() => {
    const total = currentOrder.reduce((sum, item) => {
      if (item.type === "meal" && item.meal) {
        const basePrice =
          item.meal.size === "bowl"
            ? 8.99
            : item.meal.size === "plate"
            ? 10.99
            : 12.99;

        const premiumItems = [
          item.meal.entree1,
          item.meal.entree2,
          item.meal.entree3,
          item.meal.side1,
          item.meal.side2,
        ].filter((i) => i?.premium).length;

        return sum + basePrice + premiumItems * 1.5;
      } else if (item.item) {
        return sum + item.item.price * item.item.quantity;
      }
      return sum;
    }, 0);

    setOrderTotal(total);
    setDiscountedTotal(isPromoValid ? total * 0.8 : total);
  }, [currentOrder, isPromoValid]);

  /**
   * Fetches the menu items from the server on initial load.
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
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [calculateTotal]);

  useEffect(() => {
    const savedOrder = localStorage.getItem("currentOrder");
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        setCurrentOrder(parsedOrder);
      } catch (err) {
        console.error("Failed to parse saved order:", err);
        localStorage.removeItem("currentOrder");
      }
    }
  }, []);

  /**
   * Validates the promo code entered by the user.
   */
  const validatePromoCode = () => {
    if (promoCode.trim().toUpperCase() === "PANDA20") {
      setIsPromoValid(true);
      setDiscountedTotal(orderTotal * 0.8);
    } else {
      setIsPromoValid(false);
      setDiscountedTotal(orderTotal);
    }
  };

  /**
 * Updates the promo code input field value.
 * @param {React.ChangeEvent<HTMLInputElement>} e - Event object for input change.
 */
  const handlePromoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCode(e.target.value);
  };

  /**
   * Starts a new meal creation process with the selected size.
   * @param {SizeEnum} size - The size of the meal being created (e.g., "bowl", "plate").
   */
  const startNewMeal = (size: SizeEnum) => {
    setCurrentMeal({
      size,
      side1: null,
      side2: null,
      entree1: null,
      entree2: null,
      entree3: null,
    });
    setShowMealBuilder(true);
  };

  /**
   * Handles meal updates based on the selected item (side, entree).
   * @param {MenuItem} item - The menu item selected to update the meal.
   */
  const handleMealUpdate = (item: MenuItem) => {
    if (!currentMeal) return;

    setCurrentMeal((prev) => {
      if (!prev) return prev;

      if (item.item_type === "side") {
        if (prev.size === "bowl" || prev.size === "plate") {
          if (prev.side1?.id === item.id) return { ...prev, side1: null };
          if (prev.side2?.id === item.id) return { ...prev, side2: null };

          return { ...prev, side1: item, side2: null };
        } else {
          if (prev.side1?.id === item.id) return { ...prev, side1: null };
          if (prev.side2?.id === item.id) return { ...prev, side2: null };

          if (!prev.side1) return { ...prev, side1: item };
          if (!prev.side2) return { ...prev, side2: item };
        }
        return prev;
      }

      if (item.item_type === "entree") {
        if (prev.size === "bowl") {
          if (prev.entree1?.id === item.id) return { ...prev, entree1: null };
          
          return { ...prev, entree1: item, entree2: null, entree3: null };
        } else if (prev.size === "plate") {
          if (prev.entree1?.id === item.id) return { ...prev, entree1: null };
          if (prev.entree2?.id === item.id) return { ...prev, entree2: null };

          if (!prev.entree1) return { ...prev, entree1: item };
          if (!prev.entree2) return { ...prev, entree2: item };
        } else {
          if (prev.entree1?.id === item.id) return { ...prev, entree1: null };
          if (prev.entree2?.id === item.id) return { ...prev, entree2: null };
          if (prev.entree3?.id === item.id) return { ...prev, entree3: null };

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
    if (item.item_type !== "appetizer" && item.item_type !== "drink") return;

    setCurrentOrder((prev) => {
      const existingIndex = prev.findIndex(
        (orderItem) =>
          orderItem.type !== "meal" && orderItem.item?.id === item.id
      );

      if (existingIndex >= 0) {
        return prev.map((orderItem, index) =>
          index === existingIndex && orderItem.item
            ? {
                ...orderItem,
                item: {
                  ...orderItem.item,
                  quantity: (orderItem.item.quantity || 1) + 1,
                },
              }
            : orderItem
        );
      }

      const newOrderItem: OrderItem = {
        type: item.item_type as "appetizer" | "drink",
        item: { ...item, quantity: 1 },
      };

      return [...prev, newOrderItem];
    });
  };

  /**
 * Handles the item click event. If the meal builder is active, it updates the current meal;
 * otherwise, it adds a simple item to the order.
 *
 * @param {MenuItem} item - The menu item that was clicked.
 */
  const handleItemClick = (item: MenuItem) => {
    if (showMealBuilder) {
      handleMealUpdate(item);
    } else {
      addSimpleItem(item);
    }
  };

  /**
 * Cancels the current meal creation process by resetting the meal state and hiding the meal builder.
 */
  const cancelMeal = () => {
    setCurrentMeal(null);
    setShowMealBuilder(false);
  };

  /**
   * Cancels the current order by clearing all the order details, resetting the meal state, 
   * clearing the promo code, and removing all localStorage items related to the order.
   * Afterward, it redirects the user to the login page.
   */
  const cancelOrder = () => {
    setCurrentOrder([]);
    setCurrentMeal(null);
    setShowMealBuilder(false);
    setPromoCode("");
    setIsPromoValid(false);
    setOrderTotal(0);
    setDiscountedTotal(0);
    localStorage.removeItem("currentOrder");
    localStorage.removeItem("orderTotal");
    localStorage.removeItem("originalTotal");
    localStorage.removeItem("promoCode");
    router.push("/customer/login");
  };

  /**
   * Completes the current meal by adding it to the order and saving the updated order to localStorage.
   * Afterward, it resets the current meal and hides the meal builder.
   */
  const completeMeal = () => {
    if (!currentMeal) return;
    const newMealItem: OrderItem = { type: "meal", meal: currentMeal };
    const updatedOrder = [...currentOrder, newMealItem];
    setCurrentOrder(updatedOrder);
    localStorage.setItem("currentOrder", JSON.stringify(updatedOrder));
    setCurrentMeal(null);
    setShowMealBuilder(false);
  };

  /**
   * Removes an item from the current order based on its index and updates the localStorage with the new order.
   * 
   * @param {number} index - The index of the order item to remove.
   */
  const removeOrderItem = (index: number) => {
    setCurrentOrder((prev) => {
      const updatedOrder = prev.filter((_, i) => i !== index);
      localStorage.setItem("currentOrder", JSON.stringify(updatedOrder));
      return updatedOrder;
    });
  };

  /**
   * Updates the quantity of an item in the current order based on the provided index and quantity change.
   * If the quantity goes below 1, the item is removed from the order. The updated order is saved to localStorage.
   * 
   * @param {number} index - The index of the order item to update.
   * @param {number} change - The change in quantity (positive for increase, negative for decrease).
   */
  const updateItemQuantity = (index: number, change: number) => {
    setCurrentOrder((prev) => {
      const updatedOrder = prev
        .map((item, i) => {
          if (i !== index || item.type === "meal" || !item.item) return item;

          const newQuantity = (item.item.quantity || 1) + change;
          if (newQuantity < 1) return null;

          return {
            ...item,
            item: { ...item.item, quantity: newQuantity },
          };
        })
        .filter(Boolean) as OrderItem[];

      localStorage.setItem("currentOrder", JSON.stringify(updatedOrder));
      return updatedOrder;
    });
  };
  

  /**
   * Handles the checkout process. It ensures that the order has at least one item, 
   * saves the current order details (including the total and promo code) to localStorage, 
   * and redirects the user to the checkout page.
   */
  const handleCheckout = () => {
    if (currentOrder.length === 0) {
      setError("Please add items to your order before checking out");
      return;
    }

    localStorage.setItem("currentOrder", JSON.stringify(currentOrder));
    localStorage.setItem("orderTotal", discountedTotal.toString());
    localStorage.setItem("originalTotal", orderTotal.toString());
    localStorage.setItem("promoCode", isPromoValid ? promoCode : "");

    

    router.push("/customer/checkout");
  };
  const handleVoiceCommand = useCallback((transcript: string) => {
    const command = extractCommand(transcript);
    if (!command) return;
  
    const commandHandler = new VoiceCommandHandler(
      menuItems,
      {
        startNewMeal,
        addSimpleItem,
        handleMealUpdate,
        completeMeal,
        cancelMeal,
        handleCheckout
      },
      currentMeal
    );
  
    try {
      commandHandler.handleCommand(command);
      setCommandFeedback({
        message: `Command executed: "${command}"`,
        isError: false
      });
      setTimeout(() => setCommandFeedback(null), 3000);
    } catch (error) {
      setCommandFeedback({
        message: "Sorry, I didn't understand that command.",
        isError: true
      });
      setTimeout(() => setCommandFeedback(null), 3000);
    }
  }, [
    menuItems,
    currentMeal,
    startNewMeal,
    addSimpleItem,
    handleMealUpdate,
    completeMeal,
    cancelMeal,
    handleCheckout
  ]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen dynamic-text">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-500 dynamic-text">
        {error}
      </div>
    );


  return (
    
    <div className="h-screen flex" style={{ fontSize: `${textSize}px`, '--dynamic-button-text-size': `${textSize}px` } as React.CSSProperties}>
      <div className="w-2/3 flex flex-col">
        <Card className="m-4 flex-grow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="dynamic-text">Place Your Order</CardTitle>
            <div className="flex gap-2">
            <VoiceControl
            onCommand={handleVoiceCommand}
            isListening={isListening}
            setIsListening={setIsListening}
          />

            <Button 
                variant="outline" 
                onClick={decreaseTextSize} 
                title="Decrease Text Size"
                className="gap-2"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={increaseTextSize} 
                title="Increase Text Size"
                className="gap-2"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              <GoogleTranslate />
      
              <Button variant="outline" onClick={goToHome} className="gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
              <Button
                variant="destructive"
                onClick={cancelOrder}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Cancel Order
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!showMealBuilder ? (
              <Tabs defaultValue="meals" className="h-full">
                <TabsList>
                  <TabsTrigger className="dynamic-text" value="meals">Create a Meal</TabsTrigger>
                  <TabsTrigger className="dynamic-text" value="appetizers">Appetizers</TabsTrigger>
                  <TabsTrigger className="dynamic-text" value="drinks">Drinks</TabsTrigger>
                </TabsList>

                <TabsContent value="meals" className="h-full">
                  <div className="grid grid-cols-3 gap-4 mb-4 dynamic-text">
                    <Button onClick={() => startNewMeal("bowl")}>
                      Create bowl
                    </Button>
                    <Button onClick={() => startNewMeal("plate")}>
                      Create plate
                    </Button>
                    <Button onClick={() => startNewMeal("bigger plate")}>
                      Create bigger plate
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="appetizers" className="dynamic-text">
                  <CategorySection
                    items={menuItems}
                    category="appetizer"
                    onItemClick={handleItemClick}
                  />
                </TabsContent>

                <TabsContent value="drinks" className="dynamic-text">
                  <CategorySection
                    items={menuItems}
                    category="drink"
                    onItemClick={handleItemClick}
                  />
                </TabsContent>
              </Tabs>
            ) : currentMeal ? (
              <MealBuilder
                size={currentMeal.size || "bowl"}
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
              total={discountedTotal}
              onRemoveItem={removeOrderItem}
              onUpdateQuantity={updateItemQuantity}
              onCheckout={handleCheckout}
            />

            <div className="mt-4">
              <Label className="dynamic-text" htmlFor="promoCode">Promo Code</Label>
              <Input
                id="promoCode"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={handlePromoChange}
                className="dynamic-text"
              />
              <Button
                onClick={validatePromoCode}
                className="mt-2 dynamic-text"
              >
                Apply Promo
              </Button>
              {isPromoValid && (
                <p className="text-green-600 mt-2">Promo code applied! 20% discounted.</p>
              )}
              {!isPromoValid && promoCode.trim() !== "" && (
                <p className="text-red-600 mt-2">Invalid promo code</p>)}
            </div>


          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerPage;
