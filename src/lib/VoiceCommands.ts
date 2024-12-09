import { MenuItem } from '@/types/db.types';
import { MealInProgress } from '@/types/api.types';

export type CommandHandlers = {
  startNewMeal: (size: "bowl" | "plate" | "bigger plate") => void;
  addSimpleItem: (item: MenuItem) => void;
  handleMealUpdate: (item: MenuItem) => void;
  completeMeal: () => void;
  cancelMeal: () => void;
  handleCheckout: () => void;
  validatePromoCode: (code: string) => void;
};

const COMMAND_COOLDOWN = 1000; // 1 second cooldown between commands

const COMMON_MENU_ITEMS = {
  sides: [
    { 
      name: 'Super Greens',
      aliases: ['super greens', 'greens', 'vegetables', 'mixed veggies']
    },
    { 
      name: 'Chow Mein',
      aliases: ['chow mein', 'noodles', 'lo mein']
    },
   
  ],
  entrees: [
    {
      name: 'Orange Chicken',
      aliases: ['orange chicken', 'orange']
    },

  ]
};

export function extractCommand(transcript: string): string {
  console.log('Extracting command from:', transcript);
  const normalizedTranscript = transcript.toLowerCase().trim();

  if (normalizedTranscript.match(/^(create|make|start)\s+(bowl|plate|bigger plate)$/i)) {
    return normalizedTranscript;
  }

  if (normalizedTranscript.startsWith('add ')) {
    return normalizedTranscript;
  }

  if (normalizedTranscript.match(/^(complete|finish|done|cancel|checkout|check\s*out)(?:\s+.*)?$/i)) {
    return normalizedTranscript;
  }

  console.log('No command pattern matched');
  return '';
}

export class VoiceCommandHandler {
  private menuItems: MenuItem[];
  private handlers: CommandHandlers;
  private currentMeal: MealInProgress | null;
  private lastCommandTime: number = 0;

  constructor(menuItems: MenuItem[], handlers: CommandHandlers, currentMeal: MealInProgress | null) {
    this.menuItems = menuItems;
    this.handlers = handlers;
    this.currentMeal = currentMeal;
  }

  private checkCooldown(): boolean {
    const now = Date.now();
    if (now - this.lastCommandTime < COMMAND_COOLDOWN) {
      return false;
    }
    this.lastCommandTime = now;
    return true;
  }

  private findMenuItem(itemName: string): MenuItem | undefined {
    console.log('Finding menu item:', itemName);
    const normalizedName = itemName.toLowerCase().trim();
    
    const exactMatch = this.menuItems.find(item => 
      item.name.toLowerCase() === normalizedName
    );
    if (exactMatch) {
      console.log('Found exact match:', exactMatch.name);
      return exactMatch;
    }

    let itemAlias = '';
    for (const side of COMMON_MENU_ITEMS.sides) {
      if (side.aliases.some(alias => normalizedName.includes(alias))) {
        itemAlias = side.name;
        break;
      }
    }
    if (!itemAlias) {
      for (const entree of COMMON_MENU_ITEMS.entrees) {
        if (entree.aliases.some(alias => normalizedName.includes(alias))) {
          itemAlias = entree.name;
          break;
        }
      }
    }

    if (itemAlias) {
      const menuItem = this.menuItems.find(item => 
        item.name.toLowerCase() === itemAlias.toLowerCase()
      );
      if (menuItem) {
        console.log('Found match through alias:', menuItem.name);
        return menuItem;
      }
    }

    const partialMatch = this.menuItems.find(item => {
      const itemNameLower = item.name.toLowerCase();
      return itemNameLower.includes(normalizedName) || normalizedName.includes(itemNameLower);
    });

    if (partialMatch) {
      console.log('Found partial match:', partialMatch.name);
      return partialMatch;
    }

    console.log('No menu item match found');
    return undefined;
  }

  handleCommand(command: string): void {
    console.log('Handling command:', command);
    if (!this.checkCooldown()) {
      console.log('Command ignored due to cooldown');
      return;
    }

    const normalizedCommand = command.toLowerCase().trim();
    
    if (normalizedCommand.length < 3) {
      throw new Error('Command too short');
    }

    try {
      const createMealMatch = normalizedCommand.match(/^(?:create|start|make)\s+(bowl|plate|bigger plate)$/i);
      if (createMealMatch) {
        const size = createMealMatch[1] as "bowl" | "plate" | "bigger plate";
        console.log('Creating meal:', size);
        this.handlers.startNewMeal(size);
        return;
      }

      const addItemMatch = normalizedCommand.match(/^add\s+(.+)$/i);
      if (addItemMatch) {
        const itemName = addItemMatch[1];
        console.log('Looking for item:', itemName);
        const menuItem = this.findMenuItem(itemName);
        if (!menuItem) {
          throw new Error(`Item "${itemName}" not found. Try being more specific.`);
        }

        console.log('Found menu item:', menuItem.name);
        if (this.currentMeal) {
          console.log('Adding to current meal:', menuItem.name);
          this.handlers.handleMealUpdate(menuItem);
        } else {
          console.log('Adding as simple item:', menuItem.name);
          this.handlers.addSimpleItem(menuItem);
        }
        return;
      }

      if (normalizedCommand.match(/^(?:complete|finish|done)\s+(?:the\s+)?meal$/i)) {
        console.log('Completing meal');
        this.handlers.completeMeal();
        return;
      }

      if (normalizedCommand.match(/^(?:cancel|stop)\s+(?:the\s+)?meal$/i)) {
        console.log('Canceling meal');
        this.handlers.cancelMeal();
        return;
      }

      if (normalizedCommand.match(/^(?:checkout|check\s*out)$/i)) {
        console.log('Processing checkout');
        this.handlers.handleCheckout();
        return;
      }

      console.log('No matching command pattern');
      throw new Error(
        'Unrecognized command. Try commands like:\n' +
        '- "create bowl"\n' +
        '- "add super greens"\n' +
        '- "complete meal"\n' +
        '- "checkout"'
      );
    } catch (error) {
      console.error('Error processing command:', error);
      throw error;
    }
  }
}