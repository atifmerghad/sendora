import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const userId = resolvedParams.id;
    
    // Get current user ID from query params
    const searchParams = request.nextUrl.searchParams;
    const currentUserId = searchParams.get('currentUserId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Prevent self-deletion
    if (currentUserId && userId === currentUserId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 403 }
      );
    }

    // Find the main account (first user created - earliest createdAt)
    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      take: 1,
    });

    const mainAccountId = allUsers.length > 0 ? allUsers[0].id : null;

    // Prevent deletion of main account
    if (mainAccountId && userId === mainAccountId) {
      return NextResponse.json(
        { error: 'Le compte principal ne peut pas être supprimé' },
        { status: 403 }
      );
    }

    // Delete profile image if it exists
    if (user.imageProfil) {
      try {
        const imagePath = join(process.cwd(), 'public', user.imageProfil);
        await unlink(imagePath);
      } catch (error) {
        console.error('Error deleting profile image:', error);
        // Continue even if image deletion fails
      }
    }

    // Delete user (cascade will handle related records if configured)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
}

