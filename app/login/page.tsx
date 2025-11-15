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
  CheckboxRoot,
  CheckboxControl,
  CheckboxLabel,
  IconButton,
  SimpleGrid,
} from '@chakra-ui/react';
import { Eye, EyeOff, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FormControl, FormLabel, FormErrorMessage } from '@/components/Form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/lib/toast';
import { useColorModeValue } from '@/lib/useColorModeValue';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, indigo.100)',
    'linear(to-br, gray.900, gray.800)'
  );
  const formBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('emailInvalid');
    }
    
    if (!password) {
      newErrors.password = t('passwordRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    
    if (success) {
      toast({
        title: t('success'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/dashboard');
    } else {
      toast({
        title: t('error'),
        description: t('errorDescription'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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
            p={{ base: 8, md: 10 }}
            borderRadius="2xl"
            boxShadow="xl"
            border="1px solid"
            borderColor={borderColor}
            maxW="500px"
            mx="auto"
            w="100%"
          >
            <VStack align="stretch" gap={8}>
              {/* Logo/Brand */}
              <VStack align="start" gap={2}>
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
                <Heading size="lg" fontWeight="semibold" color={useColorModeValue('gray.700', 'gray.300')}>
                  {t('title')}
                </Heading>
              </VStack>

              <Box as="form" width="100%" onSubmit={handleSubmit}>
                <VStack gap={5} align="stretch">
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel 
                      fontSize="sm" 
                      fontWeight="medium" 
                      color={useColorModeValue('gray.700', 'gray.300')}
                      mb={2}
                    >
                      {t('email')}
                    </FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      width="100%"
                      disabled={isLoading}
                      size="lg"
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
                    {errors.email && <FormErrorMessage mt={1}>{errors.email}</FormErrorMessage>}
                  </FormControl>

                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel 
                      fontSize="sm" 
                      fontWeight="medium" 
                      color={useColorModeValue('gray.700', 'gray.300')}
                      mb={2}
                    >
                      {t('password')}
                    </FormLabel>
                    <Box position="relative" width="100%">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('passwordPlaceholder')}
                        width="100%"
                        pr="50px"
                        disabled={isLoading}
                        size="lg"
                        borderRadius="lg"
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
                        right="12px"
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
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </Box>
                    {errors.password && <FormErrorMessage mt={1}>{errors.password}</FormErrorMessage>}
                  </FormControl>

                  <HStack width="100%" justify="space-between" align="center">
                    <Box 
                      as="label" 
                      display="flex" 
                      alignItems="center" 
                      gap={2} 
                      cursor={isLoading ? 'not-allowed' : 'pointer'}
                      onClick={(e) => {
                        if (isLoading) {
                          e.preventDefault();
                          return;
                        }
                        e.preventDefault();
                        setRememberMe(!rememberMe);
                      }}
                      opacity={isLoading ? 0.6 : 1}
                    >
                      <CheckboxRoot
                        checked={rememberMe}
                        onCheckedChange={(details) => {
                          if (isLoading) return;
                          const isChecked = Array.isArray(details.checked) 
                            ? details.checked.includes(true)
                            : details.checked === true;
                          setRememberMe(isChecked);
                        }}
                        size="sm"
                        disabled={isLoading}
                      >
                        <CheckboxControl />
                      </CheckboxRoot>
                      <Text 
                        fontSize="sm" 
                        userSelect="none"
                        color={useColorModeValue('gray.600', 'gray.400')}
                      >
                        {t('rememberMe')}
                      </Text>
                    </Box>
                    <Link 
                      href="/forgot-password" 
                      color="blue.500" 
                      fontSize="sm" 
                      fontWeight="medium"
                      pointerEvents={isLoading ? 'none' : 'auto'} 
                      opacity={isLoading ? 0.6 : 1}
                      _hover={{
                        color: 'blue.600',
                        textDecoration: 'underline',
                      }}
                    >
                      {t('forgotPassword')}
                    </Link>
                  </HStack>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    width="100%"
                    size="lg"
                    isLoading={isLoading}
                    loadingText={t('submitting')}
                    borderRadius="lg"
                    fontWeight="semibold"
                    fontSize="md"
                    py={6}
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
                  >
                    {t('submit')}
                  </Button>

                  <HStack justify="center" gap={1} pt={2}>
                    <Text 
                      fontSize="sm" 
                      color={useColorModeValue('gray.600', 'gray.400')}
                    >
                      {t('noAccount')}
                    </Text>
                    <Link 
                      href="/signup" 
                      color="blue.500"
                      fontSize="sm"
                      fontWeight="semibold"
                      _hover={{
                        color: 'blue.600',
                        textDecoration: 'underline',
                      }}
                    >
                      {t('signup')}
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
                        Gestion de Livraison
                      </Heading>
                      <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                        Simplifiez vos livraisons
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
              
              <VStack align="start" gap={3} color={useColorModeValue('gray.700', 'gray.300')}>
                <HStack gap={3}>
                  <Box
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg="blue.500"
                  />
                  <Text fontSize="sm" fontWeight="medium">
                    Suivi en temps réel
                  </Text>
                </HStack>
                <HStack gap={3}>
                  <Box
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg="blue.500"
                  />
                  <Text fontSize="sm" fontWeight="medium">
                    Gestion simplifiée
                  </Text>
                </HStack>
                <HStack gap={3}>
                  <Box
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg="blue.500"
                  />
                  <Text fontSize="sm" fontWeight="medium">
                    Support 24/7
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
