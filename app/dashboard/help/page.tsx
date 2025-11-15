'use client';

import { useState } from 'react';
import {
  Box,
  Heading,
  Input,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Button,
} from '@chakra-ui/react';
import { Card } from '@/components/Card';
import { Search, FileText, Receipt, Package, Warehouse, Truck, RotateCcw, DollarSign, BookOpen, UserCircle, Clock, Settings, ChevronRight, Mail } from 'lucide-react';
import { useColorModeValue } from '@/lib/useColorModeValue';
import { useTranslations } from 'next-intl';

interface Category {
  id: string;
  labelKey: string;
  icon: React.ElementType;
  articleCount: number;
  color: string;
}

interface Article {
  id: string;
  title: string;
  category: string;
}

const categories: Category[] = [
  { id: 'facturation', labelKey: 'facturation', icon: Receipt, articleCount: 5, color: 'blue' },
  { id: 'colis', labelKey: 'colis', icon: Package, articleCount: 8, color: 'green' },
  { id: 'stock', labelKey: 'stock', icon: Warehouse, articleCount: 5, color: 'purple' },
  { id: 'ramassage', labelKey: 'ramassage', icon: Truck, articleCount: 3, color: 'orange' },
  { id: 'retour', labelKey: 'retour', icon: RotateCcw, articleCount: 2, color: 'red' },
  { id: 'tarification', labelKey: 'tarification', icon: DollarSign, articleCount: 3, color: 'teal' },
  { id: 'premiers-pas', labelKey: 'premiersPas', icon: BookOpen, articleCount: 3, color: 'cyan' },
  { id: 'mon-compte', labelKey: 'monCompte', icon: UserCircle, articleCount: 3, color: 'pink' },
  { id: 'horaires', labelKey: 'horaires', icon: Clock, articleCount: 1, color: 'gray' },
  { id: 'configuration', labelKey: 'configuration', icon: Settings, articleCount: 4, color: 'indigo' },
];

const popularArticles: Article[] = [
  { id: '1', title: 'Comment ajouter un colis ?', category: 'colis' },
  { id: '2', title: 'Où puis-je trouver mes colis créés ?', category: 'colis' },
  { id: '3', title: 'Comment puis-je afficher ma facture ?', category: 'facturation' },
  { id: '4', title: 'Quels sont les différents statuts de livraison ?', category: 'colis' },
  { id: '5', title: 'Comment trouver les informations d\'un colis ?', category: 'colis' },
  { id: '6', title: 'Où puis-je trouver mes factures ?', category: 'facturation' },
  { id: '7', title: 'Quels sont les statuts d\'une facture ?', category: 'facturation' },
  { id: '8', title: 'Quelles sont les conditions pour envoyer un colis ?', category: 'colis' },
  { id: '9', title: 'Comment envoyer une demande d\'entrée de stock ?', category: 'stock' },
  { id: '10', title: 'Comment ajouter un produit pour mon stock ?', category: 'stock' },
  { id: '11', title: 'Comment récupérer mes colis annulés et refusés ?', category: 'retour' },
];

