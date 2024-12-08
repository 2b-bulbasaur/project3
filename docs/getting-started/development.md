# Development Setup

## Development Server

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build production version
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run test`: Run test suite

## Project Structure
```plaintext
project3/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # React components
│   ├── lib/                    # Utility functions
│   └── types/                  # TypeScript definitions
├── public/                     # Static assets
└── docs/                       # Documentation
```

## Code Style
- We use ESLint and Prettier for code formatting
- TypeScript is used for all components and utility functions
- Components are functional and use hooks