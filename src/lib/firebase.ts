// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// IMPORTANT: For client bundles, Next.js only inlines env vars when referenced statically
// as process.env.NEXT_PUBLIC_*. Dynamic indexing like process.env[name] will be undefined
// in the browser. Keep access static and validate values explicitly.
function reqPublic(v: string | undefined, name: string): string {
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

// Statically reference each env var so Next can inline them in the client build.
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID; // optional

// All NEXT_PUBLIC_* keys are safe for the client – Firebase requires them to initialize.
const firebaseConfig = {
  apiKey: reqPublic(API_KEY, 'NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: reqPublic(AUTH_DOMAIN, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: reqPublic(PROJECT_ID, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: reqPublic(STORAGE_BUCKET, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: reqPublic(MESSAGING_SENDER_ID, 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: reqPublic(APP_ID, 'NEXT_PUBLIC_FIREBASE_APP_ID'),
  // measurementId may be optional (Analytics). Only set if present.
  ...(MEASUREMENT_ID && { measurementId: MEASUREMENT_ID })
} as const;

// Initialize Firebase app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const authInstance = getAuth(app);
const dbInstance = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

// Enable offline persistence if in browser environment
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(dbInstance).catch((err) => {
    // Ignore persistence errors (e.g., multiple tabs). Firestore will still work without persistence.
    console.warn('Firestore persistence not enabled', err?.code || err);
  });
}

const storageInstance = getStorage(app);

// Enable Firebase auth persistence to keep user logged in across page refreshes
setPersistence(authInstance, browserLocalPersistence).catch((error) => {
  console.error('Failed to set Firebase persistence:', error);
});

// Export Firebase instances for client components
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance as FirebaseStorage;
