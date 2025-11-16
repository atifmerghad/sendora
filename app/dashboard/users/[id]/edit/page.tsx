'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Spinner,
} from '@chakra-ui/react';
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@/components/Form';
import { Card } from '@/components/Card';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, User, Mail, Phone, MapPin, Shield, Image as ImageIcon, Save, ArrowLeft } from 'lucide-react';

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

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const userId = params?.id as string;

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    telephone: '',
    deuxiemeTelephone: '',
    adresse: '',
    etat: 'Active',
    roleId: 1,
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

  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [deleteImage, setDeleteImage] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null); // Store the user being edited
  const isMountedRef = useRef(true);
  
  // Calculate permissions for editing
  const isEditingSelf = currentUser?.id === userId;
  const currentUserRole = currentUser?.roleName || currentUser?.role?.name || '';
  const editingUserRole = editingUser?.roleName || '';
  const isMember = currentUserRole === 'MEMBER';
  const isClient = currentUserRole === 'CLIENT';
  const canEditRole = !isMember && !isClient; // CLIENT cannot edit roles at all
  const canEditPermissions = !isMember && !(isClient && isEditingSelf); // CLIENT can edit MEMBER permissions but not own
  const canEditEmail = !(isClient && isEditingSelf); // CLIENT cannot edit their own email
  const canEditEtat = !(isClient && isEditingSelf); // CLIENT cannot edit their own account state
  
  // Load user data and roles
  useEffect(() => {
    isMountedRef.current = true;
    
    const loadUserData = async () => {
      if (!userId) return;

      setIsLoadingUser(true);
      
      try {
        // Load user data
        const userResponse = await fetch(`/api/users/${userId}`);
        const userData = await userResponse.json();

        if (!isMountedRef.current) return; // Don't update state if unmounted
        
        if (userResponse.ok && userData.user) {
          const user = userData.user;
          if (!isMountedRef.current) return; // Double check
          
          setEditingUser(user); // Store user being edited
          
          setFormData({
            prenom: user.prenom || '',
            nom: user.nom || '',
            email: user.email || '',
            password: '', // Don't load password
            telephone: user.telephone || '',
            deuxiemeTelephone: user.deuxiemeTelephone || '',
            adresse: user.adresse || '',
            etat: user.etat || 'Active',
            roleId: user.roleId || 1,
            imageProfil: null,
          });

          // Set existing image if available
          if (user.imageProfil) {
            setExistingImageUrl(user.imageProfil);
            setImagePreview(user.imageProfil);
          }

          // Set permissions from array (can be empty array if user has no permissions)
          const userPermissions = user.permissions || [];
          const perms: Permissions = {
            dashboard: Array.isArray(userPermissions) && userPermissions.includes('dashboard'),
            gestionColis: Array.isArray(userPermissions) && userPermissions.includes('gestionColis'),
            gestionRamassages: Array.isArray(userPermissions) && userPermissions.includes('gestionRamassages'),
            gestionStock: Array.isArray(userPermissions) && userPermissions.includes('gestionStock'),
            gestionRetours: Array.isArray(userPermissions) && userPermissions.includes('gestionRetours'),
            gestionFactures: Array.isArray(userPermissions) && userPermissions.includes('gestionFactures'),
            chat: Array.isArray(userPermissions) && userPermissions.includes('chat'),
            mesTickets: Array.isArray(userPermissions) && userPermissions.includes('mesTickets'),
          };
          setPermissions(perms);
        } else {
          const errorMessage = userData?.error || 'Impossible de charger les données de l\'utilisateur';
          console.error('Error loading user:', errorMessage, userData);
          toast({
            title: 'Erreur',
            description: errorMessage,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          setTimeout(() => {
            router.push('/dashboard/users');
          }, 1000);
          return; // Early return to prevent loading roles
        }

        // Load roles
        if (isMountedRef.current) {
          const rolesResponse = await fetch('/api/roles');
          if (rolesResponse.ok && isMountedRef.current) {
            const rolesData = await rolesResponse.json();
            if (isMountedRef.current) {
              setRoles(rolesData.roles || []);
            }
          }
        }
      } catch (error) {
        if (!isMountedRef.current) return;
        console.error('Error loading user data:', error);
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors du chargement',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setTimeout(() => {
          if (isMountedRef.current) {
            router.push('/dashboard/users');
          }
        }, 1000);
      } finally {
        if (isMountedRef.current) {
          setIsLoadingUser(false);
        }
      }
    };

    loadUserData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Only depend on userId - prevents infinite loops

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

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePermissionChange = (permission: keyof Permissions, details: { checked: boolean | 'indeterminate' | boolean[] }) => {
    // Use the exact same pattern as login page rememberMe checkbox
    const isChecked = Array.isArray(details.checked) 
      ? details.checked.includes(true)
      : details.checked === true;
    
    setPermissions(prev => ({ ...prev, [permission]: isChecked }));
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
      setDeleteImage(false); // Reset delete flag if new image is uploaded
      
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
    // Password is optional for edit
    if (formData.password && formData.password.length < 6) {
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
      if (formData.password) {
        formDataToSend.append('password', formData.password);
      }
      formDataToSend.append('telephone', formData.telephone);
      formDataToSend.append('deuxiemeTelephone', formData.deuxiemeTelephone);
      formDataToSend.append('adresse', formData.adresse);
      formDataToSend.append('etat', formData.etat);
      formDataToSend.append('roleId', formData.roleId.toString());
      formDataToSend.append('permissions', JSON.stringify(permissions));
      
      // Add current user ID for permission checks
      if (currentUser?.id) {
        formDataToSend.append('currentUserId', currentUser.id);
      }
      
      if (formData.imageProfil) {
        formDataToSend.append('imageProfil', formData.imageProfil);
      }
      
      if (deleteImage) {
        formDataToSend.append('deleteImage', 'true');
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Utilisateur modifié',
          description: 'L\'utilisateur a été modifié avec succès',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.push('/dashboard/users');
      } else {
        toast({
          title: 'Erreur',
          description: data.error || 'Erreur lors de la modification de l\'utilisateur',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
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

  if (isLoadingUser) {
    return (
      <Box>
        <VStack py={12} gap={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Chargement des données utilisateur...</Text>
        </VStack>
      </Box>
    );
  }

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
          Modifier l'utilisateur
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
              {canEditEmail ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="exemple@email.com"
                  size="md"
                />
              ) : (
                <Input
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  size="md"
                  bg="gray.100"
                  _dark={{ bg: 'gray.800' }}
                />
              )}
              <FormHelperText>
                {canEditEmail 
                  ? 'Cette adresse sera utilisée pour la connexion'
                  : 'Vous n\'êtes pas autorisé à modifier votre email'}
              </FormHelperText>
              {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel fontWeight="medium">
                Nouveau mot de passe <Text as="span" color="gray.500" fontSize="sm">(optionnel)</Text>
              </FormLabel>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  handleInputChange('password', e.target.value);
                  setShowPasswordStrength(true);
                }}
                onFocus={() => setShowPasswordStrength(true)}
                placeholder="Laissez vide pour ne pas modifier"
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
              <FormHelperText>Laissez vide pour conserver le mot de passe actuel</FormHelperText>
              {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
            </FormControl>

            {canEditRole ? (
              <FormControl>
                <FormLabel fontWeight="medium">Rôle</FormLabel>
                <NativeSelectRoot>
                  <NativeSelectField
                    value={formData.roleId}
                    onChange={(e) => handleInputChange('roleId', parseInt(e.target.value))}
                    size="md"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name === 'ADMIN' ? 'Admin' :
                         role.name === 'LIVREUR' ? 'Livreur' :
                         role.name === 'MEMBER' ? 'Membre' : 'Client'}
                      </option>
                    ))}
                  </NativeSelectField>
                  <NativeSelectIndicator />
                </NativeSelectRoot>
              </FormControl>
            ) : (
              <FormControl>
                <FormLabel fontWeight="medium">Rôle</FormLabel>
                <Input
                  value={editingUserRole === 'ADMIN' ? 'Admin' :
                         editingUserRole === 'LIVREUR' ? 'Livreur' :
                         editingUserRole === 'MEMBER' ? 'Membre' : 'Client'}
                  readOnly
                  disabled
                  size="md"
                  bg="gray.100"
                  _dark={{ bg: 'gray.800' }}
                />
                <FormHelperText>Vous n'êtes pas autorisé à modifier ce rôle</FormHelperText>
              </FormControl>
            )}
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
              {canEditEtat ? (
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
              ) : (
                <Input
                  value={formData.etat === 'Active' ? 'Active' :
                         formData.etat === 'Inactive' ? 'Inactive' :
                         formData.etat === 'Suspendu' ? 'Suspendu' : 'Active'}
                  readOnly
                  disabled
                  size="md"
                  bg="gray.100"
                  _dark={{ bg: 'gray.800' }}
                />
              )}
              <FormHelperText>
                {canEditEtat 
                  ? 'Détermine si l\'utilisateur peut se connecter'
                  : 'Vous n\'êtes pas autorisé à modifier l\'état de votre compte'}
              </FormHelperText>
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
            {canEditPermissions && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSelectAllPermissions}
              >
                {allPermissionsSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
              </Button>
            )}
          </HStack>
          <Separator mb={4} />

          <VStack align="stretch" gap={4}>
            {canEditPermissions ? (
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                Sélectionnez les permissions que cet utilisateur aura dans le système
              </Text>
            ) : (
              <Text fontSize="sm" color="orange.600" _dark={{ color: 'orange.400' }} fontWeight="medium">
                Vous n'êtes pas autorisé à modifier les permissions
              </Text>
            )}
            
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
              <Box
                as="label"
                display="flex"
                alignItems="center"
                gap={2}
                cursor={canEditPermissions ? 'pointer' : 'not-allowed'}
                opacity={canEditPermissions ? 1 : 0.6}
                onClick={(e) => {
                  if (!canEditPermissions) {
                    e.preventDefault();
                    return;
                  }
                  // Toggle permission on label click (like login page)
                  setPermissions(prev => ({ ...prev, dashboard: !prev.dashboard }));
                }}
              >
                <CheckboxRoot
                  checked={permissions.dashboard}
                  onCheckedChange={(details) => {
                    if (!canEditPermissions) return;
                    const isChecked = Array.isArray(details.checked) 
                      ? details.checked.includes(true)
                      : details.checked === true;
                    setPermissions(prev => ({ ...prev, dashboard: isChecked }));
                  }}
                  disabled={!canEditPermissions}
                >
                  <CheckboxControl />
                </CheckboxRoot>
                <Text fontWeight="medium" userSelect="none">Tableau de bord</Text>
              </Box>

              <Box
                as="label"
                display="flex"
                alignItems="center"
                gap={2}
                cursor={canEditPermissions ? 'pointer' : 'not-allowed'}
                opacity={canEditPermissions ? 1 : 0.6}
                onClick={(e) => {
                  if (!canEditPermissions) {
                    e.preventDefault();
                    return;
                  }
                  setPermissions(prev => ({ ...prev, gestionColis: !prev.gestionColis }));
                }}
              >
                <CheckboxRoot
                  checked={permissions.gestionColis}
                  onCheckedChange={(details) => {
                    if (!canEditPermissions) return;
                    const isChecked = Array.isArray(details.checked) 
                      ? details.checked.includes(true)
                      : details.checked === true;
                    setPermissions(prev => ({ ...prev, gestionColis: isChecked }));
                  }}
                  disabled={!canEditPermissions}
                >
                  <CheckboxControl />
                </CheckboxRoot>
                <Text fontWeight="medium" userSelect="none">Gestion des colis</Text>
              </Box>

              <Box
                as="label"
                display="flex"
                alignItems="center"
                gap={2}
                cursor={canEditPermissions ? 'pointer' : 'not-allowed'}
                opacity={canEditPermissions ? 1 : 0.6}
                onClick={(e) => {
                  if (!canEditPermissions) {
                    e.preventDefault();
                    return;
                  }
                  setPermissions(prev => ({ ...prev, gestionRamassages: !prev.gestionRamassages }));
                }}
              >
                <CheckboxRoot
                  checked={permissions.gestionRamassages}
                  onCheckedChange={(details) => {
                    if (!canEditPermissions) return;
                    const isChecked = Array.isArray(details.checked) 
                      ? details.checked.includes(true)
                      : details.checked === true;
                    setPermissions(prev => ({ ...prev, gestionRamassages: isChecked }));
                  }}
                  disabled={!canEditPermissions}
                >
                  <CheckboxControl />
                </CheckboxRoot>
                <Text fontWeight="medium" userSelect="none">Gestion des ramassages</Text>
              </Box>

              <Box
                as="label"
                display="flex"
                alignItems="center"
                gap={2}
                cursor={canEditPermissions ? 'pointer' : 'not-allowed'}
                opacity={canEditPermissions ? 1 : 0.6}
                onClick={(e) => {
                  if (!canEditPermissions) {
                    e.preventDefault();
                    return;
                  }
                  setPermissions(prev => ({ ...prev, gestionStock: !prev.gestionStock }));
                }}
              >
                <CheckboxRoot
                  checked={permissions.gestionStock}
                  onCheckedChange={(details) => {
                    if (!canEditPermissions) return;
                    const isChecked = Array.isArray(details.checked) 
                      ? details.checked.includes(true)
                      : details.checked === true;
                    setPermissions(prev => ({ ...prev, gestionStock: isChecked }));
                  }}
                  disabled={!canEditPermissions}
                >
                  <CheckboxControl />
                </CheckboxRoot>
                <Text fontWeight="medium" userSelect="none">Gestion de stock</Text>
              </Box>

              <Box
                as="label"
                display="flex"
                alignItems="center"
                gap={2}
                cursor={canEditPermissions ? 'pointer' : 'not-allowed'}
                opacity={canEditPermissions ? 1 : 0.6}
                onClick={(e) => {
                  if (!canEditPermissions) {
                    e.preventDefault();
                    return;
                  }
                  setPermissions(prev => ({ ...prev, gestionRetours: !prev.gestionRetours }));
                }}
              >
                <CheckboxRoot
                  checked={permissions.gestionRetours}
                  onCheckedChange={(details) => {
                    if (!canEditPermissions) return;
                    const isChecked = Array.isArray(details.checked) 
                      ? details.checked.includes(true)
                      : details.checked === true;
                    setPermissions(prev => ({ ...prev, gestionRetours: isChecked }));
                  }}
                  disabled={!canEditPermissions}
                >
                  <CheckboxControl />
                </CheckboxRoot>
                <Text fontWeight="medium" userSelect="none">Gestion des retours</Text>
              </Box>

              <Box
                as="label"
                display="flex"
                alignItems="center"
                gap={2}
                cursor={canEditPermissions ? 'pointer' : 'not-allowed'}
                opacity={canEditPermissions ? 1 : 0.6}
                onClick={(e) => {
                  if (!canEditPermissions) {
                    e.preventDefault();
                    return;
                  }
                  setPermissions(prev => ({ ...prev, gestionFactures: !prev.gestionFactures }));
                }}
              >
                <CheckboxRoot
                  checked={permissions.gestionFactures}
                  onCheckedChange={(details) => {
                    if (!canEditPermissions) return;
                    const isChecked = Array.isArray(details.checked) 
                      ? details.checked.includes(true)
                      : details.checked === true;
                    setPermissions(prev => ({ ...prev, gestionFactures: isChecked }));
                  }}
                  disabled={!canEditPermissions}
                >
                  <CheckboxControl />
                </CheckboxRoot>
                <Text fontWeight="medium" userSelect="none">Gestion des factures</Text>
              </Box>

              <Box
                as="label"
                display="flex"
                alignItems="center"
                gap={2}
                cursor={canEditPermissions ? 'pointer' : 'not-allowed'}
                opacity={canEditPermissions ? 1 : 0.6}
                onClick={(e) => {
                  if (!canEditPermissions) {
                    e.preventDefault();
                    return;
                  }
                  setPermissions(prev => ({ ...prev, chat: !prev.chat }));
                }}
              >
                <CheckboxRoot
                  checked={permissions.chat}
                  onCheckedChange={(details) => {
                    if (!canEditPermissions) return;
                    const isChecked = Array.isArray(details.checked) 
                      ? details.checked.includes(true)
                      : details.checked === true;
                    setPermissions(prev => ({ ...prev, chat: isChecked }));
                  }}
                  disabled={!canEditPermissions}
                >
                  <CheckboxControl />
                </CheckboxRoot>
                <Text fontWeight="medium" userSelect="none">Chat</Text>
              </Box>

              <Box
                as="label"
                display="flex"
                alignItems="center"
                gap={2}
                cursor={canEditPermissions ? 'pointer' : 'not-allowed'}
                opacity={canEditPermissions ? 1 : 0.6}
                onClick={(e) => {
                  if (!canEditPermissions) {
                    e.preventDefault();
                    return;
                  }
                  setPermissions(prev => ({ ...prev, mesTickets: !prev.mesTickets }));
                }}
              >
                <CheckboxRoot
                  checked={permissions.mesTickets}
                  onCheckedChange={(details) => {
                    if (!canEditPermissions) return;
                    const isChecked = Array.isArray(details.checked) 
                      ? details.checked.includes(true)
                      : details.checked === true;
                    setPermissions(prev => ({ ...prev, mesTickets: isChecked }));
                  }}
                  disabled={!canEditPermissions}
                >
                  <CheckboxControl />
                </CheckboxRoot>
                <Text fontWeight="medium" userSelect="none">Mes Tickets</Text>
              </Box>
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
                          setExistingImageUrl(null);
                          setDeleteImage(true);
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
              loadingText="Modification en cours..."
              bg="blue.600"
              color="white"
              _hover={{ bg: 'blue.700' }}
              _active={{ bg: 'blue.800' }}
            >
              <Save size={18} style={{ marginRight: '8px' }} />
              Enregistrer les modifications
            </Button>
          </HStack>
        </Card>
      </Box>
    </Box>
  );
}

