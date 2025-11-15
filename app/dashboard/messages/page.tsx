'use client';

import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  AvatarRoot,
  AvatarFallback,
  Badge,
  Input,
  Button,
  Separator,
} from '@chakra-ui/react';
import { Card } from '@/components/Card';
import { Send } from 'lucide-react';

const messages = [
  {
    id: '1',
    expediteur: 'Support Sendora',
    sujet: 'Confirmation de livraison',
    contenu: 'Votre colis COL-001 a été livré avec succès.',
    dateEnvoi: '2024-01-15 10:30',
    lu: false,
  },
  {
    id: '2',
    expediteur: 'Équipe Sendora',
    sujet: 'Nouvelle fonctionnalité',
    contenu: 'Découvrez notre nouvelle fonctionnalité de suivi en temps réel.',
    dateEnvoi: '2024-01-14 14:20',
    lu: true,
  },
  {
    id: '3',
    expediteur: 'Support Sendora',
    sujet: 'Rappel de paiement',
    contenu: 'N\'oubliez pas de régler votre facture FAC-002.',
    dateEnvoi: '2024-01-13 09:15',
    lu: true,
  },
];

export default function MessagesPage() {
  return (
    <Box>
      <Heading size="lg" mb={6}>
        Messages
      </Heading>

      <Card p={6}>
        <VStack gap={4} align="stretch">
          {messages.map((message, index) => (
            <Box key={message.id}>
              <HStack
                gap={4}
                p={4}
                borderRadius="md"
                bg={message.lu ? 'transparent' : 'blue.50'}
                _dark={{ bg: message.lu ? 'transparent' : 'blue.900' }}
                cursor="pointer"
                _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }}
              >
                <AvatarRoot size="sm">
                  <AvatarFallback>
                    {message.expediteur.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </AvatarRoot>
                <VStack align="start" flex={1} gap={1}>
                  <HStack justify="space-between" width="100%">
                    <Text fontWeight="semibold">{message.expediteur}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {message.dateEnvoi}
                    </Text>
                  </HStack>
                  <Text fontWeight="medium">{message.sujet}</Text>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                    {message.contenu}
                  </Text>
                </VStack>
                {!message.lu && (
                  <Badge colorScheme="blue" borderRadius="full" w={3} h={3} />
                )}
              </HStack>
              {index < messages.length - 1 && <Separator />}
            </Box>
          ))}
        </VStack>

        <Box mt={6} pt={6} borderTop="1px solid" borderColor="gray.200" _dark={{ borderColor: 'gray.700' }}>
          <HStack gap={2}>
            <Input placeholder="Écrire un message..." />
            <Button 
              colorScheme="blue"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Send size={16} />
              Envoyer
            </Button>
          </HStack>
        </Box>
      </Card>
    </Box>
  );
}

