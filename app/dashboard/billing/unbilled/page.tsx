'use client';

import {
  Box,
  Heading,
  Input,
  HStack,
  Button,
  Text,
  VStack,
  Badge,
} from '@chakra-ui/react';
import { TanStackTable } from '@/components/TanStackTable';
import { type ColumnDef } from '@tanstack/react-table';
import { Card } from '@/components/Card';
import { Search, Package, FileText } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UnbilledParcel {
  id: string;
  code: string;
  destinataire: string;
  ville: string;
  montantTotal: number;
  dateCreation: string;
  statut: string;
}

export default function UnbilledParcelsPage() {
  const t = useTranslations('billing.unbilled');
  const { user } = useAuth();
  
  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<UnbilledParcel>[]>(() => [
    {
      accessorKey: 'code',
      header: t('code'),
      cell: ({ row }) => <Text fontWeight="semibold">{row.original.code}</Text>,
    },
    {
      accessorKey: 'destinataire',
      header: t('recipient'),
    },
    {
      accessorKey: 'ville',
      header: t('city'),
    },
    {
      accessorKey: 'montantTotal',
      header: t('amount'),
      cell: ({ row }) => (
        <Text fontWeight="semibold">
          {row.original.montantTotal.toFixed(2)} MAD
        </Text>
      ),
    },
    {
      accessorKey: 'dateCreation',
      header: t('creationDate'),
    },
    {
      accessorKey: 'statut',
      header: t('status'),
      cell: ({ row }) => <StatusBadge status={row.original.statut} />,
    },
  ], [t]);

  const [parcels, setParcels] = useState<UnbilledParcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch unbilled parcels from API
  useEffect(() => {
    const fetchUnbilledParcels = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          userId: user.id,
          statutFacturation: 'en_attente', // Only unbilled parcels
          limit: '1000',
        });

        const response = await fetch(`/api/parcels?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setParcels(data.parcels || []);
        } else {
          console.error('Error fetching unbilled parcels:', data.error);
          setParcels([]);
        }
      } catch (error) {
        console.error('Error fetching unbilled parcels:', error);
        setParcels([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnbilledParcels();
  }, [user?.id]);

  const filteredParcels = parcels.filter(parcel =>
    parcel.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.destinataire.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.ville.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = filteredParcels.reduce((sum, parcel) => sum + parcel.montantTotal, 0);

  return (
    <Box>
      <VStack align="stretch" gap={4} mb={6}>
        <Heading size={{ base: 'md', md: 'lg' }}>
          {t('title')}
        </Heading>
        {filteredParcels.length > 0 && (
          <Card p={{ base: 4, md: 6 }} bg="orange.50" _dark={{ bg: 'orange.900' }}>
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <Text fontWeight="semibold">
                {t('totalUnbilled')}: {filteredParcels.length} {t('parcels')}
              </Text>
              <Badge colorScheme="orange" fontSize="md" px={3} py={1}>
                {t('totalAmount')}: {totalAmount.toFixed(2)} MAD
              </Badge>
            </HStack>
          </Card>
        )}
      </VStack>

      <Card p={{ base: 4, md: 6 }} mb={6}>
        <HStack mb={4} flexWrap="wrap" gap={2}>
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW={{ base: '100%', sm: '300px' }}
            size={{ base: 'md', md: 'md' }}
          />
          <Button 
            colorScheme="blue"
            size={{ base: 'sm', md: 'md' }}
          >
            <Search size={16} style={{ marginRight: '4px' }} />
            {t('search')}
          </Button>
        </HStack>

        {isLoading ? (
          <Text textAlign="center" py={8}>
            {t('loading')}
          </Text>
        ) : filteredParcels.length === 0 ? (
          <VStack py={8} gap={4}>
            <Package size={48} color="gray.400" />
            <Text color="gray.500" textAlign="center">
              {t('noUnbilledParcels')}
            </Text>
          </VStack>
        ) : (
          <TanStackTable
            data={filteredParcels}
            columns={columns}
            enableSorting={true}
            enablePagination={false}
          />
        )}
      </Card>
    </Box>
  );
}

