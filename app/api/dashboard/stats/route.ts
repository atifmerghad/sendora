import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || undefined;
    const dateFilter = searchParams.get('dateFilter') || undefined;
    const dateType = searchParams.get('dateType') || 'date_creation';

    // Get current user's businessId to filter by business (multi-tenancy)
    let businessId: string | null = null;
    if (userId) {
      // Try to get businessId from user's direct relationship first
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { businessId: true },
      });
      
      if (currentUser?.businessId) {
        businessId = currentUser.businessId;
      } else {
        // Fallback to UserBusiness join table
        const userBusiness = await prisma.user_businesses.findFirst({
          where: { userId: userId },
        });
        if (userBusiness) {
          businessId = userBusiness.businessId;
        }
      }
    }

    // Build where clause for parcels - filter by businessId instead of userId
    const parcelWhere: any = {};
    if (businessId) {
      parcelWhere.businessId = businessId;
    } else if (userId) {
      // Fallback to userId if no businessId (backward compatibility)
      parcelWhere.userId = userId;
    }

    // Build where clause for pickups - filter by businessId instead of userId
    const pickupWhere: any = {};
    if (businessId) {
      pickupWhere.businessId = businessId;
    } else if (userId) {
      // Fallback to userId if no businessId (backward compatibility)
      pickupWhere.userId = userId;
    }

    // Build where clause for invoices - filter by businessId instead of userId
    const invoiceWhere: any = {};
    if (businessId) {
      invoiceWhere.businessId = businessId;
    } else if (userId) {
      // Fallback to userId if no businessId (backward compatibility)
      invoiceWhere.userId = userId;
    }

    // Build where clause for returns - filter by businessId instead of userId
    const returnWhere: any = {};
    if (businessId) {
      returnWhere.businessId = businessId;
    } else if (userId) {
      // Fallback to userId if no businessId (backward compatibility)
      returnWhere.userId = userId;
    }

    // Apply date filter if provided
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);

      if (dateType === 'date_creation') {
        parcelWhere.dateCreation = {
          gte: filterDate,
          lt: nextDay,
        };
      } else if (dateType === 'date_ramassage') {
        pickupWhere.dateDemande = {
          gte: filterDate,
          lt: nextDay,
        };
      } else if (dateType === 'date_facturation') {
        invoiceWhere.dateEmission = {
          gte: filterDate,
          lt: nextDay,
        };
      }
    }

    // Fetch counts
    const [totalParcels, totalPickups, totalInvoices, totalReturns] = await Promise.all([
      prisma.parcels.count({ where: parcelWhere }),
      prisma.pickups.count({ where: pickupWhere }),
      prisma.invoices.count({ where: invoiceWhere }),
      prisma.returns.count({ where: returnWhere }),
    ]);

    // Calculate previous period for comparison (last 30 days vs previous 30 days)
    const now = new Date();
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);
    const previous30Days = new Date(last30Days);
    previous30Days.setDate(previous30Days.getDate() - 30);

    const [currentParcels, previousParcels] = await Promise.all([
      prisma.parcels.count({
        where: {
          ...parcelWhere,
          dateCreation: { gte: last30Days },
        },
      }),
      prisma.parcels.count({
        where: {
          ...parcelWhere,
          dateCreation: { gte: previous30Days, lt: last30Days },
        },
      }),
    ]);

    const parcelChange = previousParcels > 0 
      ? ((currentParcels - previousParcels) / previousParcels * 100).toFixed(0)
      : '0';

    // Calculate changes for other stats
    const [currentPickups, previousPickups] = await Promise.all([
      prisma.pickups.count({
        where: {
          ...pickupWhere,
          dateDemande: { gte: last30Days },
        },
      }),
      prisma.pickups.count({
        where: {
          ...pickupWhere,
          dateDemande: { gte: previous30Days, lt: last30Days },
        },
      }),
    ]);

    const pickupChange = previousPickups > 0 
      ? ((currentPickups - previousPickups) / previousPickups * 100).toFixed(0)
      : '0';

    const [currentInvoices, previousInvoices] = await Promise.all([
      prisma.invoices.count({
        where: {
          ...invoiceWhere,
          dateEmission: { gte: last30Days },
        },
      }),
      prisma.invoices.count({
        where: {
          ...invoiceWhere,
          dateEmission: { gte: previous30Days, lt: last30Days },
        },
      }),
    ]);

    const invoiceChange = previousInvoices > 0 
      ? ((currentInvoices - previousInvoices) / previousInvoices * 100).toFixed(0)
      : '0';

    const [currentReturns, previousReturns] = await Promise.all([
      prisma.returns.count({
        where: {
          ...returnWhere,
          dateDemande: { gte: last30Days },
        },
      }),
      prisma.returns.count({
        where: {
          ...returnWhere,
          dateDemande: { gte: previous30Days, lt: last30Days },
        },
      }),
    ]);

    const returnChange = previousReturns > 0 
      ? ((currentReturns - previousReturns) / previousReturns * 100).toFixed(0)
      : '0';

    // Get parcels by city
    const parcelsByCity = await prisma.parcels.groupBy({
      by: ['ville'],
      where: parcelWhere,
      _count: {
        ville: true,
      },
      orderBy: {
        _count: {
          ville: 'desc',
        },
      },
      take: 10,
    });

    const colisParVille = parcelsByCity.map(item => ({
      ville: item.ville,
      colis: item._count.ville,
    }));

    // Get parcels over time (last 6 months)
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const parcelsOverTime = await prisma.parcels.findMany({
      where: {
        ...parcelWhere,
        dateCreation: { gte: sixMonthsAgo },
      },
      select: {
        dateCreation: true,
      },
    });

    // Group by month
    const monthMap: Record<string, number> = {};
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    parcelsOverTime.forEach(parcel => {
      const date = new Date(parcel.dateCreation);
      const monthKey = `${monthNames[date.getMonth()]}`;
      monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
    });

    const colisOverTime = Object.entries(monthMap)
      .map(([month, colis]) => ({ month, colis }))
      .sort((a, b) => {
        const monthOrder = monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
        return monthOrder;
      });

    // Get revenue over time (from invoices)
    const invoicesOverTime = await prisma.invoices.findMany({
      where: {
        ...invoiceWhere,
        dateEmission: { gte: sixMonthsAgo },
      },
      select: {
        dateEmission: true,
        montant: true,
      },
    });

    const revenueMap: Record<string, number> = {};
    invoicesOverTime.forEach(invoice => {
      const date = new Date(invoice.dateEmission);
      const monthKey = `${monthNames[date.getMonth()]}`;
      revenueMap[monthKey] = (revenueMap[monthKey] || 0) + invoice.montant;
    });

    const chiffreAffaireOverTime = Object.entries(revenueMap)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => {
        const monthOrder = monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
        return monthOrder;
      });

    // Get refused parcels reasons (simplified - using statut)
    const refusedParcels = await prisma.parcels.findMany({
      where: {
        ...parcelWhere,
        statut: 'refuse',
      },
      select: {
        note: true,
      },
    });

    // Simplified refused reasons (in real app, this would come from a separate table)
    const colisRefuses = [
      { name: 'Adresse incorrecte', value: Math.floor(refusedParcels.length * 0.4) },
      { name: 'Destinataire absent', value: Math.floor(refusedParcels.length * 0.3) },
      { name: 'Refusé par client', value: Math.floor(refusedParcels.length * 0.2) },
      { name: 'Autre', value: Math.floor(refusedParcels.length * 0.1) },
    ].filter(item => item.value > 0);

    // Get canceled parcels
    const canceledParcels = await prisma.parcels.findMany({
      where: {
        ...parcelWhere,
        statut: 'annule',
      },
    });

    const colisAnnules = [
      { name: 'Annulé par client', value: Math.floor(canceledParcels.length * 0.5) },
      { name: 'Erreur de commande', value: Math.floor(canceledParcels.length * 0.3) },
      { name: 'Stock indisponible', value: Math.floor(canceledParcels.length * 0.15) },
      { name: 'Autre', value: Math.floor(canceledParcels.length * 0.05) },
    ].filter(item => item.value > 0);

    // Get returns statistics
    const returnsStats = await prisma.returns.groupBy({
      by: ['statut'],
      where: returnWhere,
      _count: {
        statut: true,
      },
    });

    const statistiquesRetour = returnsStats.map(item => ({
      name: item.statut === 'en_attente' ? 'Retours en attente' :
            item.statut === 'approuve' ? 'Retours complétés' :
            item.statut === 'traite' ? 'Retours en cours' :
            'Retours annulés',
      value: item._count.statut,
    }));

    return NextResponse.json({
      stats: {
        totalColis: totalParcels,
        totalPickups: totalPickups,
        totalInvoices: totalInvoices,
        totalReturns: totalReturns,
        parcelChange: parcelChange,
        pickupChange: pickupChange,
        invoiceChange: invoiceChange,
        returnChange: returnChange,
      },
      colisOverTime,
      chiffreAffaireOverTime,
      colisRefuses,
      colisAnnules,
      statistiquesRetour,
      colisParVille,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}

