import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle } from 'lucide-react';
import Image from 'next/image';
import type { MealInProgress, MenuItem, SizeEnum } from '@/types';

interface MealBuilderProps {
  size: SizeEnum;
  meal: MealInProgress;
  menuItems: MenuItem[];
  onUpdateMeal: (item: MenuItem) => void;
  onComplete: () => void;
  onCancel: () => void;
}

export const MealBuilder = ({ 
  size, 
  meal, 
  menuItems, 
  onUpdateMeal, 
  onComplete,
  onCancel 
}: MealBuilderProps) => {
  const getMealRequirements = () => {
    switch (size) {
      case 'bowl':
        return { sides: 1, entrees: 1 };
      case 'plate':
        return { sides: 1, entrees: 2 };
      case 'bigger plate':
        return { sides: 2, entrees: 3 };
      default:
        return { sides: 1, entrees: 1 };
    }
  };

  const getProgress = () => {
    const requirements = getMealRequirements();
    let filled = 0;
    const total = requirements.sides + requirements.entrees;

    // Count sides
    if (requirements.sides === 1) {
      if (meal.side1) filled++;
    } else {
      if (meal.side1) filled++;
      if (meal.side2) filled++;
    }

    // Count entrees
    if (meal.entree1) filled++;
    if (requirements.entrees >= 2 && meal.entree2) filled++;
    if (requirements.entrees >= 3 && meal.entree3) filled++;

    return (filled / total) * 100;
  };

  const getRequiredItems = () => {
    const requirements = getMealRequirements();
    const remaining = [];

    if (requirements.sides === 1) {
      if (!meal.side1) remaining.push('side');
    } else {
      if (!meal.side1) remaining.push('first side');
      if (!meal.side2) remaining.push('second side');
    }

    if (!meal.entree1) remaining.push('first entrée');
    if (requirements.entrees >= 2 && !meal.entree2) remaining.push('second entrée');
    if (requirements.entrees >= 3 && !meal.entree3) remaining.push('third entrée');

    return remaining;
  };

  const formatPrice = (price: number | string) => {
    return Number(price).toFixed(2);
  };

  const getMealDescription = () => {
    const requirements = getMealRequirements();
    return `${size} (${requirements.sides} side${requirements.sides > 1 ? 's' : ''}, ${requirements.entrees} entrée${requirements.entrees > 1 ? 's' : ''})`;
  };

  const isSideDisabled = (item: MenuItem) => {
    const requirements = getMealRequirements();
    if (requirements.sides === 1) {
      return meal.side1 !== null && meal.side1.id !== item.id;
    }
    return meal.side1 !== null && meal.side2 !== null && 
           meal.side1.id !== item.id && meal.side2.id !== item.id;
  };

  const isEntreeDisabled = (item: MenuItem) => {
    if (size === 'bowl') {
      return meal.entree1 !== null && meal.entree1.id !== item.id;
    }
    if (size === 'plate') {
      return meal.entree1 !== null && meal.entree2 !== null && 
             meal.entree1.id !== item.id && meal.entree2.id !== item.id;
    }
    return meal.entree1 !== null && meal.entree2 !== null && meal.entree3 !== null &&
           meal.entree1.id !== item.id && meal.entree2.id !== item.id && 
           meal.entree3.id !== item.id;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{getMealDescription()}</h2>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onCancel}
          className="gap-2"
        >
          <XCircle className="h-4 w-4" />
          Cancel Meal
        </Button>
      </div>

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
        <Card className="h-[600px]">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Sides</h3>
            <ScrollArea className="h-[550px]">
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
                      disabled={isSideDisabled(item)}
                    >
                      <div className="flex flex-col items-center w-full gap-2">
                        <Image
                          src={`/images/${item.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                          alt={item.name}
                          width={500}
                          height={224}
                          className="w-full h-56 object-cover rounded-md"
                        />                        
                        
                        <div className="flex justify-between w-full">
                          <span>{item.name}</span>
                          <span>${formatPrice(item.price)}</span>
                        </div>
                      </div>
                      
                    </Button>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="h-[600px]">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Entrées</h3>
            <ScrollArea className="h-[550px]">
              <div className="grid grid-cols-1 gap-2">
                {menuItems
                  .filter(item => item.item_type === 'entree')
                  .map(item => (
                    <Button
                      key={item.id}
                      variant={
                        meal.entree1?.id === item.id || 
                        meal.entree2?.id === item.id ||
                        meal.entree3?.id === item.id
                          ? "default" 
                          : "outline"
                      }
                      className="w-full justify-start h-auto py-2"
                      onClick={() => onUpdateMeal(item)}
                      disabled={isEntreeDisabled(item)}
                    >
                    <div className="flex flex-col items-center w-full gap-2">
                      <Image
                        src={`/images/${item.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                        alt={item.name}
                        width={500}
                        height={224}
                        className="w-full h-56 object-cover rounded-md"
                      />
                      
                      <div className="flex justify-between w-full">
                        <span>{item.name}</span>
                        <span>${formatPrice(item.price)}</span>
                      </div>
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
          {meal.entree3 && <div>Entrée 3: {meal.entree3.name}</div>}
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