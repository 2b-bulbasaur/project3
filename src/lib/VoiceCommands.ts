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

// Enhanced menu items with common variations and alternate names
const COMMON_MENU_ITEMS = {
  entrees: [
    { name: 'original orange chicken', variations: ['orange', 'orange express'] },
    { name: 'beijing beef', variations: ['beijing'] },
    { name: 'broccoli beef', variations: ['beef broccoli', 'beef and broccoli'] },
    { name: 'kung pao chicken', variations: ['kung pao'] },
    { name: 'mushroom chicken', variations: ['chicken mushroom'] },
    { name: 'black pepper chicken', variations: ['pepper chicken'] },
    { name: 'string bean chicken breast', variations: ['string bean chicken', 'green bean chicken'] },
    { name: 'sweetfire chicken breast', variations: ['sweetfire chicken', 'sweet fire'] },
    { name: 'grilled teriyaki chicken', variations: ['teriyaki chicken', 'teriyaki'] },
    { name: 'honey walnut shrimp', variations: ['walnut shrimp', 'honey shrimp'] },
    {name: 'hot ones blazing bourbon chicken', variations: ['hot ones chicken']},
    {name: 'black pepper sirloin steak', variations: ['black pepper steak']},
    {name: 'honey walnut shrimp', variations: ['honey shrimp', 'shrimp']},
    {name: 'honey sesame chicken', variations: ['sesame chicken']},
    {name: 'mushroom chicken', variations: ['mushroom chicken']},
    {name: 'sweetfire chicken breast', variations: ['sweetfire chicken']},
    {name: 'string bean chicken', variations: [' bean chicken']},
  
    

  ],
  sides: [
    { name: 'chow mein', variations: ['noodles', 'lo mein', 'chinese noodles'] },
    { name: 'fried rice', variations: ['rice'] },
    { name: 'white rice', variations: ['steamed rice', 'plain rice'] },
    { name: 'brown rice', variations: ['whole grain rice'] },
    { name: 'super greens', variations: ['mixed veggies', 'vegetables', 'greens', 'broccoli'] }
  ],
  appetizers: [
    { name: 'chicken egg roll', variations: ['egg roll'] },
    { name: 'veggie spring roll', variations: ['spring roll', 'vegetable roll'] },
    { name: 'apple pie roll', variations: ['apple roll', 'dessert roll'] },
    { name: 'cream cheese rangoon', variations: ['rangoon', 'crab rangoon', 'cheese rangoon'] }
  ],
  drinks: [
    { name: 'Dr. Pepper', variations: ['doctor pepper', 'dr pepper'] },
    { name: 'Coca Cola', variations: ['coke', 'cola'] },
    { name: 'Diet Coke', variations: ['diet cola'] },
    { name: 'Sprite', variations: ['lemon lime soda'] },
    { name: 'Fanta Orange', variations: ['orange soda', 'fanta'] },
    { name: 'Minute Maid Lemonade', variations: ['lemonade'] },
    { name: 'Dasani Water', variations: ['water', 'dasani'] },
    { name: 'Mango Guava Flavored Tea', variations: ['mango tea', 'guava tea'] },
    { name: 'Peach Lychee Flavored Tea', variations: ['peach tea', 'lychee tea'] },
    { name: 'Pineapple Flavored Tea', variations: ['pineapple tea'] },
    { name: 'Watermelon Mango Flavored Tea', variations: ['watermelon tea'] }
  ]
} as const;

