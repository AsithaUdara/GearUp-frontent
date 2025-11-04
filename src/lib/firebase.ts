// src/lib/firebase.ts
// Mock Firebase configuration until real Firebase is set up
// import { initializeApp, getApps, getApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';

// Mock Firebase app and auth objects for development
const mockApp = {
  name: '[DEFAULT]',
  options: {},
};

const mockAuth = {
  app: mockApp,
  currentUser: null,
};

// Export mock objects that match Firebase interface
export { mockApp as app, mockAuth as auth };
