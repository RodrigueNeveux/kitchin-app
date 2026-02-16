# Déployer Kitch'in

## Erreur submodule « No url found for submodule path Kitchin » ?

Utilise la **solution rapide** :

### 1. Créer un nouveau dépôt sur GitHub
- Va sur **https://github.com/new**
- Nom : `kitchin-app` (ou autre)
- Public, sans README
- **Create repository**

### 2. Lancer fix-et-push.bat
Double-clique sur **`fix-et-push.bat`** dans ce dossier.

### 3. Déployer sur Netlify
1. [netlify.com](https://netlify.com) → **Add new site** → **Import** → **kitchin-app**
2. **Base directory** : laisse vide
3. **Build command** : `npm run build`
4. **Publish directory** : `dist`
5. **Environment variables** : ajoute les 6 variables `VITE_FIREBASE_*` (depuis ton `.env.local`)
6. **Deploy**
7. Firebase Console → **Authorized domains** → ajoute `xxx.netlify.app`

---

## Variables Firebase (obligatoires)

| Variable | Où la trouver |
|----------|---------------|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | `ton-projet.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | ID du projet |
| `VITE_FIREBASE_STORAGE_BUCKET` | `ton-projet.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Numéro |
| `VITE_FIREBASE_APP_ID` | `1:123:web:...` |

---

## Commandes utiles

```bash
npm install
npm run dev      # Développement local
npm run build    # Build production
npm run preview  # Prévisualiser le build
```
