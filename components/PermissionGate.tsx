'use client';

import { ReactNode } from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { usePermissions } from '@/hooks/usePermissions';
import { Shield } from 'lucide-react';

interface PermissionGateProps {
  permission?: string; // Single permission to check
  permissions?: string[]; // Multiple permissions (requires ALL)
  anyPermission?: string[]; // Multiple permissions (requires ANY)
  fallback?: ReactNode; // Custom fallback component
  children: ReactNode;
}

/**
 * Component to conditionally render content based on user permissions
 */
export function PermissionGate({
  permission,
  permissions,
  anyPermission,
  fallback,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  let hasAccess = false;

  // Check single permission
  if (permission) {
    hasAccess = hasPermission(permission);
  }
  // Check multiple permissions (requires ALL)
  else if (permissions && permissions.length > 0) {
    hasAccess = hasAllPermissions(permissions);
  }
  // Check multiple permissions (requires ANY)
  else if (anyPermission && anyPermission.length > 0) {
    hasAccess = hasAnyPermission(anyPermission);
  }
  // If no permission specified, allow access (shouldn't happen)
  else {
    hasAccess = true;
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default fallback: show access denied message
    return (
      <Box
        p={8}
        textAlign="center"
        bg="gray.50"
        _dark={{ bg: 'gray.800' }}
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.200"
        _dark={{ borderColor: 'gray.700' }}
      >
        <VStack gap={4}>
          <Box
            p={3}
            borderRadius="full"
            bg="red.100"
            _dark={{ bg: 'red.900' }}
            color="red.600"
            _dark={{ color: 'red.300' }}
          >
            <Shield size={24} />
          </Box>
          <VStack gap={2}>
            <Text fontWeight="semibold" fontSize="lg">
              Accès refusé
            </Text>
            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
              Vous n'avez pas les permissions nécessaires pour accéder à ce contenu.
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return <>{children}</>;
}

