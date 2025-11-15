# Sendora - Gestion de Livraison

Application web complète de gestion de livraison et colis pour le marché marocain.

## Technologies

- **Next.js** (dernière version) - Framework React
- **Chakra UI v3** - Bibliothèque de composants UI
- **TypeScript** - Typage statique
- **Lucide React** - Icônes
- **JWT** - Authentification
- **bcryptjs** - Hachage de mots de passe

## Fonctionnalités

### Authentification
- Page de connexion avec validation
- Page d'inscription avec formulaire complet
- Réinitialisation de mot de passe
- Routes protégées
- Gestion de session avec localStorage

### Dashboard
- Vue d'ensemble avec statistiques
- Navigation latérale collapsible (260px)
- En-tête avec menu utilisateur et notifications
- Mode clair/sombre
- Design responsive (desktop, tablette, mobile)

### Gestion des colis
- Ajouter un colis
- Liste des colis avec statuts
- Suivi en temps réel

### Ramassages
- Demander un ramassage
- Liste des ramassages
- Statuts de ramassage

### Autres fonctionnalités
- Tickets de support
- Facturation
- Gestion des retours
- Gestion de stock
- Liste des villes (incluant les districts de Casablanca)
- Gestion d'équipe
- Utilisateurs
- Centre d'aide (FAQ)
- Intégration API
- Messages/Chat

## Installation

1. Installer les dépendances:
```bash
npm install
```

2. Lancer le serveur de développement:
```bash
npm run dev
```

3. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur

## Structure du projet

```
Sendora/
├── app/                    # Pages Next.js App Router
│   ├── api/               # Routes API
│   ├── dashboard/         # Pages du dashboard
│   ├── login/             # Page de connexion
│   ├── signup/            # Page d'inscription
│   └── forgot-password/   # Réinitialisation mot de passe
├── components/            # Composants réutilisables
├── contexts/              # Contextes React (Auth)
├── data/                  # Données (users.json, cities.json)
├── lib/                   # Utilitaires (JWT, users)
└── types/                 # Types TypeScript
```

## Données

Les utilisateurs sont stockés dans `/data/users.json` (pour démonstration).
Les villes marocaines sont dans `/data/cities.json` (incluant les districts de Casablanca).

## API Routes

- `POST /api/auth/login` - Connexion
- `POST /api/auth/signup` - Inscription

## Notes

- Les mots de passe sont hachés avec bcryptjs
- Les tokens JWT sont stockés dans localStorage
- L'interface est en français
- Toutes les villes marocaines sont incluses, avec les districts de Casablanca (Sidi Maarouf, Anfa, Bourgogne)

