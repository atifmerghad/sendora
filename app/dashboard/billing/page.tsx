'use client';

import {
  Box,
  Heading,
  Input,
  HStack,
  Button,
  Text,
} from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/Table';
import { Card } from '@/components/Card';
import { Search, Download } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

const invoices = [
  { id: '1', numero: 'FAC-001', montant: 1250.00, dateEmission: '2024-01-15', statut: 'paye' },
  { id: '2', numero: 'FAC-002', montant: 890.50, dateEmission: '2024-01-10', statut: 'en_attente' },
  { id: '3', numero: 'FAC-003', montant: 2100.00, dateEmission: '2024-01-05', statut: 'en_retard' },
];

export default function BillingPage() {
  return (
    <Box>
      <Heading size="lg" mb={6}>
        Facturation
      </Heading>

      <Card p={6}>
        <HStack mb={4}>
          <Input placeholder="Rechercher..." maxW="300px" />
          <Button>
            <Search size={16} style={{ marginRight: '4px' }} />
            Rechercher
          </Button>
        </HStack>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Numéro</Th>
                <Th>Montant</Th>
                <Th>Date émission</Th>
                <Th>Statut</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {invoices.map((invoice) => (
                <Tr key={invoice.id}>
                  <Td fontWeight="semibold">{invoice.numero}</Td>
                  <Td>
                    <Text fontWeight="semibold">{invoice.montant.toFixed(2)} MAD</Text>
                  </Td>
                  <Td>{invoice.dateEmission}</Td>
                  <Td><StatusBadge status={invoice.statut} /></Td>
                  <Td>
                    <Button size="sm" variant="ghost">
                      <Download size={14} style={{ marginRight: '4px' }} />
                      Télécharger
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}

