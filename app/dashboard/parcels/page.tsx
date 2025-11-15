'use client';

import { useState, useMemo, useEffect } from 'react';
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
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleIndicator,
} from '@chakra-ui/react';
import { TanStackTable } from '@/components/TanStackTable';
import { type ColumnDef } from '@tanstack/react-table';
import { Card } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';
import { Download, Upload, Printer, Plus, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Parcel } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const statutOptions = [
  { value: '', label: 'Sélectionnez tous' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'a_preparer', label: 'À préparer' },
  { value: 'a_changer', label: 'À changer' },
  { value: 'ramassage_en_cours', label: 'Ramassage en cours' },
  { value: 'ramassage_a_verifier', label: 'Ramassage à vérifier' },
  { value: 'ramasse', label: 'Ramassé' },
  { value: 'entrepot', label: 'Entrepôt' },
  { value: 'en_transit', label: 'En transit' },
  { value: 'distribue', label: 'Distribué' },
  { value: 'injoignable', label: 'Injoignable' },
  { value: 'reporte', label: 'Reporté' },
  { value: 'programme', label: 'Programmé' },
  { value: 'en_cours_de_livraison', label: 'En cours de livraison' },
  { value: 'annule', label: 'Annulé' },
  { value: 'refuse', label: 'Refusé' },
  { value: 'livre', label: 'Livré' },
  { value: 'rembourse', label: 'Remboursé' },
];

const statutFacturationOptions = [
  { value: '', label: 'Sélectionnez tous' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'facture', label: 'Facturé' },
];

const typeColisOptions = [
  { value: '', label: 'Sélectionnez tous' },
  { value: 'colis_stock', label: 'Colis de stock' },
  { value: 'colis_normal', label: 'Colis Normal' },
  { value: 'echange_avec', label: 'Échange - Avec échange' },
  { value: 'echange_sans', label: 'Échange - Sans échange' },
];

const dateTypeOptions = [
  { value: 'date_creation', label: 'Date de création' },
  { value: 'date_livraison', label: 'Date de livraison' },
  { value: 'date_ramassage', label: 'Date de ramassage' },
];

