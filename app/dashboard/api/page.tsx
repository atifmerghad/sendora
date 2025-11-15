'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  Text,
  Code,
  Button,
  HStack,
  Badge,
  Input,
  IconButton,
  TableRoot,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHeader,
  TableRow,
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  NativeSelectRoot,
  NativeSelectField,
  NativeSelectIndicator,
  Separator,
} from '@chakra-ui/react';
import { Card } from '@/components/Card';
import { FormControl, FormLabel } from '@/components/Form';
import { Copy, Plus, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/lib/toast';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  active: boolean;
  createdAt: string;
  lastUsedAt?: string | null;
}

interface Webhook {
  id: string;
  url: string;
  event: string;
  secretKey: string;
  active: boolean;
  createdAt: string;
  lastTriggeredAt?: string | null;
}

const codeExamples = {
  javascript: `// Exemple d'intégration JavaScript
const response = await fetch('https://api.sendora.com/v1/parcels', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    numero: 'COL-12345',
    destinataire: 'Ahmed Benali',
    telephone: '+212 612 345 678',
    adresse: '123 Rue Mohammed V',
    ville: 'Casablanca - Anfa'
  })
});

const data = await response.json();
console.log(data);`,
  python: `# Exemple d'intégration Python
import requests

url = 'https://api.sendora.com/v1/parcels'
headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}
data = {
    'numero': 'COL-12345',
    'destinataire': 'Ahmed Benali',
    'telephone': '+212 612 345 678',
    'adresse': '123 Rue Mohammed V',
    'ville': 'Casablanca - Anfa'
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`,
};

const webhookEvents = [
  { value: 'parcel.status_update', label: 'Mise à jour du statut d\'un colis' },
  { value: 'parcel.created', label: 'Création d\'un colis' },
  { value: 'parcel.delivered', label: 'Livraison d\'un colis' },
  { value: 'parcel.refused', label: 'Refus d\'un colis' },
  { value: 'pickup.created', label: 'Création d\'un ramassage' },
  { value: 'pickup.completed', label: 'Complétion d\'un ramassage' },
  { value: 'invoice.created', label: 'Création d\'une facture' },
];

