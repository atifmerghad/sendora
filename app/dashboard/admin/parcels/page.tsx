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
  SimpleGrid,
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableColumnHeader,
  TableCell,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuPositioner,
  MenuItem,
  MenuSeparator,
} from '@chakra-ui/react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { Card } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, ChevronLeft, ChevronRight, MoreVertical, Eye, Package, Tag, Ticket } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/navigation';
import { DateRangePicker } from '@/components/DateRangePicker';

interface AdminParcel {
  id: string;
  codeEnvoi: string;
  dateExpedition: Date;
  telephone: string;
  nomMagasin: string;
  etat: string;
  status: string;
  ville: string;
  prix: number;
}

export default function AdminParcelsPage() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [parcels, setParcels] = useState<AdminParcel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  
  const [search, setSearch] = useState('');
  const [searchMagasin, setSearchMagasin] = useState('');
  const [dateDebut, setDateDebut] = useState<string>('');
  const [dateFin, setDateFin] = useState<string>('');
  
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [mounted, isAdmin, user, router]);

  // Fetch parcels
  useEffect(() => {
    const fetchParcels = async () => {
      if (!isAdmin) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        });
        
        if (search) params.append('search', search);
        if (searchMagasin) params.append('searchMagasin', searchMagasin);
        if (dateDebut) params.append('dateDebut', dateDebut);
        if (dateFin) params.append('dateFin', dateFin);

        const response = await fetch(`/api/admin/parcels?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setParcels(data.parcels || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        } else {
          console.error('Error fetching admin parcels:', data.error);
        }
      } catch (error) {
        console.error('Error fetching admin parcels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParcels();
  }, [isAdmin, page, pageSize, search, searchMagasin, dateDebut, dateFin]);

  // Define columns
  const columns = useMemo<ColumnDef<AdminParcel>[]>(() => [
    {
      accessorKey: 'codeEnvoi',
      header: 'Code d\'envoi',
      cell: ({ row }) => <Text fontWeight="semibold">{row.original.codeEnvoi}</Text>,
    },
    {
      accessorKey: 'dateExpedition',
      header: 'Date d\'expédition',
      cell: ({ row }) => {
        const date = new Date(row.original.dateExpedition);
        return <Text>{date.toLocaleDateString('fr-FR')}</Text>;
      },
    },
    {
      accessorKey: 'telephone',
      header: 'Téléphone',
    },
    {
      accessorKey: 'nomMagasin',
      header: 'Nom du magasin',
    },
    {
      accessorKey: 'etat',
      header: 'Etat',
      cell: ({ row }) => <StatusBadge status={row.original.etat} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'ville',
      header: 'Ville',
    },
    {
      accessorKey: 'prix',
      header: 'Prix',
      cell: ({ row }) => <Text>{row.original.prix.toFixed(2)} MAD</Text>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const parcel = row.original;
        return (
          <MenuRoot positioning={{ placement: 'bottom-end' }}>
            <MenuTrigger asChild>
              <Button size="sm" variant="outline">
                <MoreVertical size={16} />
              </Button>
            </MenuTrigger>
            <MenuPositioner>
              <MenuContent>
                <MenuItem
                  onClick={() => {
                    // TODO: Navigate to tracking details
                    console.log('Details du suivi pour:', parcel.codeEnvoi);
                  }}
                >
                  <HStack gap={2}>
                    <Eye size={16} />
                    <Text>Details du suivi</Text>
                  </HStack>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    // TODO: Navigate to parcel information
                    console.log('Information du colis pour:', parcel.codeEnvoi);
                  }}
                >
                  <HStack gap={2}>
                    <Package size={16} />
                    <Text>Information du colis</Text>
                  </HStack>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    // TODO: Show labels
                    console.log('Voir les étiquettes pour:', parcel.codeEnvoi);
                  }}
                >
                  <HStack gap={2}>
                    <Tag size={16} />
                    <Text>Voir les etiquettes</Text>
                  </HStack>
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                  onClick={() => {
                    // TODO: Navigate to e-tickets
                    console.log('E-tickets pour:', parcel.codeEnvoi);
                  }}
                >
                  <HStack gap={2}>
                    <Ticket size={16} />
                    <Text>E-tickets</Text>
                  </HStack>
                </MenuItem>
              </MenuContent>
            </MenuPositioner>
          </MenuRoot>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: parcels,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    manualPagination: true,
    pageCount: totalPages,
  });

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
  };

  if (!mounted || (!isAdmin && !isLoading)) {
    return null;
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Colis (Parcels)
      </Heading>

      {/* Filters */}
      <Card p={6} mb={6}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {/* Search Magasin */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Rechercher un magasin
            </Text>
            <Input
              placeholder="Nom du magasin..."
              value={searchMagasin}
              onChange={(e) => setSearchMagasin(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
          </Box>

          {/* Date Range */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Date d'expédition
            </Text>
            <DateRangePicker
              startDate={dateDebut}
              endDate={dateFin}
              onDateChange={(start, end) => {
                setDateDebut(start);
                setDateFin(end);
                setPage(1);
              }}
            />
          </Box>

          {/* Entrées par page */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Afficher
            </Text>
            <NativeSelectRoot
              value={pageSize.toString()}
              onValueChange={(e) => {
                setPageSize(parseInt(e.value));
                setPage(1);
              }}
            >
              <NativeSelectField>
                <option value="10">10 entrées par page</option>
                <option value="25">25 entrées par page</option>
                <option value="50">50 entrées par page</option>
                <option value="100">100 entrées par page</option>
              </NativeSelectField>
              <NativeSelectIndicator />
            </NativeSelectRoot>
          </Box>

          {/* General Search */}
          <Box gridColumn={{ base: 'span 1', md: 'span 2', lg: 'span 3' }}>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Rechercher :
            </Text>
            <HStack>
              <Input
                placeholder="Code, nom, téléphone, adresse..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              <Button
                leftIcon={<Search size={16} />}
                onClick={handleSearch}
                colorScheme="blue"
              >
                Rechercher
              </Button>
            </HStack>
          </Box>
        </SimpleGrid>
      </Card>

      {/* Table */}
      <Card p={0} overflow="hidden">
        {isLoading ? (
          <Box p={8} textAlign="center">
            <Text>Chargement...</Text>
          </Box>
        ) : (
          <>
            <Box overflowX="auto">
              <TableRoot>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableColumnHeader
                          key={header.id}
                          px={4}
                          py={3}
                          cursor={header.column.getCanSort() ? 'pointer' : 'default'}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableColumnHeader>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} px={4} py={3}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} textAlign="center" py={8}>
                        <Text>No data available in table</Text>
                        <Text fontSize="sm" color="gray.500" mt={2}>
                          Aucun élément existe
                        </Text>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </TableRoot>
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box p={4} borderTop="1px solid" borderColor="gray.200" _dark={{ borderColor: 'gray.700' }}>
                <HStack justify="space-between" align="center">
                  <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                    Page {page} sur {totalPages} ({total} résultats)
                  </Text>
                  <HStack gap={2}>
                    <Button
                      size="sm"
                      leftIcon={<ChevronLeft size={16} />}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      isDisabled={page === 1}
                      variant="outline"
                    >
                      Précédent
                    </Button>
                    <Button
                      size="sm"
                      rightIcon={<ChevronRight size={16} />}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      isDisabled={page === totalPages}
                      variant="outline"
                    >
                      Suivant
                    </Button>
                  </HStack>
                </HStack>
              </Box>
            )}
          </>
        )}
      </Card>
    </Box>
  );
}

