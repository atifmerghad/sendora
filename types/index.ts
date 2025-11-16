export interface Role {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone: string;
  nomMarque: string;
  siteUrl: string;
  ville: string;
  roleId: number;
  role?: Role; // Optional, included when fetched with relation
  roleName?: string; // Convenience field for role name (CLIENT, ADMIN, etc.)
  permissions?: string | null;
  deuxiemeTelephone?: string | null;
  adresse?: string | null;
  etat?: string | null;
  imageProfil?: string | null;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SignupData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone: string;
  nomMarque: string;
  siteUrl: string;
  ville: string;
  roleId?: number; // Optional, defaults to CLIENT (id=1)
}

export interface Parcel {
  id: string;
  numero: string;
  code: string;
  destinataire: string;
  telephone: string;
  adresse: string;
  ville: string;
  statut: 'en_attente' | 'a_preparer' | 'a_changer' | 'ramassage_en_cours' | 'ramassage_a_verifier' | 'ramasse' | 'entrepot' | 'en_transit' | 'distribue' | 'injoignable' | 'reporte' | 'programme' | 'en_cours_de_livraison' | 'annule' | 'refuse' | 'livre' | 'rembourse';
  statutFacturation: 'en_attente' | 'en_cours' | 'facture';
  typeColis: 'colis_stock' | 'colis_normal' | 'echange_avec' | 'echange_sans';
  fraisLivraison: number;
  montantTotal: number;
  referenceColis: string;
  referenceVendeur: string;
  note: string;
  vendeurSecondaire: string;
  derniereAction: string;
  dateCreation: string;
  userId: string;
}

export interface Pickup {
  id: string;
  numero: string;
  adresse: string;
  ville: string;
  dateDemande: string;
  statut: 'en_attente' | 'programme' | 'effectue' | 'annule';
  userId: string;
}

export interface Ticket {
  id: string;
  sujet: string;
  description: string;
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'ferme';
  dateCreation: string;
  userId: string;
}

export interface Invoice {
  id: string;
  numero: string;
  montant: number;
  dateEmission: string;
  statut: 'en_attente' | 'paye' | 'en_retard';
  userId: string;
}

export interface Return {
  id: string;
  numeroColis: string;
  raison: string;
  dateDemande: string;
  statut: 'en_attente' | 'approuve' | 'refuse' | 'traite';
  userId: string;
}

export interface Inventory {
  id: string;
  produit: string;
  quantite: number;
  prix: number;
  dateAjout: string;
  userId: string;
}

export interface City {
  id: string;
  nom: string;
  region: string;
}

export interface CityWithPrice {
  id: number;
  ville: string;
  price: number;
  delais: string;
  refused_cost: number;
  canceled_cost: number;
  region: string;
}

export interface TeamMember {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  dateAjout: string;
  userId: string;
}

export interface Message {
  id: string;
  expediteur: string;
  sujet: string;
  contenu: string;
  dateEnvoi: string;
  lu: boolean;
  userId: string;
}

