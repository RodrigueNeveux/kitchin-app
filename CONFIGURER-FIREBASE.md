# 🔥 Configuration Firebase - Guide rapide

## ⚠️ IMPORTANT : Avant de commencer

Vous devez créer un projet Firebase et obtenir vos clés de configuration.

## 📋 Étapes

### 1. Créer un projet Firebase

1. Allez sur [https://console.firebase.google.com](https://console.firebase.google.com)
2. Cliquez sur **Ajouter un projet**
3. Nommez-le "KitchIn" (ou autre)
4. Activez **Google Analytics** (optionnel)
5. Créez le projet

### 2. Activer les services

#### Authentication
1. Allez dans **Authentication** → **Get started**
2. Activez **Email/Password**
3. Désactivez **Email verification** (pour le développement)

#### Firestore Database
1. Allez dans **Firestore Database** → **Create database**
2. Choisissez **Start in test mode** (pour commencer)
3. Sélectionnez une région (ex: `europe-west`)

### 3. Récupérer les clés

1. Allez dans **Project Settings** (⚙️ en haut à gauche)
2. Dans **Your apps**, cliquez sur **Web** (</>)
3. Enregistrez l'app avec un nom (ex: "KitchIn Web")
4. **Copiez les clés** et créez un fichier `.env.local` dans `Kitchin/` :

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Installer Firebase

```bash
cd Kitchin
npm install firebase
```

### 5. Configurer les règles Firestore

Allez dans **Firestore Database** → **Rules** et collez :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Households: members can read, owner can write
    match /households/{householdId} {
      allow read: if request.auth != null && 
        resource.data.members.hasAny([request.auth.uid]);
      allow write: if request.auth != null && 
        resource.data.createdBy == request.auth.uid;
    }
    
    // Products: household members can read/write
    match /products/{productId} {
      allow read, write: if request.auth != null;
    }
    
    // Shopping lists: household members can read/write
    match /shoppingLists/{listId} {
      allow read, write: if request.auth != null;
    }
    
    // Invites: anyone can read, creator can write
    match /invites/{inviteId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## ✅ C'est tout !

Une fois configuré, l'application fonctionnera sans problèmes CORS !