export function extractCommand(transcript: string): string {
  const keywords = [
    'create', 'start', 'add', 'complete', 'finish', 'cancel', 'checkout', 
    'bowl', 'plate', 'bigger plate', 'remove', 'delete', 'promo'
  ];

  const words = transcript.toLowerCase().split(' ');
  const commandStart = words.findIndex(word => {
    if (word === 'and') return false;
    return keywords.includes(word) || 
           keywords.some(keyword => word.includes(keyword));
  });
  
  if (commandStart === -1) return '';
  
  const command = words.slice(commandStart).join(' ');
  console.log('Extracted command:', command);
  return command;
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
        pattern: /^(create|start|make|begin|give me)(?:\s+a)?(?:\s+new)?\s+(bowl|plate|bigger plate)$/i,
        action: (matches) => {
          const size = matches[2] as "bowl" | "plate" | "bigger plate";
          console.log('Starting new meal:', size);
          this.handlers.startNewMeal(size);
        },
        example: "create bowl" 
      },
      {
        pattern: /^add\s+(?:some\s+|a\s+|an\s+)?(.+?)(?:\s+and\s+(?:some\s+|a\s+|an\s+)?(.+))?$/i,
        action: (matches) => {
          console.log('Add command matches:', matches);
          const firstItem = matches[1].trim();
          this.handleAddItem(firstItem);

          if (matches[2]) {
            const secondItem = matches[2].trim();
            this.handleAddItem(secondItem);
          }
        },
        example: "add orange chicken and super greens"
      },
      {
        pattern: /^(complete|finish|done with|end)\s+(?:the\s+)?meal$/i,
        action: () => {
          console.log('Completing meal');
          this.handlers.completeMeal();
        },
        example: "complete meal"
      },
      {
        pattern: /^(cancel|stop|remove|delete)\s+(?:the\s+)?meal$/i,
        action: () => {
          console.log('Canceling meal');
          this.handlers.cancelMeal();
        },
        example: "cancel meal"
      },
      {
        pattern: /^(checkout|check\s*out|pay|finish order|complete order)$/i,
        action: () => {
          console.log('Initiating checkout');
          this.handlers.handleCheckout();
        },
        example: "checkout"
      },
      {
        pattern: /^(?:use\s+|apply\s+)?promo\s+code\s+(.+)$/i,
        action: (matches) => this.handlers.validatePromoCode(matches[1]),
        example: "promo code PANDA20"
      }
    ];
  }

  private handleAddItem(itemName: string) {
    console.log('Attempting to add item:', itemName);
    const menuItem = this.findMenuItem(itemName);
    
    if (!menuItem) {
      console.error('Menu item not found:', itemName);
      throw new Error(`Sorry, I couldn't find "${itemName}" in the menu. Try saying the exact item name.`);
    }

    console.log('Found menu item:', menuItem);
    
    if (this.currentMeal) {
      console.log('Adding to current meal:', menuItem.name);
      this.handlers.handleMealUpdate(menuItem);
    } else {
      console.log('Adding as simple item:', menuItem.name);
      this.handlers.addSimpleItem(menuItem);
    }
  }

  private findMenuItem(itemName: string): MenuItem | undefined {
    console.log('Searching for menu item:', itemName);
    const normalizedSearchName = itemName.toLowerCase().trim();
    
    // First try exact match
    const exactMatch = this.menuItems.find(
      item => item.name.toLowerCase() === normalizedSearchName
    );
    if (exactMatch) {
      console.log('Found exact match:', exactMatch.name);
      return exactMatch;
    }

    // Handle common variations and partial matches
    for (const category of Object.values(COMMON_MENU_ITEMS)) {
      for (const item of category) {
        const variations = Array.isArray(item) ? [item] : 
                         typeof item === 'string' ? [item] :
                         [item.name, ...(item.variations || [])];
        
        for (const variation of variations) {
          const variationText = typeof variation === 'string' ? variation : variation.name;
          if (variationText.toLowerCase() === normalizedSearchName) {
            const match = this.menuItems.find(
              menuItem => menuItem.name.toLowerCase() === 
                (typeof item === 'string' ? item : item.name).toLowerCase()
            );
            if (match) {
              console.log('Found match through variation:', match.name);
              return match;
            }
          }
        }
      }
    }

    // Try partial matches as a last resort
    const partialMatch = this.menuItems.find(item =>
      item.name.toLowerCase().includes(normalizedSearchName) ||
      normalizedSearchName.includes(item.name.toLowerCase())
    );

    if (partialMatch) {
      console.log('Found partial match:', partialMatch.name);
      return partialMatch;
    }

    console.log('No menu item found for:', itemName);
    return undefined;
  }

  handleCommand(command: string) {
    console.log('Received raw command:', command);
    const normalizedCommand = command.toLowerCase().trim();
    console.log('Normalized command:', normalizedCommand);
    this.addToHistory(normalizedCommand);

    // Try to match command against patterns
    for (const { pattern, action } of this.commandPatterns) {
      const matches = normalizedCommand.match(pattern);
      console.log('Testing pattern:', pattern);
      if (matches) {
        console.log('Matched pattern:', pattern);
        console.log('Matches:', matches);
        try {
          action(matches);
          return;
        } catch (error) {
          console.error(`Error executing command "${command}":`, error);
          throw new Error(error instanceof Error ? error.message : 'Unrecognized command');
        }
      }
    }

    // Handle compound commands with "and"
    if (normalizedCommand.includes(' and ')) {
      const items = normalizedCommand.split(' and ').map(item => item.trim());
      console.log('Split items:', items);
      
      if (items[0].startsWith('add')) {
        try {
          items.forEach(item => {
            const cleanItem = item.replace(/^add\s+/, '').trim();
            console.log('Processing item:', cleanItem);
            this.handleAddItem(cleanItem);
          });
          return;
        } catch (error) {
          console.error('Error processing multiple items:', error);
          throw error;
        }
      }
    }

    // Provide helpful feedback for unrecognized commands
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