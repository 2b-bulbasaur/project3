import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Minus, Trash2 } from 'lucide-react';
import type { OrderItem } from '@/types/api.types';

interface OrderSummaryProps {
  order: OrderItem[];
  total: number;
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, change: number) => void;
  onCheckout: () => void;
}

export const OrderSummary = ({
  order,
  total,
  onRemoveItem,
  onUpdateQuantity,
  onCheckout
}: OrderSummaryProps) => {
  const formatPrice = (price: number | string) => {
    return Number(price).toFixed(2);
  };

  if (order.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h3 className="text-lg font-medium mb-2">Your order is empty</h3>
        <p className="text-sm text-muted-foreground">
          Add items from the menu to get started
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-grow">
        <div className="space-y-4 p-4">
          {order.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                {item.type === 'meal' && item.meal ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{item.meal.size}</h4>
                        <div className="text-sm text-muted-foreground">
                          <p>Sides: {item.meal.side1?.name}, {item.meal.side2?.name}</p>
                          <p>
                            Entrées: {item.meal.entree1?.name}
                            {item.meal.entree2 && `, ${item.meal.entree2.name}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : item.item ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{item.item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${formatPrice(Number(item.item.price) * (item.item.quantity || 1))}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(index, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span>{item.item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(index, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">Total</span>
          <span className="text-2xl font-bold">${formatPrice(total)}</span>
        </div>
        <Button 
          className="w-full"
          size="lg"
          onClick={onCheckout}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
};

export default OrderSummary;