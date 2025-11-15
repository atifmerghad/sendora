import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/parcels - Get parcels with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract filter parameters
    const statut = searchParams.get('statut') || undefined;
    const statutFacturation = searchParams.get('statutFacturation') || undefined;
    const typeColis = searchParams.get('typeColis') || undefined;
    const codeColis = searchParams.get('codeColis') || undefined;
    const villeClient = searchParams.get('villeClient') || undefined;
    const nomClient = searchParams.get('nomClient') || undefined;
    const telephoneClient = searchParams.get('telephoneClient') || undefined;
    const referenceColis = searchParams.get('referenceColis') || undefined;
    const dateDebut = searchParams.get('dateDebut') || undefined;
    const dateFin = searchParams.get('dateFin') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (statut) {
      where.statut = statut;
    }
    
    if (statutFacturation) {
      where.statutFacturation = statutFacturation;
    }
    
    if (typeColis) {
      where.typeColis = typeColis;
    }
    
    // Note: SQLite doesn't support 'contains' - we'll filter in memory for text searches
    // For production with PostgreSQL, you can use: { contains: value }
    
    if (dateDebut || dateFin) {
      where.dateCreation = {};
      if (dateDebut) {
        where.dateCreation.gte = new Date(dateDebut);
      }
      if (dateFin) {
        where.dateCreation.lte = new Date(dateFin);
      }
    }

    // Fetch parcels (without text search filters for SQLite)
    const baseWhere: any = { ...where };
    delete baseWhere.code;
    delete baseWhere.ville;
    delete baseWhere.destinataire;
    delete baseWhere.telephone;
    delete baseWhere.referenceColis;

    let parcels = await prisma.parcel.findMany({
      where: baseWhere,
      orderBy: { dateCreation: 'desc' },
    });

    // Apply text filters in memory (SQLite limitation)
    if (codeColis) {
      parcels = parcels.filter(p => p.code.toLowerCase().includes(codeColis.toLowerCase()));
    }
    if (villeClient) {
      parcels = parcels.filter(p => p.ville.toLowerCase().includes(villeClient.toLowerCase()));
    }
    if (nomClient) {
      parcels = parcels.filter(p => p.destinataire.toLowerCase().includes(nomClient.toLowerCase()));
    }
    if (telephoneClient) {
      parcels = parcels.filter(p => p.telephone.includes(telephoneClient));
    }
    if (referenceColis) {
      parcels = parcels.filter(p => p.referenceColis.toLowerCase().includes(referenceColis.toLowerCase()));
    }

    const total = parcels.length;
    
    // Apply pagination
    parcels = parcels.slice(skip, skip + limit);

    // Transform to match frontend format
    const formattedParcels = parcels.map(parcel => ({
      id: parcel.id,
      numero: parcel.numero,
      code: parcel.code,
      destinataire: parcel.destinataire,
      telephone: parcel.telephone,
      adresse: parcel.adresse,
      ville: parcel.ville,
      statut: parcel.statut,
      statutFacturation: parcel.statutFacturation,
      typeColis: parcel.typeColis,
      fraisLivraison: parcel.fraisLivraison,
      montantTotal: parcel.montantTotal,
      referenceColis: parcel.referenceColis,
      referenceVendeur: parcel.referenceVendeur,
      note: parcel.note || '',
      vendeurSecondaire: parcel.vendeurSecondaire || '',
      derniereAction: parcel.derniereAction,
      dateCreation: parcel.dateCreation.toISOString().split('T')[0],
      userId: parcel.userId,
    }));

    return NextResponse.json({
      parcels: formattedParcels,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching parcels:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des colis' },
      { status: 500 }
    );
  }
}

// POST /api/parcels - Create a new parcel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      numero,
      code,
      destinataire,
      telephone,
      adresse,
      ville,
      statut,
      statutFacturation,
      typeColis,
      fraisLivraison,
      montantTotal,
      referenceColis,
      referenceVendeur,
      note,
      vendeurSecondaire,
      derniereAction,
      userId,
    } = body;

    // Validate required fields
    if (!code || !destinataire || !telephone || !ville || !userId) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.parcel.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ce code de colis existe déjà' },
        { status: 400 }
      );
    }

    const parcel = await prisma.parcel.create({
      data: {
        numero: numero || code,
        code,
        destinataire,
        telephone,
        adresse: adresse || '',
        ville,
        statut: statut || 'en_attente',
        statutFacturation: statutFacturation || 'en_attente',
        typeColis: typeColis || 'colis_normal',
        fraisLivraison: fraisLivraison || 0,
        montantTotal: montantTotal || 0,
        referenceColis: referenceColis || '',
        referenceVendeur: referenceVendeur || '',
        note: note || null,
        vendeurSecondaire: vendeurSecondaire || null,
        derniereAction: derniereAction || 'Créé',
        userId,
      },
    });

    return NextResponse.json({
      id: parcel.id,
      numero: parcel.numero,
      code: parcel.code,
      destinataire: parcel.destinataire,
      telephone: parcel.telephone,
      adresse: parcel.adresse,
      ville: parcel.ville,
      statut: parcel.statut,
      statutFacturation: parcel.statutFacturation,
      typeColis: parcel.typeColis,
      fraisLivraison: parcel.fraisLivraison,
      montantTotal: parcel.montantTotal,
      referenceColis: parcel.referenceColis,
      referenceVendeur: parcel.referenceVendeur,
      note: parcel.note || '',
      vendeurSecondaire: parcel.vendeurSecondaire || '',
      derniereAction: parcel.derniereAction,
      dateCreation: parcel.dateCreation.toISOString().split('T')[0],
      userId: parcel.userId,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating parcel:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du colis' },
      { status: 500 }
    );
  }
}

