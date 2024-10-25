import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { MealInProgress, MenuItem, SizeEnum } from '@/types';

interface MealBuilderProps {
  size: SizeEnum;
  meal: MealInProgress;
  menuItems: MenuItem[];
  onUpdateMeal: (item: MenuItem) => void;
  onComplete: () => void;
}

export const MealBuilder = ({ size, meal, menuItems, onUpdateMeal, onComplete }: MealBuilderProps) => {
  const getProgress = () => {
    const total = size === 'bowl' ? 3 : 4; // bowl needs 3 items, others need 4
    const filled = [meal.side1, meal.side2, meal.entree1, meal.entree2]
      .filter(Boolean).length;
    return (filled / total) * 100;
  };

  const getRequiredItems = () => {
    const remaining = [];
    if (!meal.side1) remaining.push('first side');
    if (!meal.side2) remaining.push('second side');
    if (!meal.entree1) remaining.push('first entrée');
    if (size !== 'bowl' && !meal.entree2) remaining.push('second entrée');
    return remaining;
  };

  const formatPrice = (price: number | string) => {
    return Number(price).toFixed(2);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Progress value={getProgress()} className="w-full" />
        {getRequiredItems().length > 0 && (
          <Alert>
            <AlertDescription>
              Please select your {getRequiredItems().join(', ')}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Sides</h3>
            <ScrollArea className="h-48">
              <div className="grid grid-cols-1 gap-2">
                {menuItems
                  .filter(item => item.item_type === 'side')
                  .map(item => (
                    <Button
                      key={item.id}
                      variant={meal.side1?.id === item.id || meal.side2?.id === item.id 
                        ? "default" 
                        : "outline"}
                      className="w-full justify-start h-auto py-2"
                      onClick={() => onUpdateMeal(item)}
                    >
                      <div className="flex justify-between w-full">
                        <span>{item.name}</span>
                        <span>${formatPrice(item.price)}</span>
                      </div>
                    </Button>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Entrées</h3>
            <ScrollArea className="h-48">
              <div className="grid grid-cols-1 gap-2">
                {menuItems
                  .filter(item => item.item_type === 'entree')
                  .map(item => (
                    <Button
                      key={item.id}
                      variant={meal.entree1?.id === item.id || meal.entree2?.id === item.id 
                        ? "default" 
                        : "outline"}
                      className="w-full justify-start h-auto py-2"
                      onClick={() => onUpdateMeal(item)}
                    >
                      <div className="flex justify-between w-full">
                        <span>{item.name}</span>
                        <span>${formatPrice(item.price)}</span>
                      </div>
                    </Button>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div className="space-y-1 text-sm">
          {meal.side1 && <div>Side 1: {meal.side1.name}</div>}
          {meal.side2 && <div>Side 2: {meal.side2.name}</div>}
          {meal.entree1 && <div>Entrée 1: {meal.entree1.name}</div>}
          {meal.entree2 && <div>Entrée 2: {meal.entree2.name}</div>}
        </div>
        <Button 
          onClick={onComplete}
          disabled={getProgress() < 100}
        >
          Add to Order
        </Button>
      </div>
    </div>
  );
};

export default MealBuilder;