'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export function ProfileCompletionCheck() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't show on profile page itself
    if (pathname === '/dashboard/profile') return;

    // Check if profile is incomplete
    if (user) {
      // Check if banking info exists (stored in localStorage for demo)
      const bankingInfo = localStorage.getItem('sendora_banking_info');
      
      // If no banking info, show the toast
      if (!bankingInfo) {
        // Show toast after a short delay to ensure UI is ready
        setTimeout(() => {
          const description = `Afin d'assurer la réception de vos factures, nous vous prions de bien vouloir compléter votre profil

من أجل ضمان استلامكم للفواتير بشكل سليم، نرجو منكم إكمال بيانات ملفكم الشخصي`;
          
          toast({
            title: 'Profil incomplet',
            description: description,
            status: 'warning',
            duration: 15000,
            isClosable: true,
            actionLabel: 'Compléter le profil',
            onAction: () => {
              router.push('/dashboard/profile?tab=banking');
            },
          });
        }, 1500);
      }
    }
  }, [user, toast, router, pathname]);

  return null;
}

