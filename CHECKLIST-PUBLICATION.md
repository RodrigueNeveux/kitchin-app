# Checklist de tests avant publication - Kitch'In

Cette checklist vous permet de vérifier que l'application est prête pour la publication.

## 🔧 Prérequis

- [ ] Node.js installé (v18+ recommandé)
- [ ] Fichier `.env.local` créé avec les clés Firebase (voir `.env.example`)
- [ ] Compte Firebase configuré (Auth, Firestore)

---

## 1. Build de production

Ouvrez un terminal dans le dossier `Kitchin` et exécutez :

```bash
npm install
npm run build
```

- [ ] Le build se termine sans erreur
- [ ] Le dossier `dist/` est généré avec les fichiers JS et CSS

---

## 2. Test en local (preview)

```bash
npm run preview
```

- [ ] L'application se charge sur http://localhost:4173
- [ ] Pas d'erreur dans la console du navigateur (F12)

---

## 3. Tests fonctionnels par écran

### Authentification (AuthScreen)
- [ ] Affichage du formulaire de connexion/inscription
- [ ] Inscription avec email + mot de passe
- [ ] Connexion avec compte existant
- [ ] Lien "Mot de passe oublié" → envoi d'email
- [ ] Toggle afficher/masquer le mot de passe
- [ ] Redirection vers l'accueil après connexion

### Accueil (HomeScreen)
- [ ] Affichage des produits proches de l'expiration
- [ ] Affichage des produits du frigo
- [ ] Boutons "Voir tout" fonctionnels
- [ ] Bouton "Ajouter" (invitation) → redirige vers Profil
- [ ] Navigation vers Profil, Inventaire, Notifications

### Inventaire (InventoryScreen)
- [ ] Liste des produits (Frigo, Placard, Congélateur)
- [ ] Filtrage par catégorie
- [ ] Modifier la quantité d'un produit
- [ ] Supprimer un produit
- [ ] Bouton "Ajouter un produit" → AddProductScreen
- [ ] Bouton "Ajouter des ingrédients de base" (optionnel)

### Ajout de produit (AddProductScreen)
- [ ] Formulaire manuel (nom, quantité, catégorie, date d'expiration)
- [ ] Bouton scanner code-barres (si caméra disponible)
- [ ] Exemple produit scanné (Nutella)
- [ ] Sauvegarde et retour à l'inventaire

### Listes de courses (ShoppingListScreen)
- [ ] Onglets : Principale, Semaine Prochaine, Pharmacie
- [ ] Ajouter un article (nom + quantité)
- [ ] Cocher/décocher un article
- [ ] Supprimer un article
- [ ] Déplacer un article vers une autre liste
- [ ] Barre de progression
- [ ] Suggestions rapides (icône ✨)
- [ ] Responsive mobile : barre d'ajout visible au-dessus de la nav

### Recettes (RecipesScreen)
- [ ] Affichage des recettes (TheMealDB / Spoonacular)
- [ ] Recherche par texte
- [ ] Filtre par catégorie
- [ ] Bascule "Selon mon inventaire" / "Toutes les recettes"
- [ ] Clic sur une recette → détail

### Détail recette (RecipeDetailScreen)
- [ ] Affichage image, ingrédients, étapes
- [ ] Bouton "Ajouter les ingrédients manquants à la liste" (si connecté)
- [ ] Bouton retour

### Profil (ProfileScreen)
- [ ] Affichage nom, email, foyer
- [ ] Créer un foyer (si sans foyer)
- [ ] Inviter : génération code + QR code
- [ ] Rejoindre un foyer avec code
- [ ] Quitter le foyer (membre non-propriétaire)
- [ ] Paramètres

### Paramètres (SettingsScreen)
- [ ] Changer thème (Clair/Sombre)
- [ ] Sélection de langue
- [ ] Modifier nom du foyer
- [ ] Modifier email
- [ ] Section À propos (Version)

### Notifications (NotificationsScreen)
- [ ] Liste des produits proches de l'expiration
- [ ] Marquer comme lu
- [ ] Lien vers l'inventaire

---

## 4. Responsive & UX

### Mobile
- [ ] Bottom navigation visible et fonctionnelle
- [ ] Formulaires utilisables (zones tactiles suffisantes)
- [ ] Listes scrollables correctement
- [ ] Pas de contenu masqué derrière la barre de navigation

### Desktop (md+)
- [ ] Sidebar à gauche
- [ ] Contenu prend toute la largeur (max-w-4xl)
- [ ] Pas de bande démo visible

---

## 5. Sécurité & configuration

- [ ] `.env.local` est dans `.gitignore` (ne pas committer les clés Firebase)
- [ ] Règles Firestore configurées pour la production
- [ ] Auth Firebase : méthodes email/password activées
- [ ] Domaine autorisé dans Firebase Console (pour le déploiement)

---

## 6. Déploiement

Selon votre hébergeur (Vercel, Netlify, etc.) :

- [ ] Variables d'environnement définies (VITE_FIREBASE_*)
- [ ] Build command : `npm run build`
- [ ] Output directory : `dist`
- [ ] Redirections SPA configurées (/_redirects ou vercel.json)

---

## ✅ Validation finale

- [ ] Tous les tests ci-dessus passent
- [ ] Aucune erreur dans la console en production
- [ ] Les données Firebase se synchronisent correctement
- [ ] Mode sombre fonctionne

---

*Document généré pour Kitch'In - Application de gestion de cuisine*
