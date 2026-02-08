// Configuration Firebase
// Remplacez ces valeurs par vos clés Firebase depuis https://console.firebase.google.com

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Instructions pour obtenir les clés :
// 1. Allez sur https://console.firebase.google.com
// 2. Créez un projet ou sélectionnez un projet existant
// 3. Allez dans Project Settings (⚙️) → Your apps → Web (</>)
// 4. Copiez les valeurs de firebaseConfig
// 5. Créez un fichier .env.local avec :
//    VITE_FIREBASE_API_KEY=your_api_key
//    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
//    VITE_FIREBASE_PROJECT_ID=your_project_id
//    VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
//    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
//    VITE_FIREBASE_APP_ID=your_app_id
