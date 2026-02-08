# Déployer Kitch'in sur Vercel

Guide pas à pas pour publier ton application sur Vercel.

---

## ⚠️ Si tu as une erreur 404

1. **Vercel** → ton projet → **Settings** → **General**
2. Dans **Build & Development Settings**, clique sur **Override** puis vérifie :
   - **Framework Preset** : `Vite`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist` ← **IMPORTANT**
   - **Install Command** : `npm install`
3. **Deployments** → **⋯** sur le dernier déploiement → **Redeploy**
4. Regarde les **logs du build** : le build doit se terminer en succès (vert). S'il échoue, le 404 est normal.

---

## Étape 1 : Préparer ton projet sur GitHub

1. Si ce n'est pas déjà fait, crée un dépôt sur [github.com](https://github.com)
2. Pousse ton code :
   ```bash
   cd "C:\Users\Admin\Kitch'in\Kitchin"
   git add .
   git commit -m "Prêt pour déploiement Vercel"
   git push origin main
   ```

---

## Étape 2 : Créer un compte Vercel

1. Va sur [vercel.com](https://vercel.com)
2. Clique sur **Sign Up**
3. Choisis **Continue with GitHub** pour connecter ton compte GitHub

---

## Étape 3 : Importer le projet

1. Une fois connecté, clique sur **Add New...** → **Project**
2. Tu verras la liste de tes dépôts GitHub
3. Trouve **Kitchin** (ou le nom de ton dépôt) et clique sur **Import**
4. **Root Directory** : Si ton projet est dans un sous-dossier `Kitchin`, clique sur **Edit** à côté de Root Directory et entre `Kitchin`. Sinon, laisse vide.

---

## Étape 4 : Variables d'environnement (obligatoire pour Firebase)

Avant de cliquer sur Deploy, clique sur **Environment Variables** et ajoute chacune de ces variables :

| Nom | Valeur | Où la trouver |
|-----|--------|---------------|
| `VITE_FIREBASE_API_KEY` | Ta clé API | Firebase Console → Project Settings → Your apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | `ton-projet.firebaseapp.com` | Idem |
| `VITE_FIREBASE_PROJECT_ID` | ID de ton projet | Idem |
| `VITE_FIREBASE_STORAGE_BUCKET` | `ton-projet.appspot.com` | Idem |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Numéro (ex: 123456789) | Idem |
| `VITE_FIREBASE_APP_ID` | `1:123:web:abc...` | Idem |

Tu peux copier ces valeurs depuis ton fichier `.env.local` local.

Pour chaque variable : colle le nom, colle la valeur, puis clique **Add**.

---

## Étape 5 : Déployer

1. Clique sur **Deploy**
2. Attends 1 à 2 minutes
3. Quand c'est terminé, tu verras une URL du type : `https://kitchin-xxx.vercel.app`

---

## Étape 6 : Autoriser le domaine dans Firebase

Sans cette étape, la connexion (Auth) ne fonctionnera pas !

1. Va sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionne ton projet
3. **Authentication** → **Settings** (onglet) → **Authorized domains**
4. Clique sur **Add domain**
5. Ajoute ton domaine Vercel : `kitchin-xxx.vercel.app` (remplace par ton URL réelle)
6. Clique **Add**

---

## Étape 7 : Tester

Ouvre l'URL de ton déploiement et vérifie :
- L'inscription / connexion fonctionne
- Les données se chargent (inventaire, listes de courses)
- Le mode sombre fonctionne

---

## Mises à jour futures

Chaque fois que tu fais un `git push` sur la branche `main`, Vercel redéploiera automatiquement ton application. Les variables d'environnement restent sauvegardées.

---

## Problèmes courants

### "Page not found" en cliquant sur un lien
→ Le fichier `vercel.json` avec les rewrites est déjà configuré. Si le problème persiste, vérifie que `vercel.json` est à la racine du projet importé.

### Erreur de connexion Firebase
→ Vérifie que le domaine Vercel est bien ajouté dans Firebase **Authorized domains**.

### Build échoue
→ Vérifie que toutes les variables `VITE_FIREBASE_*` sont définies dans Vercel.
