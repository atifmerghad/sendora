'use client';

import {
  Box,
  Heading,
  Input,
  HStack,
  Button,
  Badge,
} from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/Table';
import { Card } from '@/components/Card';
import { Search, Plus } from 'lucide-react';

const teamMembers = [
  { id: '1', nom: 'Benali', prenom: 'Ahmed', email: 'ahmed@example.com', role: 'Gestionnaire', dateAjout: '2024-01-15' },
  { id: '2', nom: 'Alami', prenom: 'Fatima', email: 'fatima@example.com', role: 'Livreur', dateAjout: '2024-01-14' },
  { id: '3', nom: 'Idrissi', prenom: 'Youssef', email: 'youssef@example.com', role: 'Support', dateAjout: '2024-01-10' },
];

export default function TeamPage() {
  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Gestion d'équipe</Heading>
        <Button colorScheme="blue">
          <Plus size={16} style={{ marginRight: '4px' }} />
          Ajouter un membre
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
                <Th>Nom</Th>
                <Th>Prénom</Th>
                <Th>Email</Th>
                <Th>Rôle</Th>
                <Th>Date ajout</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teamMembers.map((member) => (
                <Tr key={member.id}>
                  <Td fontWeight="semibold">{member.nom}</Td>
                  <Td>{member.prenom}</Td>
                  <Td>{member.email}</Td>
                  <Td>
                    <Badge colorScheme="blue">{member.role}</Badge>
                  </Td>
                  <Td>{member.dateAjout}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}

