'use client';

import { Badge } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, { color: string; bg: string }> = {
  en_attente: { color: 'orange.600', bg: 'orange.100' },
  a_preparer: { color: 'yellow.600', bg: 'yellow.100' },
  a_changer: { color: 'purple.600', bg: 'purple.100' },
  ramassage_en_cours: { color: 'blue.600', bg: 'blue.100' },
  ramassage_a_verifier: { color: 'cyan.600', bg: 'cyan.100' },
  ramasse: { color: 'teal.600', bg: 'teal.100' },
  entrepot: { color: 'indigo.600', bg: 'indigo.100' },
  en_transit: { color: 'blue.600', bg: 'blue.100' },
  distribue: { color: 'green.600', bg: 'green.100' },
  injoignable: { color: 'red.600', bg: 'red.100' },
  reporte: { color: 'orange.600', bg: 'orange.100' },
  programme: { color: 'purple.600', bg: 'purple.100' },
  en_cours_de_livraison: { color: 'blue.600', bg: 'blue.100' },
  annule: { color: 'gray.600', bg: 'gray.100' },
  refuse: { color: 'red.600', bg: 'red.100' },
  livre: { color: 'green.600', bg: 'green.100' },
  rembourse: { color: 'pink.600', bg: 'pink.100' },
  retourne: { color: 'red.600', bg: 'red.100' },
  effectue: { color: 'green.600', bg: 'green.100' },
  ouvert: { color: 'blue.600', bg: 'blue.100' },
  en_cours: { color: 'yellow.600', bg: 'yellow.100' },
  resolu: { color: 'green.600', bg: 'green.100' },
  ferme: { color: 'gray.600', bg: 'gray.100' },
  paye: { color: 'green.600', bg: 'green.100' },
  en_retard: { color: 'red.600', bg: 'red.100' },
  approuve: { color: 'green.600', bg: 'green.100' },
  traite: { color: 'blue.600', bg: 'blue.100' },
  facture: { color: 'green.600', bg: 'green.100' },
};

const statusLabels: Record<string, string> = {
  en_attente: 'En attente',
  a_preparer: 'À préparer',
  a_changer: 'À changer',
  ramassage_en_cours: 'Ramassage en cours',
  ramassage_a_verifier: 'Ramassage à vérifier',
  ramasse: 'Ramassé',
  entrepot: 'Entrepôt',
  en_transit: 'En transit',
  distribue: 'Distribué',
  injoignable: 'Injoignable',
  reporte: 'Reporté',
  programme: 'Programmé',
  en_cours_de_livraison: 'En cours de livraison',
  annule: 'Annulé',
  refuse: 'Refusé',
  livre: 'Livré',
  rembourse: 'Remboursé',
  retourne: 'Retourné',
  effectue: 'Effectué',
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  resolu: 'Résolu',
  ferme: 'Fermé',
  paye: 'Payé',
  en_retard: 'En retard',
  approuve: 'Approuvé',
  traite: 'Traité',
  facture: 'Facturé',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const t = useTranslations('status');
  const config = statusColors[status] || { color: 'gray.600', bg: 'gray.100' };
  // Try to get translation using the status key (with underscores), fallback to hardcoded labels
  const label = t(status as any) || statusLabels[status] || status;

  return (
    <Badge
      color={config.color}
      bg={config.bg}
      px={2}
      py={1}
      borderRadius="md"
      fontSize="sm"
      fontWeight="medium"
    >
      {label}
    </Badge>
  );
}

