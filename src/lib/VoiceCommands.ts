import { useRouter } from 'next/router';

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

const DEBUG = true;

const log = {
  debug: (...args: any[]) => {
    if (DEBUG) console.log('%c[VoiceCommand]', 'color: #4CAF50', ...args);
  },
  error: (...args: any[]) => {
    if (DEBUG) console.error('%c[VoiceCommand Error]', 'color: #f44336', ...args);
  },
  info: (...args: any[]) => {
    if (DEBUG) console.info('%c[VoiceCommand Info]', 'color: #2196F3', ...args);
  }
};

const COMMON_MENU_ITEMS = {
  entrees: [
    { 
      name: 'The Original Orange Chicken',
      variations: ['orange chicken', 'orange', 'orange express', 'original orange']
    },
    { 
      name: 'Hot Ones Blazing Bourbon Chicken',
      variations: ['hot ones chicken', 'bourbon chicken', 'blazing chicken', 'hot ones']
    },
    { 
      name: 'Black Pepper Sirloin Steak',
      variations: ['sirloin steak', 'pepper steak', 'black pepper steak']
    },
    { 
      name: 'Honey Walnut Shrimp',
      variations: ['walnut shrimp', 'honey shrimp']
    },
    { 
      name: 'Grilled Teriyaki Chicken',
      variations: ['teriyaki chicken', 'teriyaki']
    },
    { 
      name: 'Broccoli Beef',
      variations: ['beef broccoli', 'beef and broccoli']
    },
    { 
      name: 'Kung Pao Chicken',
      variations: ['kung pao']
    },
    { 
      name: 'Honey Sesame Chicken Breast',
      variations: ['sesame chicken', 'honey sesame']
    },
    { 
      name: 'Beijing Beef',
      variations: ['beijing']
    },
    { 
      name: 'Mushroom Chicken',
      variations: ['chicken mushroom']
    },
    { 
      name: 'SweetFire Chicken Breast',
      variations: ['sweetfire chicken', 'sweet fire']
    },
    { 
      name: 'String Bean Chicken Breast',
      variations: ['string bean chicken', 'green bean chicken', 'bean chicken']
    },
    { 
      name: 'Black Pepper Chicken',
      variations: ['pepper chicken']
    },
    {
      name: 'super chicken chicken',
      variations: ['super chicken']
    }
  ],
  sides: [
    { 
      name: 'Super Greens',
      variations: ['mixed veggies', 'vegetables', 'greens', 'broccoli']
    },
    { 
      name: 'Chow Mein',
      variations: ['noodles', 'lo mein', 'chinese noodles']
    },
    { 
      name: 'Fried Rice',
      variations: ['rice']
    },
    { 
      name: 'White Rice',
      variations: ['steamed rice', 'plain rice']
    }
  ],
  appetizers: [
    { 
      name: 'Chicken Egg Roll',
      variations: ['egg roll']
    },
    { 
      name: 'Veggie Spring Roll',
      variations: ['spring roll', 'vegetable roll']
    },
    { 
      name: 'Cream Cheese Rangoon',
      variations: ['rangoon', 'crab rangoon', 'cheese rangoon']
    },
    { 
      name: 'Apple Pie Roll',
      variations: ['apple roll', 'dessert roll']
    }
  ],
  drinks: [
    { 
      name: 'Dr Pepper',
      variations: ['doctor pepper', 'pepper']
    },
    { 
      name: 'Coca Cola',
      variations: ['coke', 'cola']
    },
    { 
      name: 'Diet Coke',
      variations: ['diet cola']
    },
    { 
      name: 'Mango Guava Flavored Tea',
      variations: ['mango tea', 'guava tea']
    },
    { 
      name: 'Peach Lychee Flavored Refresher',
      variations: ['peach refresher', 'lychee refresher']
    },
    { 
      name: 'Pomegranate Pineapple Flavored Lemonade',
      variations: ['pomegranate lemonade', 'pineapple lemonade']
    },
    { 
      name: 'Watermelon Mango Flavored Refresher',
      variations: ['watermelon refresher', 'mango refresher']
    },
    { 
      name: 'Fanta Orange',
      variations: ['orange soda', 'fanta']
    },
    { 
      name: 'Minute Maid Lemonade',
      variations: ['lemonade']
    },
    { 
      name: 'Powerade Mountain Berry Blast',
      variations: ['mountain berry', 'powerade berry']
    },
    { 
      name: 'Sprite',
      variations: ['lemon lime soda']
    },
    { 
      name: 'Coca Cola Cherry',
      variations: ['cherry coke']
    },
    { 
      name: 'Fuze Raspberry Iced Tea',
      variations: ['raspberry tea', 'fuze tea']
    },
    { 
      name: 'Powerade Fruit Punch',
      variations: ['fruit punch']
    },
    { 
      name: 'Dasani',
      variations: ['water', 'dasani water']
    },
    { 
      name: 'Minute Maid Apple Juice',
      variations: ['apple juice']
    },
    { 
      name: 'Coke Mexico',
      variations: ['mexican coke']
    },
    { 
      name: 'Coke Zero',
      variations: ['zero coke']
    },
    { 
      name: 'Smartwater',
      variations: ['smart water']
    },
    { 
      name: 'Boba',
      variations: ['bubble tea', 'boba tea']
    }
  ],
  other: [
    {
      name: 'Strawberry Ice Cream',
      variations: ['strawberry']
    },
    {
      name: 'Chocolate Ice Cream',
      variations: ['chocolate']
    },
    {
      name: 'A La Carte Fortune Cookie',
      variations: ['fortune cookie']
    }
  ]
} as const;

