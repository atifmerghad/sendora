import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding permissions...');

  // Create permissions based on the interface in add user page
  const permissions = [
    { name: 'dashboard', description: 'Accès au tableau de bord' },
    { name: 'gestionColis', description: 'Gestion des colis' },
    { name: 'gestionRamassages', description: 'Gestion des ramassages' },
    { name: 'gestionStock', description: 'Gestion du stock' },
    { name: 'gestionRetours', description: 'Gestion des retours' },
    { name: 'gestionFactures', description: 'Gestion des factures' },
    { name: 'chat', description: 'Accès au chat' },
    { name: 'mesTickets', description: 'Gestion des tickets' },
  ];

  for (const permissionData of permissions) {
    const permission = await prisma.permission.upsert({
      where: { name: permissionData.name },
      update: {},
      create: permissionData,
    });
    console.log(`✅ Permission created/updated: ${permission.name} (id: ${permission.id})`);
  }

  console.log('✨ Permissions seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

