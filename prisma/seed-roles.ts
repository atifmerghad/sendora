import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding roles...');

  // Create roles
  const roles = [
    { name: 'CLIENT' },
    { name: 'ADMIN' },
    { name: 'LIVREUR' },
    { name: 'MEMBER' },
  ];

  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: roleData,
    });
    console.log(`✅ Role created/updated: ${role.name} (id: ${role.id})`);
  }

  console.log('✨ Roles seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding roles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


