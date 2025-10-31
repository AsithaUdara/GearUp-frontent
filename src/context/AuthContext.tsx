// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
<<<<<<< Updated upstream
import { onAuthStateChanged, User, reload } from 'firebase/auth';
=======
import { onAuthStateChanged, type User, reload } from 'firebase/auth';
>>>>>>> Stashed changes
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, refreshUser: async () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
<<<<<<< Updated upstream
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
=======
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
>>>>>>> Stashed changes
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (!auth.currentUser) return;
    await reload(auth.currentUser);
    // After reload, onAuthStateChanged won't fire automatically; manually set
    setUser({ ...auth.currentUser });
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
