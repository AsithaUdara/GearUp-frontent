// src/lib/authService.ts
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

// Default to API Gateway on 9090; override with NEXT_PUBLIC_API_BASE_URL if set
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9090';

// Backend response structures
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
interface RoleResponse {
  id: number;
  name: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
}

interface BackendUserResponse {
  id: number;
  firebaseUid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  photoUrl?: string;
  accountStatus: string;
  roles: RoleResponse[];
  createdAt?: string;
  lastLoginAt?: string;
}

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
  accountStatus: string;
  phoneNumber?: string;
}

export interface LoginResponse {
  user: UserProfile;
  token: string;
  dashboardPath: string;
}

/**
 * Login user with email and password
 * Returns user profile and appropriate dashboard path based on role
 */
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  try {
    // Step 1: Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    // Step 2: Get user profile from backend
    console.log('Fetching user profile from:', `${API_BASE_URL}/api/v1/users/profile`);
    console.log('Using token:', idToken.substring(0, 20) + '...');
    
    let response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });

    console.log('Response status:', response.status);
    // If user does not exist in backend yet, auto-register then retry profile
    if (response.status === 404) {
      console.warn('User profile not found in backend (404). Attempting auto-registration...');
      const u = userCredential.user;
      const registerBody = {
        firebaseUid: u.uid,
        email: u.email ?? email,
        displayName: u.displayName || (u.email ? u.email.split('@')[0] : 'Customer'),
        phoneNumber: u.phoneNumber || undefined,
        photoUrl: u.photoURL || undefined,
        role: 'CUSTOMER'
      };
      const regRes = await fetch(`${API_BASE_URL}/api/v1/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerBody),
        mode: 'cors'
      });
      if (!regRes.ok && regRes.status !== 409) {
        let regMsg = `HTTP ${regRes.status}`;
        try {
          const regJson = await regRes.json();
          regMsg = regJson?.message || regMsg;
        } catch {}
        throw new Error(`Failed to auto-register user: ${regMsg}`);
      }
      console.log('Auto-registration complete. Retrying profile fetch...');
      response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
    }

    if (!response.ok) {
      // Try to parse JSON error first
      let errMsg = `HTTP ${response.status}`;
      try {
        const errJson = await response.json();
        if (typeof errJson === 'string') errMsg = errJson;
        else if (errJson?.message) errMsg = errJson.message;
        else if (errJson?.error) errMsg = errJson.error;
      } catch {
        const errorText = await response.text().catch(() => '');
        if (errorText) errMsg = errorText;
      }

      // Fallback: If backend profile fails but email is recognized as admin, allow immediate admin redirect.
      const emailLower = (userCredential.user.email || email).toLowerCase();
      const looksAdmin = ADMIN_EMAILS.includes(emailLower) || emailLower.startsWith('admin@');
      if (looksAdmin) {
        console.warn('Profile fetch failed but email matches admin pattern; applying admin fallback redirect. Reason:', errMsg);
        return {
          user: {
            id: -1, // unknown until profile succeeds later
            email: userCredential.user.email || email,
            firstName: 'Admin',
            lastName: '',
            role: 'ADMIN',
            accountStatus: 'UNKNOWN'
          },
            token: idToken,
            dashboardPath: '/admin/dashboard'
        };
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error('You are not authorized to access this resource. Please sign in with an admin account.');
      }
      throw new Error(`Failed to fetch user profile: ${errMsg}`);
    }

    // Parse the backend ApiResponse wrapper
    const apiResponse: BackendApiResponse<BackendUserResponse> = await response.json();
    
    // DEBUG: Log the actual response structure
    console.log('Full API response:', apiResponse);
    console.log('Backend user data:', apiResponse.data);
    console.log('User roles:', apiResponse.data.roles);

    if (!apiResponse.success || !apiResponse.data) {
      throw new Error('Invalid response from backend');
    }

    const backendUser = apiResponse.data;
    
    // Extract the primary role (first role in the array)
    const primaryRole = backendUser.roles && backendUser.roles.length > 0 
      ? backendUser.roles[0].name 
      : 'CUSTOMER';
    
    console.log('Primary role extracted:', primaryRole);
    
    // Map backend response to frontend UserProfile
    const userProfile: UserProfile = {
      id: backendUser.id,
      email: backendUser.email,
      firstName: backendUser.displayName?.split(' ')[0] || '',
      lastName: backendUser.displayName?.split(' ').slice(1).join(' ') || '',
      role: primaryRole,
      accountStatus: backendUser.accountStatus,
      phoneNumber: backendUser.phoneNumber
    };

    console.log('Mapped user profile:', userProfile);

    // Step 3: Determine dashboard path based on role
    // NOTE: employees should go to the top-level /employee route (not /employee/dashboard)
    let dashboardPath = '/customer/dashboard';

    switch (userProfile.role) {
      case 'ADMIN':
        dashboardPath = '/admin/dashboard';
        break;
      case 'EMPLOYEE':
        // Redirect employees to the employee root as requested
        dashboardPath = '/employee';
        break;
      case 'CUSTOMER':
        dashboardPath = '/customer/dashboard';
        break;
      default:
        console.warn('Unknown role, defaulting to customer dashboard:', userProfile.role);
        dashboardPath = '/customer/dashboard';
    }
    
    console.log('Redirecting to:', dashboardPath);
    console.log('Role-based routing:', userProfile.role, '->', dashboardPath);

    return {
      user: userProfile,
      token: idToken,
      dashboardPath
    };
  } catch (error) {
    console.error('Login error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error,
      apiUrl: API_BASE_URL
    });
    
    if (error instanceof Error) {
      // Check if it's a network error
      if (error.message.includes('fetch')) {
        // For admin users, allow login even if backend is down
        const currentUser = auth.currentUser;
        if (currentUser) {
          const emailLower = (currentUser.email || '').toLowerCase();
          const looksAdmin = ADMIN_EMAILS.includes(emailLower) || emailLower.startsWith('admin@');
          if (looksAdmin) {
            console.warn('Backend fetch failed but user is admin; applying admin fallback.');
            return {
              user: {
                id: -1,
                email: currentUser.email || '',
                firstName: 'Admin',
                lastName: '',
                role: 'ADMIN',
                accountStatus: 'UNKNOWN'
              },
              token: await currentUser.getIdToken(),
              dashboardPath: '/admin/dashboard'
            };
          }
        }
        throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running.`);
      }
      throw error;
    }
    throw new Error('Login failed. Please check your credentials.');
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
}

/**
 * Get current Firebase ID token
 */
export async function getCurrentToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch (error) {
    console.error('Get token error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}
