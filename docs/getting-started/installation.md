# Installation Guide

## Prerequisites
- Node.js (v23 or higher)
- Git
- PostgreSQL (for local development)
- NPM package manager

## Basic Installation

1. Clone the repository:
```bash
git clone https://github.com/2b-bulbasaur/project3.git
cd project3
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:

```plaintext
DATABASE_URL=postgresql://username:password@host:port/database

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

WEATHER_API_KEY=your-weather-api-key
GOOGLE_TRANSLATE_API_KEY=your-translate-api-key
```

### Common Issues

1. Node Version Mismatch
```bash
nvm use 23  # If using nvm
# or
node -v     # Verify version
```

2. Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials
- Ensure proper network access

3. Missing Dependencies
```bash
npm clean-cache
npm install
```