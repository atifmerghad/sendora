'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  NativeSelectRoot,
  NativeSelectField,
  NativeSelectIndicator,
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleIndicator,
  Badge,
} from '@chakra-ui/react';
import { Package, Truck, Receipt, RotateCcw, TrendingUp, XCircle, Ban, Eye, Filter, X, ChevronDown } from 'lucide-react';
import { Card } from '@/components/Card';
import { FormControl, FormLabel } from '@/components/Form';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';
import { useColorModeValue } from '@/lib/useColorModeValue';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionGate } from '@/components/PermissionGate';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface DashboardStats {
  totalColis: number;
  totalPickups: number;
  totalInvoices: number;
  totalReturns: number;
  parcelChange: string;
  pickupChange: string;
  invoiceChange: string;
  returnChange: string;
}

interface ChartData {
  month?: string;
  colis?: number;
  revenue?: number;
  name?: string;
  value?: number;
  ville?: string;
  [key: string]: string | number | undefined;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const bg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [dateFilter, setDateFilter] = useState('');
  const [dateType, setDateType] = useState('date_creation');
  const [isLoading, setIsLoading] = useState(true);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalColis: 0,
    totalPickups: 0,
    totalInvoices: 0,
    totalReturns: 0,
    parcelChange: '0',
    pickupChange: '0',
    invoiceChange: '0',
    returnChange: '0',
  });

  const [colisOverTime, setColisOverTime] = useState<ChartData[]>([]);
  const [chiffreAffaireOverTime, setChiffreAffaireOverTime] = useState<ChartData[]>([]);
  const [colisRefuses, setColisRefuses] = useState<ChartData[]>([]);
  const [colisAnnules, setColisAnnules] = useState<ChartData[]>([]);
  const [statistiquesRetour, setStatistiquesRetour] = useState<ChartData[]>([]);
  const [colisParVille, setColisParVille] = useState<ChartData[]>([]);

  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          userId: user.id,
        });
        if (dateFilter) {
          params.append('dateFilter', dateFilter);
          params.append('dateType', dateType);
        }

        const response = await fetch(`/api/dashboard/stats?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setStats({
            totalColis: data.stats.totalColis,
            totalPickups: data.stats.totalPickups,
            totalInvoices: data.stats.totalInvoices,
            totalReturns: data.stats.totalReturns,
            parcelChange: data.stats.parcelChange,
            pickupChange: data.stats.pickupChange,
            invoiceChange: data.stats.invoiceChange,
            returnChange: data.stats.returnChange,
          });
          setColisOverTime(data.colisOverTime || []);
          setChiffreAffaireOverTime(data.chiffreAffaireOverTime || []);
          setColisRefuses(data.colisRefuses || []);
          setColisAnnules(data.colisAnnules || []);
          setStatistiquesRetour(data.statistiquesRetour || []);
          setColisParVille(data.colisParVille || []);
        } else {
          console.error('Error fetching dashboard stats:', data.error);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user?.id, dateFilter, dateType]);

  const handleFilter = () => {
    // Filter is handled by useEffect when dateFilter or dateType changes
  };

  const handleClear = () => {
    setDateFilter('');
    setDateType('date_creation');
  };

  const statsData = [
    {
      label: 'Total Colis',
      value: stats.totalColis.toLocaleString(),
      change: `${parseFloat(stats.parcelChange) >= 0 ? '+' : ''}${stats.parcelChange}%`,
      icon: Package,
      color: 'blue',
    },
    {
      label: 'Ramassages',
      value: stats.totalPickups.toLocaleString(),
      change: `${parseFloat(stats.pickupChange) >= 0 ? '+' : ''}${stats.pickupChange}%`,
      icon: Truck,
      color: 'green',
    },
    {
      label: 'Factures',
      value: stats.totalInvoices.toLocaleString(),
      change: `${parseFloat(stats.invoiceChange) >= 0 ? '+' : ''}${stats.invoiceChange}%`,
      icon: Receipt,
      color: 'purple',
    },
    {
      label: 'Retours',
      value: stats.totalReturns.toLocaleString(),
      change: `${parseFloat(stats.returnChange) >= 0 ? '+' : ''}${stats.returnChange}%`,
      icon: RotateCcw,
      color: 'orange',
    },
  ];

  const handleVilleClick = (ville: string) => {
    router.push(`/dashboard/parcels?ville=${encodeURIComponent(ville)}`);
  };

  return (
    <PermissionGate permission="dashboard">
      <Box>
        <Heading size={{ base: 'md', md: 'lg' }} mb={{ base: 4, md: 6 }}>
          Tableau de bord
        </Heading>

      {/* Filters - Collapsible (collapsed by default) */}
      <Card p={0} mb={{ base: 4, md: 6 }} overflow="hidden">
        <CollapsibleRoot defaultOpen={false}>
          <CollapsibleTrigger asChild>
            <Box
              as="button"
              width="100%"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={{ base: 3, md: 4 }}
              bg={useColorModeValue('gray.50', 'gray.700')}
              _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
              transition="background 0.2s"
              borderBottom="1px solid"
              borderColor={borderColor}
            >
              <HStack gap={2}>
                <Box
                  p={1.5}
                  borderRadius="md"
                  bg="blue.100"
                  color="blue.600"
                  _dark={{ bg: 'blue.900', color: 'blue.300' }}
                >
                  <Filter size={16} />
                </Box>
                <Heading size="sm" fontWeight="semibold">
                  Filtres
                </Heading>
                {(dateFilter || dateType !== 'date_creation') && (
                  <Badge colorScheme="blue" fontSize="10px" px={1.5} py={0.5}>
                    Actif
                  </Badge>
                )}
              </HStack>
              <CollapsibleIndicator>
                <ChevronDown size={18} style={{ transition: 'transform 0.2s' }} />
              </CollapsibleIndicator>
            </Box>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <Box p={{ base: 3, md: 4 }}>
              <SimpleGrid 
                columns={{ base: 1, md: 2, lg: 3 }} 
                gap={3}
                mb={3}
              >
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="medium" mb={1.5}>
                    Date
                  </FormLabel>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              width="100%"
                    size="sm"
                    borderRadius="md"
            />
          </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="medium" mb={1.5}>
                    Type de la date
                  </FormLabel>
            <NativeSelectRoot width="100%">
              <NativeSelectField
                value={dateType}
                onChange={(e) => setDateType(e.target.value)}
                width="100%"
              >
                <option value="date_creation">Date de création</option>
                <option value="date_livraison">Date de livraison</option>
                <option value="date_ramassage">Date de ramassage</option>
                <option value="date_facturation">Date de facturation</option>
              </NativeSelectField>
              <NativeSelectIndicator />
            </NativeSelectRoot>
          </FormControl>
              </SimpleGrid>

              <HStack gap={2} justify="flex-end" flexWrap="wrap">
            <Button
                  variant="outline"
              colorScheme="blue"
                  onClick={handleClear}
                  size="sm"
              display="flex"
              alignItems="center"
                  gap={1.5}
            >
                  <X size={14} />
                  Réinitialiser
            </Button>
            <Button
                  colorScheme="blue"
                  onClick={handleFilter}
                  size="sm"
              display="flex"
              alignItems="center"
                  gap={1.5}
                  bg="blue.600"
                  color="white"
                  _hover={{ bg: 'blue.700' }}
                  _active={{ bg: 'blue.800' }}
                >
                  <Filter size={14} />
                  Appliquer
            </Button>
          </HStack>
            </Box>
          </CollapsibleContent>
        </CollapsibleRoot>
      </Card>

      {isLoading ? (
        <Card p={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
          <Text textAlign="center" py={8}>Chargement des statistiques...</Text>
        </Card>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={{ base: 4, md: 6 }} mb={{ base: 6, md: 8 }}>
            {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
                <Card key={stat.label} p={{ base: 4, md: 6 }}>
              <VStack align="start" gap={4}>
                <HStack justify="space-between" width="100%">
                  <Box
                    p={3}
                    borderRadius="lg"
                    bg={`${stat.color}.100`}
                    _dark={{ bg: `${stat.color}.900` }}
                  >
                    <Icon size={24} color={`var(--chakra-colors-${stat.color}-500)`} />
                  </Box>
                </HStack>
                <VStack align="start" gap={1}>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                    {stat.label}
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {stat.value}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {stat.change} ce mois
                  </Text>
                </VStack>
              </VStack>
            </Card>
          );
        })}
      </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
        {/* Total des colis over time */}
            <Card p={{ base: 4, md: 6 }}>
          <HStack justify="space-between" mb={4}>
            <HStack gap={2}>
              <TrendingUp size={20} />
              <Heading size="md">Total des colis</Heading>
            </HStack>
          </HStack>
          <Box height="300px" minHeight="300px" width="100%" minWidth="0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={colisOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="colis" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  name="Nombre de colis"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        {/* Chiffre d'affaire over time */}
            <Card p={{ base: 4, md: 6 }}>
          <HStack justify="space-between" mb={4}>
            <HStack gap={2}>
              <Receipt size={20} />
              <Heading size="md">Chiffre d'affaire</Heading>
            </HStack>
          </HStack>
          <Box height="300px" minHeight="300px" width="100%" minWidth="0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chiffreAffaireOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toLocaleString()} MAD`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  name="Revenus (MAD)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
        {/* Colis Refusés */}
            <Card p={{ base: 4, md: 6 }}>
          <HStack justify="space-between" mb={4}>
            <HStack gap={2}>
              <XCircle size={20} />
              <Heading size="md">Colis Refusés</Heading>
            </HStack>
          </HStack>
          <Box height="300px" minHeight="300px" width="100%" minWidth="0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={colisRefuses}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                      label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {colisRefuses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        {/* Colis Annulés */}
            <Card p={{ base: 4, md: 6 }}>
          <HStack justify="space-between" mb={4}>
            <HStack gap={2}>
              <Ban size={20} />
              <Heading size="md">Colis Annulés</Heading>
            </HStack>
          </HStack>
          <Box height="300px" minHeight="300px" width="100%" minWidth="0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={colisAnnules}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                      label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {colisAnnules.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
        {/* Statistiques de Retour */}
            <Card p={{ base: 4, md: 6 }}>
          <HStack justify="space-between" mb={4}>
            <HStack gap={2}>
              <RotateCcw size={20} />
              <Heading size="md">Statistiques de Retour</Heading>
            </HStack>
          </HStack>
          <Box height="300px" minHeight="300px" width="100%" minWidth="0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statistiquesRetour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#FF8042" name="Nombre de retours" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        {/* Nombre des colis par villes */}
            <Card p={{ base: 4, md: 6 }}>
          <HStack justify="space-between" mb={4}>
            <HStack gap={2}>
              <Package size={20} />
              <Heading size="md">Colis par ville</Heading>
            </HStack>
                <Button size="sm" variant="ghost" colorScheme="blue" onClick={() => router.push('/dashboard/parcels')}>
              <Eye size={16} style={{ marginRight: '4px' }} />
              Voir tous
            </Button>
          </HStack>
          <Box height="300px" minHeight="300px" width="100%" minWidth="0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={colisParVille} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="ville" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="colis" 
                  fill="#0088FE" 
                  name="Nombre de colis"
                  onClick={(data: any) => handleVilleClick(data.ville)}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
            Cliquez sur une barre pour voir les colis de cette ville
          </Text>
        </Card>
      </SimpleGrid>
        </>
      )}
      </Box>
    </PermissionGate>
  );
}