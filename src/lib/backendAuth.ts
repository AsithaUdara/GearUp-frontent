/**
 * Backend Authentication Service Client
 * 
 * Handles login, register, JWT token management
 * Replaces Firebase Authentication
 */

'use client';

const AUTH_API_BASE = process.env.NEXT_PUBLIC_GATEWAY_BASE || 'http://localhost:9090';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: 'CUSTOMER' | 'ADMIN' | 'EMPLOYEE';
  photoURL?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
};

/**
 * Login with email/password via backend User Auth Service
 */
export async function login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
  const res = await fetch(`${AUTH_API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Login failed');
  }

  const data = await res.json();
  
  // Store JWT token in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
  }

  return data;
}

/**
 * Register new user via backend User Auth Service
 */
export async function register(userData: RegisterData): Promise<{ user: AuthUser; token: string }> {
  const res = await fetch(`${AUTH_API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Registration failed');
  }

  const data = await res.json();
  
  // Store JWT token in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
  }

  return data;
}

/**
 * Logout - clear local storage
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}

/**
 * Get stored JWT token
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

/**
 * Get stored user data
 */
export function getStoredUser(): AuthUser | null {
  if (typeof window !== 'undefined') {
    const userJson = localStorage.getItem('auth_user');
    if (userJson) {
      try {
        return JSON.parse(userJson) as AuthUser;
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Verify token with backend (optional - for session validation)
 */
export async function verifyToken(token: string): Promise<AuthUser> {
  const res = await fetch(`${AUTH_API_BASE}/auth/verify`, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (!res.ok) {
    throw new Error('Token invalid or expired');
  }

  return await res.json();
}

/**
 * Refresh token (if backend supports it)
 */
export async function refreshToken(): Promise<string> {
  const currentToken = getToken();
  if (!currentToken) throw new Error('No token to refresh');

  const res = await fetch(`${AUTH_API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${currentToken}`,
      'Content-Type': 'application/json'
    },
  });

  if (!res.ok) {
    throw new Error('Token refresh failed');
  }

  const data = await res.json();
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', data.token);
  }

  return data.token;
}
