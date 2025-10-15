import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Process private key - handle both literal newlines and escaped \n
const getPrivateKey = () => {
  const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!key) return undefined;
  
  // If the key contains literal \n, replace them with actual newlines
  if (key.includes('\\n')) {
    return key.replace(/\\n/g, '\n');
  }
  
  // If it's already properly formatted, return as is
  return key;
};

// Lazy initialization function
let adminApp: App | null = null;
let adminDbInstance: Firestore | null = null;
let adminAuthInstance: Auth | null = null;
let adminStorageInstance: any = null;

function initializeFirebaseAdmin() {
  if (adminApp) return adminApp;
  
  const firebaseAdminConfig = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: getPrivateKey(),
  };

  // Only initialize if all credentials are available
  if (firebaseAdminConfig.projectId && firebaseAdminConfig.clientEmail && firebaseAdminConfig.privateKey) {
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert(firebaseAdminConfig),
        projectId: firebaseAdminConfig.projectId,
      });
    } else {
      adminApp = getApps()[0];
    }
    
    adminDbInstance = getFirestore(adminApp);
    adminAuthInstance = getAuth(adminApp);
    adminStorageInstance = getStorage(adminApp);
  }
  
  return adminApp;
}

// Export getters that initialize on first use
export const adminDb = new Proxy({} as Firestore, {
  get(target, prop) {
    if (!adminDbInstance) {
      initializeFirebaseAdmin();
    }
    return adminDbInstance ? (adminDbInstance as any)[prop] : undefined;
  }
});

export const adminAuth = new Proxy({} as Auth, {
  get(target, prop) {
    if (!adminAuthInstance) {
      initializeFirebaseAdmin();
    }
    return adminAuthInstance ? (adminAuthInstance as any)[prop] : undefined;
  }
});

export const adminStorage = new Proxy({} as any, {
  get(target, prop) {
    if (!adminStorageInstance) {
      initializeFirebaseAdmin();
    }
    return adminStorageInstance ? adminStorageInstance[prop] : undefined;
  }
});

export default adminApp;





