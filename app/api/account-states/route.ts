import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/account-states - Get all account states
export async function GET(request: NextRequest) {
  try {
    const accountStates = await prisma.accountState.findMany({
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({
      accountStates,
    });
  } catch (error: any) {
    console.error('Error fetching account states:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des états de compte' },
      { status: 500 }
    );
  }
}

