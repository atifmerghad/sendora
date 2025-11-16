import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating users account states...');

  // Example 1: Update all users to ACTIVE state
  const activeState = await prisma.accountState.findUnique({
    where: { code: 'ACTIVE' },
  });

  if (!activeState) {
    console.error('❌ ACTIVE account state not found!');
    process.exit(1);
  }

  // Update all users to have ACTIVE state (id=1)
  const result = await prisma.user.updateMany({
    where: {
      // You can add filters here, for example:
      // accountStateId: { not: 1 }, // Only update users that don't have ACTIVE
      // OR update all users
    },
    data: {
      accountStateId: activeState.id, // Set to ACTIVE (id=1)
    },
  });

  console.log(`✅ Updated ${result.count} users to ACTIVE state`);

  // Example 2: Update a specific user by email
  const userEmail = 'user@example.com'; // Replace with actual email
  const specificUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (specificUser) {
    await prisma.user.update({
      where: { id: specificUser.id },
      data: {
        accountStateId: activeState.id, // Set to ACTIVE
      },
    });
    console.log(`✅ Updated user ${userEmail} to ACTIVE state`);
  }

  // Example 3: Update user by ID
  const userId = 'user-id-here'; // Replace with actual user ID
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        accountStateId: activeState.id, // Set to ACTIVE
      },
    });
    console.log(`✅ Updated user ${userId} to ACTIVE state`);
  } catch (error) {
    console.log(`⚠️  User ${userId} not found or already updated`);
  }

  // Example 4: Get all account states and their IDs
  const allStates = await prisma.accountState.findMany({
    orderBy: { id: 'asc' },
  });

  console.log('\n📋 Available account states:');
  allStates.forEach(state => {
    console.log(`  - ${state.name} (code: ${state.code}, id: ${state.id})`);
  });

  // Example 5: Show current users and their account states
  const usersWithStates = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      accountStateId: true,
      accountState: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    take: 10, // Limit to first 10
  });

  console.log('\n👥 Current users and their account states:');
  usersWithStates.forEach(user => {
    console.log(`  - ${user.email}: ${user.accountState?.name || 'N/A'} (id: ${user.accountStateId})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error updating users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

