'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Input,
  ListRoot,
  ListItem,
  HStack,
  Text,
} from '@chakra-ui/react';
import { useColorModeValue } from '@/lib/useColorModeValue';

interface City {
  id: number;
  ville: string;
  price: number;
  delais?: string | null;
  region?: string | null;
  arabicName?: string | null;
  active?: string | null;
}

interface CityDropdownWithPriceProps {
  value: string;
  onChange: (city: string, cityData?: City) => void;
  placeholder?: string;
  showPrice?: boolean;
}

export function CityDropdownWithPrice({ 
  value, 
  onChange, 
  placeholder = 'Sélectionner une ville',
  showPrice = true 
}: CityDropdownWithPriceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/cities?active=true');
        if (response.ok) {
          const data = await response.json();
          setCities(data);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, []);

  const filteredCities = useMemo(() => {
    if (!searchTerm) return cities;
    return cities.filter(city =>
      city.ville.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, cities]);

  const selectedCity = cities.find(c => c.ville === value);

  return (
    <Box position="relative" width="100%">
      <Input
        value={selectedCity?.ville || searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        onClick={() => setIsOpen(true)}
        readOnly={false}
      />
      {isOpen && (
        <>
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            zIndex={1000}
            bg={bg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="md"
            mt={1}
            maxH="300px"
            overflowY="auto"
            boxShadow="lg"
          >
            <ListRoot>
              {isLoading ? (
                <ListItem p={3}>Chargement...</ListItem>
              ) : filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <ListItem
                    key={city.id}
                    p={3}
                    cursor="pointer"
                    _hover={{ bg: hoverBg }}
                    onClick={() => {
                      onChange(city.ville, city);
                      setSearchTerm('');
                      setIsOpen(false);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <HStack justify="space-between" width="100%">
                      <Text fontWeight="medium">{city.ville}</Text>
                      {showPrice && (
                        <HStack gap={2}>
                          {city.delais && (
                            <Text fontSize="sm" color={textColor}>
                              {city.delais}
                            </Text>
                          )}
                          <Text fontSize="sm" fontWeight="semibold" color="blue.500">
                            {city.price} DH
                          </Text>
                        </HStack>
                      )}
                    </HStack>
                  </ListItem>
                ))
              ) : (
                <ListItem p={3}>Aucune ville trouvée</ListItem>
              )}
            </ListRoot>
          </Box>
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={999}
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </Box>
  );
}