export default function HelpPage() {
  const t = useTranslations('help');
  const [searchTerm, setSearchTerm] = useState('');
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const cardBg = useColorModeValue('white', 'gray.800');

  const filteredCategories = categories.filter(cat =>
    t(cat.labelKey).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredArticles = popularArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (color: string) => {
    const colorMap: Record<string, { bg: string; color: string }> = {
      blue: { bg: 'blue.100', color: 'blue.600' },
      green: { bg: 'green.100', color: 'green.600' },
      purple: { bg: 'purple.100', color: 'purple.600' },
      orange: { bg: 'orange.100', color: 'orange.600' },
      red: { bg: 'red.100', color: 'red.600' },
      teal: { bg: 'teal.100', color: 'teal.600' },
      cyan: { bg: 'cyan.100', color: 'cyan.600' },
      pink: { bg: 'pink.100', color: 'pink.600' },
      gray: { bg: 'gray.100', color: 'gray.600' },
      indigo: { bg: 'indigo.100', color: 'indigo.600' },
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <Box>
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <VStack align="stretch" gap={4}>
          <Heading size={{ base: 'md', md: 'lg' }} textAlign="center">
            {t('title')}
          </Heading>
          <Text fontSize="lg" color={textColor} textAlign="center">
            {t('subtitle')}
          </Text>
        </VStack>

        {/* Search Bar */}
        <Box position="relative" maxW="600px" mx="auto" w="100%">
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="lg"
            pl="50px"
            borderRadius="lg"
            borderColor={borderColor}
            _focus={{
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
            }}
          />
          <Box
            position="absolute"
            left="16px"
            top="50%"
            transform="translateY(-50%)"
            color="gray.400"
          >
            <Search size={20} />
          </Box>
        </Box>

        {/* Categories Grid */}
        {searchTerm === '' && (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
            {categories.map((category) => {
              const Icon = category.icon;
              const colors = getCategoryColor(category.color);
              
              return (
                <Card
                  key={category.id}
                  p={6}
                  cursor="pointer"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.2s"
                  border="1px solid"
                  borderColor={borderColor}
                  bg={cardBg}
                >
                  <VStack align="start" gap={3}>
                    <HStack justify="space-between" width="100%">
                      <Box
                        p={3}
                        borderRadius="lg"
                        bg={colors.bg}
                        color={colors.color}
                        _dark={{ bg: `${category.color}.900`, color: `${category.color}.300` }}
                      >
                        <Icon size={24} />
                      </Box>
                      <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        {category.articleCount} {t('articles')}
                      </Text>
                    </HStack>
                    <VStack align="start" gap={1} width="100%">
                      <Text fontSize="md" fontWeight="semibold" color={textColor}>
                        {t(category.labelKey)}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {t(`${category.labelKey}Description`)}
                      </Text>
                    </VStack>
                    <HStack width="100%" justify="space-between" mt={2}>
                      <Button
                        variant="ghost"
                        size="sm"
                        rightIcon={<ChevronRight size={16} />}
                        colorScheme={category.color}
                      >
                        {t('viewAll')}
                      </Button>
                    </HStack>
                  </VStack>
                </Card>
              );
            })}
          </SimpleGrid>
        )}

        {/* Search Results */}
        {searchTerm !== '' && (
          <VStack align="stretch" gap={4}>
            {filteredCategories.length > 0 && (
              <Box>
                <Heading size="md" mb={4}>
                  {t('categories')}
                </Heading>
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
                  {filteredCategories.map((category) => {
                    const Icon = category.icon;
                    const colors = getCategoryColor(category.color);
                    
                    return (
                      <Card
                        key={category.id}
                        p={4}
                        cursor="pointer"
                        _hover={{ bg: hoverBg }}
                        border="1px solid"
                        borderColor={borderColor}
                        bg={cardBg}
                      >
                        <HStack gap={3}>
                          <Box
                            p={2}
                            borderRadius="md"
                            bg={colors.bg}
                            color={colors.color}
                            _dark={{ bg: `${category.color}.900`, color: `${category.color}.300` }}
                          >
                            <Icon size={20} />
                          </Box>
                          <VStack align="start" gap={0} flex={1}>
                            <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                              {t(category.labelKey)}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {category.articleCount} {t('articles')}
                            </Text>
                          </VStack>
                        </HStack>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              </Box>
            )}

            {filteredArticles.length > 0 && (
              <Box>
                <Heading size="md" mb={4}>
                  {t('articles')}
                </Heading>
                <VStack align="stretch" gap={2}>
                  {filteredArticles.map((article) => (
                    <Card
                      key={article.id}
                      p={4}
                      cursor="pointer"
                      _hover={{ bg: hoverBg }}
                      border="1px solid"
                      borderColor={borderColor}
                      bg={cardBg}
                    >
                      <HStack justify="space-between">
                        <HStack gap={3}>
                          <FileText size={20} color="gray.400" />
                          <Text fontSize="sm" color={textColor}>
                            {article.title}
                          </Text>
                        </HStack>
                        <ChevronRight size={16} color="gray.400" />
                      </HStack>
                    </Card>
                  ))}
                </VStack>
              </Box>
            )}

            {filteredCategories.length === 0 && filteredArticles.length === 0 && (
              <Box textAlign="center" py={12}>
                <Text fontSize="lg" color="gray.500" mb={2}>
                  {t('noResults')}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  {t('noResultsDescription')}
                </Text>
              </Box>
            )}
          </VStack>
        )}

        {/* Popular Articles */}
        {searchTerm === '' && (
          <Box>
            <Heading size="md" mb={4}>
              {t('popularQuestions')}
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
              {popularArticles.map((article) => (
                <Card
                  key={article.id}
                  p={4}
                  cursor="pointer"
                  _hover={{ bg: hoverBg, transform: 'translateX(4px)' }}
                  transition="all 0.2s"
                  border="1px solid"
                  borderColor={borderColor}
                  bg={cardBg}
                >
                  <HStack justify="space-between">
                    <Text fontSize="sm" color={textColor} flex={1}>
                      {article.title}
                    </Text>
                    <ChevronRight size={16} color="gray.400" />
                  </HStack>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* Contact Support */}
        <Card p={6} bgGradient="linear(to-r, blue.50, indigo.50)" _dark={{ bgGradient: 'linear(to-r, blue.900, indigo.900)' }} border="1px solid" borderColor={borderColor}>
          <HStack justify="space-between" flexWrap="wrap" gap={4}>
            <VStack align="start" gap={2}>
              <Heading size="sm" color={textColor}>
                {t('needMoreHelp')}
              </Heading>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                {t('contactSupport')}
              </Text>
            </VStack>
            <Button
              colorScheme="blue"
              size={{ base: 'sm', md: 'md' }}
            >
              <Mail size={16} style={{ marginRight: '4px' }} />
              {t('contactUs')}
            </Button>
          </HStack>
        </Card>
      </VStack>
    </Box>
  );
}
