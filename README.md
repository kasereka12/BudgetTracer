# BudgetTracker - Application de Suivi de Budget Personnel

Une application web moderne et élégante pour suivre vos finances personnelles, développée avec React, Tailwind CSS et Supabase.

## 🚀 Fonctionnalités

### 📊 Tableau de bord
- Vue d'ensemble de vos finances
- Statistiques en temps réel
- Graphiques interactifs des dépenses
- Alertes de budget

### 💰 Gestion des budgets
- Budgets mensuels et annuels
- Suivi des catégories de dépenses
- Alertes de dépassement
- Historique des budgets

### 💳 Suivi des dépenses
- Enregistrement des dépenses quotidiennes
- Catégorisation automatique
- Recherche et filtres avancés
- Import/Export des données

### 🎯 Objectifs personnels
- Définition d'objectifs financiers
- Suivi de progression
- Système de priorités
- Rappels et notifications

### 🍎 Suivi alimentaire
- Enregistrement des repas
- Calcul des calories et nutriments
- Suivi des coûts alimentaires
- Statistiques nutritionnelles

### 👤 Profil utilisateur
- Gestion du profil personnel
- Statistiques du compte
- Paramètres de l'application

## 🛠️ Technologies utilisées

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Graphiques**: Chart.js avec react-chartjs-2
- **Icônes**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## 📦 Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn
- Un compte Supabase

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd budget-tracker-app
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration Supabase

#### Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre URL et votre clé anonyme

#### Configurer la base de données
1. Dans le dashboard Supabase, allez dans l'éditeur SQL
2. Exécutez le contenu du fichier `supabase-schema.sql`
3. Cela créera toutes les tables et politiques RLS nécessaires

#### Variables d'environnement
1. Copiez le fichier `env.example` vers `.env.local`
2. Remplissez vos informations Supabase :
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Lancer l'application
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🗄️ Structure de la base de données

### Tables principales
- **profiles**: Informations utilisateur
- **budgets**: Budgets mensuels/annuels
- **expense_categories**: Catégories de dépenses
- **expenses**: Dépenses enregistrées
- **goals**: Objectifs personnels
- **meals**: Repas et nutrition
- **income**: Revenus
- **reminders**: Rappels et notifications

### Sécurité
- Row Level Security (RLS) activé
- Politiques de sécurité pour chaque table
- Authentification Supabase intégrée

## 🎨 Design et UX

### Charte graphique
- **Couleur principale**: Bleu (#3b82f6)
- **Palette**: Tons de bleu et gris
- **Design**: Moderne et minimaliste
- **Responsive**: Compatible mobile et desktop

### Composants
- Design system cohérent
- Animations fluides
- Icônes intuitives
- Feedback utilisateur

## 📱 Utilisation

### Première utilisation
1. Créez un compte ou connectez-vous
2. Configurez votre premier budget
3. Ajoutez vos catégories de dépenses
4. Commencez à enregistrer vos dépenses

### Fonctionnalités avancées
- **Objectifs**: Définissez des objectifs d'épargne ou de réduction de dépenses
- **Nutrition**: Suivez vos repas et leurs coûts
- **Graphiques**: Visualisez vos données avec des graphiques interactifs
- **Export**: Exportez vos données pour analyse externe

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Aperçu du build
npm run preview

# Linting
npm run lint
```

## 🚀 Déploiement

### Vercel (recommandé)
1. Connectez votre repository GitHub à Vercel
2. Ajoutez vos variables d'environnement
3. Déployez automatiquement

### Netlify
1. Build: `npm run build`
2. Dossier de publication: `dist`
3. Ajoutez vos variables d'environnement

### Autres plateformes
L'application peut être déployée sur toute plateforme supportant les applications React statiques.

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
1. Vérifiez la documentation Supabase
2. Consultez les issues GitHub
3. Créez une nouvelle issue si nécessaire

## 🔮 Roadmap

### Fonctionnalités futures
- [ ] Import de relevés bancaires
- [ ] Notifications push
- [ ] Mode sombre
- [ ] Application mobile
- [ ] Intégration avec des APIs bancaires
- [ ] Rapports PDF
- [ ] Budgets collaboratifs
- [ ] Prédictions IA

---

**BudgetTracker** - Prenez le contrôle de vos finances personnelles ! 💰✨
