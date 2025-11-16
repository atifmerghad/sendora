'use client';

import { useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Input,
  Button,
  Textarea,
  Text,
  HStack,
  RadioGroup,
  RadioGroupRoot,
  RadioGroupItem,
  RadioGroupIndicator,
  RadioGroupLabel,
} from '@chakra-ui/react';
import { FormControl, FormLabel, FormErrorMessage } from '@/components/Form';
import { Card as CardComponent } from '@/components/Card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Home, Warehouse } from 'lucide-react';
import { PermissionGate } from '@/components/PermissionGate';

type ReturnType = 'domicile' | 'entrepot';

export default function AddReturnPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [returnType, setReturnType] = useState<ReturnType | ''>('');
  const [formData, setFormData] = useState({
    numeroColis: '',
    raison: '',
    adresse: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.numeroColis) newErrors.numeroColis = 'Numéro de colis requis';
    if (!formData.raison) newErrors.raison = 'Raison requise';
    if (returnType === 'domicile' && !formData.adresse) {
      newErrors.adresse = 'Adresse requise pour la récupération à domicile';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numeroColis: formData.numeroColis,
          raison: formData.raison,
          userId: user?.id,
          typeRetour: returnType,
          adresse: returnType === 'domicile' ? formData.adresse : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Demande de retour créée',
          description: 'Votre demande de retour a été enregistrée avec succès',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.push('/dashboard/returns');
      } else {
        toast({
          title: 'Erreur',
          description: data.error || 'Erreur lors de la création de la demande',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error creating return:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création de la demande',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeSelection = (type: ReturnType) => {
    setReturnType(type);
    setStep('form');
  };

  return (
    <PermissionGate permission="gestionRetours">
      <Box>
        <HStack mb={6} gap={4}>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            leftIcon={<ArrowLeft size={16} />}
          >
            Retour
          </Button>
          <Heading size="lg">Ajouter demande de retour</Heading>
        </HStack>

        {step === 'type' ? (
          <CardComponent p={6}>
            <VStack align="stretch" gap={6}>
              <Text fontSize="lg" fontWeight="semibold" mb={2}>
                Type de la demande de retour
              </Text>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }} mb={4}>
                Cette option vous permet de choisir où vous souhaitez récupérer les colis retournés.
              </Text>

              <VStack align="stretch" gap={4}>
                <Box
                  p={6}
                  cursor="pointer"
                  border="2px solid"
                  borderColor="gray.200"
                  _dark={{ borderColor: 'gray.700' }}
                  bg="white"
                  _dark={{ bg: 'gray.800' }}
                  borderRadius="md"
                  _hover={{
                    borderColor: 'blue.500',
                    bg: 'blue.50',
                    _dark: { bg: 'blue.900', borderColor: 'blue.400' },
                  }}
                  onClick={() => handleTypeSelection('domicile')}
                  transition="all 0.2s"
                >
                  <HStack gap={4}>
                    <Box
                      p={3}
                      borderRadius="md"
                      bg="blue.100"
                      _dark={{ bg: 'blue.900' }}
                      color="blue.600"
                      _dark={{ color: 'blue.300' }}
                    >
                      <Home size={24} />
                    </Box>
                    <VStack align="stretch" flex={1} gap={2}>
                      <Text fontWeight="semibold" fontSize="lg">
                        À Domicile
                      </Text>
                      <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                        Si vous choisissez cette option, un livreur se rendra à l'adresse que vous avez fournie pour vous restituer vos retours.
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                <Box
                  p={6}
                  cursor="pointer"
                  border="2px solid"
                  borderColor="gray.200"
                  _dark={{ borderColor: 'gray.700' }}
                  bg="white"
                  _dark={{ bg: 'gray.800' }}
                  borderRadius="md"
                  _hover={{
                    borderColor: 'blue.500',
                    bg: 'blue.50',
                    _dark: { bg: 'blue.900', borderColor: 'blue.400' },
                  }}
                  onClick={() => handleTypeSelection('entrepot')}
                  transition="all 0.2s"
                >
                  <HStack gap={4}>
                    <Box
                      p={3}
                      borderRadius="md"
                      bg="purple.100"
                      _dark={{ bg: 'purple.900' }}
                      color="purple.600"
                      _dark={{ color: 'purple.300' }}
                    >
                      <Warehouse size={24} />
                    </Box>
                    <VStack align="stretch" flex={1} gap={2}>
                      <Text fontWeight="semibold" fontSize="lg">
                        Récupérer à l'entrepôt de Casablanca - Ain sebaa
                      </Text>
                      <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                        Si vous sélectionnez cette option, vous devrez vous rendre à l'entrepôt pour récupérer vos retours.
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </VStack>
            </VStack>
          </CardComponent>
        ) : (
          <CardComponent p={6}>
            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <Box w="100%">
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>
                    Type de retour sélectionné:
                  </Text>
                  <Text fontSize="sm" color="blue.600" _dark={{ color: 'blue.400' }}>
                    {returnType === 'domicile' ? 'À Domicile' : 'Récupérer à l\'entrepôt de Casablanca - Ain sebaa'}
                  </Text>
                  <Button
                    variant="link"
                    size="sm"
                    mt={2}
                    onClick={() => setStep('type')}
                  >
                    Changer le type
                  </Button>
                </Box>

                <FormControl isInvalid={!!errors.numeroColis}>
                  <FormLabel>Numéro de colis</FormLabel>
                  <Input
                    value={formData.numeroColis}
                    onChange={(e) => setFormData({ ...formData, numeroColis: e.target.value })}
                    placeholder="COL-12345"
                  />
                  {errors.numeroColis && <FormErrorMessage>{errors.numeroColis}</FormErrorMessage>}
                </FormControl>

                {returnType === 'domicile' && (
                  <FormControl isInvalid={!!errors.adresse}>
                    <FormLabel>Adresse de récupération</FormLabel>
                    <Textarea
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      placeholder="Entrez l'adresse complète où vous souhaitez récupérer vos retours"
                      rows={3}
                    />
                    {errors.adresse && <FormErrorMessage>{errors.adresse}</FormErrorMessage>}
                  </FormControl>
                )}

                <FormControl isInvalid={!!errors.raison}>
                  <FormLabel>Raison du retour</FormLabel>
                  <Textarea
                    value={formData.raison}
                    onChange={(e) => setFormData({ ...formData, raison: e.target.value })}
                    placeholder="Expliquez la raison du retour..."
                    rows={5}
                  />
                  {errors.raison && <FormErrorMessage>{errors.raison}</FormErrorMessage>}
                </FormControl>

                <HStack w="100%" justify="flex-end" gap={4}>
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isLoading}
                  >
                    Soumettre la demande
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </CardComponent>
        )}
      </Box>
    </PermissionGate>
  );
}
