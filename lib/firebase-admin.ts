import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Check if we're in build phase (only during actual build, not runtime)
const isBuildPhase = 
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.npm_lifecycle_event === 'build';

// Process private key - handle both literal newlines and escaped \n
const getPrivateKey = () => {
  if (isBuildPhase) return undefined;
  
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
  // Skip initialization during build time
  if (isBuildPhase) {
    console.log('Skipping Firebase Admin initialization during build phase');
    return null;
  }
  
  if (adminApp) return adminApp;
  
  const firebaseAdminConfig = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: getPrivateKey(),
  };

  // Log what's missing for debugging
  if (!firebaseAdminConfig.projectId) {
    console.error('Missing FIREBASE_ADMIN_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  }
  if (!firebaseAdminConfig.clientEmail) {
    console.error('Missing FIREBASE_ADMIN_CLIENT_EMAIL');
  }
  if (!firebaseAdminConfig.privateKey) {
    console.error('Missing FIREBASE_ADMIN_PRIVATE_KEY');
  }

  // Only initialize if all credentials are available and valid
  if (firebaseAdminConfig.projectId && 
      firebaseAdminConfig.clientEmail && 
      firebaseAdminConfig.privateKey && 
      firebaseAdminConfig.privateKey.length > 100) { // Basic validation for private key
    try {
      if (getApps().length === 0) {
        adminApp = initializeApp({
          credential: cert(firebaseAdminConfig),
          projectId: firebaseAdminConfig.projectId,
        });
        console.log('Firebase Admin initialized successfully');
      } else {
        adminApp = getApps()[0];
      }
      
      adminDbInstance = getFirestore(adminApp);
      adminAuthInstance = getAuth(adminApp);
      adminStorageInstance = getStorage(adminApp);
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
      return null;
    }
  } else {
    console.error('Firebase Admin credentials not available or invalid - using mock implementation');
    console.error('Environment check:', {
      hasProjectId: !!firebaseAdminConfig.projectId,
      hasClientEmail: !!firebaseAdminConfig.clientEmail,
      hasPrivateKey: !!firebaseAdminConfig.privateKey,
      privateKeyLength: firebaseAdminConfig.privateKey?.length || 0,
    });
  }
  
  return adminApp;
}

// Mock implementations for build phase
const mockDb = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve(),
    }),
    add: () => Promise.resolve({ id: 'mock-id' }),
    get: () => Promise.resolve({ docs: [] }),
    where: () => ({
      get: () => Promise.resolve({ docs: [] }),
    }),
  }),
};

const mockAuth = {
  verifyIdToken: () => Promise.resolve({ uid: 'mock-uid' }),
  getUser: () => Promise.resolve({ uid: 'mock-uid' }),
};

const mockStorage = {
  bucket: () => ({
    file: () => ({
      save: () => Promise.resolve(),
      delete: () => Promise.resolve(),
    }),
  }),
};

// Export getters that initialize on first use
export const adminDb = new Proxy({} as Firestore, {
  get(target, prop) {
    if (isBuildPhase) {
      return (mockDb as any)[prop];
    }
    if (!adminDbInstance) {
      initializeFirebaseAdmin();
    }
    return adminDbInstance ? (adminDbInstance as any)[prop] : (mockDb as any)[prop];
  }
});

export const adminAuth = new Proxy({} as Auth, {
  get(target, prop) {
    if (isBuildPhase) {
      return (mockAuth as any)[prop];
    }
    if (!adminAuthInstance) {
      initializeFirebaseAdmin();
    }
    return adminAuthInstance ? (adminAuthInstance as any)[prop] : (mockAuth as any)[prop];
  }
});

export const adminStorage = new Proxy({} as any, {
  get(target, prop) {
    if (isBuildPhase) {
      return (mockStorage as any)[prop];
    }
    if (!adminStorageInstance) {
      initializeFirebaseAdmin();
    }
    return adminStorageInstance ? adminStorageInstance[prop] : (mockStorage as any)[prop];
  }
});

export default adminApp;





