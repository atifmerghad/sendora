'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import {
  Box,
  HStack,
  VStack,
  Button,
  Text,
} from '@chakra-ui/react';
import { AlertCircle } from 'lucide-react';
import { useEffect, useRef, Suspense, useState } from 'react';

function ProfileIncompleteAlertContent() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  const alertRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [hasBankingInfo, setHasBankingInfo] = useState(true); // Default to true to avoid flash

  // Only check localStorage after component is mounted
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const bankingInfo = localStorage.getItem('sendora_banking_info');
      setHasBankingInfo(!!bankingInfo);
    }
  }, []);

  // Update CSS variable with alert height for dynamic padding
  // This hook must be called before any early returns
  useEffect(() => {
    if (!alertRef.current) return;

    const updateHeight = () => {
      if (alertRef.current) {
        const height = alertRef.current.offsetHeight;
        if (height > 0) {
          document.documentElement.style.setProperty('--alert-height', `${height}px`);
          // Dispatch custom event to notify layout
          window.dispatchEvent(new CustomEvent('alert-height-updated'));
        }
      }
    };

    // Initial update after render
    const timeout1 = setTimeout(updateHeight, 50);
    const timeout2 = setTimeout(updateHeight, 200);
    const timeout3 = setTimeout(updateHeight, 500);
    
    window.addEventListener('resize', updateHeight);
    
    // Use ResizeObserver for more accurate height tracking
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && alertRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });
      resizeObserver.observe(alertRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [isCollapsed]);

  // Don't show on profile page itself
  if (pathname === '/dashboard/profile') return null;

  // Check if profile is incomplete
  if (!user) return null;

  // Don't show until mounted to avoid hydration mismatch
  if (!mounted) return null;
  
  // If banking info exists, don't show alert
  if (hasBankingInfo) return null;

  const handleCompleteProfile = () => {
    router.push('/dashboard/profile?tab=banking');
  };

  return (
    <Box
      ref={alertRef}
      ml={isCollapsed ? '80px' : '260px'}
      mt="70px"
      width={isCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 260px)'}
      px={6}
      py={3}
      bg="red.500"
      borderBottom="2px solid"
      borderColor="red.600"
      _dark={{ bg: 'red.600', borderColor: 'red.700' }}
      transition="margin-left 0.3s, width 0.3s"
      boxShadow="md"
    >
      <HStack gap={4} align="center" justify="space-between" flexWrap="wrap">
        <HStack gap={3} align="center" flex="1" minW="300px">
          <AlertCircle size={20} color="white" />
          <VStack align="start" gap={0.5} flex="1">
            <Text fontSize="sm" fontWeight="semibold" color="white" mb={1}>
              Profil incomplet
            </Text>
            <Text fontSize="xs" color="red.50" _dark={{ color: 'red.100' }} lineHeight="1.4">
              Afin d'assurer la réception de vos factures, nous vous prions de bien vouloir compléter votre profil
            </Text>
            <Text fontSize="xs" fontStyle="italic" color="red.50" _dark={{ color: 'red.100' }} lineHeight="1.4">
              من أجل ضمان استلامكم للفواتير بشكل سليم، نرجو منكم إكمال بيانات ملفكم الشخصي
            </Text>
          </VStack>
        </HStack>
        <Button
          size="sm"
          bg="white"
          color="red.600"
          _hover={{ bg: 'red.50' }}
          onClick={handleCompleteProfile}
          minW="150px"
          fontWeight="semibold"
        >
          Compléter le profil
        </Button>
      </HStack>
    </Box>
  );
}

export function ProfileIncompleteAlert() {
  return (
    <Suspense fallback={null}>
      <ProfileIncompleteAlertContent />
    </Suspense>
  );
}

