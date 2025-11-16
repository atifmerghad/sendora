import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { User, SignupData } from '@/types';

// Get CLIENT role ID (id=1) as default
async function getClientRoleId(): Promise<number> {
  const clientRole = await prisma.role.findUnique({
    where: { name: 'CLIENT' },
  });
  if (!clientRole) {
    throw new Error('CLIENT role not found. Please run db:seed-roles first.');
  }
  return clientRole.id;
}

export async function createUser(userData: SignupData, businessId?: string): Promise<User> {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  // Get roleId, default to CLIENT (id=1)
  const roleId = userData.roleId || await getClientRoleId();
  
  // Get ACTIVE account state ID (id=1) as default
  const activeState = await prisma.accountState.findUnique({
    where: { code: 'ACTIVE' },
  });
  if (!activeState) {
    throw new Error('ACTIVE account state not found. Please run db:seed-account-states first.');
  }
  
  const newUser = await prisma.user.create({
    data: {
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
    password: hashedPassword,
      telephone: userData.telephone,
      roleId: roleId,
      accountStateId: activeState.id, // Default to ACTIVE
      businessId: businessId || null,
    },
    include: { role: true, accountState: true }, // Include role and accountState relations
  });
  
  // Get business info to populate nomMarque, siteUrl, ville for compatibility
  const business = businessId ? await prisma.businesses.findUnique({
    where: { id: businessId },
  }) : null;
  
  // Convert Prisma User to our User type (excluding password for return)
  return {
    id: newUser.id,
    nom: newUser.nom,
    prenom: newUser.prenom,
    email: newUser.email,
    password: newUser.password, // Keep for verification, but don't return in API
    telephone: newUser.telephone,
    nomMarque: business?.businessName || userData.nomMarque || '', // Keep for compatibility but get from business
    siteUrl: business?.siteUrl || userData.siteUrl || '', // Keep for compatibility but get from business
    ville: business?.ville || userData.ville || '', // Keep for compatibility but get from business
    roleId: newUser.roleId,
    roleName: newUser.role?.name || 'CLIENT',
    role: newUser.role ? {
      id: newUser.role.id,
      name: newUser.role.name,
      createdAt: newUser.role.createdAt.toISOString(),
      updatedAt: newUser.role.updatedAt.toISOString(),
    } : undefined,
    permissions: newUser.permissions || null,
    deuxiemeTelephone: newUser.deuxiemeTelephone || null,
    adresse: newUser.adresse || null,
    accountStateId: newUser.accountStateId,
    accountState: newUser.accountState ? {
      id: newUser.accountState.id,
      name: newUser.accountState.name,
      code: newUser.accountState.code,
      createdAt: newUser.accountState.createdAt.toISOString(),
      updatedAt: newUser.accountState.updatedAt.toISOString(),
    } : undefined,
    // Keep etat for backward compatibility (deprecated)
    etat: newUser.accountState?.name || null,
    imageProfil: newUser.imageProfil || null,
    createdAt: newUser.createdAt.toISOString(),
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { 
      role: true, 
      accountState: true,
      user_permissions: {
        include: {
          permissions: true,
        },
      },
    }, // Include role, accountState and permissions relations
  });
  
  if (!user) return null;
  
  // Get user's business to populate nomMarque, siteUrl, ville
  // Try direct businessId first, then fallback to UserBusiness join table
  const business = user.businessId ? await prisma.businesses.findUnique({
    where: { id: user.businessId },
  }) : null;
  
  const userBusiness = !business ? await prisma.user_businesses.findFirst({
    where: { userId: user.id },
    include: { businesses: true },
  }) : null;

  // Extract permissions as array of permission names
  const userPermissions = (user.user_permissions || [])
    .map(up => up.permissions?.name)
    .filter(Boolean) as string[];

  return {
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    password: user.password,
    telephone: user.telephone,
    nomMarque: business?.businessName || userBusiness?.businesses.businessName || '', // Get from business
    siteUrl: business?.siteUrl || userBusiness?.businesses.siteUrl || '', // Get from business
    ville: business?.ville || userBusiness?.businesses.ville || '', // Get from business
    roleId: user.roleId,
    roleName: user.role?.name || 'CLIENT',
    role: user.role ? {
      id: user.role.id,
      name: user.role.name,
      createdAt: user.role.createdAt.toISOString(),
      updatedAt: user.role.updatedAt.toISOString(),
    } : undefined,
    permissions: userPermissions.length > 0 ? userPermissions : null,
    deuxiemeTelephone: user.deuxiemeTelephone || null,
    adresse: user.adresse || null,
    accountStateId: user.accountStateId,
    accountState: user.accountState ? {
      id: user.accountState.id,
      name: user.accountState.name,
      code: user.accountState.code,
      createdAt: user.accountState.createdAt.toISOString(),
      updatedAt: user.accountState.updatedAt.toISOString(),
    } : undefined,
    // Keep etat for backward compatibility (deprecated)
    etat: user.accountState?.name || null,
    imageProfil: user.imageProfil || null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { 
      role: true, 
      accountState: true,
      user_permissions: {
        include: {
          permissions: true,
        },
      },
    }, // Include role, accountState and permissions relations
  });
  
  if (!user) return null;
  
  // Get user's business to populate nomMarque, siteUrl, ville
  // Try direct businessId first, then fallback to UserBusiness join table
  const business = user.businessId ? await prisma.businesses.findUnique({
    where: { id: user.businessId },
  }) : null;
  
  const userBusiness = !business ? await prisma.user_businesses.findFirst({
    where: { userId: user.id },
    include: { businesses: true },
  }) : null;

  // Extract permissions as array of permission names
  const userPermissions = (user.user_permissions || [])
    .map(up => up.permissions?.name)
    .filter(Boolean) as string[];

  return {
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    password: user.password,
    telephone: user.telephone,
    nomMarque: business?.businessName || userBusiness?.businesses.businessName || '', // Get from business
    siteUrl: business?.siteUrl || userBusiness?.businesses.siteUrl || '', // Get from business
    ville: business?.ville || userBusiness?.businesses.ville || '', // Get from business
    roleId: user.roleId,
    roleName: user.role?.name || 'CLIENT',
    role: user.role ? {
      id: user.role.id,
      name: user.role.name,
      createdAt: user.role.createdAt.toISOString(),
      updatedAt: user.role.updatedAt.toISOString(),
    } : undefined,
    permissions: userPermissions.length > 0 ? userPermissions : null,
    deuxiemeTelephone: user.deuxiemeTelephone || null,
    adresse: user.adresse || null,
    accountStateId: user.accountStateId,
    accountState: user.accountState ? {
      id: user.accountState.id,
      name: user.accountState.name,
      code: user.accountState.code,
      createdAt: user.accountState.createdAt.toISOString(),
      updatedAt: user.accountState.updatedAt.toISOString(),
    } : undefined,
    // Keep etat for backward compatibility (deprecated)
    etat: user.accountState?.name || null,
    imageProfil: user.imageProfil || null,
    createdAt: user.createdAt.toISOString(),
  };
}
