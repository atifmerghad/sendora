import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    const cities = await prisma.cities.findMany({
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

