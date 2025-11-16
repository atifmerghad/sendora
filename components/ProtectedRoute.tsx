'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Box, Spinner } from '@chakra-ui/react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only redirect if we've finished loading and user is not authenticated
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, mounted]);

  // Show loading spinner while checking authentication or during initial mount
  if (!mounted || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh" suppressHydrationWarning>
        <Spinner size="xl" />
      </Box>
    );
  }

  // Show loading spinner if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh" suppressHydrationWarning>
        <Spinner size="xl" />
      </Box>
    );
  }

  return <>{children}</>;
}

