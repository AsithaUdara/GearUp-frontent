// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
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

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;
let storageInstance: FirebaseStorage | undefined;

if (typeof window !== 'undefined') {
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

  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
  storageInstance = getStorage(app);
  
  // Enable Firebase auth persistence to keep user logged in across page refreshes
  setPersistence(authInstance, browserLocalPersistence).catch((error) => {
    console.error('Failed to set Firebase persistence:', error);
  });
}

// For TypeScript consumers that import { auth } in client components, keep the
// type as Auth while avoiding SSR initialization. This assertion is safe
// because all usages are in 'use client' boundaries.
export { app };
export const auth = authInstance as unknown as ReturnType<typeof getAuth>;
export const db = dbInstance as unknown as Firestore;
export const storage = storageInstance as unknown as FirebaseStorage;
