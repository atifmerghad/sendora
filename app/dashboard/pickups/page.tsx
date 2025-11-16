'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Heading,
  Input,
  HStack,
  VStack,
  Button,
  Text,
  NativeSelectRoot,
  NativeSelectField,
  NativeSelectIndicator,
} from '@chakra-ui/react';
import { TanStackTable } from '@/components/TanStackTable';
import { type ColumnDef } from '@tanstack/react-table';
import { Card } from '@/components/Card';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionGate } from '@/components/PermissionGate';

interface Pickup {
  id: string;
  code: string;
  statut: 'en_attente' | 'programme' | 'effectue' | 'annule';
  ville: string;
  nombreColis: number;
  dateDemande: string;
  frais: number;
  nom: string;
  telephone: string;
  note: string;
  vendeurSecondaire: string;
}

export default function PickupsPage() {
  const { user } = useAuth();
  
  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<Pickup>[]>(() => [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <Text fontWeight="semibold">{row.original.code}</Text>,
    },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ row }) => <StatusBadge status={row.original.statut} />,
    },
    {
      accessorKey: 'ville',
      header: 'Ville/Quartier du ramassage',
    },
    {
      accessorKey: 'nombreColis',
      header: 'Nombre des colis',
    },
    {
      accessorKey: 'dateDemande',
      header: 'Date demande',
    },
    {
      accessorKey: 'frais',
      header: 'Frais',
      cell: ({ row }) => `${row.original.frais} MAD`,
    },
    {
      accessorKey: 'nom',
      header: 'Nom',
    },
    {
      accessorKey: 'telephone',
      header: 'Téléphone',
    },
    {
      accessorKey: 'note',
      header: 'Note',
      cell: ({ row }) => row.original.note || '-',
    },
    {
      accessorKey: 'vendeurSecondaire',
      header: 'Vendeur Secondaire',
      cell: ({ row }) => row.original.vendeurSecondaire || '-',
    },
  ], []);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  // Calculate date range based on selection
  const getDateRange = (range: string, customStart: string = '', customEnd: string = ''): { start: string; end: string } => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    let start = '';
    let end = todayStr;

    switch (range) {
      case 'all':
        // Return empty strings to show all pickups
        return { start: '', end: '' };
      case 'today':
        start = todayStr;
        end = todayStr;
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        start = yesterday.toISOString().split('T')[0];
        end = start;
        break;
      case 'last3days':
        const last3 = new Date(today);
        last3.setDate(last3.getDate() - 3);
        start = last3.toISOString().split('T')[0];
        break;
      case 'last7days':
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        start = last7.toISOString().split('T')[0];
        break;
      case 'last14days':
        const last14 = new Date(today);
        last14.setDate(last14.getDate() - 14);
        start = last14.toISOString().split('T')[0];
        break;
      case 'last30days':
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        start = last30.toISOString().split('T')[0];
        break;
      case 'thisMonth':
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        start = thisMonthStart.toISOString().split('T')[0];
        break;
      case 'lastMonth':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        start = lastMonthStart.toISOString().split('T')[0];
        end = lastMonthEnd.toISOString().split('T')[0];
        break;
      case 'last3months':
        const last3Months = new Date(today);
        last3Months.setMonth(last3Months.getMonth() - 3);
        start = last3Months.toISOString().split('T')[0];
        break;
      case 'lastYear':
        const lastYear = new Date(today);
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        start = lastYear.toISOString().split('T')[0];
        break;
      case 'custom':
      default:
        return { start: customStart, end: customEnd };
    }

    return { start, end };
  };

  // Initialize date range on mount and update when selection changes
  useEffect(() => {
    if (dateRange !== 'custom' && dateRange !== 'all') {
      const { start, end } = getDateRange(dateRange);
      setDateDebut(start);
      setDateFin(end);
      setCurrentPage(1);
    } else if (dateRange === 'all') {
      setDateDebut('');
      setDateFin('');
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  // Fetch pickups from API
  useEffect(() => {
    const fetchPickups = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          userId: user.id,
        });

        if (searchTerm) params.append('search', searchTerm);
        if (dateRange !== 'all') {
          const effectiveDateDebut = dateRange !== 'custom' ? getDateRange(dateRange, dateDebut, dateFin).start : dateDebut;
          const effectiveDateFin = dateRange !== 'custom' ? getDateRange(dateRange, dateDebut, dateFin).end : dateFin;
          if (effectiveDateDebut) params.append('dateDebut', effectiveDateDebut);
          if (effectiveDateFin) params.append('dateFin', effectiveDateFin);
        }

        const response = await fetch(`/api/pickups?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setPickups(data.pickups);
          setTotal(data.total);
        } else {
          console.error('Error fetching pickups:', data.error);
          setPickups([]);
          setTotal(0);
        }
      } catch (error) {
        console.error('Error fetching pickups:', error);
        setPickups([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPickups();
  }, [searchTerm, dateRange, dateDebut, dateFin, currentPage, user?.id, itemsPerPage]);

  const totalPages = Math.ceil(total / itemsPerPage);

  const handleSearch = () => {
    setCurrentPage(1);
  };


  return (
    <PermissionGate permission="gestionRamassages">
      <Box>
      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
        <Heading size={{ base: 'md', md: 'lg' }}>Ramassages</Heading>
        <Button 
          colorScheme="blue" 
          onClick={() => window.location.href = '/dashboard/pickups/add'}
          size={{ base: 'sm', md: 'md' }}
          bg="blue.600"
          color="white"
          _hover={{ bg: 'blue.700' }}
          _active={{ bg: 'blue.800' }}
        >
          Demander un ramassage
        </Button>
      </HStack>

      <Card p={{ base: 4, md: 6 }} mb={6}>
        <HStack gap={3} flexWrap="wrap" align="end">
          <Box flex={{ base: '1 1 100%', sm: '0 0 auto' }} minW={{ base: '100%', sm: '220px' }}>
            <Input
              placeholder="Rechercher un ramassage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="md"
              borderRadius="lg"
              borderColor="gray.300"
              _hover={{ borderColor: 'gray.400' }}
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
            />
          </Box>
          <Box flex={{ base: '1 1 100%', sm: '0 0 auto' }} minW={{ base: '100%', sm: '240px' }}>
            <NativeSelectRoot size="md" borderRadius="lg">
              <NativeSelectField
                value={dateRange}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setDateRange(e.target.value);
                }}
                borderColor="gray.300"
                _hover={{ borderColor: 'gray.400' }}
                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
              >
                <option value="all">Tous</option>
                <option value="today">Aujourd'hui</option>
                <option value="yesterday">Hier</option>
                <option value="last3days">Les 3 derniers jours</option>
                <option value="last7days">Les 7 derniers jours</option>
                <option value="last14days">Les 14 derniers jours</option>
                <option value="last30days">Les 30 derniers jours</option>
                <option value="thisMonth">Ce mois</option>
                <option value="lastMonth">Le mois dernier</option>
                <option value="last3months">Trois mois</option>
                <option value="lastYear">Un an</option>
                <option value="custom">Date personnalisée</option>
              </NativeSelectField>
              <NativeSelectIndicator />
            </NativeSelectRoot>
          </Box>
          {dateRange === 'custom' && (
            <Box flex={{ base: '1 1 100%', sm: '0 0 auto' }} minW={{ base: '100%', sm: '300px' }} maxW={{ base: '100%', sm: '350px' }}>
              <DateRangePicker
                startDate={dateDebut}
                endDate={dateFin}
                onDateChange={(start, end) => {
                  setDateDebut(start);
                  setDateFin(end);
                  setCurrentPage(1);
                }}
                placeholder="Sélectionner une plage de dates"
              />
            </Box>
          )}
        </HStack>
      </Card>

      <Card p={{ base: 4, md: 6 }}>
        {isLoading ? (
          <Text textAlign="center" py={8}>Chargement...</Text>
        ) : pickups.length === 0 ? (
          <VStack py={8} gap={4}>
            <Text color="gray.500" textAlign="center">Aucun ramassage trouvé</Text>
          </VStack>
        ) : (
          <>
            <TanStackTable
              data={pickups}
              columns={columns}
              enableSorting={true}
              enablePagination={false}
            />
            {total > 0 && (
              <VStack align="stretch" gap={3} mt={4}>
                <Text fontSize="sm" color="gray.600" display={{ base: 'none', sm: 'block' }}>
                  {itemsPerPage} éléments par page
                </Text>
                <HStack justify="space-between" gap={2} flexWrap="wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    flex={{ base: '1', sm: 'none' }}
                  >
                    <ChevronLeft size={16} style={{ marginRight: '4px' }} />
                    <Text display={{ base: 'none', sm: 'block' }}>Précédent</Text>
                    <Text display={{ base: 'block', sm: 'none' }}>Préc.</Text>
                  </Button>
                  <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
                    Page {currentPage} sur {totalPages}
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    flex={{ base: '1', sm: 'none' }}
                  >
                    <Text display={{ base: 'none', sm: 'block' }}>Suivant</Text>
                    <Text display={{ base: 'block', sm: 'none' }}>Suiv.</Text>
                    <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                  </Button>
                </HStack>
              </VStack>
            )}
          </>
        )}
      </Card>
      </Box>
    </PermissionGate>
  );
}
