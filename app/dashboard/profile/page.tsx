'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContentGroup,
  VStack,
  Input,
  Button,
  Text,
  HStack,
  Badge,
  Spinner,
  IconButton,
  Code,
} from '@chakra-ui/react';
import { FormControl as FormControlCompat, FormLabel as FormLabelCompat } from '@/components/Form';
import { Card } from '@/components/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/lib/toast';
import { Eye, EyeOff, Copy } from 'lucide-react';

function ProfileContent() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('personal');

  // Handle tab query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['personal', 'banking', 'api', 'promo'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Fetch API keys when API tab is active
  useEffect(() => {
    const fetchApiKeys = async () => {
      if (activeTab === 'api' && user?.id) {
        setIsLoadingApiKeys(true);
        try {
          const response = await fetch(`/api/api-keys?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setApiKeys(data.apiKeys || []);
          }
        } catch (error) {
          console.error('Error fetching API keys:', error);
        } finally {
          setIsLoadingApiKeys(false);
        }
      }
    };

    fetchApiKeys();
  }, [activeTab, user?.id]);

  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    nomMarque: user?.nomMarque || '',
    siteUrl: user?.siteUrl || '',
    ville: user?.ville || '',
  });

  // Banking Information State
  const [bankingInfo, setBankingInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sendora_banking_info');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return {
            nomBanque: '',
            numeroCompte: '',
            iban: '',
            swift: '',
            adresseBanque: '',
          };
        }
      }
    }
    return {
      nomBanque: '',
      numeroCompte: '',
      iban: '',
      swift: '',
      adresseBanque: '',
    };
  });

  // API Integration State
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; key: string; name: string; active: boolean; createdAt: string }>>([]);
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(true);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [promoCodes, setPromoCodes] = useState([
    { code: 'WELCOME10', discount: '10%', status: 'actif', dateExpiration: '2024-12-31' },
    { code: 'NEWUSER20', discount: '20%', status: 'expire', dateExpiration: '2024-01-15' },
  ]);

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Informations mises à jour',
      description: 'Vos informations personnelles ont été mises à jour avec succès',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleBankingInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save banking info to localStorage
    localStorage.setItem('sendora_banking_info', JSON.stringify(bankingInfo));
    toast({
      title: 'Informations bancaires mises à jour',
      description: 'Vos informations bancaires ont été enregistrées',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleGenerateApiKey = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: 'Clé API',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys([...apiKeys, data.apiKey]);
        toast({
          title: 'Nouvelle clé API générée',
          description: 'Votre nouvelle clé API a été générée avec succès',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erreur',
          description: errorData.error || 'Erreur lors de la génération de la clé API',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la génération de la clé API',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCopyApiKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      toast({
        title: 'Copié',
        description: 'Clé API copiée dans le presse-papiers',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return `${key.substring(0, 8)}${'•'.repeat(key.length - 12)}${key.substring(key.length - 4)}`;
  };

  const handleAddPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode) {
      setPromoCodes([
        ...promoCodes,
        {
          code: promoCode,
          discount: '10%',
          status: 'actif',
          dateExpiration: '2024-12-31',
        },
      ]);
      setPromoCode('');
      toast({
        title: 'Code promo ajouté',
        description: 'Le code promo a été ajouté avec succès',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Mon Profil
      </Heading>

      <Card p={6}>
        <TabsRoot value={activeTab} onValueChange={(details) => setActiveTab(details.value as string)}>
          <TabsList>
            <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
            <TabsTrigger value="banking">Informations bancaires</TabsTrigger>
            <TabsTrigger value="api">Intégration API</TabsTrigger>
            <TabsTrigger value="promo">Code Promo</TabsTrigger>
          </TabsList>

          <TabsContentGroup>
            <TabsContent value="personal">
            <Box mt={6}>
              <form onSubmit={handlePersonalInfoSubmit}>
                <VStack gap={4} align="stretch">
                  <FormControlCompat>
                    <FormLabelCompat>Nom</FormLabelCompat>
                    <Input
                      value={personalInfo.nom}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, nom: e.target.value })}
                    />
                  </FormControlCompat>

                  <FormControlCompat>
                    <FormLabelCompat>Prénom</FormLabelCompat>
                    <Input
                      value={personalInfo.prenom}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, prenom: e.target.value })}
                    />
                  </FormControlCompat>

                  <FormControlCompat>
                    <FormLabelCompat>Adresse email</FormLabelCompat>
                    <Input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    />
                  </FormControlCompat>

                  <FormControlCompat>
                    <FormLabelCompat>Téléphone</FormLabelCompat>
                    <Input
                      type="tel"
                      value={personalInfo.telephone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, telephone: e.target.value })}
                    />
                  </FormControlCompat>

                  <FormControlCompat>
                    <FormLabelCompat>Nom de la marque</FormLabelCompat>
                    <Input
                      value={personalInfo.nomMarque}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, nomMarque: e.target.value })}
                    />
                  </FormControlCompat>

                  <FormControlCompat>
                    <FormLabelCompat>Site ou page Facebook/Instagram (URL)</FormLabelCompat>
                    <Input
                      type="url"
                      value={personalInfo.siteUrl}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, siteUrl: e.target.value })}
                    />
                  </FormControlCompat>

                  <FormControlCompat>
                    <FormLabelCompat>Ville</FormLabelCompat>
                    <Input
                      value={personalInfo.ville}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, ville: e.target.value })}
                    />
                  </FormControlCompat>

                  <Button type="submit" colorScheme="blue" width="100%">
                    Enregistrer les modifications
                  </Button>
                </VStack>
              </form>
            </Box>
          </TabsContent>

          <TabsContent value="banking">
            <Box mt={6}>
              <form onSubmit={handleBankingInfoSubmit}>
                <VStack gap={4} align="stretch">
                  <FormControlCompat>
                    <FormLabelCompat>Nom de la banque</FormLabelCompat>
                    <Input
                      value={bankingInfo.nomBanque}
                      onChange={(e) => setBankingInfo({ ...bankingInfo, nomBanque: e.target.value })}
                      placeholder="Ex: Bank of Africa"
                    />
                  </FormControlCompat>

                  <FormControlCompat>
                    <FormLabelCompat>Numéro de compte</FormLabelCompat>
                    <Input
                      value={bankingInfo.numeroCompte}
                      onChange={(e) => setBankingInfo({ ...bankingInfo, numeroCompte: e.target.value })}
                      placeholder="Numéro de compte bancaire"
                    />
                  </FormControlCompat>

                  <FormControlCompat>
                    <FormLabelCompat>IBAN</FormLabelCompat>
                    <Input
                      value={bankingInfo.iban}
                      onChange={(e) => setBankingInfo({ ...bankingInfo, iban: e.target.value })}
                      placeholder="MA64 0000 0000 0000 0000 0000 000"
                    />
                  </FormControlCompat>

                  <FormControlCompat>
                    <FormLabelCompat>SWIFT/BIC</FormLabelCompat>
                    <Input
                      value={bankingInfo.swift}
                      onChange={(e) => setBankingInfo({ ...bankingInfo, swift: e.target.value })}
                      placeholder="Ex: BOAMAMAC"
                    />
                  </FormControlCompat>

                  <FormControlCompat>
                    <FormLabelCompat>Adresse de la banque</FormLabelCompat>
                    <Input
                      value={bankingInfo.adresseBanque}
                      onChange={(e) => setBankingInfo({ ...bankingInfo, adresseBanque: e.target.value })}
                      placeholder="Adresse complète de la banque"
                    />
                  </FormControlCompat>

                  <Button type="submit" colorScheme="blue" width="100%">
                    Enregistrer les informations bancaires
                  </Button>
                </VStack>
              </form>
            </Box>
          </TabsContent>

          <TabsContent value="api">
            <Box mt={6}>
                <VStack gap={6} align="stretch">
                <HStack justify="space-between" width="100%">
                  <Text fontSize="md" fontWeight="semibold">
                    Clés API
                  </Text>
                  <Button 
                    onClick={handleGenerateApiKey} 
                    colorScheme="blue"
                    size="sm"
                    bg="blue.600"
                    color="white"
                    _hover={{ bg: 'blue.700' }}
                    _active={{ bg: 'blue.800' }}
                  >
                    Générer une nouvelle clé
                  </Button>
                </HStack>

                {isLoadingApiKeys ? (
                  <Text textAlign="center" py={4}>Chargement...</Text>
                ) : apiKeys.length === 0 ? (
                  <VStack py={8} gap={4}>
                    <Text color="gray.500" textAlign="center">Aucune clé API générée</Text>
                    <Text fontSize="sm" color="gray.400" textAlign="center">
                      Cliquez sur "Générer une nouvelle clé" pour créer votre première clé API
                    </Text>
                  </VStack>
                ) : (
                  <VStack align="stretch" gap={4}>
                    {apiKeys.map((apiKey) => (
                      <Box
                        key={apiKey.id}
                        p={4}
                        bg="gray.50"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.200"
                        _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
                      >
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" fontWeight="medium">{apiKey.name}</Text>
                          <Badge colorScheme={apiKey.active ? 'green' : 'red'}>
                            {apiKey.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </HStack>
                        <HStack gap={2}>
                          <Code flex={1} fontSize="sm">
                            {showApiKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                          </Code>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            aria-label={showApiKey[apiKey.id] ? 'Masquer' : 'Afficher'}
                            onClick={() => setShowApiKey(prev => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}
                          >
                            {showApiKey[apiKey.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </IconButton>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            aria-label="Copier"
                            onClick={() => handleCopyApiKey(apiKey.key)}
                          >
                            <Copy size={16} />
                          </IconButton>
                        </HStack>
                        {apiKey.createdAt && (
                          <Text fontSize="xs" color="gray.500" mt={2}>
                            Créée le: {new Date(apiKey.createdAt).toLocaleString('fr-FR')}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                )}

                <Box mt={4}>
                  <Text fontSize="md" fontWeight="semibold" mb={3}>
                    Documentation API
                  </Text>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Utilisez votre clé API pour intégrer Sendora dans votre application.
                  </Text>
                  <Text fontSize="sm" color="gray.600" mb={3}>
                    Endpoint de base: <Code fontSize="xs">https://api.sendora.com/v1</Code>
                  </Text>
                  <Button
                    onClick={() => router.push('/dashboard/api')}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                  >
                    Voir la documentation complète
                  </Button>
                </Box>
              </VStack>
            </Box>
          </TabsContent>

          <TabsContent value="promo">
            <Box mt={6}>
                <VStack gap={6} align="stretch">
                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={4}>
                    Ajouter un code promo
                  </Text>
                  <form onSubmit={handleAddPromoCode}>
                    <VStack gap={3} align="stretch">
                      <FormControlCompat>
                        <FormLabelCompat>Code promo</FormLabelCompat>
                        <Input
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Ex: WELCOME10"
                        />
                      </FormControlCompat>
                      <Button type="submit" colorScheme="blue" width="100%">
                        Ajouter le code
                      </Button>
                    </VStack>
                  </form>
                </Box>

                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={4}>
                    Mes codes promo
                  </Text>
                  <VStack gap={3} align="stretch">
                    {promoCodes.map((promo, index) => (
                      <Box
                        key={index}
                        p={4}
                        border="1px solid"
                        borderColor="gray.200"
                        _dark={{ borderColor: 'gray.700' }}
                        borderRadius="md"
                      >
                        <VStack align="start" gap={2}>
                          <HStack justify="space-between" width="100%">
                            <Text fontWeight="semibold">{promo.code}</Text>
                            <Badge
                              colorScheme={promo.status === 'actif' ? 'green' : 'gray'}
                            >
                              {promo.status}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            Réduction: {promo.discount}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Expire le: {promo.dateExpiration}
                          </Text>
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </TabsContent>
          </TabsContentGroup>
        </TabsRoot>
      </Card>
    </Box>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    }>
      <ProfileContent />
    </Suspense>
  );
}

