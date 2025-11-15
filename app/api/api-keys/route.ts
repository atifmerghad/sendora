import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

// GET /api/api-keys - Get API keys for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      apiKeys,
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des clés API' },
      { status: 500 }
    );
  }
}

// POST /api/api-keys - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Generate a secure API key
    const apiKey = `sk_live_${crypto.randomBytes(32).toString('hex')}`;

    const newApiKey = await prisma.apiKey.create({
      data: {
        key: apiKey,
        name: name || 'Clé API',
        active: true,
        userId,
      },
    });

    return NextResponse.json({
      apiKey: newApiKey,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la clé API' },
      { status: 500 }
    );
  }
}

