import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/invoices - Get invoices with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract filter parameters
    const search = searchParams.get('search') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const statut = searchParams.get('statut') || undefined;
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

    // Fetch invoices
    let invoices = await prisma.invoice.findMany({
      where,
      orderBy: { dateEmission: 'desc' },
    });

    // Apply search filter in memory (SQLite limitation)
    if (search) {
      const searchLower = search.toLowerCase();
      invoices = invoices.filter(invoice => 
        invoice.numero.toLowerCase().includes(searchLower) ||
        invoice.montant.toString().includes(search)
      );
    }

    const total = invoices.length;
    
    // Apply pagination
    invoices = invoices.slice(skip, skip + limit);

    // Transform to match frontend format
    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      numero: invoice.numero,
      montant: invoice.montant,
      dateEmission: invoice.dateEmission.toISOString().split('T')[0],
      statut: invoice.statut as 'paye' | 'en_attente' | 'en_retard',
    }));

    return NextResponse.json({
      invoices: formattedInvoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des factures' },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      numero,
      montant,
      statut,
      userId,
    } = body;

    // Validate required fields
    if (!numero || !montant || !userId) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Check if numero already exists
    const existing = await prisma.invoice.findUnique({
      where: { numero },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ce numéro de facture existe déjà' },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.create({
      data: {
        numero,
        montant,
        statut: statut || 'en_attente',
        userId,
      },
    });

    return NextResponse.json({
      id: invoice.id,
      numero: invoice.numero,
      montant: invoice.montant,
      dateEmission: invoice.dateEmission.toISOString().split('T')[0],
      statut: invoice.statut,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la facture' },
      { status: 500 }
    );
  }
}


