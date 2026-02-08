# 🔥 Installation de Firebase - Instructions

## ⚠️ Problème actuel

Firebase est dans `package.json` mais n'est pas installé dans `node_modules`.

## ✅ Solution

### Méthode 1 : Installation via npm (Recommandée)

Ouvrez un terminal **dans le dossier Kitchin** et exécutez :

```bash
npm install
```

Cela installera toutes les dépendances, y compris Firebase.

### Méthode 2 : Installation directe de Firebase

```bash
cd Kitchin
npm install firebase
```

### Méthode 3 : Double-clic sur le fichier batch

Double-cliquez sur `install-firebase.bat` dans le dossier `Kitchin`.

## 🔍 Vérification

Après l'installation, vérifiez que Firebase est installé :

```bash
npm list firebase
```

Vous devriez voir :
```
firebase@10.13.0
```

## 🚀 Après l'installation

Relancez le build :

```bash
npm run build
```

L'erreur devrait être résolue !

## 📝 Note

Si vous avez toujours des problèmes après l'installation :

1. Supprimez `node_modules` et `package-lock.json`
2. Réinstallez toutes les dépendances : `npm install`
3. Relancez le build