export default function APIPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [showWebhookKey, setShowWebhookKey] = useState<Record<string, boolean>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvent, setWebhookEvent] = useState('parcel.status_update');

  // Fetch API keys and webhooks
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [apiKeysResponse, webhooksResponse] = await Promise.all([
          fetch(`/api/api-keys?userId=${user.id}`),
          fetch(`/api/webhooks?userId=${user.id}`),
        ]);

        if (apiKeysResponse.ok) {
          const apiKeysData = await apiKeysResponse.json();
          setApiKeys(apiKeysData.apiKeys || []);
        }

        if (webhooksResponse.ok) {
          const webhooksData = await webhooksResponse.json();
          setWebhooks(webhooksData.webhooks || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copié',
        description: `${label} a été copié dans le presse-papiers`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
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
          title: 'Clé API générée',
          description: 'Une nouvelle clé API a été générée avec succès',
          status: 'success',
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

  const handleCreateWebhook = async () => {
    if (!user?.id || !webhookUrl || !webhookEvent) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          url: webhookUrl,
          event: webhookEvent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWebhooks([...webhooks, data.webhook]);
        setIsDialogOpen(false);
        setWebhookUrl('');
        setWebhookEvent('parcel.status_update');
        toast({
          title: 'Webhook créé',
          description: 'Le webhook a été créé avec succès',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création du webhook',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce webhook ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWebhooks(webhooks.filter(w => w.id !== webhookId));
        toast({
          title: 'Webhook supprimé',
          description: 'Le webhook a été supprimé avec succès',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression du webhook',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const toggleWebhookKeyVisibility = (webhookId: string) => {
    setShowWebhookKey(prev => ({ ...prev, [webhookId]: !prev[webhookId] }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return `${key.substring(0, 8)}${'•'.repeat(key.length - 12)}${key.substring(key.length - 4)}`;
  };

  return (
    <Box>
      <Heading size={{ base: 'md', md: 'lg' }} mb={6}>
        Intégration API
      </Heading>

      {/* Introduction */}
      <Card p={{ base: 4, md: 6 }} mb={6}>
        <VStack align="start" gap={4}>
          <Heading size="md">Intégration API</Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }}>
            Les accès fournis ci-dessous sont destinés à l'intégration de l'API. Ils vous permettent de connecter votre application à notre système et d'accéder à nos fonctionnalités. Veuillez consulter notre documentation API pour obtenir des informations détaillées sur l'utilisation de ces accès.
          </Text>
        </VStack>
      </Card>

      {/* API Keys Section */}
      <Card p={{ base: 4, md: 6 }} mb={6}>
        <VStack align="start" gap={4}>
          <HStack justify="space-between" width="100%">
            <Heading size="md">Clés API</Heading>
            <Button 
              size="sm" 
              colorScheme="blue"
              onClick={handleGenerateApiKey}
              bg="blue.600"
              color="white"
              _hover={{ bg: 'blue.700' }}
              _active={{ bg: 'blue.800' }}
            >
              <Plus size={16} style={{ marginRight: '4px' }} />
              Générer une nouvelle clé
            </Button>
          </HStack>
          
          {isLoading ? (
            <Text>Chargement...</Text>
          ) : apiKeys.length === 0 ? (
            <Text color="gray.500">Aucune clé API générée</Text>
          ) : (
            <VStack align="stretch" gap={4} width="100%">
              {apiKeys.map((apiKey) => (
                <Box key={apiKey.id} p={4} bg="gray.50" _dark={{ bg: 'gray.800' }} borderRadius="md">
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
                      onClick={() => toggleApiKeyVisibility(apiKey.id)}
                    >
                      {showApiKey[apiKey.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      aria-label="Copier"
                      onClick={() => handleCopy(apiKey.key, 'Clé API')}
                    >
                      <Copy size={16} />
                    </IconButton>
                  </HStack>
                  {apiKey.lastUsedAt && (
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Dernière utilisation: {new Date(apiKey.lastUsedAt).toLocaleString('fr-FR')}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </VStack>
      </Card>

      {/* Webhooks Section */}
      <Card p={{ base: 4, md: 6 }} mb={6}>
        <VStack align="start" gap={4}>
          <HStack justify="space-between" width="100%">
            <Box>
              <Heading size="md" mb={2}>Intégration Webhooks</Heading>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                Les webhooks vous permettent de recevoir des notifications automatiques dès qu'un événement spécifique se produit (par exemple, la mise à jour du statut d'un colis). Pour en créer un, indiquez simplement l'URL où vous souhaitez recevoir ces notifications. Chaque webhook possède une clé secrète associée qui permet de sécuriser et valider les notifications envoyées vers votre application.
              </Text>
            </Box>
            <Button 
              size="sm" 
              colorScheme="blue"
              onClick={() => {
                setEditingWebhook(null);
                setWebhookUrl('');
                setWebhookEvent('parcel.status_update');
                setIsDialogOpen(true);
              }}
              bg="blue.600"
              color="white"
              _hover={{ bg: 'blue.700' }}
              _active={{ bg: 'blue.800' }}
            >
              <Plus size={16} style={{ marginRight: '4px' }} />
              Ajouter un webhook
            </Button>
          </HStack>

          <Separator />

          {isLoading ? (
            <Text>Chargement...</Text>
          ) : webhooks.length === 0 ? (
            <VStack py={8} gap={4}>
              <Text color="gray.500" textAlign="center">Aucun webhook configuré</Text>
              <Text fontSize="sm" color="gray.400" textAlign="center">
                Cliquez sur "Ajouter un webhook" pour créer votre premier webhook
              </Text>
            </VStack>
          ) : (
            <Box width="100%" overflowX="auto">
              <TableRoot>
                <TableHeader>
                  <TableRow>
                    <TableColumnHeader>URL du Webhook</TableColumnHeader>
                    <TableColumnHeader>Événement</TableColumnHeader>
                    <TableColumnHeader>Clé API</TableColumnHeader>
                    <TableColumnHeader>Statut</TableColumnHeader>
                    <TableColumnHeader>Actions</TableColumnHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <Text fontSize="sm" fontWeight="medium" maxW="300px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                          {webhook.url}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Badge colorScheme="blue">
                          {webhookEvents.find(e => e.value === webhook.event)?.label || webhook.event}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <HStack gap={2}>
                          <Code fontSize="xs">
                            {showWebhookKey[webhook.id] ? webhook.secretKey : maskKey(webhook.secretKey)}
                          </Code>
                          <IconButton
                            size="xs"
                            variant="ghost"
                            aria-label={showWebhookKey[webhook.id] ? 'Masquer' : 'Afficher'}
                            onClick={() => toggleWebhookKeyVisibility(webhook.id)}
                          >
                            {showWebhookKey[webhook.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </IconButton>
                          <IconButton
                            size="xs"
                            variant="ghost"
                            aria-label="Copier"
                            onClick={() => handleCopy(webhook.secretKey, 'Clé secrète')}
                          >
                            <Copy size={14} />
                          </IconButton>
                        </HStack>
                      </TableCell>
                      <TableCell>
                        <Badge colorScheme={webhook.active ? 'green' : 'red'}>
                          {webhook.active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <HStack gap={2}>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            aria-label="Supprimer"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </HStack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableRoot>
            </Box>
          )}
        </VStack>
      </Card>

      {/* Documentation Section */}
      <Card p={{ base: 4, md: 6 }} mb={6}>
        <Heading size="md" mb={4}>
          Documentation
        </Heading>
        <Text mb={4} color="gray.600" _dark={{ color: 'gray.400' }}>
          Utilisez notre API REST pour intégrer Sendora dans votre application. Voici des exemples de code:
        </Text>

        <VStack gap={4} align="stretch">
          <Box>
            <HStack mb={2}>
              <Badge colorScheme="blue">JavaScript</Badge>
            </HStack>
            <Box
              p={4}
              bg="gray.900"
              color="gray.100"
              borderRadius="md"
              overflowX="auto"
              position="relative"
            >
              <Button
                size="xs"
                position="absolute"
                top={2}
                right={2}
                onClick={() => handleCopy(codeExamples.javascript, 'Code JavaScript')}
              >
                <Copy size={12} style={{ marginRight: '4px' }} />
                Copier
              </Button>
              <Code colorScheme="gray" display="block" whiteSpace="pre" fontSize="sm">
                {codeExamples.javascript}
              </Code>
            </Box>
          </Box>

          <Box>
            <HStack mb={2}>
              <Badge colorScheme="green">Python</Badge>
            </HStack>
            <Box
              p={4}
              bg="gray.900"
              color="gray.100"
              borderRadius="md"
              overflowX="auto"
              position="relative"
            >
              <Button
                size="xs"
                position="absolute"
                top={2}
                right={2}
                onClick={() => handleCopy(codeExamples.python, 'Code Python')}
              >
                <Copy size={12} style={{ marginRight: '4px' }} />
                Copier
              </Button>
              <Code colorScheme="gray" display="block" whiteSpace="pre" fontSize="sm">
                {codeExamples.python}
              </Code>
            </Box>
          </Box>
        </VStack>
      </Card>

      {/* Endpoints Section */}
      <Card p={{ base: 4, md: 6 }}>
        <Heading size="md" mb={4}>
          Endpoints disponibles
        </Heading>
        <VStack align="start" gap={2}>
          <Text><Code>POST /v1/parcels</Code> - Créer un colis</Text>
          <Text><Code>GET /v1/parcels</Code> - Lister les colis</Text>
          <Text><Code>GET /v1/parcels/:id</Code> - Obtenir un colis</Text>
          <Text><Code>POST /v1/pickups</Code> - Demander un ramassage</Text>
          <Text><Code>GET /v1/invoices</Code> - Obtenir les factures</Text>
        </VStack>
      </Card>

      {/* Create Webhook Dialog */}
      <DialogRoot open={isDialogOpen} onOpenChange={(details) => {
        if (!details.open) {
          setIsDialogOpen(false);
          setEditingWebhook(null);
          setWebhookUrl('');
          setWebhookEvent('parcel.status_update');
        }
      }}>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent maxW="500px">
            <DialogHeader>
              <DialogTitle>
                {editingWebhook ? 'Modifier le webhook' : 'Créer un webhook'}
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <VStack gap={4} align="stretch">
                <FormControl>
                  <FormLabel>URL du Webhook</FormLabel>
                  <Input
                    type="url"
                    placeholder="https://votre-domaine.com/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Événement</FormLabel>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={webhookEvent}
                      onChange={(e) => setWebhookEvent(e.target.value)}
                    >
                      {webhookEvents.map((event) => (
                        <option key={event.value} value={event.value}>
                          {event.label}
                        </option>
                      ))}
                    </NativeSelectField>
                    <NativeSelectIndicator />
                  </NativeSelectRoot>
                </FormControl>
              </VStack>
            </DialogBody>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingWebhook(null);
                  setWebhookUrl('');
                  setWebhookEvent('parcel.status_update');
                }}
              >
                Annuler
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleCreateWebhook}
                bg="blue.600"
                color="white"
                _hover={{ bg: 'blue.700' }}
                _active={{ bg: 'blue.800' }}
              >
                {editingWebhook ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>
    </Box>
  );
}
