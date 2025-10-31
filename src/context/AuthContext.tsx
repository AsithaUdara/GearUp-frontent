// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { onAuthStateChanged, User, reload } from 'firebase/auth';
// import { auth } from '@/lib/firebase';

// Mock User interface until Firebase is properly installed
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Mock auth state changed function
const mockOnAuthStateChanged = (mockAuth: unknown, callback: (user: User | null) => void) => {
  // Return a mock user for development
  setTimeout(() => {
    callback(null); // No user logged in by default
  }, 100);
  
  return () => {}; // Mock unsubscribe function
};

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
    const unsubscribe = mockOnAuthStateChanged(null, (user: User | null) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      // setUser to trigger re-render with updated profile
      setUser(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
