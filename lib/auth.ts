import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserRole } from '@/types';

export class AuthService {
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }
      
      return userDoc.data() as User;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (!firebaseUser) {
          resolve(null);
          unsubscribe();
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            resolve(userDoc.data() as User);
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error('Get current user error:', error);
          resolve(null);
        }
        
        unsubscribe();
      });
    });
  }

  static hasPermission(user: User, requiredRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      staff: 1,
      admin: 2,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  static canAccess(user: User, resource: string): boolean {
    // Admin can access everything
    if (user.role === 'admin') {
      return true;
    }

    // Staff can access most resources except settings
    if (user.role === 'staff') {
      const restrictedResources = ['settings', 'users'];
      return !restrictedResources.includes(resource);
    }

    return false;
  }
}





