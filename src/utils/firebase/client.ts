import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
// Langue des emails (réinitialisation mot de passe, vérification, etc.)
auth.languageCode = 'fr';
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export types for convenience
export type { Auth, Firestore, FirebaseStorage };

// Export app instance if needed
export default app;
