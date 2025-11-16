import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { unlink, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import bcrypt from 'bcryptjs';

// GET /api/users/[id] - Get a single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    // Fetch user with role, accountState and permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        accountState: true,
        user_permissions: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Map user data to match frontend expectations
    const userData = {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      deuxiemeTelephone: user.deuxiemeTelephone,
      adresse: user.adresse,
      accountStateId: user.accountStateId,
      accountState: user.accountState ? {
        id: user.accountState.id,
        name: user.accountState.name,
        code: user.accountState.code,
      } : null,
      etat: user.accountState?.name || null, // Backward compatibility
      imageProfil: user.imageProfil,
      roleId: user.roleId,
      roleName: user.role?.name || 'CLIENT',
      permissions: (user.user_permissions || []).map(up => up.permissions?.name).filter(Boolean) as string[],
      createdAt: user.createdAt,
    };

    return NextResponse.json({
      user: userData,
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const prenom = formData.get('prenom') as string;
    const nom = formData.get('nom') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string | null;
    const telephone = formData.get('telephone') as string;
    const deuxiemeTelephone = formData.get('deuxiemeTelephone') as string | null;
    const adresse = formData.get('adresse') as string | null;
    const accountStateIdStr = formData.get('accountStateId') as string | null;
    const etatName = formData.get('etat') as string | null; // Backward compatibility: name like "Active", "Inactive"
    const roleId = parseInt(formData.get('roleId') as string) || existingUser.roleId;
    const permissions = formData.get('permissions') as string;
    const imageProfil = formData.get('imageProfil') as File | null;
    const deleteImage = formData.get('deleteImage') === 'true';
    const currentUserId = formData.get('currentUserId') as string | null;

    // Get accountStateId: use provided accountStateId, or map from etat name, or keep existing
    let accountStateId = existingUser.accountStateId;
    if (accountStateIdStr) {
      accountStateId = parseInt(accountStateIdStr);
    } else if (etatName) {
      // Map state name to accountStateId
      const accountState = await prisma.accountState.findFirst({
        where: { name: etatName },
      });
      if (accountState) {
        accountStateId = accountState.id;
      }
    }

    // Validate required fields
    if (!prenom || !nom || !email || !telephone) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Get current user's role for permission checks
    let currentUserRoleName = null;
    if (currentUserId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: { role: true },
      });
      currentUserRoleName = currentUser?.role?.name || null;
    }

    // Get existing user's role
    const existingUserWithRole = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    const existingUserRoleName = existingUserWithRole?.role?.name || null;

    // Permission checks:
    // 1. MEMBER can only edit their own information, cannot change role or permissions
    // 2. CLIENT can edit their own info (but not role/permissions) and can edit MEMBER info (with role/permissions)
    // 3. ADMIN can edit anyone

    const isEditingSelf = currentUserId === userId;
    const isMember = currentUserRoleName === 'MEMBER';
    const isClient = currentUserRoleName === 'CLIENT';
    const targetIsMember = existingUserRoleName === 'MEMBER';
    const targetIsClient = existingUserRoleName === 'CLIENT';

    // MEMBER restrictions: can only edit self, cannot change role or permissions
    if (isMember) {
      if (!isEditingSelf) {
        return NextResponse.json(
          { error: 'Vous n\'êtes pas autorisé à modifier les informations d\'autres utilisateurs' },
          { status: 403 }
        );
      }
      // MEMBER cannot change their own role or permissions
      if (roleId !== existingUser.roleId) {
        return NextResponse.json(
          { error: 'Vous n\'êtes pas autorisé à modifier votre rôle' },
          { status: 403 }
        );
      }
      // MEMBER cannot change their own permissions (we'll skip permission update below)
    }

    // CLIENT restrictions:
    if (isClient) {
      if (isEditingSelf) {
        // CLIENT cannot change their own role or permissions
        if (roleId !== existingUser.roleId) {
          return NextResponse.json(
            { error: 'Vous n\'êtes pas autorisé à modifier votre rôle' },
            { status: 403 }
          );
        }
        // CLIENT cannot change their own email
        if (email !== existingUser.email) {
          return NextResponse.json(
            { error: 'Vous n\'êtes pas autorisé à modifier votre email' },
            { status: 403 }
          );
        }
        // CLIENT cannot change their own account state
        if (accountStateId !== existingUser.accountStateId) {
          return NextResponse.json(
            { error: 'Vous n\'êtes pas autorisé à modifier l\'état de votre compte' },
            { status: 403 }
          );
        }
        // Skip permission update for self (we'll handle this below)
      } else {
        // CLIENT can only edit MEMBER users
        if (!targetIsMember) {
          return NextResponse.json(
            { error: 'Vous n\'êtes autorisé à modifier que les membres' },
            { status: 403 }
          );
        }
        // CLIENT cannot change roles at all (even for MEMBER)
        if (roleId !== existingUser.roleId) {
          return NextResponse.json(
            { error: 'Vous n\'êtes pas autorisé à modifier les rôles' },
            { status: 403 }
          );
        }
      }
    }

    // Check if email is already used by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 400 }
        );
      }
    }

    // Hash password if provided
    let hashedPassword = existingUser.password;
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Handle image upload or deletion
    let imagePath = existingUser.imageProfil;
    
    if (deleteImage) {
      // Delete existing image
      if (existingUser.imageProfil) {
        try {
          const oldImagePath = join(process.cwd(), 'public', existingUser.imageProfil);
          await unlink(oldImagePath);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      imagePath = null;
    } else if (imageProfil && imageProfil.size > 0) {
      // Delete old image if exists
      if (existingUser.imageProfil) {
        try {
          const oldImagePath = join(process.cwd(), 'public', existingUser.imageProfil);
          await unlink(oldImagePath);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      // Save new image
      const bytes = await imageProfil.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });
      const filename = `${userId}-${Date.now()}-${imageProfil.name}`;
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);
      imagePath = `/uploads/${filename}`;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        prenom,
        nom,
        email,
        password: hashedPassword,
        telephone,
        deuxiemeTelephone,
        adresse,
        accountStateId,
        roleId,
        imageProfil: imagePath,
      },
    });

    // Update permissions (only if user has permission to do so)
    if (permissions) {
      // Check if current user can modify permissions:
      // - MEMBER cannot modify their own permissions
      // - CLIENT cannot modify their own permissions but can modify MEMBER permissions
      // - ADMIN can modify anyone's permissions
      
      const canModifyPermissions = 
        !isMember || // MEMBER can never modify permissions
        (isClient && !isEditingSelf) || // CLIENT can modify MEMBER permissions (but not their own)
        currentUserRoleName === 'ADMIN'; // ADMIN can modify anyone

      if (canModifyPermissions) {
        const permissionsObj = JSON.parse(permissions);
        
        // Get all permission IDs
        const allPermissions = await prisma.permissions.findMany();
        const permissionMap = new Map(allPermissions.map(p => [p.name, p.id]));

        // Delete existing user permissions
        await prisma.user_permissions.deleteMany({
          where: { userId },
        });

        // Add new permissions
        const permissionsToAdd = Object.entries(permissionsObj)
          .filter(([_, value]) => value === true)
          .map(([name, _]) => permissionMap.get(name))
          .filter((id): id is number => id !== undefined);

        if (permissionsToAdd.length > 0) {
          await prisma.user_permissions.createMany({
            data: permissionsToAdd.map(permissionId => ({
              id: crypto.randomUUID(), // Generate unique ID for user_permissions
              userId,
              permissionId,
            })),
          });
        }
      } else {
        // Silently ignore permission update if not allowed
        // This prevents errors but doesn't change permissions
      }
    }

    return NextResponse.json({
      message: 'Utilisateur modifié avec succès',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la modification de l\'utilisateur' },
      { status: 500 }
    );
  }
}

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

