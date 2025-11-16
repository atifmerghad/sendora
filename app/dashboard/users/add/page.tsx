'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  CheckboxRoot,
  CheckboxControl,
  CheckboxLabel,
  NativeSelectRoot,
  NativeSelectField,
  NativeSelectIndicator,
  SimpleGrid,
  Separator,
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
  Badge,
} from '@chakra-ui/react';
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@/components/Form';
import { Card } from '@/components/Card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, User, Mail, Phone, MapPin, Shield, Image as ImageIcon, UserPlus, ArrowLeft } from 'lucide-react';

interface Permissions {
  dashboard: boolean;
  gestionColis: boolean;
  gestionRamassages: boolean;
  gestionStock: boolean;
  gestionRetours: boolean;
  gestionFactures: boolean;
  chat: boolean;
  mesTickets: boolean;
}

export default function AddUserPage() {
  const router = useRouter();
  const toast = useToast();
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    telephone: '',
    deuxiemeTelephone: '',
    adresse: '',
    etat: 'Active',
    imageProfil: null as File | null,
  });

  const [permissions, setPermissions] = useState<Permissions>({
    dashboard: false,
    gestionColis: false,
    gestionRamassages: false,
    gestionStock: false,
    gestionRetours: false,
    gestionFactures: false,
    chat: false,
    mesTickets: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  // Calculate password strength
  const passwordStrength = useMemo(() => {
    if (!formData.password) return { strength: 0, label: '', color: 'gray' };
    
    let strength = 0;
    if (formData.password.length >= 6) strength++;
    if (formData.password.length >= 8) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[a-z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;

    if (strength <= 2) return { strength, label: 'Faible', color: 'red' };
    if (strength <= 4) return { strength, label: 'Moyen', color: 'orange' };
    return { strength, label: 'Fort', color: 'green' };
  }, [formData.password]);

  // Check if all permissions are selected
  const allPermissionsSelected = useMemo(() => {
    return Object.values(permissions).every(v => v === true);
  }, [permissions]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePermissionChange = (permission: keyof Permissions, checked: boolean | 'indeterminate') => {
    setPermissions(prev => ({ ...prev, [permission]: checked === true }));
  };

  const handleSelectAllPermissions = () => {
    const allSelected = allPermissionsSelected;
    setPermissions({
      dashboard: !allSelected,
      gestionColis: !allSelected,
      gestionRamassages: !allSelected,
      gestionStock: !allSelected,
      gestionRetours: !allSelected,
      gestionFactures: !allSelected,
      chat: !allSelected,
      mesTickets: !allSelected,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageProfil: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.prenom.trim()) newErrors.prenom = 'Prénom requis';
    if (!formData.nom.trim()) newErrors.nom = 'Nom requis';
    if (!formData.email.trim()) {
      newErrors.email = 'Adresse email requise';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Adresse email invalide';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (!formData.telephone.trim()) newErrors.telephone = 'Téléphone requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('prenom', formData.prenom);
      formDataToSend.append('nom', formData.nom);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('telephone', formData.telephone);
      formDataToSend.append('deuxiemeTelephone', formData.deuxiemeTelephone);
      formDataToSend.append('adresse', formData.adresse);
      formDataToSend.append('etat', formData.etat);
      formDataToSend.append('role', 'CLIENT'); // Always CLIENT for new users
      formDataToSend.append('permissions', JSON.stringify(permissions));
      // Pass current user ID to get their business
      if (currentUser?.id) {
        formDataToSend.append('currentUserId', currentUser.id);
      }
      
      if (formData.imageProfil) {
        formDataToSend.append('imageProfil', formData.imageProfil);
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Utilisateur créé',
          description: 'L\'utilisateur a été créé avec succès',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.push('/dashboard/users');
      } else {
        toast({
          title: 'Erreur',
          description: data.error || 'Erreur lors de la création de l\'utilisateur',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
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
      <HStack mb={{ base: 4, md: 6 }} gap={4}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft size={16} style={{ marginRight: '6px' }} />
          Retour
        </Button>
        <Heading size={{ base: 'md', md: 'lg' }} flex={1}>
          Ajouter un utilisateur
        </Heading>
      </HStack>

      <Box as="form" onSubmit={handleSubmit}>
        {/* Informations personnelles */}
        <Card p={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
          <HStack mb={4} gap={2}>
            <Box
              p={2}
              borderRadius="md"
              bg="blue.100"
              _dark={{ bg: 'blue.900' }}
              color="blue.600"
              _dark={{ color: 'blue.300' }}
            >
              <User size={18} />
            </Box>
            <Heading size="md">Informations personnelles</Heading>
          </HStack>
          <Separator mb={4} />

          <VStack gap={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <FormControl isInvalid={!!errors.prenom}>
                <FormLabel fontWeight="medium">Prénom <Text as="span" color="red.500">*</Text></FormLabel>
                <Input
                  value={formData.prenom}
                  onChange={(e) => handleInputChange('prenom', e.target.value)}
                  placeholder="Entrez le prénom"
                  size="md"
                />
                {errors.prenom && <FormErrorMessage>{errors.prenom}</FormErrorMessage>}
              </FormControl>

              <FormControl isInvalid={!!errors.nom}>
                <FormLabel fontWeight="medium">Nom <Text as="span" color="red.500">*</Text></FormLabel>
                <Input
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  placeholder="Entrez le nom"
                  size="md"
                />
                {errors.nom && <FormErrorMessage>{errors.nom}</FormErrorMessage>}
              </FormControl>
            </SimpleGrid>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel fontWeight="medium">
                <HStack gap={2}>
                  <Mail size={14} />
                  <Text>Adresse email <Text as="span" color="red.500">*</Text></Text>
                </HStack>
              </FormLabel>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="exemple@email.com"
                size="md"
              />
              <FormHelperText>Cette adresse sera utilisée pour la connexion</FormHelperText>
              {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel fontWeight="medium">
                Mot de passe <Text as="span" color="red.500">*</Text>
              </FormLabel>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  handleInputChange('password', e.target.value);
                  setShowPasswordStrength(true);
                }}
                onFocus={() => setShowPasswordStrength(true)}
                placeholder="Minimum 6 caractères"
                size="md"
              />
              {showPasswordStrength && formData.password && (
                <Box mt={2}>
                  <HStack gap={2} mb={1}>
                    <Badge colorScheme={passwordStrength.color} px={2} py={1}>
                      {passwordStrength.label}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      Force: {passwordStrength.strength}/6
                    </Text>
                  </HStack>
                  <Box
                    height="4px"
                    bg="gray.200"
                    _dark={{ bg: 'gray.700' }}
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      height="100%"
                      bg={`${passwordStrength.color}.500`}
                      width={`${(passwordStrength.strength / 6) * 100}%`}
                      transition="width 0.3s"
                    />
                  </Box>
                </Box>
              )}
              <FormHelperText>Le mot de passe doit contenir au moins 6 caractères</FormHelperText>
              {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
            </FormControl>
          </VStack>
        </Card>

        {/* Informations de contact */}
        <Card p={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
          <HStack mb={4} gap={2}>
            <Box
              p={2}
              borderRadius="md"
              bg="green.100"
              _dark={{ bg: 'green.900' }}
              color="green.600"
              _dark={{ color: 'green.300' }}
            >
              <Phone size={18} />
            </Box>
            <Heading size="md">Informations de contact</Heading>
          </HStack>
          <Separator mb={4} />

          <VStack gap={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <FormControl isInvalid={!!errors.telephone}>
                <FormLabel fontWeight="medium">
                  Téléphone <Text as="span" color="red.500">*</Text>
                </FormLabel>
                <Input
                  value={formData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  placeholder="06XXXXXXXX"
                  size="md"
                />
                {errors.telephone && <FormErrorMessage>{errors.telephone}</FormErrorMessage>}
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium">Deuxième numéro de téléphone</FormLabel>
                <Input
                  value={formData.deuxiemeTelephone}
                  onChange={(e) => handleInputChange('deuxiemeTelephone', e.target.value)}
                  placeholder="06XXXXXXXX (optionnel)"
                  size="md"
                />
                <FormHelperText>WhatsApp ou autre numéro de contact</FormHelperText>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel fontWeight="medium">
                <HStack gap={2}>
                  <MapPin size={14} />
                  <Text>Adresse</Text>
                </HStack>
              </FormLabel>
              <Input
                value={formData.adresse}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                placeholder="Adresse complète (optionnel)"
                size="md"
              />
            </FormControl>

            <FormControl>
                <FormLabel fontWeight="medium">
                  <HStack gap={2}>
                    <Shield size={14} />
                    <Text>État du compte</Text>
                  </HStack>
                </FormLabel>
                <NativeSelectRoot>
                  <NativeSelectField
                    value={formData.etat}
                    onChange={(e) => handleInputChange('etat', e.target.value)}
                    size="md"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspendu">Suspendu</option>
                  </NativeSelectField>
                  <NativeSelectIndicator />
                </NativeSelectRoot>
                <FormHelperText>Détermine si l'utilisateur peut se connecter</FormHelperText>
              </FormControl>
          </VStack>
        </Card>

        {/* Permissions */}
        <Card p={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
          <HStack justify="space-between" mb={4}>
            <HStack gap={2}>
              <Box
                p={2}
                borderRadius="md"
                bg="purple.100"
                _dark={{ bg: 'purple.900' }}
                color="purple.600"
                _dark={{ color: 'purple.300' }}
              >
                <Shield size={18} />
              </Box>
              <Heading size="md">Permissions</Heading>
            </HStack>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleSelectAllPermissions}
            >
              {allPermissionsSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
            </Button>
          </HStack>
          <Separator mb={4} />

          <VStack align="stretch" gap={4}>
            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
              Sélectionnez les permissions que cet utilisateur aura dans le système
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
              <CheckboxRoot
                checked={permissions.dashboard}
                onCheckedChange={(details) => {
                  const isChecked = Array.isArray(details.checked) 
                    ? details.checked.includes(true)
                    : details.checked === true;
                  handlePermissionChange('dashboard', isChecked);
                }}
              >
                <CheckboxControl />
                <CheckboxLabel fontWeight="medium">Tableau de bord</CheckboxLabel>
              </CheckboxRoot>

              <CheckboxRoot
                checked={permissions.gestionColis}
                onCheckedChange={(details) => {
                  const isChecked = Array.isArray(details.checked) 
                    ? details.checked.includes(true)
                    : details.checked === true;
                  handlePermissionChange('gestionColis', isChecked);
                }}
              >
                <CheckboxControl />
                <CheckboxLabel fontWeight="medium">Gestion des colis</CheckboxLabel>
              </CheckboxRoot>

              <CheckboxRoot
                checked={permissions.gestionRamassages}
                onCheckedChange={(details) => {
                  const isChecked = Array.isArray(details.checked) 
                    ? details.checked.includes(true)
                    : details.checked === true;
                  handlePermissionChange('gestionRamassages', isChecked);
                }}
              >
                <CheckboxControl />
                <CheckboxLabel fontWeight="medium">Gestion des ramassages</CheckboxLabel>
              </CheckboxRoot>

              <CheckboxRoot
                checked={permissions.gestionStock}
                onCheckedChange={(details) => {
                  const isChecked = Array.isArray(details.checked) 
                    ? details.checked.includes(true)
                    : details.checked === true;
                  handlePermissionChange('gestionStock', isChecked);
                }}
              >
                <CheckboxControl />
                <CheckboxLabel fontWeight="medium">Gestion de stock</CheckboxLabel>
              </CheckboxRoot>

              <CheckboxRoot
                checked={permissions.gestionRetours}
                onCheckedChange={(details) => {
                  const isChecked = Array.isArray(details.checked) 
                    ? details.checked.includes(true)
                    : details.checked === true;
                  handlePermissionChange('gestionRetours', isChecked);
                }}
              >
                <CheckboxControl />
                <CheckboxLabel fontWeight="medium">Gestion des retours</CheckboxLabel>
              </CheckboxRoot>

              <CheckboxRoot
                checked={permissions.gestionFactures}
                onCheckedChange={(details) => {
                  const isChecked = Array.isArray(details.checked) 
                    ? details.checked.includes(true)
                    : details.checked === true;
                  handlePermissionChange('gestionFactures', isChecked);
                }}
              >
                <CheckboxControl />
                <CheckboxLabel fontWeight="medium">Gestion des factures</CheckboxLabel>
              </CheckboxRoot>

              <CheckboxRoot
                checked={permissions.chat}
                onCheckedChange={(details) => {
                  const isChecked = Array.isArray(details.checked) 
                    ? details.checked.includes(true)
                    : details.checked === true;
                  handlePermissionChange('chat', isChecked);
                }}
              >
                <CheckboxControl />
                <CheckboxLabel fontWeight="medium">Chat</CheckboxLabel>
              </CheckboxRoot>

              <CheckboxRoot
                checked={permissions.mesTickets}
                onCheckedChange={(details) => {
                  const isChecked = Array.isArray(details.checked) 
                    ? details.checked.includes(true)
                    : details.checked === true;
                  handlePermissionChange('mesTickets', isChecked);
                }}
              >
                <CheckboxControl />
                <CheckboxLabel fontWeight="medium">Mes Tickets</CheckboxLabel>
              </CheckboxRoot>
            </SimpleGrid>
          </VStack>
        </Card>

        {/* Image de profil */}
        <Card p={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
          <HStack mb={4} gap={2}>
            <Box
              p={2}
              borderRadius="md"
              bg="pink.100"
              _dark={{ bg: 'pink.900' }}
              color="pink.600"
              _dark={{ color: 'pink.300' }}
            >
              <ImageIcon size={18} />
            </Box>
            <Heading size="md">Image de profil</Heading>
          </HStack>
          <Separator mb={4} />

          <VStack align="stretch" gap={4}>
            <FormControl>
              <FormLabel fontWeight="medium">Photo de profil (optionnel)</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                display="none"
                id="image-upload"
              />
              <VStack align="stretch" gap={4}>
                {imagePreview ? (
                  <VStack gap={3}>
                    <AvatarRoot
                      size="xl"
                      border="3px solid"
                      borderColor="blue.200"
                      _dark={{ borderColor: 'blue.700' }}
                    >
                      <AvatarImage src={imagePreview} alt={`${formData.prenom} ${formData.nom}`} />
                      <AvatarFallback>
                        {`${formData.prenom[0] || ''}${formData.nom[0] || ''}`.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </AvatarRoot>
                    <HStack gap={2}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <Upload size={14} style={{ marginRight: '6px' }} />
                        Changer l'image
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        colorScheme="red"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, imageProfil: null }));
                          setImagePreview(null);
                        }}
                      >
                        Supprimer
                      </Button>
                    </HStack>
                    {formData.imageProfil && (
                      <Text fontSize="xs" color="gray.500">
                        {formData.imageProfil.name}
                      </Text>
                    )}
                  </VStack>
                ) : (
                  <Box
                    border="2px dashed"
                    borderColor="gray.300"
                    _dark={{ borderColor: 'gray.600' }}
                    borderRadius="lg"
                    p={8}
                    textAlign="center"
                    cursor="pointer"
                    _hover={{
                      borderColor: 'blue.400',
                      bg: 'blue.50',
                      _dark: { bg: 'blue.900', borderColor: 'blue.500' },
                    }}
                    transition="all 0.2s"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <VStack gap={3}>
                      <Box
                        p={3}
                        borderRadius="full"
                        bg="blue.100"
                        _dark={{ bg: 'blue.900' }}
                        color="blue.600"
                        _dark={{ color: 'blue.300' }}
                      >
                        <Upload size={24} />
                      </Box>
                      <VStack gap={1}>
                        <Text fontWeight="medium" fontSize="sm">
                          Cliquez pour télécharger une image
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          PNG, JPG ou GIF (max. 5MB)
                        </Text>
                      </VStack>
                    </VStack>
                  </Box>
                )}
              </VStack>
            </FormControl>
          </VStack>
        </Card>

        {/* Actions */}
        <Card p={{ base: 4, md: 6 }}>
          <HStack width="100%" gap={4} flexWrap="wrap">
            <Button
              type="button"
              variant="outline"
              colorScheme="blue"
              onClick={() => router.back()}
              flex={{ base: '1 1 100%', md: '0 0 auto' }}
              minW={{ base: '100%', md: '150px' }}
            >
              <ArrowLeft size={16} style={{ marginRight: '6px' }} />
              Annuler
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              flex={{ base: '1 1 100%', md: '1' }}
              size="lg"
              loading={isLoading}
              loadingText="Création en cours..."
              bg="blue.600"
              color="white"
              _hover={{ bg: 'blue.700' }}
              _active={{ bg: 'blue.800' }}
            >
              <UserPlus size={18} style={{ marginRight: '8px' }} />
              Créer l'utilisateur
            </Button>
          </HStack>
        </Card>
      </Box>
    </Box>
  );
}

