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
  HStack,
  IconButton,
  SimpleGrid,
} from '@chakra-ui/react';
import { Eye, EyeOff, Package, Store, Globe, MapPin } from 'lucide-react';
import { FormControl, FormLabel, FormErrorMessage } from '@/components/Form';
import { useAuth } from '@/contexts/AuthContext';
import { CityDropdown } from '@/components/CityDropdown';
import { useToast } from '@/lib/toast';
import { useColorModeValue } from '@/lib/useColorModeValue';

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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, indigo.100)',
    'linear(to-br, gray.900, gray.800)'
  );
  const formBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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
    if (!formData.telephone) {
      newErrors.telephone = 'Téléphone requis';
    } else {
      // Validate Moroccan phone number format
      // Accepts: +212666842311, 212666842311, 0666842311
      const phoneRegex = /^(\+212|212|0)[5-7]\d{8}$/;
      const cleanPhone = formData.telephone.trim().replace(/\s+/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.telephone = 'Format invalide. Utilisez: +2126XXXXXXX, 2126XXXXXXX ou 06XXXXXXX';
      }
    }
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
    
    try {
      // Normalize phone number before sending (remove spaces, ensure proper format)
      const normalizedFormData = {
        ...formData,
        telephone: formData.telephone.trim().replace(/\s+/g, ''),
      };
      
      const success = await signup(normalizedFormData);
      setIsLoading(false);
      
      if (success) {
        toast({
          title: 'Inscription réussie',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.push('/dashboard');
      }
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: 'Erreur d\'inscription',
        description: error.message || 'Une erreur est survenue lors de l\'inscription',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      // Set specific field error if it's a business name error
      if (error.message?.includes('nom de marque') || error.message?.includes('marque')) {
        setErrors(prev => ({ ...prev, nomMarque: error.message }));
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bgGradient={bgGradient}
      position="relative"
      overflow="hidden"
      py={{ base: 8, md: 0 }}
      px={{ base: 4, md: 6 }}
    >
      {/* Decorative background elements */}
      <Box
        position="absolute"
        top="-50%"
        right="-20%"
        w="600px"
        h="600px"
        borderRadius="full"
        bg="blue.200"
        opacity={0.1}
        _dark={{ bg: 'blue.800', opacity: 0.1 }}
        filter="blur(80px)"
      />
      <Box
        position="absolute"
        bottom="-30%"
        left="-10%"
        w="500px"
        h="500px"
        borderRadius="full"
        bg="indigo.200"
        opacity={0.1}
        _dark={{ bg: 'indigo.800', opacity: 0.1 }}
        filter="blur(80px)"
      />

      <Container maxW="6xl" px={6} position="relative" zIndex={1}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={12} alignItems="center">
          {/* Left side - Form */}
          <Box
            bg={formBg}
            p={{ base: 5, md: 6, lg: 7 }}
            borderRadius="2xl"
            boxShadow="xl"
            border="1px solid"
            borderColor={borderColor}
            maxW="550px"
            mx="auto"
            w="100%"
          >
            <VStack align="stretch" gap={4}>
              {/* Logo/Brand */}
              <VStack align="start" gap={1}>
                <HStack gap={3}>
                  <Box
                    p={2}
                    bg="blue.500"
                    borderRadius="lg"
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Package size={24} />
                  </Box>
                  <Heading size="xl" fontWeight="bold" color={useColorModeValue('gray.900', 'white')}>
                    Sendora
                  </Heading>
                </HStack>
                <Heading size="md" fontWeight="semibold" color={useColorModeValue('gray.700', 'gray.300')}>
                  Créer un compte
                </Heading>
              </VStack>

              <Box as="form" width="100%" onSubmit={handleSubmit}>
                <VStack gap={3} align="stretch" maxH={{ base: 'auto', lg: '70vh' }} overflowY="auto" pr={2}>
                  {/* Name fields in a row */}
                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                    <FormControl isInvalid={!!errors.prenom}>
                      <FormLabel 
                        fontSize="xs" 
                        fontWeight="medium" 
                        color={useColorModeValue('gray.700', 'gray.300')}
                        mb={1}
                      >
                        Prénom
                      </FormLabel>
                      <Input
                        value={formData.prenom}
                        onChange={(e) => handleChange('prenom', e.target.value)}
                        placeholder="Votre prénom"
                        disabled={isLoading}
                        size="md"
                        borderRadius="lg"
                        borderColor={errors.prenom ? 'red.300' : borderColor}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                        }}
                        _hover={{
                          borderColor: errors.prenom ? 'red.400' : 'gray.400',
                        }}
                      />
                      {errors.prenom && <FormErrorMessage mt={0.5} fontSize="xs">{errors.prenom}</FormErrorMessage>}
                    </FormControl>

                    <FormControl isInvalid={!!errors.nom}>
                      <FormLabel 
                        fontSize="xs" 
                        fontWeight="medium" 
                        color={useColorModeValue('gray.700', 'gray.300')}
                        mb={1}
                      >
                        Nom
                      </FormLabel>
                      <Input
                        value={formData.nom}
                        onChange={(e) => handleChange('nom', e.target.value)}
                        placeholder="Votre nom"
                        disabled={isLoading}
                        size="md"
                        borderRadius="lg"
                        borderColor={errors.nom ? 'red.300' : borderColor}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                        }}
                        _hover={{
                          borderColor: errors.nom ? 'red.400' : 'gray.400',
                        }}
                      />
                      {errors.nom && <FormErrorMessage mt={0.5} fontSize="xs">{errors.nom}</FormErrorMessage>}
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel 
                        fontSize="xs" 
                        fontWeight="medium" 
                        color={useColorModeValue('gray.700', 'gray.300')}
                        mb={1}
                      >
                        Email
                      </FormLabel>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="votre@email.com"
                        disabled={isLoading}
                        size="md"
                        borderRadius="lg"
                        borderColor={errors.email ? 'red.300' : borderColor}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                        }}
                        _hover={{
                          borderColor: errors.email ? 'red.400' : 'gray.400',
                        }}
                      />
                      {errors.email && <FormErrorMessage mt={0.5} fontSize="xs">{errors.email}</FormErrorMessage>}
                    </FormControl>

                    <FormControl isInvalid={!!errors.telephone}>
                      <FormLabel 
                        fontSize="xs" 
                        fontWeight="medium" 
                        color={useColorModeValue('gray.700', 'gray.300')}
                        mb={1}
                      >
                        Téléphone
                      </FormLabel>
                      <Input
                        type="tel"
                        value={formData.telephone}
                        onChange={(e) => handleChange('telephone', e.target.value)}
                        placeholder="+212 6XX XXX XXX"
                        disabled={isLoading}
                        size="md"
                        borderRadius="lg"
                        borderColor={errors.telephone ? 'red.300' : borderColor}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                        }}
                        _hover={{
                          borderColor: errors.telephone ? 'red.400' : 'gray.400',
                        }}
                      />
                      {errors.telephone && <FormErrorMessage mt={0.5} fontSize="xs">{errors.telephone}</FormErrorMessage>}
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel 
                      fontSize="xs" 
                      fontWeight="medium" 
                      color={useColorModeValue('gray.700', 'gray.300')}
                      mb={1}
                    >
                      Mot de passe
                    </FormLabel>
                    <Box position="relative" width="100%">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoading}
                        size="md"
                        borderRadius="lg"
                        pr="45px"
                        borderColor={errors.password ? 'red.300' : borderColor}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                        }}
                        _hover={{
                          borderColor: errors.password ? 'red.400' : 'gray.400',
                        }}
                      />
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        position="absolute"
                        right="10px"
                        top="50%"
                        transform="translateY(-50%)"
                        size="sm"
                        h="auto"
                        w="auto"
                        minW="auto"
                        p={1}
                        type="button"
                        zIndex={1}
                        disabled={isLoading}
                        color={useColorModeValue('gray.500', 'gray.400')}
                        _hover={{
                          color: useColorModeValue('gray.700', 'gray.200'),
                          bg: 'transparent',
                        }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </Box>
                    {errors.password && <FormErrorMessage mt={0.5} fontSize="xs">{errors.password}</FormErrorMessage>}
                  </FormControl>

                  <FormControl isInvalid={!!errors.nomMarque}>
                    <FormLabel 
                      fontSize="xs" 
                      fontWeight="medium" 
                      color={useColorModeValue('gray.700', 'gray.300')}
                      mb={1}
                    >
                      Nom de la marque
                    </FormLabel>
                    <Input
                      value={formData.nomMarque}
                      onChange={(e) => handleChange('nomMarque', e.target.value)}
                      placeholder="Nom de votre marque"
                      disabled={isLoading}
                      size="md"
                      borderRadius="lg"
                      borderColor={errors.nomMarque ? 'red.300' : borderColor}
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                      }}
                      _hover={{
                        borderColor: errors.nomMarque ? 'red.400' : 'gray.400',
                      }}
                    />
                    {errors.nomMarque && <FormErrorMessage mt={0.5} fontSize="xs">{errors.nomMarque}</FormErrorMessage>}
                  </FormControl>

                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                    <FormControl isInvalid={!!errors.siteUrl}>
                      <FormLabel 
                        fontSize="xs" 
                        fontWeight="medium" 
                        color={useColorModeValue('gray.700', 'gray.300')}
                        mb={1}
                      >
                        Site/Page Sociale
                      </FormLabel>
                      <Input
                        type="url"
                        value={formData.siteUrl}
                        onChange={(e) => handleChange('siteUrl', e.target.value)}
                        placeholder="https://..."
                        disabled={isLoading}
                        size="md"
                        borderRadius="lg"
                        borderColor={errors.siteUrl ? 'red.300' : borderColor}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                        }}
                        _hover={{
                          borderColor: errors.siteUrl ? 'red.400' : 'gray.400',
                        }}
                      />
                      {errors.siteUrl && <FormErrorMessage mt={0.5} fontSize="xs">{errors.siteUrl}</FormErrorMessage>}
                    </FormControl>

                    <FormControl isInvalid={!!errors.ville}>
                      <FormLabel 
                        fontSize="xs" 
                        fontWeight="medium" 
                        color={useColorModeValue('gray.700', 'gray.300')}
                        mb={1}
                      >
                        Ville
                      </FormLabel>
                      <CityDropdown
                        value={formData.ville}
                        onChange={(ville) => handleChange('ville', ville)}
                      />
                      {errors.ville && <FormErrorMessage mt={0.5} fontSize="xs">{errors.ville}</FormErrorMessage>}
                    </FormControl>
                  </SimpleGrid>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    width="100%"
                    size="md"
                    isLoading={isLoading}
                    loadingText="Inscription..."
                    borderRadius="lg"
                    fontWeight="semibold"
                    fontSize="sm"
                    py={5}
                    bg="blue.600"
                    color="white"
                    _hover={{
                      bg: 'blue.700',
                      transform: 'translateY(-1px)',
                      boxShadow: 'lg',
                    }}
                    _active={{
                      bg: 'blue.800',
                    }}
                    transition="all 0.2s"
                    mt={1}
                  >
                    Créer un compte
                  </Button>

                  <HStack justify="center" gap={1} pt={1}>
                    <Text 
                      fontSize="xs" 
                      color={useColorModeValue('gray.600', 'gray.400')}
                    >
                      Déjà un compte ?
                    </Text>
                    <Link 
                      href="/login" 
                      color="blue.500"
                      fontSize="xs"
                      fontWeight="semibold"
                      _hover={{
                        color: 'blue.600',
                        textDecoration: 'underline',
                      }}
                    >
                      Se connecter
                    </Link>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </Box>

          {/* Right side - Visual/Illustration */}
          <Box
            display={{ base: 'none', lg: 'flex' }}
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={6}
            px={8}
          >
            <VStack gap={6} align="start" maxW="500px">
              <Box
                p={8}
                bg={useColorModeValue('white', 'gray.800')}
                borderRadius="2xl"
                boxShadow="xl"
                border="1px solid"
                borderColor={borderColor}
                w="100%"
              >
                <VStack gap={4} align="start">
                  <HStack gap={3}>
                    <Box
                      p={3}
                      bg="blue.100"
                      _dark={{ bg: 'blue.900' }}
                      borderRadius="lg"
                      color="blue.600"
                      _dark={{ color: 'blue.300' }}
                    >
                      <Package size={32} />
                    </Box>
                    <VStack align="start" gap={0}>
                      <Heading size="md" color={useColorModeValue('gray.900', 'white')}>
                        Commencez votre voyage
                      </Heading>
                      <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                        Rejoignez des milliers de clients satisfaits
                      </Text>
                    </VStack>
                  </HStack>
                  <Box
                    h="200px"
                    w="100%"
                    bgGradient="linear(to-br, blue.100, indigo.100)"
                    _dark={{ bgGradient: 'linear(to-br, blue.900, indigo.900)' }}
                    borderRadius="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    opacity={0.8}
                  >
                    <Package size={80} color="currentColor" opacity={0.3} />
                  </Box>
                </VStack>
              </Box>
              
              <VStack align="start" gap={4} color={useColorModeValue('gray.700', 'gray.300')}>
                <HStack gap={3}>
                  <Box
                    p={2}
                    bg="blue.100"
                    _dark={{ bg: 'blue.900' }}
                    borderRadius="md"
                    color="blue.600"
                    _dark={{ color: 'blue.300' }}
                  >
                    <Store size={20} />
                  </Box>
                  <VStack align="start" gap={0}>
                    <Text fontSize="sm" fontWeight="semibold">
                      Gestion de marque
                    </Text>
                    <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                      Créez et gérez votre entreprise facilement
                    </Text>
                  </VStack>
                </HStack>
                <HStack gap={3}>
                  <Box
                    p={2}
                    bg="blue.100"
                    _dark={{ bg: 'blue.900' }}
                    borderRadius="md"
                    color="blue.600"
                    _dark={{ color: 'blue.300' }}
                  >
                    <Globe size={20} />
                  </Box>
                  <VStack align="start" gap={0}>
                    <Text fontSize="sm" fontWeight="semibold">
                      Intégration simple
                    </Text>
                    <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                      Connectez votre site ou réseaux sociaux
                    </Text>
                  </VStack>
                </HStack>
                <HStack gap={3}>
                  <Box
                    p={2}
                    bg="blue.100"
                    _dark={{ bg: 'blue.900' }}
                    borderRadius="md"
                    color="blue.600"
                    _dark={{ color: 'blue.300' }}
                  >
                    <MapPin size={20} />
                  </Box>
                  <VStack align="start" gap={0}>
                    <Text fontSize="sm" fontWeight="semibold">
                      Couverture nationale
                    </Text>
                    <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                      Livraisons dans toutes les villes du Maroc
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}

