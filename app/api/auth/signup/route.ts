import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/users';
import { generateToken } from '@/lib/jwt';

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

    const newUser = await createUser(userData);
    const token = generateToken({ userId: newUser.id, email: newUser.email });
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

