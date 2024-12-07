// VoiceCommands.ts
import { MenuItem } from '@/types/db.types';
import { MealInProgress } from '@/types/api.types';

export type CommandHandlers = {
  startNewMeal: (size: "bowl" | "plate" | "bigger plate") => void;
  addSimpleItem: (item: MenuItem) => void;
  handleMealUpdate: (item: MenuItem) => void;
  completeMeal: () => void;
  cancelMeal: () => void;
  handleCheckout: () => void;
};

export function extractCommand(transcript: string): string {
  const keywords = [
    'create', 'start', 'add', 'complete', 'finish', 'cancel', 'checkout', 
    'bowl', 'plate', 'bigger plate'
  ];

  const words = transcript.toLowerCase().split(' ');
  const commandStart = words.findIndex(word => keywords.includes(word));
  
  if (commandStart === -1) return '';
  
  return words.slice(commandStart).join(' ');
}

export class VoiceCommandHandler {
  private menuItems: MenuItem[];
  private handlers: CommandHandlers;
  private currentMeal: MealInProgress | null;

  constructor(menuItems: MenuItem[], handlers: CommandHandlers, currentMeal: MealInProgress | null) {
    this.menuItems = menuItems;
    this.handlers = handlers;
    this.currentMeal = currentMeal;
  }

  private findMenuItem(itemName: string): MenuItem | undefined {
    return this.menuItems.find(item => 
      item.name.toLowerCase().includes(itemName.toLowerCase())
    );
  }

  handleCommand(command: string) {
    const words = command.toLowerCase().trim().split(' ');

    // Create new meal commands
    if (command.includes('create') || command.includes('start')) {
      if (command.includes('bowl')) {
        this.handlers.startNewMeal('bowl');
        return;
      }
      if (command.includes('bigger plate')) {
        this.handlers.startNewMeal('bigger plate');
        return;
      }
      if (command.includes('plate')) {
        this.handlers.startNewMeal('plate');
        return;
      }
    }

    // Add item commands
    if (command.includes('add')) {
      const itemName = words.slice(words.indexOf('add') + 1).join(' ');
      const menuItem = this.findMenuItem(itemName);
      
      if (menuItem) {
        if (this.currentMeal) {
          this.handlers.handleMealUpdate(menuItem);
        } else {
          this.handlers.addSimpleItem(menuItem);
        }
        return;
      }
    }

    // Complete meal command
    if (command.includes('complete meal') || command.includes('finish meal')) {
      this.handlers.completeMeal();
      return;
    }

    // Cancel commands
    if (command.includes('cancel meal')) {
      this.handlers.cancelMeal();
      return;
    }

    // Checkout command
    if (command.includes('checkout') || command.includes('check out')) {
      this.handlers.handleCheckout();
      return;
    }
  }
}