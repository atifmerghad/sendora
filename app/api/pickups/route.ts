import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/pickups - Get pickups with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract filter parameters
    const search = searchParams.get('search') || undefined;
    const dateDebut = searchParams.get('dateDebut') || undefined;
    const dateFin = searchParams.get('dateFin') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (dateDebut || dateFin) {
      where.dateDemande = {};
      if (dateDebut) {
        where.dateDemande.gte = new Date(dateDebut);
      }
      if (dateFin) {
        where.dateDemande.lte = new Date(dateFin);
      }
    }
    
    // Note: SQLite doesn't support 'contains' - we'll filter in memory for text searches
    const baseWhere: any = { ...where };
    delete baseWhere.OR;

    let pickups = await prisma.pickup.findMany({
      where: baseWhere,
      orderBy: { dateDemande: 'desc' },
    });

    // Apply search filter in memory (SQLite limitation)
    if (search) {
      const searchLower = search.toLowerCase();
      pickups = pickups.filter(p => 
        p.code.toLowerCase().includes(searchLower) ||
        p.ville.toLowerCase().includes(searchLower) ||
        p.nom.toLowerCase().includes(searchLower) ||
        p.telephone.includes(search)
      );
    }

    const total = pickups.length;
    
    // Apply pagination
    pickups = pickups.slice(skip, skip + limit);

    // Transform to match frontend format
    const formattedPickups = pickups.map(pickup => ({
      id: pickup.id,
      code: pickup.code,
      statut: pickup.statut,
      ville: pickup.ville,
      nombreColis: pickup.nombreColis,
      dateDemande: pickup.dateDemande.toISOString().split('T')[0],
      frais: pickup.frais,
      nom: pickup.nom,
      telephone: pickup.telephone,
      adresse: pickup.adresse,
      note: pickup.note || '',
      vendeurSecondaire: pickup.vendeurSecondaire || '',
      userId: pickup.userId,
    }));

    return NextResponse.json({
      pickups: formattedPickups,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching pickups:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des ramassages' },
      { status: 500 }
    );
  }
}

// POST /api/pickups - Create a new pickup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ville,
      adresse,
      note,
      nom,
      telephone,
      userId,
    } = body;

    // Validate required fields
    if (!ville || !adresse || !nom || !telephone || !userId) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Generate unique code
    const count = await prisma.pickup.count();
    const code = `RAM-${String(count + 1).padStart(3, '0')}`;

    const pickup = await prisma.pickup.create({
      data: {
        code,
        statut: 'en_attente',
        ville,
        nombreColis: 0, // Will be updated when parcels are added
        frais: 0,
        nom,
        telephone,
        adresse,
        note: note || null,
        vendeurSecondaire: null,
        userId,
      },
    });

    return NextResponse.json({
      id: pickup.id,
      code: pickup.code,
      statut: pickup.statut,
      ville: pickup.ville,
      nombreColis: pickup.nombreColis,
      dateDemande: pickup.dateDemande.toISOString().split('T')[0],
      frais: pickup.frais,
      nom: pickup.nom,
      telephone: pickup.telephone,
      adresse: pickup.adresse,
      note: pickup.note || '',
      vendeurSecondaire: pickup.vendeurSecondaire || '',
      userId: pickup.userId,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating pickup:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du ramassage' },
      { status: 500 }
    );
  }
}

