import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding account states...');
  const accountStates = [
    { name: 'Active', code: 'ACTIVE' },
    { name: 'Inactive', code: 'INACTIVE' },
    { name: 'Suspended', code: 'SUSPENDED' },
  ];

  for (const stateData of accountStates) {
    const state = await prisma.accountState.upsert({
      where: { code: stateData.code },
      update: {},
      create: stateData,
    });
    console.log(`✅ Account state created/updated: ${state.name} (code: ${state.code}, id: ${state.id})`);
  }
  console.log('✨ Account states seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding account states:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

