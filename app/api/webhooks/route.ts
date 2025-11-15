import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

// GET /api/webhooks - Get webhooks for a user
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

    const webhooks = await prisma.webhook.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      webhooks,
    });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des webhooks' },
      { status: 500 }
    );
  }
}

// POST /api/webhooks - Create a new webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, url, event } = body;

    if (!userId || !url || !event) {
      return NextResponse.json(
        { error: 'User ID, URL, and event are required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Generate a secure secret key
    const secretKey = `whsec_${crypto.randomBytes(32).toString('hex')}`;

    const webhook = await prisma.webhook.create({
      data: {
        url,
        event,
        secretKey,
        active: true,
        userId,
      },
    });

    return NextResponse.json({
      webhook,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du webhook' },
      { status: 500 }
    );
  }
}

