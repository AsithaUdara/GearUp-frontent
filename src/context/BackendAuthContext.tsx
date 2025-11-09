/**
 * Backend Auth Context Provider
 * 
 * Replaces Firebase Auth context with backend JWT authentication
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as backendAuth from '@/lib/backendAuth';

type AuthUser = backendAuth.AuthUser;

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, phone?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function BackendAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // On mount, check for stored user and verify token
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = backendAuth.getStoredUser();
      const token = backendAuth.getToken();

      if (storedUser && token) {
        try {
          // Verify token is still valid
          const verified = await backendAuth.verifyToken(token);
          setUser(verified);
        } catch (error) {
          console.warn('Token verification failed, clearing session:', error);
          backendAuth.logout();
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: authUser } = await backendAuth.login({ email, password });
      setUser(authUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string, phone?: string) => {
    setLoading(true);
    try {
      const { user: authUser } = await backendAuth.register({ email, password, displayName, phone });
      setUser(authUser);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    backendAuth.logout();
    setUser(null);
    router.push('/');
  };

  const refreshUser = async () => {
    const token = backendAuth.getToken();
    if (!token) return;

    try {
      const verified = await backendAuth.verifyToken(token);
      setUser(verified);
    } catch (error) {
      console.warn('User refresh failed:', error);
      backendAuth.logout();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within BackendAuthProvider');
  }
  return context;
}
