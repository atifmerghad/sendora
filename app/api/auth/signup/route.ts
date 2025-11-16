import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/users';
import { generateToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    const requiredFields = ['nom', 'prenom', 'email', 'password', 'telephone', 'nomMarque', 'siteUrl', 'ville'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        return NextResponse.json(
          { error: `Le champ ${field} est requis` },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(userData.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Check if business name already exists (business name must be unique)
    const existingBusiness = await prisma.business.findFirst({
      where: { businessName: userData.nomMarque }, // nomMarque from frontend maps to businessName in DB
    });

    if (existingBusiness) {
      return NextResponse.json(
        { error: 'Ce nom de marque est déjà utilisé. Veuillez choisir un autre nom.' },
        { status: 400 }
      );
    }

    // Create new business (business name is unique, so we always create a new one)
    const business = await prisma.business.create({
      data: {
        businessName: userData.nomMarque, // nomMarque from frontend maps to businessName in DB
        siteUrl: userData.siteUrl,
        ville: userData.ville,
        etat: 'Active',
      },
    });

    // Create user with businessId (without nomMarque, siteUrl, ville - those are in Business now)
    const newUser = await createUser(userData, business.id);

    // Link user to business as owner
    await prisma.userBusiness.create({
      data: {
        userId: newUser.id,
        businessId: business.id,
        role: 'owner',
      },
    });

    const token = generateToken({ userId: newUser.id, email: newUser.email });
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json(
      { error: error.message || 'Erreur serveur', details: error.meta },
      { status: 500 }
    );
  }
}

