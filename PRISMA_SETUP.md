# Prisma Database Setup Guide

## Overview

This project uses **Prisma ORM** with **SQLite** for development and is configured to easily switch to **PostgreSQL** for production.

## Current Setup

- **Development**: SQLite (file-based, no installation needed)
- **Production**: PostgreSQL (ready to switch)

## Database Location

- SQLite database: `prisma/dev.db`
- Migrations: `prisma/migrations/`

## Available Scripts

```bash
# Generate Prisma Client (after schema changes)
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Push schema changes without migrations (dev only)
npm run db:push
```

## Switching to PostgreSQL

When you're ready to move to production with PostgreSQL:

### 1. Update Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql" // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 2. Update Environment Variables

In your `.env` file:

```env
# Replace SQLite URL with PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/sendora?schema=public"
```

### 3. Run Migration

```bash
npm run db:migrate
```

This will:
- Create a new migration for PostgreSQL
- Apply it to your PostgreSQL database
- Regenerate Prisma Client

## Database Models

The following models are available:

- **User** - User accounts
- **Parcel** - Parcels/packages
- **Pickup** - Pickup requests
- **Ticket** - Support tickets
- **Invoice** - Invoices
- **Return** - Return requests
- **Inventory** - Inventory items
- **TeamMember** - Team members
- **Message** - Messages

## Using Prisma in Your Code

```typescript
import { prisma } from '@/lib/db';

// Example: Create a user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    // ... other fields
  },
});

// Example: Find users
const users = await prisma.user.findMany({
  where: {
    email: {
      contains: '@example.com',
    },
  },
});

// Example: Update
await prisma.user.update({
  where: { id: userId },
  data: { nom: 'New Name' },
});

// Example: Delete
await prisma.user.delete({
  where: { id: userId },
});
```

## Prisma Studio

Visual database browser:

```bash
npm run db:studio
```

Opens at `http://localhost:5555` - great for development and debugging!

## Notes

- The database file (`dev.db`) is gitignored
- Migrations are tracked in git
- Always run `npm run db:generate` after pulling changes that modify the schema
- Use migrations for production, `db push` only for rapid prototyping

