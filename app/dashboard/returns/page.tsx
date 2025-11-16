'use client';

import { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/Table';
import { Card } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';
import { PermissionGate } from '@/components/PermissionGate';
import { Search, Printer, Tag, Plus, ChevronLeft, ChevronRight, ChevronDown, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import { DateRangePicker } from '@/components/DateRangePicker';
import { useColorModeValue } from '@/lib/useColorModeValue';

interface Return {
  id: string;
  code: string;
  statut: string;
  ville: string;
  nombreColis: number;
  dateDemande: string;
  nom: string;
  telephone: string;
  frais: number;
  vendeurSecondaire: string;
  raison: string;
}

export default function ReturnsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const filterIconColor = useColorModeValue('#6F3F73', '#A373A7'); // blue.600 in light, blue.400 in dark
  const [returns, setReturns] = useState<Return[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [showLabelOptions, setShowLabelOptions] = useState(false);

  // Fetch returns from API
  useEffect(() => {
    const fetchReturns = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          userId: user.id,
          page: currentPage.toString(),
          limit: '50',
        });

        if (searchTerm) {
          params.append('search', searchTerm);
        }

        if (dateDebut) {
          params.append('dateDebut', dateDebut);
        }

        if (dateFin) {
          params.append('dateFin', dateFin);
        }

        const response = await fetch(`/api/returns?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setReturns(data.returns || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        } else {
          console.error('Error fetching returns:', data.error);
          setReturns([]);
        }
      } catch (error) {
        console.error('Error fetching returns:', error);
        setReturns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReturns();
  }, [user?.id, currentPage, searchTerm, dateDebut, dateFin]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setDateDebut(start);
    setDateFin(end);
    setCurrentPage(1);
  };

  const handlePrintReturnSlip = () => {
    // TODO: Implement print return slip
    toast({
      title: 'Impression',
      description: 'Fonctionnalité d\'impression du bon de retour à venir',
      status: 'info',
      duration: 3000,
    });
  };

  const handlePrintLabels = (format: 'A4' | '10x10') => {
    // TODO: Implement print labels
    toast({
      title: 'Impression',
      description: `Impression des étiquettes en format ${format} à venir`,
      status: 'info',
      duration: 3000,
    });
    setShowLabelOptions(false);
  };

  return (
    <PermissionGate permission="gestionRetours">
    <Box>
        <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
          <Heading size="lg">Retours</Heading>
          <HStack gap={2} flexWrap="wrap">
            <Button
              variant="outline"
              colorScheme="blue"
              onClick={handlePrintReturnSlip}
              leftIcon={<Printer size={16} />}
            >
              Imprimer Bon de retour
            </Button>
            <Box position="relative">
              <Button
                variant="outline"
                colorScheme="blue"
                onClick={() => setShowLabelOptions(!showLabelOptions)}
                leftIcon={<Tag size={16} />}
                rightIcon={<ChevronDown size={16} />}
              >
                Imprimer Étiquettes
              </Button>
              {showLabelOptions && (
                <Box
                  position="absolute"
                  top="100%"
                  right={0}
                  mt={2}
                  bg="white"
                  _dark={{ bg: 'gray.800' }}
                  border="1px solid"
                  borderColor="gray.200"
                  _dark={{ borderColor: 'gray.700' }}
                  borderRadius="md"
                  boxShadow="lg"
                  zIndex={10}
                  minW="200px"
                >
                  <VStack align="stretch" p={2} gap={1}>
                    <Button
                      variant="ghost"
                      justifyContent="flex-start"
                      onClick={() => handlePrintLabels('A4')}
                    >
                      Format A4
                    </Button>
                    <Button
                      variant="ghost"
                      justifyContent="flex-start"
                      onClick={() => handlePrintLabels('10x10')}
                    >
                      10cm × 10cm
                    </Button>
                  </VStack>
                </Box>
              )}
            </Box>
            <Button
              colorScheme="blue"
              onClick={() => router.push('/dashboard/returns/add')}
              leftIcon={<Plus size={16} />}
            >
          Demander un retour
        </Button>
      </HStack>
        </HStack>

        <Card p={3} mb={6} bg="transparent" border="none" boxShadow="none">
          <HStack gap={3} flexWrap={{ base: 'wrap', md: 'nowrap' }} alignItems="center">
            <HStack gap={2} flex="0 0 auto" alignItems="center">
              <Box
                as="span"
                display="inline-flex"
                alignItems="center"
                style={{ color: filterIconColor }}
              >
                <Filter size={16} />
              </Box>
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                size="sm"
                maxW="180px"
              />
            </HStack>
            <Box flex="0 0 auto" maxW="220px">
              <DateRangePicker
                startDate={dateDebut}
                endDate={dateFin}
                onDateChange={handleDateRangeChange}
              />
            </Box>
            <Button
              colorScheme="blue"
              onClick={handleSearch}
              leftIcon={<Search size={14} />}
              size="sm"
              flexShrink={0}
            >
              Rechercher
            </Button>
          </HStack>
        </Card>

        <Card p={6}>
          {isLoading ? (
            <Text textAlign="center" py={8}>
              Chargement des retours...
            </Text>
          ) : returns.length === 0 ? (
            <Text textAlign="center" py={8} color="gray.500">
              Aucun élément existe
            </Text>
          ) : (
            <>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                      <Th>Code</Th>
                      <Th>Statut</Th>
                      <Th>Ville/Quartier du retour</Th>
                      <Th>Nombre des colis</Th>
                <Th>Date demande</Th>
                      <Th>Nom</Th>
                      <Th>Téléphone</Th>
                      <Th>Frais</Th>
                      <Th>Vendeur Secondaire</Th>
              </Tr>
            </Thead>
            <Tbody>
              {returns.map((ret) => (
                <Tr key={ret.id}>
                        <Td fontWeight="semibold">{ret.code}</Td>
                        <Td>
                          <StatusBadge status={ret.statut} />
                        </Td>
                        <Td>{ret.ville || '-'}</Td>
                        <Td>{ret.nombreColis}</Td>
                  <Td>{ret.dateDemande}</Td>
                        <Td>{ret.nom || '-'}</Td>
                        <Td>{ret.telephone || '-'}</Td>
                        <Td>{ret.frais.toFixed(2)} MAD</Td>
                        <Td>{ret.vendeurSecondaire || '-'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

              {totalPages > 1 && (
                <HStack justify="space-between" mt={6} flexWrap="wrap" gap={4}>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                    {total} élément{total > 1 ? 's' : ''} au total
                  </Text>
                  <HStack gap={2}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      leftIcon={<ChevronLeft size={16} />}
                    >
                      Précédent
                    </Button>
                    <Text fontSize="sm" px={2}>
                      Page {currentPage} sur {totalPages}
                    </Text>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      rightIcon={<ChevronRight size={16} />}
                    >
                      Suivant
                    </Button>
                  </HStack>
                </HStack>
              )}
            </>
          )}
      </Card>
    </Box>
    </PermissionGate>
  );
}