export function extractCommand(transcript: string): string {
  const normalizedTranscript = transcript.toLowerCase().trim();

  const keywords = [
    'create', 'start', 'add', 'complete', 'finish', 'cancel', 'checkout', 'check out',
    'bowl', 'plate', 'bigger plate', 'remove', 'delete', 'promo'
  ];

  const words = normalizedTranscript.split(' ');
  const commandStart = words.findIndex(word => {
    if (word === 'and') return false;
    return keywords.includes(word) || 
           keywords.some(keyword => word.includes(keyword));
  });

  if (commandStart !== -1) {
    const command = words.slice(commandStart).join(' ');
    log.debug('Extracted command:', command);
    return command;
  }

  for (let i = words.length - 1; i >= 0; i--) {
    if (keywords.includes(words[i])) {
      const command = words.slice(i).join(' ');
      log.debug('Extracted command:', command);
      return command;
    }
  }

  for (const keyword of keywords) {
    if (normalizedTranscript.includes(keyword)) {
      log.debug("Matched Command:", keyword);
      return keyword === "check out" ? "checkout" : keyword;
    }
  }

  log.debug('No command keywords found');
  return '';
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
    log.info('VoiceCommandHandler initialized with', menuItems.length, 'menu items');
  }

  private initializeCommandPatterns() {
    this.commandPatterns = [
      {
        pattern: /^(create|start|make|begin|give me)(?:\s+a)?(?:\s+new)?\s+(bowl|plate|bigger plate)$/i,
        action: (matches) => {
          const size = matches[2] as "bowl" | "plate" | "bigger plate";
          log.debug('Starting new meal:', size);
          this.handlers.startNewMeal(size);
        },
        example: "create bowl" 
      },
      {
        pattern: /^add\s+(?:some\s+|a\s+|an\s+)?(.+?)(?:\s+and\s+(?:some\s+|a\s+|an\s+)?(.+))?$/i,
        action: (matches) => {
          log.debug('Add command matches:', matches);
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
          log.debug('Completing meal');
          this.handlers.completeMeal();
        },
        example: "complete meal"
      },
      {
        pattern: /^(cancel|stop|remove|delete)\s+(?:the\s+)?meal$/i,
        action: () => {
          log.debug('Canceling meal');
          this.handlers.cancelMeal();
        },
        example: "cancel meal"
      },
      {
        pattern: /^(checkout|check\s*out|pay|finish order|complete order)$/i,
        action: () => {
          log.debug('Initiating checkout');
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
    log.info('Command patterns initialized');
  }

  private handleAddItem(itemName: string) {
    log.debug('=== Attempting to add item ===');
    log.debug('Item name:', itemName);
    const menuItem = this.findMenuItem(itemName);
    
    if (!menuItem) {
      log.error('Menu item not found:', itemName);
      throw new Error(`Sorry, I couldn't find "${itemName}" in the menu. Try saying the exact item name.`);
    }

    log.info('Found menu item:', menuItem.name);
    
    if (this.currentMeal) {
      log.debug('Adding to current meal:', menuItem.name);
      this.handlers.handleMealUpdate(menuItem);
    } else {
      log.debug('Adding as simple item:', menuItem.name);
      this.handlers.addSimpleItem(menuItem);
    }
  }

  private findMenuItem(itemName: string): MenuItem | undefined {
    log.debug('=== Starting item search ===');
    log.debug('Looking for:', itemName);
    
    const normalizeString = (str: string) => 
      str.toLowerCase()
         .replace(/[^\w\s]/g, '') // Remove special characters
         .replace(/\s+/g, ' ')    // Normalize spaces
         .trim();

    const normalizedSearchName = normalizeString(itemName);
    
    const exactMatch = this.menuItems.find(item => {
      const isMatch = normalizeString(item.name) === normalizedSearchName;
      log.debug('Checking exact match:', item.name, isMatch ? '✓' : '✗');
      return isMatch;
    });
    
    if (exactMatch) {
      log.info('Found exact match:', exactMatch.name);
      return exactMatch;
    }

    for (const category of Object.values(COMMON_MENU_ITEMS)) {
      for (const menuItem of category) {
        log.debug('Checking variations for:', menuItem.name);
        
        const databaseItem = this.menuItems.find(
          item => normalizeString(item.name) === normalizeString(menuItem.name)
        );
        
        if (databaseItem) {
          const allNames = [menuItem.name, ...menuItem.variations].map(normalizeString);
          for (const name of allNames) {
            const isMatch = name === normalizedSearchName;
            log.debug('Checking variation:', name, isMatch ? '✓' : '✗');
            if (isMatch) {
              log.info('Found match through variation:', databaseItem.name);
              return databaseItem;
            }
          }
        }
      }
    }

    log.debug('Trying partial matches');
    const partialMatch = this.menuItems.find(item => {
      const normalizedItem = normalizeString(item.name);
      const isMatch = normalizedItem.includes(normalizedSearchName) ||
                     normalizedSearchName.includes(normalizedItem);
      log.debug('Checking partial match:', item.name, isMatch ? '✓' : '✗');
      return isMatch;
    });

    if (partialMatch) {
      log.info('Found partial match:', partialMatch.name);
      return partialMatch;
    }

    log.error('No matches found for:', itemName);
    return undefined;
  }

  handleCommand(command: string) {
    log.debug('Received raw command:', command);
    const normalizedCommand = command.toLowerCase().trim();
    log.debug('Normalized command:', normalizedCommand);
    this.addToHistory(normalizedCommand);

    for (const { pattern, action } of this.commandPatterns) {
      const matches = normalizedCommand.match(pattern);
      log.debug('Testing pattern:', pattern);
      if (matches) {
        log.info('Matched pattern:', pattern, 'Matches:', matches);
        try {
          action(matches);
          return;
        } catch (error) {
          log.error(`Error executing command "${command}":`, error);
          throw new Error(error instanceof Error ? error.message : 'Unrecognized command');
        }
      }
    }

    if (normalizedCommand.includes(' and ')) {
      const items = normalizedCommand.split(' and ').map(item => item.trim());
      log.debug('Split items:', items);
      
      if (items[0].startsWith('add')) {
        try {
          items.forEach(item => {
            const cleanItem = item.replace(/^add\s+/, '').trim();
            log.debug('Processing item:', cleanItem);
            this.handleAddItem(cleanItem);
          });
          return;
        } catch (error) {
          log.error('Error processing multiple items:', error);
          throw error;
        }
      }
    }

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
    log.debug('Command added to history. Current history:', this.commandHistory);
  }

  getLastCommand(): string | undefined {
    return this.commandHistory[0];
  }

  getCommandHistory(): string[] {
    return [...this.commandHistory];
  }
}