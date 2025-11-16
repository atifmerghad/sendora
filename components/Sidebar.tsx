'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
} from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { useColorModeValue } from '@/lib/useColorModeValue';
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  Truck,
  TruckIcon,
  FileText,
  MessageSquare,
  Receipt,
  RotateCcw,
  RotateCcwIcon,
  Warehouse,
  MapPin,
  Users,
  User,
  HelpCircle,
  Code,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  List,
  ArrowDownToLine,
  ArrowUpFromLine,
  PackageX,
  Package2,
  Shield,
  Settings,
  Database,
  BarChart3,
} from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useState, useEffect, useMemo } from 'react';
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent, CollapsibleIndicator } from '@chakra-ui/react';
import { usePermissions } from '@/hooks/usePermissions';

interface SubMenuItem {
  labelKey: string;
  icon: React.ElementType;
  path: string;
  permission?: string; // Permission required to show this item
  adminOnly?: boolean; // Only show for ADMIN users
  clientOnly?: boolean; // Only show for CLIENT users (exclude ADMIN)
}

interface MenuItem {
  labelKey: string;
  icon: React.ElementType;
  path?: string;
  submenu?: SubMenuItem[];
  permission?: string; // Permission required to show this item
  adminOnly?: boolean; // Only show for ADMIN users
  clientOnly?: boolean; // Only show for CLIENT users (exclude ADMIN)
}

const menuItems: MenuItem[] = [
  // Client-only items (excluded for ADMIN)
  { labelKey: 'dashboard', icon: LayoutDashboard, path: '/dashboard', permission: 'dashboard', clientOnly: true },
  { labelKey: 'addParcel', icon: PackagePlus, path: '/dashboard/parcels/add', permission: 'gestionColis', clientOnly: true },
  { labelKey: 'parcelsList', icon: Package, path: '/dashboard/parcels', permission: 'gestionColis', clientOnly: true },
  { labelKey: 'requestPickup', icon: Truck, path: '/dashboard/pickups/add', permission: 'gestionRamassages', clientOnly: true },
  { labelKey: 'pickupsList', icon: TruckIcon, path: '/dashboard/pickups', permission: 'gestionRamassages', clientOnly: true },
  { labelKey: 'tickets', icon: FileText, path: '/dashboard/tickets', permission: 'mesTickets', clientOnly: true },
  {
    labelKey: 'billing',
    icon: Receipt,
    permission: 'gestionFactures',
    clientOnly: true,
    submenu: [
      { labelKey: 'invoiceList', icon: FileText, path: '/dashboard/billing/invoices', permission: 'gestionFactures' },
      { labelKey: 'unbilledParcels', icon: Package, path: '/dashboard/billing/unbilled', permission: 'gestionFactures' },
    ]
  },
  { labelKey: 'requestReturn', icon: RotateCcw, path: '/dashboard/returns/add', permission: 'gestionRetours', clientOnly: true },
  { labelKey: 'returnsList', icon: RotateCcwIcon, path: '/dashboard/returns', permission: 'gestionRetours', clientOnly: true },
  { 
    labelKey: 'inventory', 
    icon: Warehouse,
    permission: 'gestionStock',
    clientOnly: true,
    submenu: [
      { labelKey: 'productList', icon: List, path: '/dashboard/inventory/products', permission: 'gestionStock' },
      { labelKey: 'stockEntry', icon: ArrowDownToLine, path: '/dashboard/inventory/entry', permission: 'gestionStock' },
      { labelKey: 'stockExit', icon: ArrowUpFromLine, path: '/dashboard/inventory/exit', permission: 'gestionStock' },
      { labelKey: 'parcelStockMovement', icon: PackageX, path: '/dashboard/inventory/movement', permission: 'gestionStock' },
      { labelKey: 'packagingManagement', icon: Package2, path: '/dashboard/inventory/packaging', permission: 'gestionStock' },
    ]
  },
  { labelKey: 'cities', icon: MapPin, path: '/dashboard/cities', clientOnly: true }, // Client-only
  { 
    labelKey: 'team', 
    icon: Users,
    clientOnly: true, // Client-only (admin has adminPanel instead)
    submenu: [
      { labelKey: 'users', icon: User, path: '/dashboard/users' },
    ]
  },
  { labelKey: 'help', icon: HelpCircle, path: '/dashboard/help', clientOnly: true }, // Client-only
  { labelKey: 'api', icon: Code, path: '/dashboard/api', clientOnly: true }, // Client-only
  { labelKey: 'messages', icon: MessageSquare, path: '/dashboard/messages', permission: 'chat', clientOnly: true },
  
  // Admin-only menu items (shown only to ADMIN users)
  { labelKey: 'adminPanel', icon: Shield, path: '/dashboard/admin', adminOnly: true },
  { labelKey: 'adminParcels', icon: Package, path: '/dashboard/admin/parcels', adminOnly: true },
  { 
    labelKey: 'adminSettings', 
    icon: Settings, 
    adminOnly: true,
    submenu: [
      { labelKey: 'systemSettings', icon: Settings, path: '/dashboard/admin/settings', adminOnly: true },
      { labelKey: 'databaseManagement', icon: Database, path: '/dashboard/admin/database', adminOnly: true },
      { labelKey: 'analytics', icon: BarChart3, path: '/dashboard/admin/analytics', adminOnly: true },
    ]
  },
];

