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
import { Search, Plus } from 'lucide-react';

const inventory = [
  { id: '1', produit: 'Produit A', quantite: 150, prix: 25.50, dateAjout: '2024-01-15' },
  { id: '2', produit: 'Produit B', quantite: 89, prix: 45.00, dateAjout: '2024-01-14' },
  { id: '3', produit: 'Produit C', quantite: 234, prix: 12.75, dateAjout: '2024-01-10' },
];

export default function InventoryPage() {
  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Gestion de stock</Heading>
        <Button colorScheme="blue">
          <Plus size={16} style={{ marginRight: '4px' }} />
          Ajouter un produit
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
                <Th>Produit</Th>
                <Th>Quantité</Th>
                <Th>Prix unitaire</Th>
                <Th>Valeur totale</Th>
                <Th>Date ajout</Th>
              </Tr>
            </Thead>
            <Tbody>
              {inventory.map((item) => (
                <Tr key={item.id}>
                  <Td fontWeight="semibold">{item.produit}</Td>
                  <Td>{item.quantite}</Td>
                  <Td>{item.prix.toFixed(2)} MAD</Td>
                  <Td>
                    <Text fontWeight="semibold">{(item.quantite * item.prix).toFixed(2)} MAD</Text>
                  </Td>
                  <Td>{item.dateAjout}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}

