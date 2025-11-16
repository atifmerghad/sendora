import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Examples of how to update user account states in Prisma
 */

async function examples() {
  // 1. Get all available account states
  const accountStates = await prisma.accountState.findMany({
    orderBy: { id: 'asc' },
  });

  console.log('📋 Available account states:');
  accountStates.forEach(state => {
    console.log(`  ${state.id}. ${state.name} (code: ${state.code})`);
  });

  // 2. Update a user by email to ACTIVE state
  async function updateUserByEmail(email: string, stateCode: string = 'ACTIVE') {
    const accountState = await prisma.accountState.findUnique({
      where: { code: stateCode },
    });

    if (!accountState) {
      throw new Error(`Account state with code ${stateCode} not found`);
    }

    const user = await prisma.user.update({
      where: { email },
      data: {
        accountStateId: accountState.id,
      },
      include: {
        accountState: true,
      },
    });

    console.log(`✅ Updated user ${email} to ${user.accountState.name}`);
    return user;
  }

  // 3. Update a user by ID to INACTIVE state
  async function updateUserById(userId: string, stateId: number = 2) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        accountStateId: stateId, // 2 = INACTIVE, 3 = SUSPENDED
      },
      include: {
        accountState: true,
      },
    });

    console.log(`✅ Updated user ${user.email} to ${user.accountState.name}`);
    return user;
  }

  // 4. Update multiple users to a specific state
  async function updateMultipleUsers(stateCode: string = 'ACTIVE') {
    const accountState = await prisma.accountState.findUnique({
      where: { code: stateCode },
    });

    if (!accountState) {
      throw new Error(`Account state with code ${stateCode} not found`);
    }

    const result = await prisma.user.updateMany({
      // You can add filters here
      // where: {
      //   accountStateId: { not: accountState.id }, // Only update users that don't have this state
      //   OR
      //   email: { in: ['user1@example.com', 'user2@example.com'] }, // Update specific users
      // },
      data: {
        accountStateId: accountState.id,
      },
    });

    console.log(`✅ Updated ${result.count} users to ${stateCode} state`);
    return result;
  }

  // 5. Update user using state name
  async function updateUserByStateName(email: string, stateName: string = 'Active') {
    const accountState = await prisma.accountState.findFirst({
      where: { name: stateName },
    });

    if (!accountState) {
      throw new Error(`Account state with name ${stateName} not found`);
    }

    const user = await prisma.user.update({
      where: { email },
      data: {
        accountStateId: accountState.id,
      },
      include: {
        accountState: true,
      },
    });

    console.log(`✅ Updated user ${email} to ${user.accountState.name} (${user.accountState.code})`);
    return user;
  }

  // 6. Get user with account state
  async function getUserWithState(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accountState: true,
        role: true,
      },
    });

    if (user) {
      console.log(`👤 User: ${user.email}`);
      console.log(`   Account State: ${user.accountState.name} (${user.accountState.code})`);
      console.log(`   Role: ${user.role.name}`);
    }

    return user;
  }

  // Example usage:
  // Uncomment and modify as needed:

  // Update user by email to ACTIVE
  // await updateUserByEmail('user@example.com', 'ACTIVE');

  // Update user by email to INACTIVE
  // await updateUserByEmail('user@example.com', 'INACTIVE');

  // Update user by email to SUSPENDED
  // await updateUserByEmail('user@example.com', 'SUSPENDED');

  // Update user by ID to INACTIVE (id=2)
  // await updateUserById('user-id-here', 2);

  // Update all users to ACTIVE
  // await updateMultipleUsers('ACTIVE');

  // Update user using state name
  // await updateUserByStateName('user@example.com', 'Inactive');

  // Get user with state info
  // await getUserWithState('user@example.com');
}

// Run examples
examples()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