export function Sidebar() {
  const t = useTranslations('sidebar');
  const { isCollapsed, isMobile, isOpen, toggleSidebar, closeSidebar } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission, isAdmin, isClient } = usePermissions();
  const sidebarBg = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(26, 32, 44, 0.85)');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.300');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // Filter menu items based on permissions and admin status
  const visibleMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      // Admin-only items: only show to ADMIN users
      if (item.adminOnly) {
        return isAdmin;
      }
      
      // Client-only items: exclude for ADMIN users
      if (item.clientOnly && isAdmin) {
        return false;
      }
      
      // If no permission specified, check client-only flag
      if (!item.permission) {
        // Client-only items should not show for admins
        if (item.clientOnly && isAdmin) {
          return false;
        }
        return true;
      }
      
      // For ADMIN users, skip client-only items even if they have permissions
      if (item.clientOnly && isAdmin) {
        return false;
      }
      
      // Check if user has the required permission
      return hasPermission(item.permission);
    }).map(item => {
      // Filter submenu items based on permissions and admin status
      if (item.submenu) {
        return {
          ...item,
          submenu: item.submenu.filter(subItem => {
            // Admin-only submenu items
            if (subItem.adminOnly) {
              return isAdmin;
            }
            // Client-only submenu items: exclude for ADMIN users
            if (subItem.clientOnly && isAdmin) {
              return false;
            }
            // Permission-based submenu items
            if (!subItem.permission) return true;
            return hasPermission(subItem.permission);
          }),
        };
      }
      return item;
    }).filter(item => {
      // If a menu item has submenu, only show it if it has at least one visible submenu item
      if (item.submenu && item.submenu.length === 0) {
        return false;
      }
      return true;
    });
  }, [hasPermission, isAdmin, isClient]);

  const handleItemClick = (path: string) => {
    router.push(path);
    if (isMobile) {
      closeSidebar();
    }
  };

  const toggleSubmenu = (labelKey: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(labelKey)) {
        newSet.delete(labelKey);
      } else {
        newSet.add(labelKey);
      }
      return newSet;
    });
  };

  const isSubmenuActive = (submenu: SubMenuItem[]) => {
    return submenu.some(item => pathname === item.path);
  };

  // Auto-expand submenu if one of its items is active
  useEffect(() => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      visibleMenuItems.forEach(item => {
        if (item.submenu && isSubmenuActive(item.submenu)) {
          newSet.add(item.labelKey);
        }
      });
      return newSet;
    });
  }, [pathname, visibleMenuItems]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={999}
          onClick={closeSidebar}
        />
      )}
      <Box
        position="fixed"
        left={0}
        top={0}
        h="100vh"
        w={isMobile ? (isOpen ? '260px' : '0') : (isCollapsed ? '80px' : '260px')}
        bg={sidebarBg}
        backdropFilter="blur(12px)"
        borderRight="1px solid"
        borderColor={borderColor}
        transition="width 0.3s, transform 0.3s, background 0.2s"
        zIndex={1000}
        display="flex"
        flexDirection="column"
        transform={isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)'}
        overflow="hidden"
        boxShadow="xl"
      >
      <Box
        position="sticky"
        top={0}
        bg={sidebarBg}
        backdropFilter="blur(12px)"
        zIndex={10}
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <HStack
          p={4}
          justify="space-between"
        >
          {!isCollapsed ? (
            <HStack gap={2}>
              <Box color={activeColor}>
                <Package size={24} />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color={activeColor}>
                Sendora
              </Text>
            </HStack>
          ) : (
            <Box color={activeColor}>
              <Package size={24} />
            </Box>
          )}
          <IconButton
            aria-label="Toggle sidebar"
            onClick={toggleSidebar}
            variant="ghost"
            size="sm"
          >
            {isCollapsed ? (
              <HStack gap={0}>
                <ChevronRight size={16} />
                <ChevronRight size={16} style={{ marginLeft: '-8px' }} />
              </HStack>
            ) : (
              <HStack gap={0}>
                <ChevronLeft size={16} />
                <ChevronLeft size={16} style={{ marginLeft: '-8px' }} />
              </HStack>
            )}
          </IconButton>
        </HStack>
      </Box>

      <Box
        flex={1}
        overflowY="auto"
        overflowX="hidden"
      >
        <VStack align="stretch" gap={0} p={2}>
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isActive = item.path ? pathname === item.path : (hasSubmenu && isSubmenuActive(item.submenu!));
            const isExpanded = expandedMenus.has(item.labelKey);
            
            if (hasSubmenu) {
              return (
                <Box key={item.labelKey} w="100%">
                  <CollapsibleRoot open={isExpanded} onOpenChange={(details) => {
                    if (details.open !== isExpanded) {
                      toggleSubmenu(item.labelKey);
                    }
                  }}>
                    <CollapsibleTrigger asChild>
                      <Box
                        as="button"
                        w="100%"
                        p={2}
                        borderRadius="md"
                        bg={isActive ? activeBg : 'transparent'}
                        color={isActive ? activeColor : textColor}
                        _hover={{ bg: hoverBg }}
                        transition="all 0.2s"
                        textAlign="left"
                      >
                        <HStack gap={3} justify="space-between">
                          <HStack gap={3}>
                            <Box flexShrink={0}>
                              <Icon size={20} />
                            </Box>
                            {(!isCollapsed || isMobile) && (
                              <Text fontSize="sm" fontWeight={isActive ? 'semibold' : 'normal'}>
                                {t(item.labelKey)}
                              </Text>
                            )}
                          </HStack>
                          {(!isCollapsed || isMobile) && (
                            <CollapsibleIndicator>
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </CollapsibleIndicator>
                          )}
                        </HStack>
                      </Box>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {(!isCollapsed || isMobile) && (
                        <VStack align="stretch" gap={0} pl={8} mt={0}>
                          {item.submenu!.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = pathname === subItem.path;
                            
                            return (
                              <Box
                                key={subItem.path}
                                as="button"
                                onClick={() => handleItemClick(subItem.path)}
                                p={2}
                                borderRadius="md"
                                bg={isSubActive ? activeBg : 'transparent'}
                                color={isSubActive ? activeColor : textColor}
                                _hover={{ bg: hoverBg }}
                                transition="all 0.2s"
                                textAlign="left"
                                w="100%"
                              >
                                <HStack gap={2}>
                                  <Box flexShrink={0}>
                                    <SubIcon size={16} />
                                  </Box>
                                  <Text fontSize="xs" fontWeight={isSubActive ? 'semibold' : 'normal'}>
                                    {t(subItem.labelKey)}
                                  </Text>
                                </HStack>
                              </Box>
                            );
                          })}
                        </VStack>
                      )}
                    </CollapsibleContent>
                  </CollapsibleRoot>
                </Box>
              );
            }
            
            return (
              <Box
                key={item.path}
                as="button"
                onClick={() => item.path && handleItemClick(item.path)}
                p={2}
                borderRadius="md"
                bg={isActive ? activeBg : 'transparent'}
                color={isActive ? activeColor : textColor}
                _hover={{ bg: hoverBg }}
                transition="all 0.2s"
                textAlign="left"
                w="100%"
              >
                <HStack gap={3}>
                  <Box flexShrink={0}>
                    <Icon size={20} />
                  </Box>
                  {(!isCollapsed || isMobile) && (
                    <Text fontSize="sm" fontWeight={isActive ? 'semibold' : 'normal'}>
                      {t(item.labelKey)}
                    </Text>
                  )}
                </HStack>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </Box>
    </>
  );
}

