# 🚀 Déployer avec Vercel CLI (plus simple !)

## ✅ Méthode via le terminal (RECOMMANDÉ)

Si vous ne voyez pas l'option drag & drop sur Vercel, utilisez le terminal !

---

## 📋 ÉTAPE PAR ÉTAPE

### Étape 1 : Installer Vercel CLI

Dans votre terminal PowerShell (celui où vous êtes), tapez :

```bash
npm install -g vercel
```

Attendez que l'installation se termine (quelques secondes).

### Étape 2 : Aller dans le dossier Kitchin

Assurez-vous d'être dans le bon dossier :

```bash
cd Kitchin
```

### Étape 3 : Déployer avec Vercel

Tapez simplement :

```bash
vercel
```

### Étape 4 : Suivre les instructions

Vercel va vous demander :
1. **Login** → Appuyez sur Entrée → Ça va ouvrir votre navigateur
2. **Link to existing project?** → Tapez `N` (Non) puis Entrée
3. **What's your project's name?** → Tapez `Kitchin` puis Entrée
4. **In which directory is your code located?** → Appuyez juste Entrée (c'est déjà `.` qui est correct)
5. **Want to override the settings?** → Tapez `N` puis Entrée

### Étape 5 : C'est tout !

Vercel va :
- Détecter automatiquement que c'est un projet Vite
- Build l'application
- La déployer
- Vous donner une URL !

---

## 🎯 Commandes complètes (copier-coller)

```bash
npm install -g vercel
cd Kitchin
vercel
```

Puis suivez les instructions à l'écran !

---

## ⚠️ Si ça ne fonctionne pas

**Problème : npm n'est pas reconnu**
→ Installez Node.js depuis nodejs.org

**Problème : Permission denied**
→ Exécutez PowerShell en tant qu'administrateur

---

## ✅ Alternative : Utiliser Netlify (plus simple avec drag & drop)

Si Vercel est compliqué :

1. Allez sur : https://app.netlify.com/drop
2. Glissez le dossier `dist` directement
3. C'est tout ! Netlify déploie en 30 secondes

---

**Essayez la méthode Vercel CLI d'abord ! C'est la plus simple ! 🚀**
