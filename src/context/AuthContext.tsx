// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, reload } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, refreshUser: async () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email || 'No user');
      if (firebaseUser) {
        console.log('Firebase UID:', firebaseUser.uid);
      }
      setUser(firebaseUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (!auth.currentUser) return;
    await reload(auth.currentUser);
    // After reload, onAuthStateChanged will fire automatically
    setUser(auth.currentUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
