'use client';

import {
  Box,
  Heading,
  Input,
  HStack,
  Button,
  Text,
  VStack,
} from '@chakra-ui/react';
import { TanStackTable } from '@/components/TanStackTable';
import { type ColumnDef } from '@tanstack/react-table';
import { Card } from '@/components/Card';
import { Search, Download, FileText } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Invoice {
  id: string;
  numero: string;
  montant: number;
  dateEmission: string;
  statut: 'paye' | 'en_attente' | 'en_retard';
}

export default function InvoicesPage() {
  const t = useTranslations('billing.invoices');
  const { user } = useAuth();
  
  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<Invoice>[]>(() => [
    {
      accessorKey: 'numero',
      header: t('invoiceNumber'),
      cell: ({ row }) => <Text fontWeight="semibold">{row.original.numero}</Text>,
    },
    {
      accessorKey: 'montant',
      header: t('amount'),
      cell: ({ row }) => (
        <Text fontWeight="semibold">
          {row.original.montant.toFixed(2)} MAD
        </Text>
      ),
    },
    {
      accessorKey: 'dateEmission',
      header: t('issueDate'),
    },
    {
      accessorKey: 'statut',
      header: t('status'),
      cell: ({ row }) => <StatusBadge status={row.original.statut} />,
    },
    {
      id: 'actions',
      header: t('actions'),
      cell: () => (
        <Button
          size="sm"
          variant="ghost"
        >
          <Download size={14} style={{ marginRight: '4px' }} />
          {t('download')}
        </Button>
      ),
    },
  ], [t]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch invoices from API
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          userId: user.id,
        });

        if (searchTerm) {
          params.append('search', searchTerm);
        }

        const response = await fetch(`/api/invoices?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setInvoices(data.invoices || []);
        } else {
          console.error('Error fetching invoices:', data.error);
          setInvoices([]);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setInvoices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [user?.id, searchTerm]);

  const handleSearch = () => {
    // Search is handled by useEffect when searchTerm changes
  };

  return (
    <Box>
      <VStack align="stretch" gap={4} mb={6}>
        <Heading size={{ base: 'md', md: 'lg' }}>
          {t('title')}
        </Heading>
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
            onClick={handleSearch}
          >
            <Search size={16} style={{ marginRight: '4px' }} />
            {t('search')}
          </Button>
        </HStack>

        {isLoading ? (
          <Text textAlign="center" py={8}>
            {t('loading')}
          </Text>
        ) : invoices.length === 0 ? (
          <VStack py={8} gap={4}>
            <FileText size={48} color="gray.400" />
            <Text color="gray.500" textAlign="center">
              {t('noInvoices')}
            </Text>
          </VStack>
        ) : (
          <TanStackTable
            data={invoices}
            columns={columns}
            enableSorting={true}
            enablePagination={false}
          />
        )}
      </Card>
    </Box>
  );
}

