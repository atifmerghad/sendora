import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/returns - Get returns with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract filter parameters
    const search = searchParams.get('search') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const statut = searchParams.get('statut') || undefined;
    const dateDebut = searchParams.get('dateDebut') || undefined;
    const dateFin = searchParams.get('dateFin') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Get current user's businessId to filter by business (multi-tenancy)
    let businessId: string | null = null;
    if (userId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { businessId: true },
      });
      
      if (currentUser?.businessId) {
        businessId = currentUser.businessId;
      } else {
        const userBusiness = await prisma.user_businesses.findFirst({
          where: { userId: userId },
        });
        if (userBusiness) {
          businessId = userBusiness.businessId;
        }
      }
    }

    // Build where clause
    const where: any = {};
    
    if (businessId) {
      where.businessId = businessId;
    } else if (userId) {
      where.userId = userId;
    }
    
    if (statut) {
      where.statut = statut;
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

    // Fetch returns
    let returns = await prisma.returns.findMany({
      where,
      orderBy: { dateDemande: 'desc' },
    });

    // Apply search filter in memory (SQLite limitation)
    if (search) {
      const searchLower = search.toLowerCase();
      returns = returns.filter(r => 
        r.numeroColis.toLowerCase().includes(searchLower) ||
        r.raison.toLowerCase().includes(searchLower)
      );
    }

    const total = returns.length;
    
    // Apply pagination
    returns = returns.slice(skip, skip + limit);

    // Transform to match frontend format
    // Note: Some fields like ville, nom, telephone, frais, vendeurSecondaire
    // would need to be added to the schema or fetched from related tables
    const formattedReturns = returns.map(ret => ({
      id: ret.id,
      code: ret.numeroColis,
      statut: ret.statut,
      ville: '', // TODO: Add to schema or fetch from related data
      nombreColis: 1, // TODO: Add to schema
      dateDemande: ret.dateDemande.toISOString().split('T')[0],
      nom: '', // TODO: Add to schema or fetch from user
      telephone: '', // TODO: Add to schema or fetch from user
      frais: 0, // TODO: Add to schema
      vendeurSecondaire: '', // TODO: Add to schema
      raison: ret.raison,
    }));

    return NextResponse.json({
      returns: formattedReturns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching returns:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des retours' },
      { status: 500 }
    );
  }
}

// POST /api/returns - Create a new return
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { numeroColis, raison, userId, typeRetour, adresse } = body;

    if (!numeroColis || !raison || !userId) {
      return NextResponse.json(
        { error: 'Numéro de colis, raison et userId sont requis' },
        { status: 400 }
      );
    }

    // Get user's businessId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { businessId: true },
    });

    const businessId = user?.businessId || null;

    // Create return
    const newReturn = await prisma.returns.create({
      data: {
        id: crypto.randomUUID(),
        numeroColis,
        raison,
        statut: 'en_attente',
        userId,
        businessId,
      },
    });

    return NextResponse.json({
      return: {
        id: newReturn.id,
        code: newReturn.numeroColis,
        statut: newReturn.statut,
        dateDemande: newReturn.dateDemande.toISOString().split('T')[0],
        raison: newReturn.raison,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating return:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du retour' },
      { status: 500 }
    );
  }
}

