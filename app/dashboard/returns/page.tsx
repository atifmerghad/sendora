'use client';

import {
  Box,
  Heading,
  Input,
  HStack,
  Button,
} from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/Table';
import { Card } from '@/components/Card';
import { Search } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { PermissionGate } from '@/components/PermissionGate';

const returns = [
  { id: '1', numeroColis: 'COL-001', raison: 'Produit défectueux', dateDemande: '2024-01-15', statut: 'en_attente' },
  { id: '2', numeroColis: 'COL-002', raison: 'Mauvaise adresse', dateDemande: '2024-01-14', statut: 'approuve' },
  { id: '3', numeroColis: 'COL-003', raison: 'Client a refusé', dateDemande: '2024-01-10', statut: 'traite' },
];

export default function ReturnsPage() {
  return (
    <PermissionGate permission="gestionRetours">
      <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Liste des retours</Heading>
        <Button colorScheme="blue" onClick={() => window.location.href = '/dashboard/returns/add'}>
          Demander un retour
        </Button>
      </HStack>

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
                <Th>Numéro colis</Th>
                <Th>Raison</Th>
                <Th>Date demande</Th>
                <Th>Statut</Th>
              </Tr>
            </Thead>
            <Tbody>
              {returns.map((ret) => (
                <Tr key={ret.id}>
                  <Td fontWeight="semibold">{ret.numeroColis}</Td>
                  <Td>{ret.raison}</Td>
                  <Td>{ret.dateDemande}</Td>
                  <Td><StatusBadge status={ret.statut} /></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
      </Box>
    </PermissionGate>
  );
}

