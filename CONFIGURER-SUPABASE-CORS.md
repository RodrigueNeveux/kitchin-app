# 🔧 Configuration CORS Supabase - Solution au problème d'authentification

## ⚠️ Problème

Si vous voyez cette erreur :
```
Blocage d'une requête multiorigine (Cross-Origin Request) : la politique « Same Origin » ne permet pas de consulter la ressource distante située sur https://bguatwhgsgduclyacxqz.supabase.co/auth/v1/token?grant_type=password
```

C'est que votre domaine Vercel n'est pas autorisé dans les paramètres Supabase.

## ✅ Solution : Configurer Supabase

### Étape 1 : Aller dans le Dashboard Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet : `bguatwhgsgduclyacxqz`

### Étape 2 : Configurer les URLs autorisées

1. Allez dans **Authentication** → **URL Configuration**
2. Dans **Site URL**, ajoutez votre URL Vercel :
   ```
   https://kitchin-oqvpp2mdt-rodrigue9s-projects.vercel.app
   ```
   Ou votre domaine personnalisé si vous en avez un.

3. Dans **Redirect URLs**, ajoutez :
   ```
   https://kitchin-oqvpp2mdt-rodrigue9s-projects.vercel.app/**
   https://*.vercel.app/**
   ```

### Étape 3 : Configurer CORS (si disponible)

1. Allez dans **Settings** → **API**
2. Vérifiez que **CORS** est activé
3. Si vous voyez une option "Allowed Origins", ajoutez :
   ```
   https://kitchin-oqvpp2mdt-rodrigue9s-projects.vercel.app
   https://*.vercel.app
   ```

### Étape 4 : Vérifier les paramètres d'authentification

1. Allez dans **Authentication** → **Providers**
2. Vérifiez que **Email** est activé
3. Vérifiez que **Confirm email** est désactivé (pour le développement) ou configuré correctement

## 🔄 Alternative : Utiliser un domaine personnalisé

Si vous avez un domaine personnalisé sur Vercel :
1. Ajoutez ce domaine dans **Site URL** et **Redirect URLs**
2. Cela résoudra définitivement les problèmes CORS

## 📝 Notes importantes

- Les changements prennent effet immédiatement
- Vous pouvez ajouter plusieurs URLs (séparées par des virgules)
- Pour le développement local, ajoutez aussi `http://localhost:3000`

## ✅ Vérification

Après avoir configuré Supabase :
1. Rafraîchissez votre application Vercel
2. Essayez de vous connecter
3. L'erreur CORS devrait disparaître
