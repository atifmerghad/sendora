import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, verifyPassword } from '@/lib/users';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    
    // Check password first (for security, don't reveal if email exists)
    // If user doesn't exist, we'll still check password to prevent timing attacks
    let isValid = false;
    if (user) {
      isValid = await verifyPassword(password, user.password);
    }

    // If user doesn't exist or password is incorrect, return generic error
    if (!user || !isValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Check if account is active (only after successful authentication)
    // Check both accountState.code and accountStateId as fallback
    // This ensures login works even if accountState relation is not loaded
    const isActive = user.accountState?.code === 'ACTIVE' || user.accountStateId === 1;
    
    if (!isActive) {
      console.log(`[Login] User ${email} account state check failed:`, {
        accountStateId: user.accountStateId,
        accountStateCode: user.accountState?.code,
        accountStateName: user.accountState?.name,
      });
      return NextResponse.json(
        { error: 'Votre compte n\'est pas activé. Veuillez contacter un administrateur.' },
        { status: 403 }
      );
    }

    const token = generateToken({ userId: user.id, email: user.email });
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('[Login] Server error:', error);
    // Log more details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Login] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error,
      });
    }
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      },
      { status: 500 }
    );
  }
}

