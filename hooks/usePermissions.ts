'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

/**
 * Permission names mapping
 */
export const PERMISSIONS = {
  DASHBOARD: 'dashboard',
  GESTION_COLIS: 'gestionColis',
  GESTION_RAMASSAGES: 'gestionRamassages',
  GESTION_STOCK: 'gestionStock',
  GESTION_RETOURS: 'gestionRetours',
  GESTION_FACTURES: 'gestionFactures',
  CHAT: 'chat',
  MES_TICKETS: 'mesTickets',
} as const;

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const { user } = useAuth();

  // Get user permissions as array
  const permissions = useMemo(() => {
    if (!user?.permissions) return [];
    
    // Handle both array and string formats (backward compatibility)
    if (Array.isArray(user.permissions)) {
      return user.permissions;
    }
    
    // If it's a string, try to parse it as JSON
    if (typeof user.permissions === 'string') {
      try {
        const parsed = JSON.parse(user.permissions);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    
    return [];
  }, [user?.permissions]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useMemo(() => {
    return (permission: PermissionName | string): boolean => {
      // ADMIN and CLIENT roles have all permissions
      if (user?.roleName === 'ADMIN' || user?.roleName === 'CLIENT') {
        return true;
      }
      
      return permissions.includes(permission);
    };
  }, [permissions, user?.roleName]);

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useMemo(() => {
    return (requiredPermissions: PermissionName[] | string[]): boolean => {
      // ADMIN and CLIENT roles have all permissions
      if (user?.roleName === 'ADMIN' || user?.roleName === 'CLIENT') {
        return true;
      }
      
      return requiredPermissions.some(permission => permissions.includes(permission));
    };
  }, [permissions, user?.roleName]);

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = useMemo(() => {
    return (requiredPermissions: PermissionName[] | string[]): boolean => {
      // ADMIN and CLIENT roles have all permissions
      if (user?.roleName === 'ADMIN' || user?.roleName === 'CLIENT') {
        return true;
      }
      
      return requiredPermissions.every(permission => permissions.includes(permission));
    };
  }, [permissions, user?.roleName]);

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: user?.roleName === 'ADMIN',
    isClient: user?.roleName === 'CLIENT',
    isMember: user?.roleName === 'MEMBER',
    isLivreur: user?.roleName === 'LIVREUR',
  };
}

