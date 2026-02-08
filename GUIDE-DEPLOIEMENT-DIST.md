# 📦 Guide : Déployer le dossier dist sur Vercel

## 🎯 Ce que vous allez faire

Vous allez prendre le dossier `dist` qui a été créé lors du build, et le déployer directement sur Vercel sans passer par GitHub.

---

## 📋 ÉTAPE PAR ÉTAPE (avec captures visuelles)

### Étape 1 : Ouvrir l'Explorateur de fichiers Windows

1. **Appuyez sur les touches :** `Windows + E` (en même temps)
2. **Ou cliquez sur l'icône dossier** dans la barre des tâches

### Étape 2 : Naviguer vers le dossier dist

1. Dans la barre d'adresse de l'Explorateur, copiez-collez :
   ```
   C:\Users\Admin\Kitch'in\Kitchin\dist
   ```
2. **Appuyez sur Entrée**
3. Vous devriez voir les fichiers :
   - `index.html`
   - dossier `assets/`
   - dossier `js/`

### Étape 3 : Ouvrir Vercel

1. **Ouvrez votre navigateur** (Chrome, Edge, Firefox...)
2. Allez sur : **https://vercel.com**
3. **Connectez-vous** avec votre compte (ou créez un compte)

### Étape 4 : Déployer le dossier dist

1. **Allez sur cette page :**
   - https://vercel.com/new
   - **OU** cliquez sur "Add New..." → "Project" puis "Import"

2. **Cherchez l'option "Drag & Drop" ou "Deploy" :**
   - Il y a une zone qui dit "Drag & Drop your project folder here"
   - **OU** un bouton "Browse" ou "Select Folder"

3. **Glissez-déposez le dossier dist :**
   - Revenez à l'Explorateur Windows (étape 2)
   - **Cliquez sur le dossier `dist`** (pas dedans, sur le dossier lui-même)
   - **Glissez-le** (cliquez maintenez et déplacez)
   - **Lâchez-le** dans la zone de Vercel

   **OU**

   - Cliquez sur "Browse" / "Select Folder"
   - Naviguez vers : `C:\Users\Admin\Kitch'in\Kitchin\dist`
   - Sélectionnez le dossier `dist`
   - Cliquez "Ouvrir"

### Étape 5 : Vercel déploie automatiquement

1. Vercel va automatiquement :
   - Analyser les fichiers
   - Déployer votre application
   - Vous donner une URL

2. **Attendez 1-2 minutes** (vous verrez la progression)

3. **Quand c'est terminé :**
   - Vercel vous donnera une URL comme : `https://kitchin-xxxxx.vercel.app`
   - **Cliquez dessus** pour voir votre site !

---

## 🖼️ Visuellement, ça ressemble à ça :

```
1. Explorateur Windows
   📁 dist
      📄 index.html
      📁 assets/
      📁 js/

2. Glissez le dossier "dist"
   ┌─────────────────┐
   │  dist           │ ← Vous glissez ça
   └─────────────────┘
          ↓
3. Zone Vercel
   ┌─────────────────────────────────┐
   │  Drag & Drop your project here  │ ← Vers là
   └─────────────────────────────────┘

4. Résultat
   ✅ Déployé !
   https://kitchin-xxxxx.vercel.app
```

---

## ❓ Si vous ne trouvez pas le dossier dist

Le dossier `dist` est créé après avoir fait `npm run build`.

**Vérifiez :**
1. Ouvrez l'Explorateur Windows (`Windows + E`)
2. Allez dans : `C:\Users\Admin\Kitch'in\Kitchin\`
3. Vous devriez voir le dossier `dist`

**Si le dossier n'existe pas :**
- Retournez dans le terminal
- Exécutez : `cd Kitchin` puis `npm run build`
- Le dossier `dist` sera créé

---

## ✅ Après le déploiement

1. **Testez votre site :** Visitez l'URL que Vercel vous a donnée
2. **Si la page est toujours blanche :**
   - Appuyez sur **F12** (Outils de développement)
   - Allez dans l'onglet **Console**
   - Regardez les erreurs en rouge
   - Envoyez-moi une capture d'écran

---

## 🎯 Résumé simple

1. Ouvrez l'Explorateur Windows → Allez dans `Kitchin\dist`
2. Ouvrez Vercel.com → Page de déploiement
3. Glissez le dossier `dist` sur Vercel
4. Attendez → Votre site est en ligne !

**C'est tout ! 🚀**