export default function ParcelsPage() {
  const { user } = useAuth();
  
  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<Parcel>[]>(() => [
    {
      accessorKey: 'ville',
      header: 'Ville du client',
    },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ row }) => <StatusBadge status={row.original.statut} />,
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <Text fontWeight="semibold">{row.original.code}</Text>,
    },
    {
      accessorKey: 'fraisLivraison',
      header: 'Frais de livraison',
      cell: ({ row }) => `${row.original.fraisLivraison} MAD`,
    },
    {
      accessorKey: 'destinataire',
      header: 'Nom du client',
    },
    {
      accessorKey: 'montantTotal',
      header: 'Montant total',
      cell: ({ row }) => `${row.original.montantTotal} MAD`,
    },
    {
      accessorKey: 'telephone',
      header: 'Téléphone du client',
    },
    {
      accessorKey: 'dateCreation',
      header: 'Créé le',
    },
    {
      accessorKey: 'referenceVendeur',
      header: 'Référence vendeur',
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
    {
      accessorKey: 'derniereAction',
      header: 'Dernière action',
    },
  ], []);

  const [filters, setFilters] = useState({
    statut: '',
    statutFacturation: '',
    typeColis: '',
    codeColis: '',
    dateDebut: '',
    dateFin: '',
    typeDate: 'date_creation',
    villeClient: '',
    nomClient: '',
    telephoneClient: '',
    referenceColis: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 50;

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Fetch parcels from API
  useEffect(() => {
    const fetchParcels = async () => {
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

        if (filters.statut) params.append('statut', filters.statut);
        if (filters.statutFacturation) params.append('statutFacturation', filters.statutFacturation);
        if (filters.typeColis) params.append('typeColis', filters.typeColis);
        if (filters.codeColis) params.append('codeColis', filters.codeColis);
        if (filters.villeClient) params.append('villeClient', filters.villeClient);
        if (filters.nomClient) params.append('nomClient', filters.nomClient);
        if (filters.telephoneClient) params.append('telephoneClient', filters.telephoneClient);
        if (filters.referenceColis) params.append('referenceColis', filters.referenceColis);
        if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
        if (filters.dateFin) params.append('dateFin', filters.dateFin);

        const response = await fetch(`/api/parcels?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setParcels(data.parcels);
          setTotal(data.total);
        } else {
          console.error('Error fetching parcels:', data.error);
          setParcels([]);
          setTotal(0);
        }
      } catch (error) {
        console.error('Error fetching parcels:', error);
        setParcels([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParcels();
  }, [filters, currentPage, user?.id, itemsPerPage]);

  const totalPages = Math.ceil(total / itemsPerPage);

  const handleImportExcel = () => {
    // TODO: Implement Excel import
    console.log('Import Excel');
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log('Export Excel');
  };

  const handlePrintLabels = () => {
    // TODO: Implement print labels
    console.log('Print Labels');
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
        <Heading size="lg">Colis</Heading>
        <HStack gap={2} flexWrap="wrap">
          <Button
            colorScheme="blue"
            variant="outline"
            onClick={handleImportExcel}
          >
            <Upload size={16} style={{ marginRight: '4px' }} />
            Importer Excel
          </Button>
          <Button
            colorScheme="blue"
            variant="outline"
            onClick={handleExportExcel}
          >
            <Download size={16} style={{ marginRight: '4px' }} />
            Export Excel
          </Button>
          <Button
            colorScheme="blue"
            variant="outline"
            onClick={handlePrintLabels}
          >
            <Printer size={16} style={{ marginRight: '4px' }} />
            Imprimer Étiquettes
          </Button>
          <Button
            colorScheme="blue"
            onClick={() => window.location.href = '/dashboard/parcels/add'}
          >
            <Plus size={16} style={{ marginRight: '4px' }} />
            Ajouter un colis
          </Button>
        </HStack>
      </HStack>

      <Card p={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
        <CollapsibleRoot defaultOpen={false}>
          <CollapsibleTrigger asChild>
            <Box
              as="button"
              width="100%"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={4}
              p={2}
              borderRadius="md"
              _hover={{ bg: 'gray.50', _dark: { bg: 'gray.700' } }}
              transition="background 0.2s"
            >
              <Heading size="md">Filtres</Heading>
              <CollapsibleIndicator>
                <ChevronDown size={20} style={{ transition: 'transform 0.2s' }} />
              </CollapsibleIndicator>
            </Box>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <VStack gap={4} align="stretch">
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: 3, md: 4 }}>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Statuts (Statut de colis)</Text>
              <NativeSelectRoot>
                <NativeSelectField
                  value={filters.statut}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('statut', e.target.value)}
                >
                  {statutOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </NativeSelectField>
                <NativeSelectIndicator />
              </NativeSelectRoot>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Statut De la facturation</Text>
              <NativeSelectRoot>
                <NativeSelectField
                  value={filters.statutFacturation}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('statutFacturation', e.target.value)}
                >
                  {statutFacturationOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </NativeSelectField>
                <NativeSelectIndicator />
              </NativeSelectRoot>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Type de colis</Text>
              <NativeSelectRoot>
                <NativeSelectField
                  value={filters.typeColis}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('typeColis', e.target.value)}
                >
                  {typeColisOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </NativeSelectField>
                <NativeSelectIndicator />
              </NativeSelectRoot>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Code du colis</Text>
              <Input
                placeholder="Saisir le code du colis"
                value={filters.codeColis}
                onChange={(e) => handleFilterChange('codeColis', e.target.value)}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Date</Text>
              <HStack>
                <Input
                  type="date"
                  value={filters.dateDebut}
                  onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
                />
                <Text>|</Text>
                <Input
                  type="date"
                  value={filters.dateFin}
                  onChange={(e) => handleFilterChange('dateFin', e.target.value)}
                />
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Type de la date</Text>
              <NativeSelectRoot>
                <NativeSelectField
                  value={filters.typeDate}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('typeDate', e.target.value)}
                >
                  {dateTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </NativeSelectField>
                <NativeSelectIndicator />
              </NativeSelectRoot>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Informations du client - Ville du client</Text>
              <Input
                placeholder="Saisir la ville du client"
                value={filters.villeClient}
                onChange={(e) => handleFilterChange('villeClient', e.target.value)}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Nom du client</Text>
              <Input
                placeholder="Saisir le nom du client"
                value={filters.nomClient}
                onChange={(e) => handleFilterChange('nomClient', e.target.value)}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Téléphone du client</Text>
              <Input
                placeholder="Saisir le téléphone du client"
                value={filters.telephoneClient}
                onChange={(e) => handleFilterChange('telephoneClient', e.target.value)}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Référence du colis</Text>
              <Input
                placeholder="Saisir la référence du colis"
                value={filters.referenceColis}
                onChange={(e) => handleFilterChange('referenceColis', e.target.value)}
              />
            </Box>
              </SimpleGrid>
            </VStack>
          </CollapsibleContent>
        </CollapsibleRoot>
      </Card>

      <Card p={{ base: 4, md: 6 }}>
        {isLoading ? (
          <Text textAlign="center" py={8}>Chargement...</Text>
        ) : (
          <>
            <TanStackTable
              data={parcels}
              columns={columns}
              enableSorting={true}
              enablePagination={false}
            />

            {parcels.length > 0 && (
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
                    rightIcon={<ChevronRight size={16} />}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    isDisabled={currentPage === totalPages}
                    flex={{ base: '1', sm: 'none' }}
                  >
                    <Text display={{ base: 'none', sm: 'block' }}>Suivant</Text>
                    <Text display={{ base: 'block', sm: 'none' }}>Suiv.</Text>
                  </Button>
                </HStack>
              </VStack>
            )}
          </>
        )}
      </Card>
    </Box>
  );
}
