import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/businesses - Get all businesses
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;

    let businesses = await prisma.business.findMany({
      where: {
        etat: 'Active',
        ...(search && {
          nomMarque: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      },
      orderBy: { nomMarque: 'asc' },
    });

    // If SQLite doesn't support case-insensitive search, filter in memory
    if (search && businesses.length > 0) {
      const searchLower = search.toLowerCase();
      businesses = businesses.filter(b => 
        b.nomMarque.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      businesses: businesses.map(business => ({
        id: business.id,
        nomMarque: business.nomMarque,
        siteUrl: business.siteUrl,
        ville: business.ville,
        adresse: business.adresse,
        telephone: business.telephone,
        email: business.email,
        etat: business.etat,
        createdAt: business.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des entreprises' },
      { status: 500 }
    );
  }
}

// POST /api/businesses - Create a new business
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nomMarque, siteUrl, ville, adresse, telephone, email } = body;

    if (!nomMarque) {
      return NextResponse.json(
        { error: 'Le nom de la marque est requis' },
        { status: 400 }
      );
    }

    // Check if business already exists
    const existing = await prisma.business.findFirst({
      where: { nomMarque },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Cette entreprise existe déjà' },
        { status: 400 }
      );
    }

    const business = await prisma.business.create({
      data: {
        nomMarque,
        siteUrl: siteUrl || null,
        ville: ville || null,
        adresse: adresse || null,
        telephone: telephone || null,
        email: email || null,
        etat: 'Active',
      },
    });

    return NextResponse.json({
      id: business.id,
      nomMarque: business.nomMarque,
      siteUrl: business.siteUrl,
      ville: business.ville,
      adresse: business.adresse,
      telephone: business.telephone,
      email: business.email,
      etat: business.etat,
      createdAt: business.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'entreprise' },
      { status: 500 }
    );
  }
}


