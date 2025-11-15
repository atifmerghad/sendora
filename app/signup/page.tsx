'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useAuth } from '@/contexts/AuthContext';
import { CityDropdown } from '@/components/CityDropdown';
import { useToast } from '@/lib/toast';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    nomMarque: '',
    siteUrl: '',
    ville: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nom) newErrors.nom = 'Nom requis';
    if (!formData.prenom) newErrors.prenom = 'Prénom requis';
    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (!formData.telephone) newErrors.telephone = 'Téléphone requis';
    if (!formData.nomMarque) newErrors.nomMarque = 'Nom de la marque requis';
    if (!formData.siteUrl) newErrors.siteUrl = 'Site ou page Facebook/Instagram requis';
    if (!formData.ville) newErrors.ville = 'Ville requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    const success = await signup(formData);
    setIsLoading(false);
    
    if (success) {
      toast({
        title: 'Inscription réussie',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/dashboard');
    } else {
      toast({
        title: 'Erreur d\'inscription',
        description: 'Cet email est peut-être déjà utilisé',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Box minH="100vh" py={{ base: 4, md: 8 }} px={{ base: 4, md: 0 }} bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <Container maxW="md" px={{ base: 0, md: 4 }}>
        <VStack spacing={6} bg="white" _dark={{ bg: 'gray.800' }} p={{ base: 6, md: 8 }} borderRadius="lg" boxShadow="lg">
          <Heading size={{ base: 'md', md: 'lg' }}>Créer un compte Sendora</Heading>
          
          <Box as="form" width="100%" onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.nom}>
                <FormLabel>Nom</FormLabel>
                <Input
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  placeholder="Votre nom"
                />
                {errors.nom && <FormErrorMessage>{errors.nom}</FormErrorMessage>}
              </FormControl>

              <FormControl isInvalid={!!errors.prenom}>
                <FormLabel>Prénom</FormLabel>
                <Input
                  value={formData.prenom}
                  onChange={(e) => handleChange('prenom', e.target.value)}
                  placeholder="Votre prénom"
                />
                {errors.prenom && <FormErrorMessage>{errors.prenom}</FormErrorMessage>}
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Adresse email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="votre@email.com"
                />
                {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Mot de passe</FormLabel>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                />
                {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
              </FormControl>

              <FormControl isInvalid={!!errors.telephone}>
                <FormLabel>Téléphone</FormLabel>
                <Input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => handleChange('telephone', e.target.value)}
                  placeholder="+212 6XX XXX XXX"
                />
                {errors.telephone && <FormErrorMessage>{errors.telephone}</FormErrorMessage>}
              </FormControl>

              <FormControl isInvalid={!!errors.nomMarque}>
                <FormLabel>Nom de la marque</FormLabel>
                <Input
                  value={formData.nomMarque}
                  onChange={(e) => handleChange('nomMarque', e.target.value)}
                  placeholder="Nom de votre marque"
                />
                {errors.nomMarque && <FormErrorMessage>{errors.nomMarque}</FormErrorMessage>}
              </FormControl>

              <FormControl isInvalid={!!errors.siteUrl}>
                <FormLabel>Votre site ou page Facebook/Instagram (URL)</FormLabel>
                <Input
                  type="url"
                  value={formData.siteUrl}
                  onChange={(e) => handleChange('siteUrl', e.target.value)}
                  placeholder="https://..."
                />
                {errors.siteUrl && <FormErrorMessage>{errors.siteUrl}</FormErrorMessage>}
              </FormControl>

              <FormControl isInvalid={!!errors.ville}>
                <FormLabel>Votre ville</FormLabel>
                <CityDropdown
                  value={formData.ville}
                  onChange={(ville) => handleChange('ville', ville)}
                />
                {errors.ville && <FormErrorMessage>{errors.ville}</FormErrorMessage>}
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                isLoading={isLoading}
                loadingText="Inscription..."
              >
                S'inscrire
              </Button>

              <Text fontSize="sm">
                Déjà un compte ?{' '}
                <Link href="/login" color="blue.500">
                  Se connecter
                </Link>
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

