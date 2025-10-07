// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };