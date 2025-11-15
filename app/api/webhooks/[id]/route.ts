import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// DELETE /api/webhooks/[id] - Delete a webhook
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const webhookId = resolvedParams.id;

    if (!webhookId) {
      return NextResponse.json(
        { error: 'Webhook ID is required' },
        { status: 400 }
      );
    }

    // Check if webhook exists
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    // Delete webhook
    await prisma.webhook.delete({
      where: { id: webhookId },
    });

    return NextResponse.json({
      message: 'Webhook supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression du webhook' },
      { status: 500 }
    );
  }
}

