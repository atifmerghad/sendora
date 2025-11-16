import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// GET /api/users - Get users with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const currentUserId = searchParams.get('currentUserId') || undefined; // Current logged-in user
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Get current user's businessId
    let currentUserBusinessId: string | null = null;
    if (currentUserId) {
      // Try to get businessId from user's direct relationship first
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: { businessId: true },
      });
      
      if (currentUser?.businessId) {
        currentUserBusinessId = currentUser.businessId;
      } else {
        // Fallback to UserBusiness join table
        const userBusiness = await prisma.user_businesses.findFirst({
          where: { userId: currentUserId },
        });
        if (userBusiness) {
          currentUserBusinessId = userBusiness.businessId;
        }
      }
    }

    // If no business found for current user, return empty (user shouldn't see anything)
    if (currentUserId && !currentUserBusinessId) {
      return NextResponse.json({
        users: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        mainAccountId: null,
      });
    }

    // Get all users in the same business
    let users: any[] = [];
    
    if (currentUserBusinessId) {
      // Fetch users by businessId (either direct or through UserBusiness)
      const usersWithDirectBusinessId = await prisma.user.findMany({
        where: { businessId: currentUserBusinessId },
        orderBy: { createdAt: 'desc' },
      });

      // Also get users from UserBusiness join table
      const userBusinessRelations = await prisma.user_businesses.findMany({
        where: { businessId: currentUserBusinessId },
        include: { users: true },
      });

      // Combine and deduplicate users
      const usersFromJoin = userBusinessRelations.map(ub => ub.users);
      const allUsersMap = new Map();
      
      // Add users with direct businessId
      usersWithDirectBusinessId.forEach(user => {
        allUsersMap.set(user.id, user);
      });
      
      // Add users from join table
      usersFromJoin.forEach(user => {
        if (!allUsersMap.has(user.id)) {
          allUsersMap.set(user.id, user);
        }
      });

      users = Array.from(allUsersMap.values());
    } else {
      // No currentUserId provided, return all users (for backward compatibility)
      // But this should be avoided in production
      users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    // Find the main account (first user created - earliest createdAt) in the same business
    const allUsersOrdered = users.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const mainAccountId = allUsersOrdered.length > 0 ? allUsersOrdered[0].id : null;

    // Apply search filter in memory (SQLite limitation)
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        user.nom.toLowerCase().includes(searchLower) ||
        user.prenom.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.telephone.includes(search)
      );
    }

    const total = users.length;
    
    // Apply pagination
    users = users.slice(skip, skip + limit);

    // Get business info and role for each user
    const usersWithRelations = await Promise.all(
      users.map(async (user) => {
        try {
          // Fetch user with role, accountState and business relations
          const userWithRole = await prisma.user.findUnique({
            where: { id: user.id },
            include: { 
              role: true,
              accountState: true,
              businesses: true,
            },
          });

          const userBusiness = !userWithRole?.businesses ? await prisma.user_businesses.findFirst({
            where: { userId: user.id },
            include: { businesses: true },
          }) : null;

          return {
            ...user,
            role: userWithRole?.role || null,
            accountState: userWithRole?.accountState || null,
            business: userWithRole?.businesses || userBusiness?.businesses || null,
          };
        } catch (error) {
          // If query fails, return user without relations
          console.error(`Error fetching relations for user ${user.id}:`, error);
          return {
            ...user,
            role: null,
            accountState: null,
            business: null,
          };
        }
      })
    );

    // Transform to match frontend format (exclude password)
    const formattedUsers = usersWithRelations.map(user => ({
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
      roleId: user.roleId,
      roleName: user.role?.name || 'CLIENT',
      permissions: null, // Permissions are now in user_permissions table
      imageProfil: user.imageProfil,
      nomMarque: user.business?.businessName || '', // business is set from userWithRole?.businesses || userBusiness?.businesses
      siteUrl: user.business?.siteUrl || '',
      ville: user.business?.ville || '',
      createdAt: user.createdAt.toISOString().split('T')[0],
    }));

    return NextResponse.json({
      users: formattedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      mainAccountId,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const prenom = formData.get('prenom') as string;
    const nom = formData.get('nom') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const telephone = formData.get('telephone') as string;
    const deuxiemeTelephone = formData.get('deuxiemeTelephone') as string | null;
    const adresse = formData.get('adresse') as string | null;
    const accountStateIdStr = formData.get('accountStateId') as string | null;
    const etatName = formData.get('etat') as string | null; // Backward compatibility: name like "Active"
    const permissions = formData.get('permissions') as string;
    const currentUserId = formData.get('currentUserId') as string | null; // User creating the new user
    const imageProfil = formData.get('imageProfil') as File | null;

    // Get ACTIVE account state ID as default
    const activeState = await prisma.accountState.findUnique({
      where: { code: 'ACTIVE' },
    });
    if (!activeState) {
      return NextResponse.json(
        { error: 'État de compte ACTIVE introuvable. Veuillez exécuter db:seed-account-states.' },
        { status: 500 }
      );
    }

    // Get accountStateId: use provided accountStateId, or map from etat name, or default to ACTIVE
    let accountStateId = activeState.id;
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

    // Get current user's role for permission checks
    let currentUserRoleName = null;
    if (currentUserId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: { role: true },
      });
      currentUserRoleName = currentUser?.role?.name || null;
    }

    // Get role ID for new user
    let roleId: number;
    const requestedRoleId = formData.get('roleId') ? parseInt(formData.get('roleId') as string) : null;
    
    // CLIENT can only create MEMBER users
    if (currentUserRoleName === 'CLIENT') {
      const memberRole = await prisma.role.findUnique({
        where: { name: 'MEMBER' },
      });
      if (!memberRole) {
        return NextResponse.json(
          { error: 'Rôle MEMBER introuvable. Veuillez exécuter db:seed-roles.' },
          { status: 500 }
        );
      }
      
      // Force MEMBER role for CLIENT
      roleId = memberRole.id;
      
      // If CLIENT tries to create with a different role, reject it
      if (requestedRoleId && requestedRoleId !== memberRole.id) {
        const requestedRole = await prisma.role.findUnique({
          where: { id: requestedRoleId },
        });
        if (requestedRole && requestedRole.name !== 'MEMBER') {
          return NextResponse.json(
            { error: 'Vous ne pouvez créer que des utilisateurs avec le rôle MEMBER' },
            { status: 403 }
          );
        }
      }
    } else {
      // ADMIN can create any role, default to CLIENT if not specified
      const clientRole = await prisma.role.findUnique({
        where: { name: 'CLIENT' },
      });
      if (!clientRole) {
        return NextResponse.json(
          { error: 'Rôle CLIENT introuvable. Veuillez exécuter db:seed-roles.' },
          { status: 500 }
        );
      }
      roleId = requestedRoleId || clientRole.id; // Use requested role or default to CLIENT
    }

    // Validate required fields
    if (!prenom || !nom || !email || !password || !telephone) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Get the business ID from the current user (the one creating this user)
    let businessId: string | null = null;
    if (currentUserId) {
      // Try to get businessId from user's direct relationship first
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: { businessId: true },
      });
      
      if (currentUser?.businessId) {
        businessId = currentUser.businessId;
      } else {
        // Fallback to UserBusiness join table
        const userBusiness = await prisma.user_businesses.findFirst({
          where: { userId: currentUserId },
        });
        if (userBusiness) {
          businessId = userBusiness.businessId;
        }
      }
    }

    if (!businessId) {
      return NextResponse.json(
        { error: 'Impossible de trouver l\'entreprise. Veuillez vous reconnecter.' },
        { status: 400 }
      );
    }

    // Check if email already exists (globally, but we'll also check within business)
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle image upload
    let imageProfilPath: string | null = null;
    if (imageProfil && imageProfil.size > 0) {
      try {
        const bytes = await imageProfil.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles');
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${imageProfil.name}`;
        const filepath = join(uploadsDir, filename);

        await writeFile(filepath, buffer);
        imageProfilPath = `/uploads/profiles/${filename}`;
      } catch (error) {
        console.error('Error uploading image:', error);
        // Continue without image if upload fails
      }
    }

    // Create user with businessId, roleId and accountStateId
    const user = await prisma.user.create({
      data: {
        prenom,
        nom,
        email,
        password: hashedPassword,
        telephone,
        deuxiemeTelephone: deuxiemeTelephone || null,
        adresse: adresse || null,
        accountStateId: accountStateId, // Use accountStateId instead of etat
        roleId: roleId,
        imageProfil: imageProfilPath,
        businessId: businessId, // Set businessId directly on user
      },
      include: { role: true, accountState: true }, // Include role and accountState relations
    });

    // Link user to the same business as the creator
    await prisma.user_businesses.create({
      data: {
        id: crypto.randomUUID(), // Generate unique ID for user_businesses
        userId: user.id,
        businessId: businessId,
        role: 'member', // Default role in the business
      },
    });

    return NextResponse.json({
      id: user.id,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone,
      deuxiemeTelephone: user.deuxiemeTelephone,
      adresse: user.adresse,
      etat: user.accountState?.name || null, // Backward compatibility
      roleId: user.roleId,
      roleName: user.role?.name || 'CLIENT',
      permissions: null, // Permissions are now in user_permissions table
      imageProfil: user.imageProfil,
      createdAt: user.createdAt.toISOString().split('T')[0],
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}

