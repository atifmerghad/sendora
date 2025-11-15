'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Textarea,
  Text,
} from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/Table';
import { FormControl, FormLabel, FormErrorMessage } from '@/components/Form';
import { Card } from '@/components/Card';
import { useRouter } from 'next/navigation';
import { CityDropdown } from '@/components/CityDropdown';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';
import { Package } from 'lucide-react';
import { Parcel } from '@/types';


export default function AddPickupPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    ville: '',
    adresse: '',
    note: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [allParcels, setAllParcels] = useState<Parcel[]>([]);
  const [parcelsToPickup, setParcelsToPickup] = useState<Parcel[]>([]);
  const [isLoadingParcels, setIsLoadingParcels] = useState(true);
  const [selectedCityData, setSelectedCityData] = useState<{ 
    ville?: string;
    region?: string | null;
    phone?: string | null;
  } | null>(null);
  const toast = useToast();
  const router = useRouter();

  // Fetch all parcels that need to be picked up
  useEffect(() => {
    const fetchParcels = async () => {
      if (!user?.id) {
        setIsLoadingParcels(false);
        return;
      }

      setIsLoadingParcels(true);
      try {
        // Fetch parcels that are ready for pickup (en_attente, a_preparer, etc.)
        const params = new URLSearchParams({
          userId: user.id,
          statut: 'en_attente', // You can adjust this filter
          limit: '1000', // Get all parcels
        });

        const response = await fetch(`/api/parcels?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setAllParcels(data.parcels || []);
        } else {
          console.error('Error fetching parcels:', data.error);
          setAllParcels([]);
        }
      } catch (error) {
        console.error('Error fetching parcels:', error);
        setAllParcels([]);
      } finally {
        setIsLoadingParcels(false);
      }
    };

    fetchParcels();
  }, [user?.id]);

  // Filter parcels by selected city
  useEffect(() => {
    if (!formData.ville) {
      setParcelsToPickup([]);
      return;
    }

    // Filter parcels by the selected city
    const filtered = allParcels.filter(
      parcel => parcel.ville.toLowerCase() === formData.ville.toLowerCase()
    );
    setParcelsToPickup(filtered);
  }, [formData.ville, allParcels]);

  // Calculate counts
  const filteredParcelsCount = parcelsToPickup.length;
  const totalParcelsForCity = formData.ville 
    ? allParcels.filter(p => p.ville.toLowerCase() === formData.ville.toLowerCase()).length
    : 0;
  const hasNoParcels = filteredParcelsCount === 0;

  // Helper function to get default phone based on city/region
  // This can be replaced when phone field is added to City model
  const getDefaultPhoneByCity = (ville: string, region?: string | null): string => {
    const cityPhoneMap: Record<string, string> = {
      'Casablanca': '0522000000',
      'Rabat': '0537000000',
      'Marrakech': '0524000000',
      'Fès': '0535000000',
      'Tanger': '0539000000',
      'Agadir': '0528000000',
    };
    
    for (const [key, phone] of Object.entries(cityPhoneMap)) {
      if (ville.includes(key)) {
        return phone;
      }
    }
    
    return '0631932433';
  };

  // Get phone number from selected city data or use default
  const phoneNumber = useMemo(() => {
    if (selectedCityData) {
      // If city has a phone field in the future, use it: selectedCityData.phone
      // For now, use default based on city name/region
      return getDefaultPhoneByCity(selectedCityData.ville || formData.ville, selectedCityData.region);
    }
    if (formData.ville) {
      return getDefaultPhoneByCity(formData.ville);
    }
    return '0631932433';
  }, [selectedCityData, formData.ville]);

  // Get user's full name
  const userName = useMemo(() => {
    if (user) {
      return `${user.prenom} ${user.nom}`;
    }
    return 'Adnane Merghad'; // Default fallback
  }, [user]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.ville) newErrors.ville = 'Ville/Quartier du ramassage requis';
    if (!formData.adresse) newErrors.adresse = 'Adresse requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/pickups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ville: formData.ville,
          adresse: formData.adresse,
          note: formData.note,
          nom: userName,
          telephone: phoneNumber,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Demande de ramassage créée',
          description: 'Votre demande de ramassage a été enregistrée',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.push('/dashboard/pickups');
      } else {
        toast({
          title: 'Erreur',
          description: data.error || 'Erreur lors de la création du ramassage',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error creating pickup:', error);
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
        Ajouter Ramassage
      </Heading>

      <Box as="form" onSubmit={handleSubmit}>
        <Card p={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
          <VStack gap={4} align="stretch">
            <FormControl isInvalid={!!errors.ville}>
              <FormLabel>Ville/Quartier du ramassage</FormLabel>
              <CityDropdown
                value={formData.ville}
                onChange={(ville, cityData) => {
                  setFormData({ ...formData, ville });
                  if (cityData) {
                    setSelectedCityData(cityData);
                  }
                }}
                placeholder="Sélectionner une ville/quartier"
              />
              {errors.ville && <FormErrorMessage>{errors.ville}</FormErrorMessage>}
            </FormControl>

            <FormControl>
              <FormLabel>Nom</FormLabel>
              <Input
                value={userName}
                readOnly
                bg="gray.50"
                _dark={{ bg: 'gray.700' }}
                cursor="not-allowed"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Téléphone</FormLabel>
              <Input
                value={phoneNumber}
                readOnly
                bg="gray.50"
                _dark={{ bg: 'gray.700' }}
                cursor="not-allowed"
              />
            </FormControl>

            <FormControl isInvalid={!!errors.adresse}>
              <FormLabel>Adresse</FormLabel>
              <Input
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                placeholder="Adresse"
              />
              {errors.adresse && <FormErrorMessage>{errors.adresse}</FormErrorMessage>}
            </FormControl>

            <FormControl>
              <FormLabel>Note</FormLabel>
              <Textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Note"
                rows={4}
              />
            </FormControl>
          </VStack>
        </Card>

        <Card p={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
          <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
            <Heading size={{ base: 'sm', md: 'md' }}>
              Liste des colis à ramasser - {formData.ville ? `${filteredParcelsCount}/${totalParcelsForCity}` : '0/0'}
            </Heading>
          </HStack>

          {isLoadingParcels ? (
            <Text textAlign="center" py={8}>Chargement des colis...</Text>
          ) : !formData.ville ? (
            <Box
              p={8}
              textAlign="center"
              bg="gray.50"
              _dark={{ bg: 'gray.700' }}
              borderRadius="md"
            >
              <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <Text fontSize="md" color="gray.600" _dark={{ color: 'gray.400' }}>
                Veuillez sélectionner une ville pour voir les colis disponibles
              </Text>
            </Box>
          ) : hasNoParcels ? (
            <Box
              p={8}
              textAlign="center"
              bg="gray.50"
              _dark={{ bg: 'gray.700' }}
              borderRadius="md"
            >
              <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <Text fontSize="md" color="gray.600" _dark={{ color: 'gray.400' }}>
                Ce vendeur n'a pas des colis et n'a pas des mouvements !
              </Text>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Code</Th>
                    <Th>Destinataire</Th>
                    <Th>Ville</Th>
                    <Th>Statut</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {parcelsToPickup.map((parcel) => (
                    <Tr key={parcel.id}>
                      <Td>{parcel.code}</Td>
                      <Td>{parcel.destinataire}</Td>
                      <Td>{parcel.ville}</Td>
                      <Td>{parcel.statut}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Card>

        {/* Submit button at the bottom */}
        <Card p={{ base: 4, md: 6 }}>
          <Button 
            type="submit" 
            colorScheme="blue"
            width="100%" 
            size="lg"
            loading={isLoading}
            bg="blue.600"
            color="white"
            _hover={{
              bg: 'blue.700',
            }}
            _active={{
              bg: 'blue.800',
            }}
          >
            Demander le ramassage
          </Button>
        </Card>
      </Box>
    </Box>
  );
}
