# Guide: How to Update User Account States in Prisma

This guide explains how to update user account states (`accountStateId`) in the Prisma database.

## Account States Available

The `account_states` table has 3 states:

1. **ACTIVE** (id: 1) - User can log in and use the system
2. **INACTIVE** (id: 2) - User account is inactive
3. **SUSPENDED** (id: 3) - User account is suspended

## Methods to Update User Account State

### Method 1: Using Prisma Client in TypeScript/JavaScript

#### Update by Email

```typescript
import { prisma } from '@/lib/db';

// Update user to ACTIVE state
const user = await prisma.user.update({
  where: { email: 'user@example.com' },
  data: {
    accountStateId: 1, // ACTIVE
  },
  include: {
    accountState: true,
  },
});

console.log(`Updated ${user.email} to ${user.accountState.name}`);
```

#### Update by ID

```typescript
const user = await prisma.user.update({
  where: { id: 'user-id-here' },
  data: {
    accountStateId: 2, // INACTIVE
  },
});

console.log(`Updated user to INACTIVE`);
```

#### Update Using State Code

```typescript
// First, get the account state
const inactiveState = await prisma.accountState.findUnique({
  where: { code: 'INACTIVE' },
});

// Then update the user
const user = await prisma.user.update({
  where: { email: 'user@example.com' },
  data: {
    accountStateId: inactiveState.id,
  },
});
```

#### Update Multiple Users

```typescript
// Update all users to ACTIVE
const result = await prisma.user.updateMany({
  data: {
    accountStateId: 1, // ACTIVE
  },
});

console.log(`Updated ${result.count} users`);
```

#### Update Users with Filter

```typescript
// Update only users that are not ACTIVE
const result = await prisma.user.updateMany({
  where: {
    accountStateId: { not: 1 }, // Not ACTIVE
  },
  data: {
    accountStateId: 1, // Set to ACTIVE
  },
});
```

### Method 2: Using SQL Directly

#### Update Single User by Email

```sql
-- Update user to ACTIVE (id=1)
UPDATE users 
SET accountStateId = 1 
WHERE email = 'user@example.com';
```

#### Update Single User by ID

```sql
-- Update user to INACTIVE (id=2)
UPDATE users 
SET accountStateId = 2 
WHERE id = 'user-id-here';
```

#### Update All Users to ACTIVE

```sql
-- Update all users to ACTIVE
UPDATE users 
SET accountStateId = 1 
WHERE accountStateId IS NULL OR accountStateId != 1;
```

#### Update Using State Code Lookup

```sql
-- Update user to INACTIVE using state code
UPDATE users 
SET accountStateId = (
    SELECT id FROM account_states WHERE code = 'INACTIVE'
)
WHERE email = 'user@example.com';
```

### Method 3: Using the Provided Scripts

#### Update All Users to ACTIVE

```bash
npm run db:update-account-states
```

This will update all users to have `accountStateId = 1` (ACTIVE).

#### Create Custom Update Script

Edit `prisma/update-user-state-examples.ts` and uncomment the desired function calls, then run:

```bash
tsx prisma/update-user-state-examples.ts
```

### Method 4: Using API Endpoints

#### Update User via API (PUT request)

```typescript
// Update user via API
const response = await fetch(`/api/users/${userId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    accountStateId: 2, // INACTIVE
    currentUserId: currentUser.id, // Required for permission checks
  }),
});

const updatedUser = await response.json();
```

## Account State IDs Reference

| ID | Code      | Name      | Description                    |
|----|-----------|-----------|--------------------------------|
| 1  | ACTIVE    | Active    | User can log in and use system |
| 2  | INACTIVE  | Inactive  | User account is inactive       |
| 3  | SUSPENDED | Suspended | User account is suspended      |

## Verify User Account State

### Using Prisma

```typescript
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: {
    accountState: true,
  },
});

console.log(`${user.email}: ${user.accountState.name} (${user.accountState.code})`);
```

### Using SQL

```sql
SELECT 
    u.email,
    u.accountStateId,
    a.name as state_name,
    a.code as state_code
FROM users u
LEFT JOIN account_states a ON u.accountStateId = a.id
WHERE u.email = 'user@example.com';
```

## Common Use Cases

### Activate All Users

```typescript
await prisma.user.updateMany({
  data: { accountStateId: 1 }, // ACTIVE
});
```

### Suspend a User

```typescript
const suspendedState = await prisma.accountState.findUnique({
  where: { code: 'SUSPENDED' },
});

await prisma.user.update({
  where: { email: 'user@example.com' },
  data: { accountStateId: suspendedState.id },
});
```

### Deactivate Users Based on Condition

```typescript
// Deactivate users who haven't logged in for 30 days
const inactiveState = await prisma.accountState.findUnique({
  where: { code: 'INACTIVE' },
});

await prisma.user.updateMany({
  where: {
    // Add your condition here
    // Example: lastLoginAt < 30 days ago
  },
  data: { accountStateId: inactiveState.id },
});
```

## Important Notes

1. **Default State**: New users are automatically created with `accountStateId = 1` (ACTIVE)
2. **Permission Checks**: When updating via API, ensure you have the necessary permissions
3. **Validation**: The `accountStateId` must reference a valid `account_states.id`
4. **Login Behavior**: Users with `accountStateId != 1` (not ACTIVE) cannot log in

## Troubleshooting

### Error: "Foreign key constraint failed"

Make sure the `accountStateId` exists in the `account_states` table:

```sql
SELECT id, code, name FROM account_states;
```

### Error: "User not found"

Verify the user exists:

```sql
SELECT id, email, accountStateId FROM users WHERE email = 'user@example.com';
```

### Check All Users and Their States

```sql
SELECT 
    u.id,
    u.email,
    u.accountStateId,
    a.name as state_name,
    a.code as state_code
FROM users u
LEFT JOIN account_states a ON u.accountStateId = a.id
ORDER BY u.email;
```

