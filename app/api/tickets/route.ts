import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/tickets - Get tickets with filters
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

    // Fetch tickets
    let tickets = await prisma.ticket.findMany({
      where,
      orderBy: { dateCreation: 'desc' },
    });

    // Apply search filter in memory (SQLite limitation)
    if (search) {
      const searchLower = search.toLowerCase();
      tickets = tickets.filter(ticket => 
        ticket.sujet.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower)
      );
    }

    const total = tickets.length;
    
    // Apply pagination
    tickets = tickets.slice(skip, skip + limit);

    // Transform to match frontend format
    const formattedTickets = tickets.map(ticket => ({
      id: ticket.id,
      sujet: ticket.sujet,
      description: ticket.description,
      statut: ticket.statut,
      dateCreation: ticket.dateCreation.toISOString().split('T')[0],
    }));

    return NextResponse.json({
      tickets: formattedTickets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tickets' },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Create a new ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sujet,
      description,
      statut,
      userId,
    } = body;

    // Validate required fields
    if (!sujet || !description || !userId) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.create({
      data: {
        sujet,
        description,
        statut: statut || 'ouvert',
        userId,
      },
    });

    return NextResponse.json({
      id: ticket.id,
      sujet: ticket.sujet,
      description: ticket.description,
      statut: ticket.statut,
      dateCreation: ticket.dateCreation.toISOString().split('T')[0],
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du ticket' },
      { status: 500 }
    );
  }
}


