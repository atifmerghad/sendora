import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { User, SignupData } from '@/types';

export async function createUser(userData: SignupData): Promise<User> {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const newUser = await prisma.user.create({
    data: {
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
      password: hashedPassword,
      telephone: userData.telephone,
      nomMarque: userData.nomMarque,
      siteUrl: userData.siteUrl,
      ville: userData.ville,
    },
  });
  
  // Convert Prisma User to our User type (excluding password for return)
  return {
    id: newUser.id,
    nom: newUser.nom,
    prenom: newUser.prenom,
    email: newUser.email,
    password: newUser.password, // Keep for verification, but don't return in API
    telephone: newUser.telephone,
    nomMarque: newUser.nomMarque,
    siteUrl: newUser.siteUrl,
    ville: newUser.ville,
    createdAt: newUser.createdAt.toISOString(),
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) return null;
  
  return {
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    password: user.password,
    telephone: user.telephone,
    nomMarque: user.nomMarque,
    siteUrl: user.siteUrl,
    ville: user.ville,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  
  if (!user) return null;
  
  return {
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    password: user.password,
    telephone: user.telephone,
    nomMarque: user.nomMarque,
    siteUrl: user.siteUrl,
    ville: user.ville,
    createdAt: user.createdAt.toISOString(),
  };
}
