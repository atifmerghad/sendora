import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const active = searchParams.get('active'); // Filter by active status
    const region = searchParams.get('region'); // Filter by region

    const where: any = {};

    // Filter by active status if provided
    if (active !== null) {
      where.active = active === 'true' ? 'Oui' : 'Non';
    }

    // Filter by region if provided
    if (region) {
      where.region = region;
    }

    // Search filter - SQLite doesn't support case-insensitive LIKE, so we use contains
    if (search) {
      where.OR = [
        { ville: { contains: search } },
        { region: { contains: search } },
        { arabicName: { contains: search } },
      ];
    }

    const cities = await prisma.city.findMany({
      where,
      orderBy: [
        { ville: 'asc' },
        { region: 'asc' },
      ],
      take: 1000, // Limit to prevent too large responses
    });

    return NextResponse.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}

