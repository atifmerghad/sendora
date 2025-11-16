import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/parcels - Get all parcels for admin (not filtered by business)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const searchMagasin = searchParams.get('searchMagasin') || '';
    const dateDebut = searchParams.get('dateDebut') || '';
    const dateFin = searchParams.get('dateFin') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    // Build base where clause (for SQLite compatibility, we'll filter in memory)
    const baseWhere: any = {};

    // Date range filter (can be done at database level)
    if (dateDebut || dateFin) {
      const dateFilter: any = {};
      if (dateDebut) {
        dateFilter.gte = new Date(dateDebut);
      }
      if (dateFin) {
        const endDate = new Date(dateFin);
        endDate.setHours(23, 59, 59, 999); // End of day
        dateFilter.lte = endDate;
      }
      baseWhere.dateCreation = dateFilter;
    }

    // Get all parcels matching date filter (if any)
    // SQLite doesn't support 'contains' natively, so we filter in memory
    let parcels = await prisma.parcels.findMany({
      where: baseWhere,
      orderBy: { dateCreation: 'desc' },
      include: {
        businesses: {
          select: {
            businessName: true,
          },
        },
      },
    });

    // Apply text search filters in memory (SQLite limitation)
    if (search) {
      const searchLower = search.toLowerCase();
      parcels = parcels.filter((p) =>
        p.code.toLowerCase().includes(searchLower) ||
        p.destinataire.toLowerCase().includes(searchLower) ||
        p.telephone.includes(search) ||
        p.adresse.toLowerCase().includes(searchLower)
      );
    }

    // Apply magasin search filter
    if (searchMagasin) {
      const magasinLower = searchMagasin.toLowerCase();
      parcels = parcels.filter((p) =>
        (p.vendeurSecondaire && p.vendeurSecondaire.toLowerCase().includes(magasinLower)) ||
        (p.referenceVendeur && p.referenceVendeur.toLowerCase().includes(magasinLower)) ||
        (p.businesses?.businessName && p.businesses.businessName.toLowerCase().includes(magasinLower))
      );
    }

    // Get total count after filters
    const total = parcels.length;

    // Apply pagination
    const skip = (page - 1) * pageSize;
    parcels = parcels.slice(skip, skip + pageSize);

    // Format parcels for frontend
    const formattedParcels = parcels.map((parcel) => ({
      id: parcel.id,
      codeEnvoi: parcel.code,
      dateExpedition: parcel.dateCreation,
      telephone: parcel.telephone,
      nomMagasin: parcel.businesses?.businessName || parcel.vendeurSecondaire || parcel.referenceVendeur || 'N/A',
      etat: parcel.statut,
      status: parcel.statutFacturation,
      ville: parcel.ville,
      prix: parcel.fraisLivraison,
      actions: null, // Will be handled in frontend
    }));

    return NextResponse.json({
      parcels: formattedParcels,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching admin parcels:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des colis' },
      { status: 500 }
    );
  }
}

