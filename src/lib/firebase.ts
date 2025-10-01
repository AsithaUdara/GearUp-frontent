// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Helper to load required env var (build-time for Next public vars)
function req(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

// All NEXT_PUBLIC_* keys are safe for the client – Firebase requires them to initialize.
const firebaseConfig = {
  apiKey: req('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: req('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: req('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: req('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: req('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: req('NEXT_PUBLIC_FIREBASE_APP_ID'),
  // measurementId may be optional (Analytics). Only set if present.
  ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID && { measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID })
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };