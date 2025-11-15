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
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

interface Ticket {
  id: string;
  sujet: string;
  description: string;
  statut: string;
  dateCreation: string;
}

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
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

        const response = await fetch(`/api/tickets?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setTickets(data.tickets || []);
        } else {
          console.error('Error fetching tickets:', data.error);
          setTickets([]);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [user?.id, searchTerm]);

  const handleSearch = () => {
    // Search is handled by useEffect when searchTerm changes
  };
  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Mes Tickets</Heading>
        <Button colorScheme="blue">
          <Plus size={16} style={{ marginRight: '4px' }} />
          Nouveau ticket
        </Button>
      </HStack>

      <Card p={6}>
        <HStack mb={4}>
          <Input 
            placeholder="Rechercher..." 
            maxW="300px"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={handleSearch}>
            <Search size={16} style={{ marginRight: '4px' }} />
            Rechercher
          </Button>
        </HStack>

        {isLoading ? (
          <Text textAlign="center" py={8}>Chargement...</Text>
        ) : tickets.length === 0 ? (
          <Text textAlign="center" py={8} color="gray.500">
            Aucun ticket trouvé
          </Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Sujet</Th>
                  <Th>Description</Th>
                  <Th>Statut</Th>
                  <Th>Date création</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tickets.map((ticket) => (
                  <Tr key={ticket.id}>
                    <Td fontWeight="semibold">{ticket.sujet}</Td>
                    <Td>{ticket.description}</Td>
                    <Td><StatusBadge status={ticket.statut} /></Td>
                    <Td>{ticket.dateCreation}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Card>
    </Box>
  );
}

