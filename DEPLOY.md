# Guide de déploiement - Kitch'In

Ce guide vous explique comment déployer l'application Kitch'In sur différents hébergements.

## 📋 Prérequis

1. Node.js 18+ installé
2. Git configuré
3. Compte sur l'hébergement de votre choix

## 🚀 Build de l'application

Avant de déployer, testez le build localement :

```bash
npm install
npm run build
```

Le dossier `dist/` contient les fichiers à déployer.

## 🌐 Déploiement sur Vercel

1. **Via l'interface Vercel :**
   - Allez sur [vercel.com](https://vercel.com)
   - Importez votre projet GitHub/GitLab
   - Vercel détectera automatiquement la configuration Vite

2. **Via la CLI Vercel :**
   ```bash
   npm i -g vercel
   vercel
   ```

3. **Configuration :**
   - Le fichier `vercel.json` est déjà configuré
   - Dossier de sortie : `dist`
   - Command de build : `npm run build`

## ☁️ Déploiement sur Netlify

1. **Via l'interface Netlify :**
   - Allez sur [netlify.com](https://netlify.com)
   - Faites glisser le dossier `dist/` sur la page de déploiement
   - Ou connectez votre dépôt Git

2. **Via la CLI Netlify :**
   ```bash
   npm i -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Configuration :**
   - Le fichier `netlify.toml` est déjà configuré
   - Dossier de publication : `dist`
   - Command de build : `npm run build`

## 📁 Déploiement sur un hébergement traditionnel (cPanel, FTP, etc.)

1. **Build l'application :**
   ```bash
   npm run build
   ```

2. **Uploader les fichiers :**
   - Uploadez TOUS les fichiers du dossier `dist/` dans le répertoire public de votre serveur
   - Généralement : `/public_html/` ou `/www/` ou `/htdocs/`

3. **Configuration Apache (.htaccess) :**
   - Le fichier `.htaccess` est déjà créé dans le projet
   - Copiez-le dans le dossier `dist/` avant l'upload
   - Ou créez-le directement sur le serveur

4. **Configuration Nginx :**
   Si vous utilisez Nginx, ajoutez dans votre configuration :
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

## 🔧 Variables d'environnement

Si vous devez configurer des variables d'environnement :

1. Créez un fichier `.env` à la racine :
   ```
   VITE_BASE_URL=/
   ```

2. Pour un sous-dossier :
   ```
   VITE_BASE_URL=/mon-sous-dossier/
   ```

3. Sur Vercel/Netlify :
   - Ajoutez les variables dans les paramètres du projet
   - Préfixez avec `VITE_` pour qu'elles soient accessibles dans le code

## ✅ Vérification après déploiement

1. ✅ Vérifiez que l'application se charge correctement
2. ✅ Testez la navigation (tous les écrans)
3. ✅ Vérifiez que les assets (images, CSS, JS) se chargent
4. ✅ Testez sur mobile et desktop
5. ✅ Vérifiez la console du navigateur pour les erreurs

## 🐛 Problèmes courants

### Erreur 404 sur les routes
- Vérifiez que la configuration de réécriture est correcte (`.htaccess`, `vercel.json`, `netlify.toml`)
- Assurez-vous que toutes les routes redirigent vers `/index.html`

### Assets non chargés
- Vérifiez que le `base` dans `vite.config.ts` correspond à votre configuration
- Si déployé dans un sous-dossier, utilisez `base: '/mon-sous-dossier/'`

### Erreur de build
- Vérifiez que toutes les dépendances sont installées : `npm install`
- Supprimez `node_modules` et `package-lock.json` puis réinstallez

### L'application ne fonctionne pas
- Videz le cache du navigateur
- Vérifiez la console du navigateur (F12)
- Vérifiez que le serveur supporte les applications SPA (Single Page Applications)

## 📝 Notes importantes

- Le dossier `dist/` contient uniquement les fichiers statiques (pas besoin de Node.js sur le serveur)
- Pour le développement, utilisez `npm run dev`
- Pour tester le build localement : `npm run preview`
- L'application fonctionne en mode démo par défaut (pas de backend requis)

## 🎉 Déploiement réussi !

Votre application Kitch'In devrait maintenant être accessible en ligne ! 🚀
