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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Find the main account (first user created - earliest createdAt)
    const allUsersOrdered = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
    const mainAccountId = allUsersOrdered.length > 0 ? allUsersOrdered[0].id : null;

    // Fetch users
    let users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

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

    // Transform to match frontend format (exclude password)
    const formattedUsers = users.map(user => ({
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      deuxiemeTelephone: user.deuxiemeTelephone,
      adresse: user.adresse,
      etat: user.etat,
      permissions: user.permissions ? JSON.parse(user.permissions) : null,
      imageProfil: user.imageProfil,
      ville: user.ville,
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
    const etat = formData.get('etat') as string | null;
    const permissions = formData.get('permissions') as string;
    const nomMarque = formData.get('nomMarque') as string || '';
    const siteUrl = formData.get('siteUrl') as string || '';
    const ville = formData.get('ville') as string || '';
    const imageProfil = formData.get('imageProfil') as File | null;

    // Validate required fields
    if (!prenom || !nom || !email || !password || !telephone) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Check if email already exists
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

    // Create user
    const user = await prisma.user.create({
      data: {
        prenom,
        nom,
        email,
        password: hashedPassword,
        telephone,
        deuxiemeTelephone: deuxiemeTelephone || null,
        adresse: adresse || null,
        etat: etat || 'Active',
        permissions: permissions || null,
        imageProfil: imageProfilPath,
        nomMarque,
        siteUrl,
        ville,
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
      etat: user.etat,
      permissions: user.permissions ? JSON.parse(user.permissions) : null,
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

