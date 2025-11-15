'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Textarea,
  CheckboxRoot,
  CheckboxControl,
  NativeSelectRoot,
  NativeSelectField,
  NativeSelectIndicator,
  Separator,
  Link,
  SimpleGrid,
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleIndicator,
} from '@chakra-ui/react';
import { FormControl, FormLabel, FormErrorMessage } from '@/components/Form';
import { Card } from '@/components/Card';
import { useRouter } from 'next/navigation';
import { CityDropdownWithPrice } from '@/components/CityDropdownWithPrice';
import { useToast } from '@/lib/toast';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/Table';
import { Info, Plus, Trash2, Package, Scale, FileText, AlertTriangle, HelpCircle, ChevronDown } from 'lucide-react';
import { useColorModeValue } from '@/lib/useColorModeValue';
import { CityWithPrice } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  produit: string;
  reference: string;
  enStock: boolean;
  aPreparer: boolean;
  quantite: number;
  note: string;
}

export default function AddParcelPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const [formData, setFormData] = useState({
    referenceColis: '',
    villeClient: '',
    villeRamassage: '',
    nomClient: '',
    telephone: '',
    adresse: '',
    referenceVendeur: '',
    note: '',
    autoriserEssayage: false,
    echange: false,
    produitStock: false,
    emballage: 'Aucun',
  });

  const [montantTotal, setMontantTotal] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCityData, setSelectedCityData] = useState<CityWithPrice | null>(null);

  // Calculate delivery fee based on selected city
  const fraisLivraison = useMemo(() => {
    return selectedCityData?.price || 0;
  }, [selectedCityData]);

  const fraisRefus = useMemo(() => {
    return selectedCityData?.refused_cost || 0;
  }, [selectedCityData]);

  const fraisAnnulation = useMemo(() => {
    return selectedCityData?.canceled_cost || 0;
  }, [selectedCityData]);

  const delais = useMemo(() => {
    return selectedCityData?.delais || '48h - 96h';
  }, [selectedCityData]);

  const montantTotalAvecFrais = montantTotal + fraisLivraison + fraisRefus + fraisAnnulation;

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      produit: '',
      reference: '',
      enStock: false,
      aPreparer: false,
      quantite: 1,
      note: '',
    };
    setProducts([...products, newProduct]);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleProductChange = (id: string, field: keyof Product, value: any) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.villeClient) newErrors.villeClient = 'Ville du client requise';
    if (!formData.nomClient) newErrors.nomClient = 'Nom du client requis';
    if (!formData.telephone) newErrors.telephone = 'Téléphone requis';
    if (!formData.adresse) newErrors.adresse = 'Adresse requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user?.id) return;

    setIsLoading(true);
    try {
      // Generate unique code
      const code = formData.referenceColis || `COL-${Date.now()}`;
      const numero = code;

      // Determine typeColis based on form data
      let typeColis = 'colis_normal';
      if (formData.produitStock) {
        typeColis = 'colis_stock';
      } else if (formData.echange) {
        typeColis = 'echange_avec';
      }

      const response = await fetch('/api/parcels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numero,
          code,
          destinataire: formData.nomClient,
          telephone: formData.telephone,
          adresse: formData.adresse,
          ville: formData.villeClient,
          statut: 'en_attente',
          statutFacturation: 'en_attente',
          typeColis,
          fraisLivraison,
          montantTotal: montantTotalAvecFrais,
          referenceColis: formData.referenceColis || '',
          referenceVendeur: formData.referenceVendeur || '',
          note: formData.note || null,
          vendeurSecondaire: null,
          derniereAction: 'Créé',
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Colis ajouté',
          description: 'Le colis a été ajouté avec succès',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.push('/dashboard/parcels');
      } else {
        toast({
          title: 'Erreur',
          description: data.error || 'Erreur lors de l\'ajout du colis',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error creating parcel:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Heading size={{ base: 'md', md: 'lg' }} mb={{ base: 4, md: 6 }}>
        Ajouter Colis
      </Heading>

      {/* Information Alert */}
      <Card 
        p={{ base: 1, md: 2 }} 
        mb={{ base: 1, md: 2 }}
        bg="blue.50"
        _dark={{ bg: 'blue.900' }}
        borderLeft="4px solid"
        borderColor="blue.500"
      >
        <CollapsibleRoot defaultOpen={true}>
          <CollapsibleTrigger asChild>
            <Box
              as="button"
              width="100%"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={4}
              p={2}
              borderRadius="md"
              _hover={{ bg: 'blue.100', _dark: { bg: 'blue.800' } }}
              transition="background 0.2s"
            >
              <HStack align="start" gap={3} flex={1}>
                <Box
                  p={2}
                  borderRadius="md"
                  bg="blue.100"
                  _dark={{ bg: 'blue.800' }}
                  color="blue.600"
                  _dark={{ color: 'blue.300' }}
                  flexShrink={0}
                >
                  <Info size={20} />
                </Box>
                <VStack align="start" gap={1} flex={1}>
                  <Heading size="sm" color="blue.900" _dark={{ color: 'blue.100' }}>
                    Informations importantes
                  </Heading>
                  <Text fontSize="xs" color="blue.700" _dark={{ color: 'blue.300' }}>
                    Veuillez lire attentivement ces informations avant d'ajouter un colis
                  </Text>
                </VStack>
              </HStack>
              <CollapsibleIndicator>
                <ChevronDown size={20} style={{ transition: 'transform 0.2s' }} />
              </CollapsibleIndicator>
            </Box>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <VStack align="stretch" gap={4}>
          <HStack align="start" gap={3}>
            <Box
              p={2}
              borderRadius="md"
              bg="primary.100"
              _dark={{ bg: 'primary.800' }}
              color="primary.600"
              _dark={{ color: 'primary.300' }}
              flexShrink={0}
            >
              <Package size={18} />
            </Box>
            <VStack align="start" gap={0} flex={1}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.800" _dark={{ color: 'gray.100' }}>
                Dimensions et poids
              </Text>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                Le colis ne doit pas dépasser <strong>30cm × 30cm × 30cm</strong> et peser entre <strong>1Kg et 5Kg</strong>
              </Text>
            </VStack>
          </HStack>

          <HStack align="start" gap={3}>
            <Box
              p={2}
              borderRadius="md"
              bg="orange.100"
              _dark={{ bg: 'orange.900' }}
              color="orange.600"
              _dark={{ color: 'orange.300' }}
              flexShrink={0}
            >
              <Scale size={18} />
            </Box>
            <VStack align="start" gap={0} flex={1}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.800" _dark={{ color: 'gray.100' }}>
                Réglementation postale
              </Text>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                Conformément au Dahir du 25 novembre 1924, l'envoi de colis de moins de 1 kilogramme est réservé aux services postaux
              </Text>
            </VStack>
          </HStack>

          <HStack align="start" gap={3}>
            <Box
              p={2}
              borderRadius="md"
              bg="green.100"
              _dark={{ bg: 'green.900' }}
              color="green.600"
              _dark={{ color: 'green.300' }}
              flexShrink={0}
            >
              <FileText size={18} />
            </Box>
            <VStack align="start" gap={0} flex={1}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.800" _dark={{ color: 'gray.100' }}>
                Étiquetage
              </Text>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                Le colis doit être étiquetté. Vous pouvez imprimer l'étiquette directement depuis le système.
              </Text>
            </VStack>
          </HStack>

          <HStack align="start" gap={3}>
            <Box
              p={2}
              borderRadius="md"
              bg="yellow.100"
              _dark={{ bg: 'yellow.900' }}
              color="yellow.600"
              _dark={{ color: 'yellow.300' }}
              flexShrink={0}
            >
              <AlertTriangle size={18} />
            </Box>
            <VStack align="start" gap={0} flex={1}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.800" _dark={{ color: 'gray.100' }}>
                Produits fragiles
              </Text>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                Les produits fragiles doivent être emballés correctement. Sendora n'est pas responsable si un produit est endommagé.
              </Text>
            </VStack>
          </HStack>

          <HStack align="start" gap={3}>
            <Box
              p={2}
              borderRadius="md"
              bg="purple.100"
              _dark={{ bg: 'purple.900' }}
              color="purple.600"
              _dark={{ color: 'purple.300' }}
              flexShrink={0}
            >
              <HelpCircle size={18} />
            </Box>
            <VStack align="start" gap={0} flex={1}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.800" _dark={{ color: 'gray.100' }}>
                Produits non autorisés
              </Text>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                <Link 
                  href="/dashboard/help" 
                  color="blue.500"
                  _dark={{ color: 'blue.300' }}
                  fontWeight="medium"
                  _hover={{ textDecoration: 'underline' }}
                >
                  Voir la liste des produits non autorisés sur le Centre d'aide
                </Link>
              </Text>
            </VStack>
          </HStack>
        </VStack>
          </CollapsibleContent>
        </CollapsibleRoot>
      </Card>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} mb={6}>
        {/* Delivery Fees Card */}
        <Card p={{ base: 4, md: 6 }}>
          <Heading size="sm" mb={4}>Frais de livraison</Heading>
          <VStack align="start" gap={2}>
            <HStack justify="space-between" width="100%">
              <Text fontSize="sm">Frais de livraison</Text>
              <Text fontSize="sm" fontWeight="semibold">{fraisLivraison} DH</Text>
            </HStack>
            <HStack justify="space-between" width="100%">
              <Text fontSize="sm">Frais de refus</Text>
              <Text fontSize="sm" fontWeight="semibold">{fraisRefus} DH</Text>
            </HStack>
            <HStack justify="space-between" width="100%">
              <Text fontSize="sm">Frais d'annulation</Text>
              <Text fontSize="sm" fontWeight="semibold">{fraisAnnulation} DH</Text>
            </HStack>
            <Separator />
            <HStack justify="space-between" width="100%">
              <Text fontSize="sm" fontWeight="semibold">Délai</Text>
              <Text fontSize="sm" fontWeight="semibold">{delais}</Text>
            </HStack>
          </VStack>
        </Card>

        {/* Main Form */}
        <Box gridColumn={{ base: 1, lg: 'span 2' }}>
          <Card p={{ base: 4, md: 6 }}>
            <Box as="form" onSubmit={handleSubmit}>
              <VStack gap={4}>
                <FormControl>
                  <FormLabel>Référence du colis</FormLabel>
                  <Input
                    value={formData.referenceColis}
                    onChange={(e) => setFormData({ ...formData, referenceColis: e.target.value })}
                    placeholder="Code de l'étiquette vide"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Veuillez saisir le code qui figure sur votre étiquette vide (fourni par Sendora), laissez le champs vide si vous n'avez pas d'étiquette
                  </Text>
                </FormControl>

                <HStack width="100%" gap={4}>
                  <FormControl isInvalid={!!errors.villeClient}>
                    <FormLabel>Ville du client</FormLabel>
                    <CityDropdownWithPrice
                      value={formData.villeClient}
                      onChange={(ville, cityData) => {
                        setFormData({ ...formData, villeClient: ville });
                        setSelectedCityData(cityData || null);
                      }}
                    />
                    {errors.villeClient && <FormErrorMessage>{errors.villeClient}</FormErrorMessage>}
                  </FormControl>

                  <FormControl>
                    <FormLabel>Ville de ramassage</FormLabel>
                    <CityDropdownWithPrice
                      value={formData.villeRamassage}
                      onChange={(ville) => setFormData({ ...formData, villeRamassage: ville })}
                      showPrice={false}
                    />
                  </FormControl>
                </HStack>

                <FormControl isInvalid={!!errors.nomClient}>
                  <FormLabel>Nom du client</FormLabel>
                  <Input
                    value={formData.nomClient}
                    onChange={(e) => setFormData({ ...formData, nomClient: e.target.value })}
                    placeholder="Nom complet"
                  />
                  {errors.nomClient && <FormErrorMessage>{errors.nomClient}</FormErrorMessage>}
                </FormControl>

                <HStack width="100%" gap={4}>
                  <FormControl flex={1}>
                    <FormLabel>Montant total</FormLabel>
                    <Input
                      type="number"
                      value={montantTotal || ''}
                      onChange={(e) => setMontantTotal(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </FormControl>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="semibold" mb={2}>Montant total avec frais de livraison inclus</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">
                      {montantTotalAvecFrais} DH
                    </Text>
                  </Box>
                </HStack>

                <FormControl isInvalid={!!errors.telephone}>
                  <FormLabel>Téléphone du client</FormLabel>
                  <Input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+212 6XX XXX XXX"
                  />
                  {errors.telephone && <FormErrorMessage>{errors.telephone}</FormErrorMessage>}
                </FormControl>

                <FormControl isInvalid={!!errors.adresse}>
                  <FormLabel>Adresse du client</FormLabel>
                  <Textarea
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    placeholder="Adresse complète"
                    rows={3}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Veuillez indiquer une adresse complète afin de prévenir les retards.
                  </Text>
                  {errors.adresse && <FormErrorMessage>{errors.adresse}</FormErrorMessage>}
                </FormControl>

                <FormControl>
                  <FormLabel>Référence vendeur</FormLabel>
                  <Input
                    value={formData.referenceVendeur}
                    onChange={(e) => setFormData({ ...formData, referenceVendeur: e.target.value })}
                    placeholder="Référence vendeur"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Note</FormLabel>
                  <Textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Des informations supplémentaires (2ème numéro de téléphone ...)"
                    rows={3}
                  />
                </FormControl>

                <FormControl>
                  <Box as="label" display="flex" alignItems="center" gap={2} cursor="pointer">
                    <CheckboxRoot
                      checked={formData.autoriserEssayage}
                      onCheckedChange={(details) => {
                        setFormData({ ...formData, autoriserEssayage: details.checked as boolean });
                      }}
                    >
                      <CheckboxControl />
                    </CheckboxRoot>
                    <Text fontSize="sm">Autoriser l'essayage du produit par le client ?</Text>
                  </Box>
                </FormControl>

                <HStack width="100%" gap={4}>
                  <FormControl>
                    <Box as="label" display="flex" alignItems="center" gap={2} cursor="pointer">
                      <CheckboxRoot
                        checked={formData.echange}
                        onCheckedChange={(details) => {
                          setFormData({ ...formData, echange: details.checked as boolean });
                        }}
                      >
                        <CheckboxControl />
                      </CheckboxRoot>
                      <Text fontSize="sm">Echange</Text>
                    </Box>
                  </FormControl>

                  <FormControl>
                    <Box as="label" display="flex" alignItems="center" gap={2} cursor="pointer">
                      <CheckboxRoot
                        checked={formData.produitStock}
                        onCheckedChange={(details) => {
                          setFormData({ ...formData, produitStock: details.checked as boolean });
                        }}
                      >
                        <CheckboxControl />
                      </CheckboxRoot>
                      <Text fontSize="sm">Produit de stock</Text>
                    </Box>
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Emballage</FormLabel>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={formData.emballage}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        setFormData({ ...formData, emballage: e.target.value });
                      }}
                    >
                      <option value="Aucun">Aucun</option>
                      <option value="Standard">Standard</option>
                      <option value="Fragile">Fragile</option>
                      <option value="Protection renforcée">Protection renforcée</option>
                    </NativeSelectField>
                    <NativeSelectIndicator />
                  </NativeSelectRoot>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    <Link href="#" color="blue.500">En savoir plus</Link>
                  </Text>
                </FormControl>

                <Separator />

                {/* Products Section */}
                <Box width="100%">
                  <HStack justify="space-between" mb={4}>
                    <Heading size="sm">Produits</Heading>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddProduct}
                    >
                      <Plus size={16} style={{ marginRight: '4px' }} />
                      Ajouter produit
                    </Button>
                  </HStack>

                  {products.length > 0 ? (
                    <Box overflowX="auto">
                      <Table>
                        <Thead>
                          <Tr>
                            <Th>Produit / Référence</Th>
                            <Th>En Stock</Th>
                            <Th>À préparer</Th>
                            <Th>Quantité</Th>
                            <Th>Note</Th>
                            <Th>Action</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {products.map((product) => (
                            <Tr key={product.id}>
                              <Td>
                                <VStack align="start" gap={1}>
                                  <Input
                                    size="sm"
                                    placeholder="Nom du produit"
                                    value={product.produit}
                                    onChange={(e) => handleProductChange(product.id, 'produit', e.target.value)}
                                  />
                                  <Input
                                    size="sm"
                                    placeholder="Référence"
                                    value={product.reference}
                                    onChange={(e) => handleProductChange(product.id, 'reference', e.target.value)}
                                  />
                                </VStack>
                              </Td>
                              <Td>
                                <CheckboxRoot
                                  checked={product.enStock}
                                  onCheckedChange={(details) => {
                                    handleProductChange(product.id, 'enStock', details.checked);
                                  }}
                                >
                                  <CheckboxControl />
                                </CheckboxRoot>
                              </Td>
                              <Td>
                                <CheckboxRoot
                                  checked={product.aPreparer}
                                  onCheckedChange={(details) => {
                                    handleProductChange(product.id, 'aPreparer', details.checked);
                                  }}
                                >
                                  <CheckboxControl />
                                </CheckboxRoot>
                              </Td>
                              <Td>
                                <Input
                                  type="number"
                                  size="sm"
                                  width="80px"
                                  min={1}
                                  value={product.quantite}
                                  onChange={(e) => handleProductChange(product.id, 'quantite', parseInt(e.target.value) || 1)}
                                />
                              </Td>
                              <Td>
                                <Input
                                  size="sm"
                                  placeholder="Note"
                                  value={product.note}
                                  onChange={(e) => handleProductChange(product.id, 'note', e.target.value)}
                                />
                              </Td>
                              <Td>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleRemoveProduct(product.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  ) : (
                    <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                      Aucun produit ajouté. Cliquez sur "Ajouter produit" pour commencer.
                    </Text>
                  )}
                </Box>

                <HStack width="100%" gap={4} mt={4}>
                  <Button
                    type="button"
                    variant="outline"
                    colorScheme="blue"
                    onClick={() => router.back()}
                    flex={1}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    flex={1}
                    isLoading={isLoading}
                  >
                    Ajouter le colis
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Card>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
