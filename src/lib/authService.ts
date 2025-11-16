/**
 * Authentication Service
 *
 * Provides authentication utilities for the application
 */

import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebase';

// Default to API Gateway on 9090; override with NEXT_PUBLIC_API_BASE_URL if set
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9090';

/**
 * Sign in user with email and password
 * Returns dashboard path based on user role
 */
export async function loginUser(email: string, password: string): Promise<{ dashboardPath: string }> {
  try {
    // Sign in with Firebase
    await signInWithEmailAndPassword(auth, email, password);

    // Get user profile from backend to determine role
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error('Failed to get authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    const user = data.data;
    const roles = user.roles || [];

    // Determine dashboard path based on highest role priority
    let dashboardPath = '/dashboard'; // default

    if (roles.some((role: any) => role.name === 'ADMIN')) {
      dashboardPath = '/admin';
    } else if (roles.some((role: any) => role.name === 'EMPLOYEE')) {
      dashboardPath = '/employee';
    } else if (roles.some((role: any) => role.name === 'CUSTOMER')) {
      dashboardPath = '/customer';
    }

    return { dashboardPath };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}