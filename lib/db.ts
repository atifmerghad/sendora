import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/nextjs-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a fresh Prisma Client instance
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

// Check if cached instance exists and has the new models
function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  
  if (!cached) {
    // No cached instance, create a new one
    const newInstance = createPrismaClient();
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = newInstance;
    }
    return newInstance;
  }
  
  // In development, clear cache and create fresh instance
  // This ensures we always use the latest Prisma Client after schema changes
  if (process.env.NODE_ENV === 'development') {
    try {
      cached.$disconnect().catch(() => {});
    } catch {
      // Ignore disconnect errors
    }
    // Always create fresh instance in development to pick up schema changes
    const newInstance = createPrismaClient();
    globalForPrisma.prisma = newInstance;
    return newInstance;
  }
  
  // Verify cached instance has the new models
  // Try to access the models - if they don't exist, accessing them might throw or return undefined
  try {
    const cachedAny = cached as any;
    // Check if webhook and apiKey models exist and have the expected methods
    // Prisma Client models are objects with methods like findMany, create, etc.
    const hasWebhook = cachedAny.webhook && typeof cachedAny.webhook.findMany === 'function';
    const hasApiKey = cachedAny.apiKey && typeof cachedAny.apiKey.findMany === 'function';
    const hasBusiness = cachedAny.business && typeof cachedAny.business.findMany === 'function';
    const hasUserBusiness = cachedAny.userBusiness && typeof cachedAny.userBusiness.findMany === 'function';
    const hasPermission = cachedAny.permission && typeof cachedAny.permission.findMany === 'function';
    const hasUserPermission = cachedAny.userPermission && typeof cachedAny.userPermission.findMany === 'function';
    
    if (!hasWebhook || !hasApiKey || !hasBusiness || !hasUserBusiness || !hasPermission || !hasUserPermission) {
      // Cached instance is outdated - it doesn't have the new models
      console.warn('[Prisma] Cached instance is outdated (missing models), creating new instance...');
      // Disconnect old instance gracefully
      cached.$disconnect().catch(() => {
        // Ignore disconnect errors
      });
      // Create new instance
      const newInstance = createPrismaClient();
      // Update cache
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = newInstance;
      }
      return newInstance;
    }
    // Cached instance is valid and has the new models
    return cached;
  } catch (error) {
    // Error checking cached instance, assume it's invalid and create a new one
    console.warn('[Prisma] Error checking cached instance, creating new instance...', error);
    try {
      cached.$disconnect().catch(() => {
        // Ignore disconnect errors
      });
    } catch {
      // Ignore disconnect errors
    }
    const newInstance = createPrismaClient();
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = newInstance;
    }
    return newInstance;
  }
}

export const prisma = getPrismaClient();

