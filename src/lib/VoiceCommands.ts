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

type CommandPattern = {
  pattern: RegExp;
  action: (matches: RegExpMatchArray) => void;
  example: string;
};

const COMMON_MENU_ITEMS = {
  entrees: ['orange chicken', 'beijing beef', 'broccoli beef', 'kung pao chicken', 
    'mushroom chicken', 'black pepper chicken', 'string bean chicken breast', 
    'sweetfire chicken breast', 'grilled teriyaki chicken', 'honey walnut shrimp'],
  sides: ['chow mein', 'fried rice', 'white rice', 'brown rice', 'super greens'],
  appetizers: ['chicken egg roll', 'veggie spring roll', 'apple pie roll', 'cream cheese rangoon'],
  drinks: ['Dr. Pepper', 'Coca Cola', 'Diet Coke', 'Mango Guava Flavored Tea', 'Peach Lychee Flavored Tea', 'Pineapple Flavored Tea', 'Watermelon Mango Flavored Tea', 'Fanta Orange', 'Minute Maid Lemonade', 'Powerade Mountain Berry Blast', 'Sprite', 'Dasani Water', 'Coca Cola Cherry', 'Fuze Raspberry Tea', 'Powerade Fruit Punch', 'Minute Maid Apple Juice', 'Dasani', 'Honest Kids Super Fruit Punch', 'Coke Mexico', 'Coke Zero', 'Boba', 'Smartwater'],
} as const;

export function extractCommand(transcript: string): string {
  const keywords = [
    'create', 'start', 'add', 'complete', 'finish', 'cancel', 'checkout', 
    'bowl', 'plate', 'bigger plate', 'remove', 'delete', 'promo'
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
  private commandHistory: string[] = [];
  private readonly MAX_HISTORY = 10;
  private commandPatterns: CommandPattern[] = [];

  constructor(menuItems: MenuItem[], handlers: CommandHandlers, currentMeal: MealInProgress | null) {
    this.menuItems = menuItems;
    this.handlers = handlers;
    this.currentMeal = currentMeal;
    this.initializeCommandPatterns();
  }

  private initializeCommandPatterns() {
    this.commandPatterns = [
      {
        pattern: /^(create|start)\s+(bowl|plate|bigger plate)$/,
        action: (matches) => this.handlers.startNewMeal(matches[2] as "bowl" | "plate" | "bigger plate"),
        example: "create bowl" 
      },
      {
        pattern: /^add\s+(.+)$/,
        action: (matches) => this.handleAddItem(matches[1]),
        example: "add orange chicken"
      },
      {
        pattern: /^(complete|finish)\s+meal$/,
        action: () => this.handlers.completeMeal(),
        example: "complete meal"
      },
      {
        pattern: /^cancel\s+meal$/,
        action: () => this.handlers.cancelMeal(),
        example: "cancel meal"
      },
      {
        pattern: /^(checkout|check out)$/,
        action: () => this.handlers.handleCheckout(),
        example: "checkout"
      },
      {
        pattern: /^promo\s+code\s+(.+)$/,
        action: (matches) => this.handlers.validatePromoCode(matches[1]),
        example: "promo code PANDA20"
      }
    ];
  }

  private handleAddItem(itemName: string) {
    const menuItem = this.findMenuItem(itemName);
    if (!menuItem) {
      throw new Error(`Sorry, I couldn't find "${itemName}" in the menu. Try saying the exact item name.`);
    }

    if (this.currentMeal) {
      this.handlers.handleMealUpdate(menuItem);
    } else {
      this.handlers.addSimpleItem(menuItem);
    }
  }

  private findMenuItem(itemName: string): MenuItem | undefined {
    const normalizedSearchName = itemName.toLowerCase().trim();
    
    // First try exact match
    const exactMatch = this.menuItems.find(
      item => item.name.toLowerCase() === normalizedSearchName
    );
    if (exactMatch) return exactMatch;

    // Then try for common variations
    const commonVariations = this.getCommonVariations(normalizedSearchName);
    for (const variation of commonVariations) {
      const match = this.menuItems.find(
        item => item.name.toLowerCase() === variation
      );
      if (match) return match;
    }

    // Finally try partial match
    return this.menuItems.find(item => 
      item.name.toLowerCase().includes(normalizedSearchName)
    );
  }

  private getCommonVariations(itemName: string): string[] {
    const variations: string[] = [];
    for (const [category, items] of Object.entries(COMMON_MENU_ITEMS)) {
        // Check if the input is a partial match for any item
        const matchedItem = items.find(item => 
          item.toLowerCase().includes(itemName.toLowerCase()) ||
          itemName.toLowerCase().includes(item.toLowerCase())
        );
        if (matchedItem) variations.push(matchedItem);
      }


    
    // Handle common shortcuts
    if (itemName === 'orange') variations.push('orange chicken');
    if (itemName === 'beijing') variations.push('beijing beef');
    if (itemName === 'kung pao') variations.push('kung pao chicken');
    if (itemName === 'teriyaki') variations.push('grilled teriyaki chicken');
    if (itemName === 'chow mein') variations.push('chow mein');
    if (itemName === 'fried rice') variations.push('fried rice');
    
    return variations;
  }

  handleCommand(command: string) {
    const normalizedCommand = command.toLowerCase().trim();
    this.addToHistory(normalizedCommand);

    // Try to match command against patterns
    for (const { pattern, action } of this.commandPatterns) {
      const matches = normalizedCommand.match(pattern);
      if (matches) {
        try {
          action(matches);
          return;
        } catch (error) {
          console.error(`Error executing command "${command}":`, error);
          throw new Error(error instanceof Error ? error.message : 'Unrecognized command');
        }
      }
    }

    // If no pattern matched, provide helpful feedback
    if (normalizedCommand.includes('add')) {
      throw new Error('Item not found. Try saying the complete item name, for example "add orange chicken"');
    }

    throw new Error(`I didn't understand that command. Try commands like "create bowl", "add orange chicken", or "checkout"`);
  }

  private addToHistory(command: string) {
    this.commandHistory.unshift(command);
    if (this.commandHistory.length > this.MAX_HISTORY) {
      this.commandHistory.pop();
    }
  }

  getLastCommand(): string | undefined {
    return this.commandHistory[0];
  }

  getCommandHistory(): string[] {
    return [...this.commandHistory];
  }
}