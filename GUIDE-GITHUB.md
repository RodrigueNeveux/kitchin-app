# 📝 Guide : Créer un projet GitHub et déployer

## Étape 1 : Préparer votre projet local

### 1.1 Initialiser Git (si pas déjà fait)

Ouvrez un terminal dans le dossier `Kitchin` et exécutez :

```bash
cd Kitchin
git init
git add .
git commit -m "Initial commit - Application Kitch'In prête"
```

### 1.2 Vérifier les fichiers à ignorer

Le fichier `.gitignore` est déjà créé et ignore :
- `node_modules/`
- `dist/`
- `.env`
- Fichiers temporaires

---

## Étape 2 : Créer le projet sur GitHub.com

### Méthode 1 : Via le site web (RECOMMANDÉ)

1. **Allez sur GitHub :**
   - Ouvrez [github.com](https://github.com)
   - Connectez-vous à votre compte

2. **Créer un nouveau repository :**
   - Cliquez sur le **+** en haut à droite
   - Sélectionnez **"New repository"**

3. **Remplissez les informations :**
   - **Repository name :** `Kitchin` (ou `kitchin-app`)
   - **Description :** `Application de gestion de cuisine et inventaire - Kitch'In`
   - **Visibilité :** 
     - ✅ Public (recommandé pour les projets personnels)
     - ⚪ Private (si vous voulez garder le code privé)
   - ⚠️ **NE COCHEZ PAS** "Add a README file" (vous en avez déjà un)
   - ⚠️ **NE COCHEZ PAS** "Add .gitignore" (vous en avez déjà un)
   - ⚠️ **NE COCHEZ PAS** "Choose a license" (vous pouvez le faire plus tard)

4. **Cliquez sur "Create repository"**

5. **GitHub vous donnera des commandes - IGNOREZ-LE pour l'instant** 😊

---

## Étape 3 : Connecter votre projet local à GitHub

Dans le terminal, exécutez ces commandes (remplacez `VOTRE_USERNAME` par votre nom d'utilisateur GitHub) :

```bash
# Ajouter le remote GitHub
git remote add origin https://github.com/VOTRE_USERNAME/Kitchin.git

# Renommer la branche principale en 'main' (si nécessaire)
git branch -M main

# Pousser votre code
git push -u origin main
```

**Exemple concret :**
Si votre username est `RodrigueNeveux` :
```bash
git remote add origin https://github.com/RodrigueNeveux/Kitchin.git
git branch -M main
git push -u origin main
```

---

## Étape 4 : Vérifier

1. Rafraîchissez la page GitHub de votre repository
2. Vous devriez voir tous vos fichiers ! ✅

---

## 🔐 Si GitHub demande votre mot de passe

### Option 1 : Personal Access Token (Recommandé)

1. Allez sur : [github.com/settings/tokens](https://github.com/settings/tokens)
2. Cliquez "Generate new token" > "Generate new token (classic)"
3. Donnez un nom : `Kitchin Local`
4. Cochez `repo` (toutes les permissions repo)
5. Cliquez "Generate token"
6. **COPIEZ LE TOKEN** (vous ne le reverrez plus !)
7. Utilisez ce token comme mot de passe lors du `git push`

### Option 2 : GitHub CLI (Plus simple)

Installez GitHub CLI et authentifiez-vous :

```bash
# Installer GitHub CLI
# Windows : winget install GitHub.cli
# Ou téléchargez depuis : https://cli.github.com

# Se connecter
gh auth login

# Puis vous pourrez pusher normalement
git push -u origin main
```

---

## ⚡ Commandes rapides (copier-coller)

Si votre username GitHub est déjà connu, voici les commandes toutes prêtes :

```bash
# 1. Aller dans le dossier
cd Kitchin

# 2. Initialiser Git (si pas déjà fait)
git init

# 3. Ajouter tous les fichiers
git add .

# 4. Faire le premier commit
git commit -m "Initial commit - Application Kitch'In"

# 5. Connecter à GitHub (REMPLACEZ VOTRE_USERNAME)
git remote add origin https://github.com/VOTRE_USERNAME/Kitchin.git

# 6. Renommer en main
git branch -M main

# 7. Pousser sur GitHub
git push -u origin main
```

---

## 🎯 Après avoir créé le repo GitHub

Une fois votre code sur GitHub, vous pouvez :

1. **Déployer sur Vercel :**
   - Allez sur [vercel.com](https://vercel.com)
   - Importez votre repo GitHub
   - Cliquez Deploy - C'EST TOUT ! 🚀

2. **Partager votre code :**
   - Partagez le lien GitHub avec d'autres développeurs
   - Collaborez sur le projet

3. **Continuer le développement :**
   ```bash
   # Faire des modifications, puis :
   git add .
   git commit -m "Description des changements"
   git push
   ```

---

## ❓ Problèmes courants

**Erreur : "repository not found"**
- Vérifiez que vous avez bien créé le repo sur GitHub
- Vérifiez l'URL (username et nom du repo)

**Erreur : "authentication failed"**
- Utilisez un Personal Access Token au lieu du mot de passe
- Ou installez GitHub CLI

**Erreur : "branch main does not exist"**
- Assurez-vous d'avoir fait au moins un commit
- Vérifiez avec `git branch`

---

## 🎉 C'est tout !

Une fois ces étapes terminées, votre projet sera sur GitHub et vous pourrez le déployer sur Vercel en 2 clics ! 🚀
