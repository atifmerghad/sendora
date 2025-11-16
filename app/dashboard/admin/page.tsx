'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { Card } from '@/components/Card';
import {
  Package,
  FileText,
  Truck,
  MapPin,
  CreditCard,
  RotateCcw,
  Receipt,
  Users,
  AlertCircle,
  Edit,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdminStats {
  totalColis: number;
  bonsDeLivraison: number;
  bonsDenvoie: number;
  bonsDeDistribution: number;
  bonsPaymentLivreur: number;
  bonsPaymentVille: number;
  bonsRetourVille: number;
  bonsRetourClient: number;
  totalFactures: number;
  totalClients: number;
  totalReclamations: number;
  modificationColis: number;
}

interface ChartData {
  name: string;
  value: number;
}

interface AdminCharts {
  colisStatistiques: ChartData[];
  facturesStatistiques: ChartData[];
  bonsLivraisonStatistiques: ChartData[];
  bonsEnvoieStatistiques: ChartData[];
  bonsDistributionStatistiques: ChartData[];
  bonsPaymentLivreurStatistiques: ChartData[];
  bonsPaymentVilleStatistiques: ChartData[];
  retourVilleStatistiques: ChartData[];
  retourClientStatistiques: ChartData[];
  reclamationsStatistiques: ChartData[];
  modificationColisStatistiques: ChartData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalColis: 0,
    bonsDeLivraison: 0,
    bonsDenvoie: 0,
    bonsDeDistribution: 0,
    bonsPaymentLivreur: 0,
    bonsPaymentVille: 0,
    bonsRetourVille: 0,
    bonsRetourClient: 0,
    totalFactures: 0,
    totalClients: 0,
    totalReclamations: 0,
    modificationColis: 0,
  });
  const [charts, setCharts] = useState<AdminCharts>({
    colisStatistiques: [],
    facturesStatistiques: [],
    bonsLivraisonStatistiques: [],
    bonsEnvoieStatistiques: [],
    bonsDistributionStatistiques: [],
    bonsPaymentLivreurStatistiques: [],
    bonsPaymentVilleStatistiques: [],
    retourVilleStatistiques: [],
    retourClientStatistiques: [],
    reclamationsStatistiques: [],
    modificationColisStatistiques: [],
  });

  // Redirect if not admin (only check after mounted)
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && !isLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [mounted, isAdmin, user, router, isLoading]);

  // Fetch admin stats from API
  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!isAdmin) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();

        if (response.ok) {
          setStats(data.stats);
          if (data.charts) {
            setCharts(data.charts);
          }
        } else {
          console.error('Error fetching admin stats:', data.error);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, [isAdmin]);

  if (!isAdmin) {
    return null;
  }

  const statsData = [
    {
      label: 'Colis',
      value: stats.totalColis.toLocaleString(),
      icon: Package,
      color: 'blue',
    },
    {
      label: 'Bons de livraison',
      value: stats.bonsDeLivraison.toLocaleString(),
      icon: Truck,
      color: 'green',
    },
    {
      label: 'Bons d\'envoie',
      value: stats.bonsDenvoie.toLocaleString(),
      icon: Package,
      color: 'purple',
    },
    {
      label: 'Bons de distribution',
      value: stats.bonsDeDistribution.toLocaleString(),
      icon: MapPin,
      color: 'orange',
    },
    {
      label: 'Bons de payment Pour livreur',
      value: stats.bonsPaymentLivreur.toLocaleString(),
      icon: CreditCard,
      color: 'teal',
    },
    {
      label: 'Bons de payment Pour ville',
      value: stats.bonsPaymentVille.toLocaleString(),
      icon: CreditCard,
      color: 'cyan',
    },
    {
      label: 'Bon de retour Pour ville',
      value: stats.bonsRetourVille.toLocaleString(),
      icon: RotateCcw,
      color: 'pink',
    },
    {
      label: 'Bon de retour Pour client',
      value: stats.bonsRetourClient.toLocaleString(),
      icon: RotateCcw,
      color: 'red',
    },
    {
      label: 'Factures',
      value: stats.totalFactures.toLocaleString(),
      icon: Receipt,
      color: 'green',
    },
    {
      label: 'Clients',
      value: stats.totalClients.toLocaleString(),
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Reclamations',
      value: stats.totalReclamations.toLocaleString(),
      icon: AlertCircle,
      color: 'orange',
    },
    {
      label: 'Modification Colis',
      value: stats.modificationColis.toLocaleString(),
      icon: Edit,
      color: 'gray',
    },
  ];

  const getColorScheme = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'blue',
      green: 'green',
      purple: 'purple',
      orange: 'orange',
      teal: 'teal',
      cyan: 'cyan',
      pink: 'pink',
      red: 'red',
      gray: 'gray',
    };
    return colorMap[color] || 'blue';
  };

  // Don't render anything if not mounted yet or not admin (will redirect)
  if (!mounted || (!isAdmin && !isLoading)) {
    return null;
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Tableau de bord Admin
      </Heading>

        {isLoading ? (
          <Card p={6} mb={6}>
            <Text textAlign="center" py={8}>
              Chargement des statistiques...
            </Text>
          </Card>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4} mb={6}>
              {statsData.map((stat) => {
                const Icon = stat.icon;
                const colorScheme = getColorScheme(stat.color);

                return (
                  <Card key={stat.label} p={6} position="relative" overflow="hidden">
                    <VStack align="stretch" gap={2}>
                      <HStack justify="space-between" align="flex-start">
                        <VStack align="flex-start" gap={1} flex={1}>
                          <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }} fontWeight="medium">
                            {stat.label}
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold" color={`${colorScheme}.600`} _dark={{ color: `${colorScheme}.400` }}>
                            {stat.value}
                          </Text>
                        </VStack>
                        <Box
                          p={3}
                          borderRadius="lg"
                          bg={`${colorScheme}.100`}
                          _dark={{ bg: `${colorScheme}.900`, color: `${colorScheme}.300` }}
                          color={`${colorScheme}.600`}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon size={24} strokeWidth={2} />
                        </Box>
                      </HStack>
                    </VStack>
                  </Card>
                );
              })}
            </SimpleGrid>

            {/* Charts Section */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mt={6}>
            {/* Colis Statistiques */}
            <Card p={6}>
              <Heading size="md" mb={4}>
                Colis Statistiques
              </Heading>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.colisStatistiques}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Factures Statistiques */}
            <Card p={6}>
              <Heading size="md" mb={4}>
                Factures Statistiques ({stats.totalFactures})
              </Heading>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.facturesStatistiques}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Bons de livraison Statistiques */}
            <Card p={6}>
              <Heading size="md" mb={4}>
                Bons de livraison Statistiques ({stats.bonsDeLivraison})
              </Heading>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.bonsLivraisonStatistiques}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Bons d'envoie Statistiques */}
            <Card p={6}>
              <Heading size="md" mb={4}>
                Bons d'envoie Statistiques ({stats.bonsDenvoie})
              </Heading>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.bonsEnvoieStatistiques}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Bons de distribution Statistiques */}
            <Card p={6}>
              <Heading size="md" mb={4}>
                Bons de distribution Statistiques ({stats.bonsDeDistribution})
              </Heading>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.bonsDistributionStatistiques}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Bons de payment pour livreur Statistiques */}
            <Card p={6}>
              <Heading size="md" mb={4}>
                Bons de payment pour livreur Statistiques ({stats.bonsPaymentLivreur})
              </Heading>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.bonsPaymentLivreurStatistiques}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Bons de payment pour ville Statistiques */}
            <Card p={6}>
              <Heading size="md" mb={4}>
                Bons de payment pour ville Statistiques ({stats.bonsPaymentVille})
              </Heading>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.bonsPaymentVilleStatistiques}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Bon de retour pour ville Statistiques */}
            <Card p={6}>
              <Heading size="md" mb={4}>
                Bon de retour pour ville Statistiques ({stats.bonsRetourVille})
              </Heading>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.retourVilleStatistiques}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ff7c7c" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Bon de retour pour client Statistiques */}
            <Card p={6}>
              <Heading size="md" mb={4}>
                Bon de retour pour client Statistiques ({stats.bonsRetourClient})
              </Heading>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.retourClientStatistiques}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8dd1e1" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Reclamations Statistiques */}
            <Card p={6}>
              <Heading size="md" mb={4}>
                Reclamations Statistiques ({stats.totalReclamations})
              </Heading>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.reclamationsStatistiques}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ff8042" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Modification Colis Statistiques */}
            <Card p={6}>
              <Heading size="md" mb={4}>
                Modification Colis Statistiques ({stats.modificationColis})
              </Heading>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.modificationColisStatistiques}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </SimpleGrid>
          </>
        )}
      </Box>
  );
}

