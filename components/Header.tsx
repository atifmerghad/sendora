'use client';

import {
  Box,
  HStack,
  AvatarRoot,
  AvatarFallback,
  Text,
  IconButton,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuPositioner,
  MenuItem,
  Badge,
  VStack,
  Button,
} from '@chakra-ui/react';
import { Bell, Sun, Moon, LogOut, UserCircle, Globe, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useColorMode } from '@/lib/useColorMode';
import { useColorModeValue } from '@/lib/useColorModeValue';
import { useSidebar } from '@/contexts/SidebarContext';
import { useLocale } from '@/contexts/LocaleContext';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { isCollapsed, isMobile, toggleSidebar } = useSidebar();
  const { colorMode, toggleColorMode } = useColorMode();
  const { locale, setLocale } = useLocale();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={isMobile ? '0' : (isCollapsed ? '80px' : '260px')}
      right={0}
      h={{ base: '60px', md: '70px' }}
      bg={bg}
      borderBottom="1px solid"
      borderColor={borderColor}
      px={{ base: 4, md: 6 }}
      zIndex={999}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      transition="left 0.3s"
    >
      {isMobile && (
        <IconButton
          aria-label="Toggle menu"
          onClick={toggleSidebar}
          variant="ghost"
          size="sm"
          mr={2}
        >
          <Menu size={20} />
        </IconButton>
      )}
      <Box flex={1} />

      <HStack gap={{ base: 2, md: 4 }}>
        <MenuRoot positioning={{ placement: 'bottom-end' }}>
          <MenuTrigger asChild>
            <IconButton
              aria-label="Select language"
              variant="ghost"
            >
              <Globe size={20} />
            </IconButton>
          </MenuTrigger>
          <MenuPositioner>
            <MenuContent>
              <MenuItem
                onClick={() => setLocale('fr')}
                bg={locale === 'fr' ? 'blue.50' : 'transparent'}
                _dark={{ bg: locale === 'fr' ? 'blue.900' : 'transparent' }}
              >
                <Text>Français</Text>
              </MenuItem>
              <MenuItem
                onClick={() => setLocale('en')}
                bg={locale === 'en' ? 'blue.50' : 'transparent'}
                _dark={{ bg: locale === 'en' ? 'blue.900' : 'transparent' }}
              >
                <Text>English</Text>
              </MenuItem>
              <MenuItem
                onClick={() => setLocale('ar')}
                bg={locale === 'ar' ? 'blue.50' : 'transparent'}
                _dark={{ bg: locale === 'ar' ? 'blue.900' : 'transparent' }}
              >
                <Text>العربية</Text>
              </MenuItem>
            </MenuContent>
          </MenuPositioner>
        </MenuRoot>

        <IconButton
          aria-label="Toggle theme"
          onClick={toggleColorMode}
          variant="ghost"
        >
          {colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </IconButton>

        <Box position="relative">
          <IconButton
            aria-label="Notifications"
            variant="ghost"
          >
            <Bell size={20} />
          </IconButton>
          <Badge
            position="absolute"
            top={0}
            right={0}
            bg="red.500"
            color="white"
            borderRadius="full"
            w={5}
            h={5}
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="xs"
          >
            3
          </Badge>
        </Box>

        <MenuRoot positioning={{ placement: 'bottom-end' }}>
          <MenuTrigger asChild>
            <Box as="button" cursor="pointer" type="button">
              <HStack gap={3}>
                <AvatarRoot size="sm" bg="blue.500">
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </AvatarRoot>
                <VStack align="start" gap={0} display={{ base: 'none', md: 'flex' }}>
                  <Text fontSize="xs" fontWeight="semibold" color={textColor}>
                    {user?.nomMarque}
                  </Text>
                  <Text fontSize="xs" color={textColor}>
                    {user?.prenom} {user?.nom}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </MenuTrigger>
          <MenuPositioner>
            <MenuContent>
              <Box p={4} borderBottom="1px solid" borderColor="gray.200" _dark={{ borderColor: 'gray.700' }}>
                <VStack align="start" gap={1}>
                  <Text fontWeight="semibold" fontSize="sm">
                    {user?.prenom} {user?.nom}
                  </Text>
                  <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
                    {user?.email}
                  </Text>
                </VStack>
              </Box>
              <MenuItem onClick={() => router.push('/dashboard/profile')}>
                <HStack gap={2}>
                  <UserCircle size={16} />
                  <Text>Mon profil</Text>
                </HStack>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <HStack gap={2}>
                  <LogOut size={16} />
                  <Text>Se déconnecter</Text>
                </HStack>
              </MenuItem>
            </MenuContent>
          </MenuPositioner>
        </MenuRoot>
      </HStack>
    </Box>
  );
}

