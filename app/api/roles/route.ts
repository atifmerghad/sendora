import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/roles - Get all roles
export async function GET(request: NextRequest) {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({
      roles,
    });
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des rôles' },
      { status: 500 }
    );
  }
}

