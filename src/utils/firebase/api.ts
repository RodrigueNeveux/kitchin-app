import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from './client';

// Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  householdId?: string;
  createdAt: Date;
}

export interface Household {
  id: string;
  name: string;
  createdBy: string;
  members: string[];
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  category: 'fridge' | 'pantry' | 'freezer';
  expiryDate?: string;
  image?: string;
  householdId: string;
  createdAt: Date;
  daysUntilExpiry?: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
  category?: string;
  listId: 'main' | 'next-week' | 'pharmacy';
  householdId: string;
  createdAt: Date;
}

export interface Invite {
  id: string;
  householdId: string;
  createdBy: string;
  expiresAt: Date;
  used: boolean;
  usedBy?: string;
}

// Firebase API Client
export class FirebaseApi {
  // ===== AUTHENTICATION =====
  
  async signup(email: string, password: string, name: string): Promise<UserCredential> {
    try {
      // Créer l'utilisateur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Mettre à jour le profil avec le nom
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Créer le profil utilisateur dans Firestore
      const userProfile: UserProfile = {
        id: userCredential.user.uid,
        email: userCredential.user.email || email,
        name: name,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...userProfile,
        createdAt: serverTimestamp()
      });
      
      // Créer un foyer pour l'utilisateur
      const householdRef = doc(collection(db, 'households'));
      const household: Household = {
        id: householdRef.id,
        name: `Foyer de ${name}`,
        createdBy: userCredential.user.uid,
        members: [userCredential.user.uid],
        createdAt: new Date()
      };
      
      await setDoc(householdRef, {
        ...household,
        createdAt: serverTimestamp()
      });
      
      // Mettre à jour le profil utilisateur avec l'ID du foyer
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        householdId: householdRef.id
      });
      
      return userCredential;
    } catch (error: any) {
      let errorMessage = 'Erreur lors de la création du compte';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible. Utilisez au moins 6 caractères.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide.';
      }
      
      throw new Error(errorMessage);
    }
  }
  
  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      let errorMessage = 'Erreur lors de la connexion';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Veuillez réessayer dans quelques minutes';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide';
      }
      
      throw new Error(errorMessage);
    }
  }
  
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Erreur lors de la déconnexion');
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      let errorMessage = 'Erreur lors de l\'envoi de l\'email de réinitialisation';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte associé à cette adresse email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Réessayez plus tard';
      }
      throw new Error(errorMessage);
    }
  }
  
  getCurrentUser(): User | null {
    return auth.currentUser;
  }
  
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }
  
  // ===== USER PROFILE =====
  
  async getProfile(userId: string): Promise<{ user: UserProfile; household: Household | null; members: UserProfile[] }> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('Profil utilisateur non trouvé');
      }
      
      const userData = userDoc.data();
      const userProfile: UserProfile = {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
        householdId: userData.householdId,
        createdAt: userData.createdAt?.toDate() || new Date()
      };
      
      let household: Household | null = null;
      let members: UserProfile[] = [];
      
      if (userProfile.householdId) {
        const householdDoc = await getDoc(doc(db, 'households', userProfile.householdId));
        
        if (householdDoc.exists()) {
          const householdData = householdDoc.data();
          household = {
            id: householdDoc.id,
            name: householdData.name,
            createdBy: householdData.createdBy,
            members: householdData.members || [],
            createdAt: householdData.createdAt?.toDate() || new Date()
          };
          
          // Récupérer les profils des membres
          const memberPromises = household.members.map(async (memberId: string) => {
            const memberDoc = await getDoc(doc(db, 'users', memberId));
            if (memberDoc.exists()) {
              const memberData = memberDoc.data();
              return {
                id: memberDoc.id,
                email: memberData.email,
                name: memberData.name,
                householdId: memberData.householdId,
                createdAt: memberData.createdAt?.toDate() || new Date()
              };
            }
            return null;
          });
          
          const memberResults = await Promise.all(memberPromises);
          members = memberResults.filter((m): m is UserProfile => m !== null);
        }
      }
      
      return { user: userProfile, household, members };
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la récupération du profil');
    }
  }
  
  async updateUserName(userId: string, name: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), { name });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
    } catch (error: any) {
      throw new Error('Erreur lors de la mise à jour du nom');
    }
  }
  
  // ===== HOUSEHOLD =====
  
  async updateHouseholdName(householdId: string, name: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'households', householdId), { name });
    } catch (error: any) {
      throw new Error('Erreur lors de la mise à jour du nom du foyer');
    }
  }
  
  async createInvite(householdId: string, createdBy: string): Promise<string> {
    try {
      // Générer un code d'invitation unique (6 caractères alphanumériques)
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Créer l'invitation dans Firestore
      const inviteRef = doc(collection(db, 'invites'));
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours
      
      await setDoc(inviteRef, {
        id: inviteCode,
        householdId,
        createdBy,
        expiresAt: Timestamp.fromDate(expiresAt),
        used: false,
        createdAt: serverTimestamp()
      });
      
      return inviteCode;
    } catch (error: any) {
      throw new Error('Erreur lors de la création du code d\'invitation');
    }
  }
  
  async joinHousehold(inviteCode: string, userId: string): Promise<void> {
    try {
      const invitesQuery = query(
        collection(db, 'invites'),
        where('id', '==', inviteCode),
        where('used', '==', false)
      );
      const invitesSnapshot = await getDocs(invitesQuery);
      
      if (invitesSnapshot.empty) {
        throw new Error('Code d\'invitation invalide ou expiré');
      }
      
      const inviteDoc = invitesSnapshot.docs[0];
      const inviteData = inviteDoc.data();
      const expiresAt = inviteData.expiresAt?.toDate();
      if (expiresAt && expiresAt < new Date()) {
        throw new Error('Code d\'invitation expiré');
      }
      
      const newHouseholdId = inviteData.householdId;
      
      // Si l'utilisateur est déjà dans un foyer, le retirer d'abord
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists() && userDoc.data().householdId) {
        const oldHouseholdId = userDoc.data().householdId;
        if (oldHouseholdId !== newHouseholdId) {
          const oldHouseholdDoc = await getDoc(doc(db, 'households', oldHouseholdId));
          if (oldHouseholdDoc.exists()) {
            const oldMembers = oldHouseholdDoc.data().members || [];
            const updatedOldMembers = oldMembers.filter((id: string) => id !== userId);
            await updateDoc(doc(db, 'households', oldHouseholdId), { members: updatedOldMembers });
          }
        }
      }
      
      const householdRef = doc(db, 'households', newHouseholdId);
      const householdDoc = await getDoc(householdRef);
      
      if (!householdDoc.exists()) {
        throw new Error('Foyer non trouvé');
      }
      
      const householdData = householdDoc.data();
      const members = householdData.members || [];
      
      if (members.includes(userId)) {
        await updateDoc(doc(db, 'users', userId), { householdId: newHouseholdId });
        return;
      }
      
      await updateDoc(householdRef, { members: [...members, userId] });
      await updateDoc(doc(db, 'users', userId), { householdId: newHouseholdId });
      await updateDoc(doc(db, 'invites', inviteDoc.id), {
        used: true,
        usedBy: userId,
        usedAt: serverTimestamp()
      });
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la jonction au foyer');
    }
  }
  
  async createHousehold(userId: string, name: string): Promise<string> {
    try {
      const householdRef = doc(collection(db, 'households'));
      const household: Household = {
        id: householdRef.id,
        name: name || 'Mon Foyer',
        createdBy: userId,
        members: [userId],
        createdAt: new Date()
      };
      
      await setDoc(householdRef, {
        ...household,
        createdAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'users', userId), {
        householdId: householdRef.id
      });
      
      return householdRef.id;
    } catch (error: any) {
      throw new Error('Erreur lors de la création du foyer');
    }
  }

  async leaveHousehold(userId: string): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists() || !userDoc.data().householdId) {
        throw new Error('Vous n\'êtes membre d\'aucun foyer');
      }

      const householdId = userDoc.data().householdId;
      const householdDoc = await getDoc(doc(db, 'households', householdId));
      
      if (!householdDoc.exists()) {
        throw new Error('Foyer non trouvé');
      }
      
      const householdData = householdDoc.data();
      
      if (householdData.createdBy === userId) {
        throw new Error('En tant que propriétaire, vous devez transférer le foyer ou le dissoudre avant de partir');
      }
      
      const members = householdData.members || [];
      const updatedMembers = members.filter((id: string) => id !== userId);
      
      await updateDoc(doc(db, 'households', householdId), {
        members: updatedMembers
      });
      
      await updateDoc(doc(db, 'users', userId), {
        householdId: null
      });
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la sortie du foyer');
    }
  }

  async removeMember(householdId: string, memberId: string, currentUserId: string): Promise<void> {
    try {
      // Vérifier que l'utilisateur actuel est le propriétaire
      const householdDoc = await getDoc(doc(db, 'households', householdId));
      
      if (!householdDoc.exists()) {
        throw new Error('Foyer non trouvé');
      }
      
      const householdData = householdDoc.data();
      
      if (householdData.createdBy !== currentUserId) {
        throw new Error('Seul le propriétaire peut retirer des membres');
      }
      
      if (memberId === currentUserId) {
        throw new Error('Vous ne pouvez pas vous retirer vous-même');
      }
      
      // Retirer le membre
      const members = householdData.members || [];
      const updatedMembers = members.filter((id: string) => id !== memberId);
      
      await updateDoc(doc(db, 'households', householdId), {
        members: updatedMembers
      });
      
      // Retirer le householdId du profil utilisateur
      await updateDoc(doc(db, 'users', memberId), {
        householdId: null
      });
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors du retrait du membre');
    }
  }
  
  // ===== PRODUCTS =====
  
  async getProducts(householdId: string): Promise<Product[]> {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('householdId', '==', householdId)
      );
      
      const snapshot = await getDocs(productsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          quantity: data.quantity,
          category: data.category,
          expiryDate: data.expiryDate,
          image: data.image,
          householdId: data.householdId,
          createdAt: data.createdAt?.toDate() || new Date(),
          daysUntilExpiry: data.daysUntilExpiry
        };
      });
    } catch (error: any) {
      throw new Error('Erreur lors de la récupération des produits');
    }
  }
  
  async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
    try {
      const productRef = doc(collection(db, 'products'));
      await setDoc(productRef, {
        ...product,
        createdAt: serverTimestamp()
      });
      return productRef.id;
    } catch (error: any) {
      throw new Error('Erreur lors de l\'ajout du produit');
    }
  }
  
  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    try {
      await updateDoc(doc(db, 'products', productId), updates);
    } catch (error: any) {
      throw new Error('Erreur lors de la mise à jour du produit');
    }
  }
  
  async deleteProduct(productId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error: any) {
      throw new Error('Erreur lors de la suppression du produit');
    }
  }
  
  // ===== SHOPPING LISTS =====
  
  async getShoppingLists(householdId: string): Promise<{ main: ShoppingItem[]; 'next-week': ShoppingItem[]; pharmacy: ShoppingItem[] }> {
    try {
      const listsQuery = query(
        collection(db, 'shoppingLists'),
        where('householdId', '==', householdId)
      );
      
      const snapshot = await getDocs(listsQuery);
      
      const allItems: ShoppingItem[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          quantity: data.quantity,
          checked: data.checked || false,
          category: data.category,
          listId: data.listId,
          householdId: data.householdId,
          createdAt: data.createdAt?.toDate() || new Date()
        };
      });
      
      return {
        main: allItems.filter(item => item.listId === 'main'),
        'next-week': allItems.filter(item => item.listId === 'next-week'),
        pharmacy: allItems.filter(item => item.listId === 'pharmacy')
      };
    } catch (error: any) {
      throw new Error('Erreur lors de la récupération des listes de courses');
    }
  }
  
  async addShoppingItem(item: Omit<ShoppingItem, 'id' | 'createdAt'>): Promise<string> {
    try {
      const itemRef = doc(collection(db, 'shoppingLists'));
      await setDoc(itemRef, {
        ...item,
        createdAt: serverTimestamp()
      });
      return itemRef.id;
    } catch (error: any) {
      throw new Error('Erreur lors de l\'ajout de l\'article');
    }
  }
  
  async updateShoppingItem(itemId: string, updates: Partial<ShoppingItem>): Promise<void> {
    try {
      await updateDoc(doc(db, 'shoppingLists', itemId), updates);
    } catch (error: any) {
      throw new Error('Erreur lors de la mise à jour de l\'article');
    }
  }
  
  async deleteShoppingItem(itemId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'shoppingLists', itemId));
    } catch (error: any) {
      throw new Error('Erreur lors de la suppression de l\'article');
    }
  }
}

// Export singleton instance
export const firebaseApi = new FirebaseApi();
