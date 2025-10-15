import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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





