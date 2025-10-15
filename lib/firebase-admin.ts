import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
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

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: getPrivateKey(),
};

// Initialize Firebase Admin only if credentials are available
let adminApp;
if (firebaseAdminConfig.projectId && firebaseAdminConfig.clientEmail && firebaseAdminConfig.privateKey) {
  adminApp = getApps().length === 0 
    ? initializeApp({
        credential: cert(firebaseAdminConfig),
        projectId: firebaseAdminConfig.projectId,
      })
    : getApps()[0];
} else {
  // For build time when env vars might not be available
  adminApp = getApps()[0] || null;
}

// Initialize Firebase Admin services
export const adminDb = adminApp ? getFirestore(adminApp) : null as any;
export const adminAuth = adminApp ? getAuth(adminApp) : null as any;
export const adminStorage = adminApp ? getStorage(adminApp) : null as any;

export default adminApp;





