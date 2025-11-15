'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Heading,
  Input,
  HStack,
  Button,
  Text,
  IconButton,
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
  VStack,
  Separator,
} from '@chakra-ui/react';
import { Card } from '@/components/Card';
import { TanStackTable } from '@/components/TanStackTable';
import { type ColumnDef } from '@tanstack/react-table';
import { Search, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface City {
  id: number;
  ville: string;
  price: number;
  delais?: string | null;
  region?: string | null;
  arabicName?: string | null;
  active?: string | null;
  refusedCost: number;
  canceledCost: number;
}

export default function CitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) {
          params.set('search', searchTerm);
        }
        const response = await fetch(`/api/cities?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setCities(data);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, [searchTerm]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleView = (city: City) => {
    setSelectedCity(city);
    setIsDialogOpen(true);
  };

  const handleSearch = () => {
    // Search is handled by the useEffect when searchTerm changes
  };

  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<City>[]>(() => [
    {
      accessorKey: 'ville',
      header: 'Nom',
      cell: ({ row }) => <Text fontWeight="semibold">{row.original.ville}</Text>,
    },
    {
      accessorKey: 'price',
      header: 'Prix',
      cell: ({ row }) => (
        <Text fontWeight="medium" color="blue.500">
          {row.original.price} DH
        </Text>
      ),
    },
    {
      accessorKey: 'delais',
      header: 'Délais',
      cell: ({ row }) => <Text>{row.original.delais || '-'}</Text>,
    },
    {
      accessorKey: 'refusedCost',
      header: 'Frais de refus',
      cell: ({ row }) => (
        <Text color={row.original.refusedCost > 0 ? 'red.500' : 'gray.500'}>
          {row.original.refusedCost} DH
        </Text>
      ),
    },
    {
      accessorKey: 'canceledCost',
      header: "Frais d'annulation",
      cell: ({ row }) => (
        <Text color={row.original.canceledCost > 0 ? 'red.500' : 'gray.500'}>
          {row.original.canceledCost} DH
        </Text>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <IconButton
          aria-label="Voir"
          size="sm"
          variant="ghost"
          onClick={() => handleView(row.original)}
        >
          <Eye size={16} />
        </IconButton>
      ),
    },
  ], []);

  // Pagination calculations
  const totalPages = Math.ceil(cities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCities = cities.slice(startIndex, endIndex);

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Liste des villes
      </Heading>

      <Card p={6}>
        <HStack mb={4}>
          <Input 
            placeholder="Rechercher une ville..." 
            maxW="300px"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={handleSearch} colorScheme="blue">
            <Search size={16} style={{ marginRight: '4px' }} />
            Rechercher
          </Button>
        </HStack>

        {isLoading ? (
          <Text textAlign="center" py={8} color="gray.500">
            Chargement...
          </Text>
        ) : cities.length === 0 ? (
          <VStack py={8} gap={4}>
            <Text color="gray.500" textAlign="center">Aucune ville trouvée</Text>
          </VStack>
        ) : (
          <>
            <TanStackTable
              data={paginatedCities}
              columns={columns}
              enableSorting={true}
              enablePagination={false}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <VStack align="stretch" gap={3} mt={4}>
                <Text fontSize="sm" color="gray.600" display={{ base: 'none', sm: 'block' }}>
                  {itemsPerPage} éléments par page
                </Text>
                <HStack justify="space-between" gap={2} flexWrap="wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    isDisabled={currentPage === 1}
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
                    isDisabled={currentPage === totalPages}
                    flex={{ base: '1', sm: 'none' }}
                  >
                    <Text display={{ base: 'none', sm: 'block' }}>Suivant</Text>
                    <Text display={{ base: 'block', sm: 'none' }}>Suiv.</Text>
                    <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                  </Button>
                </HStack>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  {cities.length} ville{cities.length > 1 ? 's' : ''} au total
                </Text>
              </VStack>
            )}
          </>
        )}
      </Card>

      {/* City Details Dialog */}
      {selectedCity && (
        <DialogRoot open={isDialogOpen} onOpenChange={(details) => setIsDialogOpen(details.open)}>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent maxW="600px">
              <DialogHeader>
                <HStack justify="space-between" align="center" width="100%">
                  <DialogTitle>Affichage Ville</DialogTitle>
                  <DialogCloseTrigger asChild>
                    <IconButton aria-label="Fermer" size="sm" variant="ghost">
                      <X size={16} />
                    </IconButton>
                  </DialogCloseTrigger>
                </HStack>
              </DialogHeader>
              <DialogBody>
                <VStack align="stretch" gap={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={1}>
                      Région
                    </Text>
                    <Text fontSize="md">{selectedCity.region}</Text>
                  </Box>

                  <Separator />

                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={1}>
                      Nom
                    </Text>
                    <Text fontSize="md" fontWeight="medium">{selectedCity.ville}</Text>
                  </Box>

                  <Separator />

                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={1}>
                      Prix
                    </Text>
                    <Text fontSize="md" fontWeight="medium" color="blue.500">
                      {selectedCity.price} DH
                    </Text>
                  </Box>

                  <Separator />

                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={1}>
                      Délais
                    </Text>
                    <Text fontSize="md">{selectedCity.delais || '-'}</Text>
                  </Box>

                  <Separator />

                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={1}>
                      Frais de refus
                    </Text>
                    <Text fontSize="md" color={selectedCity.refusedCost > 0 ? 'red.500' : 'gray.500'}>
                      {selectedCity.refusedCost} DH
                    </Text>
                  </Box>

                  <Separator />

                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={1}>
                      Frais d'annulation
                    </Text>
                    <Text fontSize="md" color={selectedCity.canceledCost > 0 ? 'red.500' : 'gray.500'}>
                      {selectedCity.canceledCost} DH
                    </Text>
                  </Box>
                </VStack>
              </DialogBody>
            </DialogContent>
          </DialogPositioner>
        </DialogRoot>
      )}
    </Box>
  );
}
