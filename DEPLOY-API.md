# 🚀 Guide de déploiement de l'API Edge Function

## ⚠️ Problème CORS

Si vous rencontrez des erreurs CORS, c'est que l'API Edge Function n'est pas déployée avec la dernière configuration CORS.

## 📋 Étapes pour redéployer l'API

### Option 1 : Via Supabase CLI (Recommandé)

1. **Installer Supabase CLI** (si pas déjà fait) :
   ```bash
   npm install -g supabase
   ```

2. **Se connecter à Supabase** :
   ```bash
   supabase login
   ```

3. **Lier votre projet** :
   ```bash
   cd Kitchin
   supabase link --project-ref bguatwhgsgduclyacxqz
   ```

4. **Déployer l'API Edge Function** :
   ```bash
   supabase functions deploy server
   ```

### Option 2 : Via l'interface Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre projet
3. Allez dans **Edge Functions**
4. Cliquez sur **Deploy** ou **Update** pour la fonction `server`
5. Copiez le contenu de `src/supabase/functions/server/index.tsx`
6. Collez-le dans l'éditeur et déployez

### Option 3 : Via GitHub Actions (si configuré)

Si vous avez configuré GitHub Actions, un push sur la branche principale devrait automatiquement déployer l'API.

## ✅ Vérification

Après le déploiement, testez l'endpoint de santé :
```bash
curl https://bguatwhgsgduclyacxqz.supabase.co/functions/v1/server/make-server-e298da7a/health
```

Vous devriez recevoir : `{"status":"ok"}`

## 🔧 Configuration CORS

L'API est maintenant configurée avec :
- ✅ CORS activé pour toutes les origines (`*`)
- ✅ Support des méthodes : GET, POST, PUT, DELETE, OPTIONS, PATCH
- ✅ En-têtes autorisés : Content-Type, Authorization, X-Requested-With
- ✅ Gestion explicite des requêtes OPTIONS (preflight)

## 📝 Notes importantes

- **L'API doit être redéployée** après chaque modification du code
- Les variables d'environnement (SUPABASE_URL, SUPABASE_ANON_KEY, etc.) sont automatiquement injectées par Supabase
- Le déploiement prend généralement 1-2 minutes
