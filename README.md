# Panda Express POS System
---
This repository contains a point of sale system for Panda express.

## Features
- **Multiple interface**
    - Cashier POS interface for easy order entry
    - Manager dashboard includes advanced analytics and management tools
    - Customer self-service kiosk for user-friendly ordering
    - Digital menu board display for dynamic menu updates
- **Tech stack**
    - Frontend: Next.JS 15, React, TypeScript
    - Styling: Tailwind CSS, shadcn UI components
    - Database: PostgreSQL with AWS
    - Authentication: NextAuth and OAuth
    - Deployment: Vercel
- **API Integrations**
    - Weather service API for sales forecasting
    - Google Translate API for multilingual support
    - OAuth for customer loyalty program
- **Accessibility**
    - WCAG 2.0 compliant
    - Screen reader support
    - Keyboard navigation
    - Translatable text
    - Voice commands

## Project Structure
```
project3/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes for backend functionality
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── inventory/      # Inventory management
│   │   │   ├── menu/           # Menu-related endpoints
│   │   │   └── reports/        # Report endpoints
│   │   ├── cashier/            # Cashier interface
│   │   ├── customer/           # Customer kiosk interface
│   │   ├── manager/            # Manager interface
│   │   └── menu-board/         # Digital menu board display
│   ├── components/             # Reusable React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── MealBuilder.tsx     # Meal customization component
│   │   ├── VoiceControl.tsx    # Voice command interface
│   │   └── ...
│   ├── lib/                    # Utility functions and business logic
│   │   ├── db.ts               # Database connections
│   │   ├── auth.ts             # Authentication utilities
│   │   └── ...
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
│   └── images/                 # Menu item images and icons
├── docs/                       # Project documentation
└── ...                         # Configuration files
```

## Installation
To install this project, make sure you have Node.js and Git installed on your machine. We are using Node version 23.
```
git clone https://github.com/2b-bulbasaur/project3.git
cd project3
npm install
```

## Development
```
# Run development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

## Deployment
Deplying on Vercel is as simple as pushing to the main branch, after some initial setup. Vercel will automatically deploy the project. For more information, see the [Vercel documentation](https://vercel.com/docs).