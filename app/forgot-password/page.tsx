'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Input,
  Button,
  Text,
  Link,
} from '@chakra-ui/react';
import { FormControl, FormLabel, FormErrorMessage } from '@/components/Form';
import { useToast } from '@/lib/toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const toast = useToast();

  const validate = () => {
    const newErrors: { email?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
    
    toast({
      title: 'Email envoyé',
      description: 'Un lien de réinitialisation a été envoyé à votre adresse email',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <Container maxW="md">
        <VStack spacing={6} bg="white" _dark={{ bg: 'gray.800' }} p={8} borderRadius="lg" boxShadow="lg">
          <Heading size="lg">Réinitialiser le mot de passe</Heading>
          
          {isSubmitted ? (
            <VStack spacing={4}>
              <Text textAlign="center">
                Un email de réinitialisation a été envoyé à <strong>{email}</strong>
              </Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Veuillez vérifier votre boîte de réception et suivre les instructions.
              </Text>
              <Link href="/login" color="blue.500">
                Retour à la connexion
              </Link>
            </VStack>
          ) : (
            <Box as="form" width="100%" onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <Text textAlign="center" color="gray.600" _dark={{ color: 'gray.400' }}>
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </Text>

                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Adresse email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                  />
                  {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="100%"
                  isLoading={isLoading}
                  loadingText="Envoi..."
                >
                  Envoyer le lien
                </Button>

                <Link href="/login" color="blue.500" fontSize="sm">
                  Retour à la connexion
                </Link>
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

