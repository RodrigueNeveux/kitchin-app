# 🚀 Déploiement de l'Edge Function Supabase

## ⚠️ IMPORTANT : Problème CORS

Si vous rencontrez des erreurs CORS lors de la connexion/inscription, c'est que l'Edge Function n'est pas déployée ou que CORS n'est pas correctement configuré.

## 📋 Étapes de déploiement

### 1. Installer Supabase CLI

```bash
npm install -g supabase
```

### 2. Se connecter à Supabase

```bash
supabase login
```

### 3. Lier votre projet

```bash
cd Kitchin
supabase link --project-ref bguatwhgsgduclyacxqz
```

### 4. Déployer l'Edge Function

```bash
supabase functions deploy server
```

### 5. Vérifier le déploiement

Allez sur https://supabase.com/dashboard/project/bguatwhgsgduclyacxqz/functions
et vérifiez que la fonction `server` est bien déployée.

## 🔧 Configuration CORS

L'Edge Function a déjà CORS configuré dans le code (`src/supabase/functions/server/index.tsx`).
Si le problème persiste après le déploiement :

1. Vérifiez que l'Edge Function est bien déployée
2. Vérifiez les logs de l'Edge Function dans le dashboard Supabase
3. Testez l'endpoint directement avec curl :

```bash
curl -X OPTIONS https://bguatwhgsgduclyacxqz.supabase.co/functions/v1/server/make-server-e298da7a/login \
  -H "Origin: https://kitchin-flax.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

## 🐛 Dépannage

### Erreur : "CORS policy blocked"
- L'Edge Function n'est pas déployée → Déployez-la avec `supabase functions deploy server`
- CORS n'est pas configuré → Vérifiez que le code CORS est présent dans `index.tsx`

### Erreur : "Function not found"
- L'Edge Function n'existe pas → Créez-la dans le dashboard Supabase
- Le nom de la fonction est incorrect → Vérifiez le nom dans `api.ts`

## 📝 Notes

- L'Edge Function doit être déployée sur Supabase pour fonctionner
- Les changements dans le code nécessitent un redéploiement
- CORS est configuré pour accepter toutes les origines (`origin: "*"`)
