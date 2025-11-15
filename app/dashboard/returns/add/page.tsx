'use client';

import { useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Input,
  Button,
  Textarea,
} from '@chakra-ui/react';
import { FormControl, FormLabel, FormErrorMessage } from '@/components/Form';
import { Card } from '@/components/Card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/toast';

export default function AddReturnPage() {
  const [formData, setFormData] = useState({
    numeroColis: '',
    raison: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.numeroColis) newErrors.numeroColis = 'Numéro de colis requis';
    if (!formData.raison) newErrors.raison = 'Raison requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    toast({
      title: 'Demande de retour créée',
      description: 'Votre demande de retour a été enregistrée',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    router.push('/dashboard/returns');
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Demande des retours
      </Heading>

      <Card p={6}>
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.numeroColis}>
              <FormLabel>Numéro de colis</FormLabel>
              <Input
                value={formData.numeroColis}
                onChange={(e) => setFormData({ ...formData, numeroColis: e.target.value })}
                placeholder="COL-12345"
              />
              {errors.numeroColis && <FormErrorMessage>{errors.numeroColis}</FormErrorMessage>}
            </FormControl>

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

            <Button type="submit" colorScheme="blue" width="100%" isLoading={isLoading}>
              Soumettre la demande
            </Button>
          </VStack>
        </Box>
      </Card>
    </Box>
  );
}

