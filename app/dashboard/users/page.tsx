'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Heading,
  Input,
  HStack,
  Button,
  Text,
  VStack,
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
  Badge,
  IconButton,
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  SimpleGrid,
  Separator,
  Spinner,
} from '@chakra-ui/react';
import { TanStackTable } from '@/components/TanStackTable';
import { type ColumnDef } from '@tanstack/react-table';
import { Card } from '@/components/Card';
import { Search, Plus, User as UserIcon, ChevronLeft, ChevronRight, Eye, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';

export default function UsersPage() {
  const router = useRouter();
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [mainAccountIdFromAPI, setMainAccountIdFromAPI] = useState<string | null>(null);
  const itemsPerPage = 50;

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      // Pass current user ID to filter by business
      if (currentUser?.id) {
        params.append('currentUserId', currentUser.id);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/users?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
        setTotal(data.total || 0);
        // Set main account ID from API (oldest user)
        if (data.mainAccountId) {
          setMainAccountIdFromAPI(data.mainAccountId);
        }
      } else {
        console.error('Error fetching users:', data.error);
        setUsers([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, currentPage, itemsPerPage, currentUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setCurrentPage(1);
    // Search is handled by useEffect when searchTerm changes
  };

  // Check if a user can be deleted (must be defined before use)
  const canDeleteUser = useCallback((user: User) => {
    // Cannot delete self
    if (currentUser && user.id === currentUser.id) {
      return false;
    }
    // Cannot delete main account
    if (mainAccountIdFromAPI && user.id === mainAccountIdFromAPI) {
      return false;
    }
    return true;
  }, [currentUser, mainAccountIdFromAPI]);

  const handleView = useCallback(async (user: User) => {
    setViewUserId(user.id);
    setIsLoadingUser(true);
    
    try {
      // Fetch full user details from API
      const response = await fetch(`/api/users/${user.id}`);
      const data = await response.json();
      
      if (response.ok && data.user) {
        setViewUser(data.user);
      } else {
        // Fallback to the user from the list
        setViewUser(user);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Fallback to the user from the list
      setViewUser(user);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  const handleEdit = useCallback((user: User) => {
    // Navigate to edit user page
    router.push(`/dashboard/users/${user.id}/edit`);
  }, [router]);

  const handleDeleteClick = useCallback((userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    // Check if user can be deleted
    if (!canDeleteUser(userToDelete)) {
      const isCurrentUser = currentUser && userToDelete.id === currentUser.id;
      toast({
        title: 'Action non autorisée',
        description: isCurrentUser 
          ? 'Vous ne pouvez pas supprimer votre propre compte'
          : 'Le compte principal ne peut pas être supprimé',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setDeleteUserId(userId);
  }, [users, canDeleteUser, currentUser, toast]);

  const handleDeleteConfirm = async () => {
    if (!deleteUserId) return;

    // Double check client-side validation
    const userToDelete = users.find(u => u.id === deleteUserId);
    if (!userToDelete) return;

    if (!canDeleteUser(userToDelete)) {
      const isCurrentUser = currentUser && userToDelete.id === currentUser.id;
      toast({
        title: 'Action non autorisée',
        description: isCurrentUser 
          ? 'Vous ne pouvez pas supprimer votre propre compte'
          : 'Le compte principal ne peut pas être supprimé',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      setDeleteUserId(null);
      return;
    }

    setIsDeleting(true);
    try {
      // Send current user ID to prevent self-deletion on server
      const params = new URLSearchParams();
      if (currentUser?.id) {
        params.append('currentUserId', currentUser.id);
      }

      const response = await fetch(`/api/users/${deleteUserId}?${params.toString()}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Utilisateur supprimé',
          description: 'L\'utilisateur a été supprimé avec succès',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Refresh the users list
        await fetchUsers();
      } else {
        toast({
          title: 'Erreur',
          description: data.error || 'Erreur lors de la suppression de l\'utilisateur',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      setDeleteUserId(null);
    }
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      accessorKey: 'nom',
      header: 'Nom',
      cell: ({ row }) => <Text fontWeight="semibold">{row.original.nom}</Text>,
    },
    {
      accessorKey: 'prenom',
      header: 'Prénom',
    },
    {
      accessorKey: 'telephone',
      header: 'Téléphone',
      cell: ({ row }) => {
        const user = row.original;
        const phoneDisplay = user.deuxiemeTelephone 
          ? `${user.telephone} - ${user.deuxiemeTelephone}`
          : user.telephone;
        return <Text>{phoneDisplay}</Text>;
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'roleName',
      header: 'Rôle',
      cell: ({ row }) => {
        const roleName = row.original.roleName || 'CLIENT';
        const roleLabels: Record<string, string> = {
          CLIENT: 'Client',
          LIVREUR: 'Livreur',
          ADMIN: 'Admin',
          MEMBER: 'Membre',
        };
        const colorScheme: Record<string, string> = {
          CLIENT: 'blue',
          LIVREUR: 'orange',
          ADMIN: 'purple',
          MEMBER: 'green',
        };
        return (
          <Badge colorScheme={colorScheme[roleName] || 'gray'} px={2} py={1} borderRadius="md">
            {roleLabels[roleName] || roleName}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'etat',
      header: 'Active',
      cell: ({ row }) => {
        const etat = row.original.etat || 'En attente';
        const colorScheme = etat === 'Active' ? 'green' : etat === 'Inactive' ? 'red' : 'orange';
        return (
          <Badge colorScheme={colorScheme} px={2} py={1} borderRadius="md">
            {etat}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'imageProfil',
      header: 'Avatar',
      cell: ({ row }) => {
        const user = row.original;
        const initials = `${user.prenom[0] || ''}${user.nom[0] || ''}`.toUpperCase();
        return (
          <AvatarRoot size="sm" bg="blue.500" color="white">
            {user.imageProfil && (
              <AvatarImage src={user.imageProfil} alt={`${user.prenom} ${user.nom}`} />
            )}
            <AvatarFallback>{initials || 'U'}</AvatarFallback>
          </AvatarRoot>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original;
        const canDelete = canDeleteUser(user);
        const isCurrentUser = currentUser && user.id === currentUser.id;
        const isMainAccount = mainAccountIdFromAPI && user.id === mainAccountIdFromAPI;
        
        return (
          <HStack gap={1}>
            <IconButton
              aria-label="Voir les détails"
              size="sm"
              variant="ghost"
              colorScheme="blue"
              onClick={() => handleView(user)}
            >
              <Eye size={16} />
            </IconButton>
            <IconButton
              aria-label="Modifier"
              size="sm"
              variant="ghost"
              colorScheme="green"
              onClick={() => handleEdit(user)}
            >
              <Edit size={16} />
            </IconButton>
            {canDelete ? (
              <IconButton
                aria-label="Supprimer"
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => handleDeleteClick(user.id)}
              >
                <Trash2 size={16} />
              </IconButton>
            ) : (
              <IconButton
                aria-label={
                  isCurrentUser 
                    ? "Vous ne pouvez pas supprimer votre propre compte" 
                    : "Le compte principal ne peut pas être supprimé"
                }
                size="sm"
                variant="ghost"
                colorScheme="gray"
                disabled
                opacity={0.4}
                cursor="not-allowed"
                title={
                  isCurrentUser 
                    ? "Vous ne pouvez pas supprimer votre propre compte" 
                    : "Le compte principal ne peut pas être supprimé"
                }
              >
                <Trash2 size={16} />
              </IconButton>
            )}
          </HStack>
        );
      },
    },
  ], [currentUser, mainAccountIdFromAPI, canDeleteUser, handleView, handleEdit, handleDeleteClick]);

  return (
    <Box>
      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
        <Heading size={{ base: 'md', md: 'lg' }}>Utilisateurs</Heading>
        <Button 
          colorScheme="blue"
          onClick={() => router.push('/dashboard/users/add')}
          bg="blue.600"
          color="white"
          _hover={{ bg: 'blue.700' }}
          _active={{ bg: 'blue.800' }}
          size={{ base: 'sm', md: 'md' }}
        >
          <Plus size={16} style={{ marginRight: '4px' }} />
          Ajouter un utilisateur
        </Button>
      </HStack>

      <Card p={{ base: 4, md: 6 }}>
        <HStack mb={4} flexWrap="wrap" gap={2}>
          <Input 
            placeholder="Rechercher par nom, prénom, email ou téléphone..." 
            maxW={{ base: '100%', sm: '300px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="md"
          />
          <Button 
            colorScheme="blue"
            onClick={handleSearch}
            size={{ base: 'sm', md: 'md' }}
          >
            <Search size={16} style={{ marginRight: '4px' }} />
            Rechercher
          </Button>
        </HStack>

        {isLoading ? (
          <Text textAlign="center" py={8}>Chargement...</Text>
        ) : users.length === 0 ? (
          <VStack py={8} gap={4}>
            <UserIcon size={48} style={{ opacity: 0.5 }} />
            <Text color="gray.500" textAlign="center">
              {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur enregistré'}
            </Text>
          </VStack>
        ) : (
          <>
            <TanStackTable
              data={users}
              columns={columns}
              enableSorting={true}
              enablePagination={false}
            />

            {totalPages > 1 && (
              <VStack align="stretch" gap={3} mt={4}>
                <Text fontSize="sm" color="gray.600" display={{ base: 'none', sm: 'block' }}>
                  {itemsPerPage} éléments par page
                </Text>
                <HStack justify="space-between" gap={2} flexWrap="wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    flex={{ base: '1', sm: 'none' }}
                  >
                    <ChevronLeft size={16} style={{ marginRight: '4px' }} />
                    <Text display={{ base: 'none', sm: 'block' }}>Précédent</Text>
                    <Text display={{ base: 'block', sm: 'none' }}>Préc.</Text>
                  </Button>
                  <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
                    Page {currentPage} sur {totalPages}
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    flex={{ base: '1', sm: 'none' }}
                  >
                    <Text display={{ base: 'none', sm: 'block' }}>Suivant</Text>
                    <Text display={{ base: 'block', sm: 'none' }}>Suiv.</Text>
                    <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                  </Button>
                </HStack>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  {total} utilisateur{total > 1 ? 's' : ''} au total
                </Text>
              </VStack>
            )}
          </>
        )}
      </Card>

      {/* User Details Dialog */}
      {viewUserId && (
        <DialogRoot 
          open={!!viewUserId}
          onOpenChange={(details) => {
            if (!details.open) {
              setViewUserId(null);
              setViewUser(null);
            }
          }}
        >
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent maxW="600px" maxH="90vh" overflowY="auto">
              <DialogHeader>
                <DialogTitle>Détails de l'utilisateur</DialogTitle>
              </DialogHeader>
              <DialogBody>
                {isLoadingUser ? (
                  <VStack py={8}>
                    <Spinner size="lg" color="blue.500" />
                    <Text>Chargement...</Text>
                  </VStack>
                ) : viewUser ? (
                  <VStack align="stretch" gap={6}>
                    {/* Avatar and Basic Info */}
                    <VStack gap={4}>
                      <AvatarRoot size="xl" bg="blue.500" color="white">
                        {viewUser.imageProfil && (
                          <AvatarImage src={viewUser.imageProfil} alt={`${viewUser.prenom} ${viewUser.nom}`} />
                        )}
                        <AvatarFallback>
                          {`${viewUser.prenom[0] || ''}${viewUser.nom[0] || ''}`.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </AvatarRoot>
                      <VStack gap={1}>
                        <Heading size="md">{viewUser.prenom} {viewUser.nom}</Heading>
                        <Text color="gray.500">{viewUser.email}</Text>
                      </VStack>
                    </VStack>

                    <Separator />

                    {/* User Information */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Nom</Text>
                        <Text fontWeight="medium">{viewUser.nom}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Prénom</Text>
                        <Text fontWeight="medium">{viewUser.prenom}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Email</Text>
                        <Text fontWeight="medium">{viewUser.email}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Téléphone</Text>
                        <Text fontWeight="medium">{viewUser.telephone}</Text>
                      </Box>
                      {viewUser.deuxiemeTelephone && (
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>Deuxième téléphone</Text>
                          <Text fontWeight="medium">{viewUser.deuxiemeTelephone}</Text>
                        </Box>
                      )}
                      {viewUser.adresse && (
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>Adresse</Text>
                          <Text fontWeight="medium">{viewUser.adresse}</Text>
                        </Box>
                      )}
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Rôle</Text>
                        <Badge 
                          colorScheme={
                            viewUser.roleName === 'ADMIN' ? 'purple' :
                            viewUser.roleName === 'LIVREUR' ? 'orange' :
                            viewUser.roleName === 'MEMBER' ? 'green' : 'blue'
                          }
                          px={2}
                          py={1}
                          borderRadius="md"
                        >
                          {viewUser.roleName === 'ADMIN' ? 'Admin' :
                           viewUser.roleName === 'LIVREUR' ? 'Livreur' :
                           viewUser.roleName === 'MEMBER' ? 'Membre' : 'Client'}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>État</Text>
                        <Badge 
                          colorScheme={viewUser.etat === 'Active' ? 'green' : 'red'}
                          px={2}
                          py={1}
                          borderRadius="md"
                        >
                          {viewUser.etat || 'En attente'}
                        </Badge>
                      </Box>
                      {viewUser.createdAt && (
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>Date de création</Text>
                          <Text fontWeight="medium">
                            {new Date(viewUser.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Text>
                        </Box>
                      )}
                    </SimpleGrid>

                    {/* Permissions */}
                    {viewUser.permissions && (
                      <>
                        <Separator />
                        <Box>
                          <Text fontSize="sm" fontWeight="semibold" mb={3}>Permissions</Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
                            {typeof viewUser.permissions === 'string' ? (
                              // Handle old string format
                              viewUser.permissions.split(',').map((perm, idx) => (
                                <Badge key={idx} colorScheme="blue" px={2} py={1} borderRadius="md">
                                  {perm.trim()}
                                </Badge>
                              ))
                            ) : Array.isArray(viewUser.permissions) ? (
                              // Handle array format
                              viewUser.permissions.map((perm: string, idx: number) => (
                                <Badge key={idx} colorScheme="blue" px={2} py={1} borderRadius="md">
                                  {perm}
                                </Badge>
                              ))
                            ) : null}
                          </SimpleGrid>
                        </Box>
                      </>
                    )}
                  </VStack>
                ) : (
                  <Text>Impossible de charger les détails de l'utilisateur</Text>
                )}
              </DialogBody>
              <DialogFooter>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setViewUserId(null);
                    setViewUser(null);
                  }}
                >
                  Fermer
                </Button>
                {viewUser && (
                  <Button
                    colorScheme="blue"
                    onClick={() => {
                      setViewUserId(null);
                      setViewUser(null);
                      handleEdit(viewUser);
                    }}
                  >
                    Modifier
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </DialogPositioner>
        </DialogRoot>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteUserId && (
        <DialogRoot 
          open={!!deleteUserId}
          onOpenChange={(details) => {
            if (!details.open) {
              setDeleteUserId(null);
            }
          }}
        >
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent maxW="500px">
              <DialogHeader>
                <DialogTitle>Supprimer l'utilisateur</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <Text>
                  Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
                  <strong>
                    {users.find(u => u.id === deleteUserId)?.prenom}{' '}
                    {users.find(u => u.id === deleteUserId)?.nom}
                  </strong> ?
                </Text>
                <Text fontSize="sm" color="red.500" mt={2}>
                  Cette action est irréversible.
                </Text>
              </DialogBody>
              <DialogFooter
                display="flex"
                flexDirection="row"
                justifyContent="flex-end"
                gap={3}
                width="100%"
              >
                <Button 
                  variant="outline"
                  size="md"
                  onClick={() => setDeleteUserId(null)}
                >
                  Annuler
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDeleteConfirm}
                  loading={isDeleting}
                  bg="red.600"
                  color="white"
                  _hover={{ bg: 'red.700' }}
                  size="md"
                >
                  Supprimer
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPositioner>
        </DialogRoot>
      )}
    </Box>
  );
}

