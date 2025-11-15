'use client';

import { Box, Spinner } from '@chakra-ui/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { ProfileIncompleteAlert } from './ProfileIncompleteAlert';
import { Suspense } from 'react';

function DashboardContentInner({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobile } = useSidebar();

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <Sidebar />
      <Header />
      <ProfileIncompleteAlert />
      <Box 
        ml={isMobile ? '0' : (isCollapsed ? '80px' : '260px')} 
        pt={isMobile ? '60px' : '70px'}
        transition="margin-left 0.3s, padding-top 0.3s"
      >
        <Box 
          p={{ base: 4, md: 6 }}
          id="main-content"
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="xl" />
      </Box>
    }>
      <DashboardContentInner>{children}</DashboardContentInner>
    </Suspense>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}

