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
  
  const newUser = await prisma.user.create({
    data: {
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
      password: hashedPassword,
      telephone: userData.telephone,
      roleId: roleId,
      businessId: businessId || null,
    },
    include: { role: true }, // Include role relation
  });
  
  // Get business info to populate nomMarque, siteUrl, ville for compatibility
  const business = businessId ? await prisma.business.findUnique({
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
    etat: newUser.etat || null,
    imageProfil: newUser.imageProfil || null,
    createdAt: newUser.createdAt.toISOString(),
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true }, // Include role relation
  });
  
  if (!user) return null;
  
  // Get user's business to populate nomMarque, siteUrl, ville
  // Try direct businessId first, then fallback to UserBusiness join table
  const business = user.businessId ? await prisma.business.findUnique({
    where: { id: user.businessId },
  }) : null;
  
  const userBusiness = !business ? await prisma.userBusiness.findFirst({
    where: { userId: user.id },
    include: { business: true },
  }) : null;

  return {
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    password: user.password,
    telephone: user.telephone,
    nomMarque: business?.businessName || userBusiness?.business.businessName || '', // Get from business
    siteUrl: business?.siteUrl || userBusiness?.business.siteUrl || '', // Get from business
    ville: business?.ville || userBusiness?.business.ville || '', // Get from business
    roleId: user.roleId,
    roleName: user.role?.name || 'CLIENT',
    role: user.role ? {
      id: user.role.id,
      name: user.role.name,
      createdAt: user.role.createdAt.toISOString(),
      updatedAt: user.role.updatedAt.toISOString(),
    } : undefined,
    permissions: user.permissions || null,
    deuxiemeTelephone: user.deuxiemeTelephone || null,
    adresse: user.adresse || null,
    etat: user.etat || null,
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
    include: { role: true }, // Include role relation
  });
  
  if (!user) return null;
  
  // Get user's business to populate nomMarque, siteUrl, ville
  // Try direct businessId first, then fallback to UserBusiness join table
  const business = user.businessId ? await prisma.business.findUnique({
    where: { id: user.businessId },
  }) : null;
  
  const userBusiness = !business ? await prisma.userBusiness.findFirst({
    where: { userId: user.id },
    include: { business: true },
  }) : null;

  return {
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    password: user.password,
    telephone: user.telephone,
    nomMarque: business?.businessName || userBusiness?.business.businessName || '', // Get from business
    siteUrl: business?.siteUrl || userBusiness?.business.siteUrl || '', // Get from business
    ville: business?.ville || userBusiness?.business.ville || '', // Get from business
    roleId: user.roleId,
    roleName: user.role?.name || 'CLIENT',
    role: user.role ? {
      id: user.role.id,
      name: user.role.name,
      createdAt: user.role.createdAt.toISOString(),
      updatedAt: user.role.updatedAt.toISOString(),
    } : undefined,
    permissions: user.permissions || null,
    deuxiemeTelephone: user.deuxiemeTelephone || null,
    adresse: user.adresse || null,
    etat: user.etat || null,
    imageProfil: user.imageProfil || null,
    createdAt: user.createdAt.toISOString(),
  };
}
