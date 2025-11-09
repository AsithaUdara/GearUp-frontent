/**
 * Mock Authentication for Testing (Until Auth Service is Ready)
 * Provides mock users for role-based testing
 */

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CUSTOMER' | 'EMPLOYEE';
}

export const MOCK_USERS: Record<string, MockUser> = {
  admin: {
    id: 'admin-001',
    email: 'admin@gearup.com',
    name: 'Admin User',
    role: 'ADMIN',
  },
  // Customers from database
  customer1: {
    id: 'customer-001',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'CUSTOMER',
  },
  customer2: {
    id: 'customer-002',
    email: 'jane@example.com',
    name: 'Jane Smith',
    role: 'CUSTOMER',
  },
  customer3: {
    id: 'customer-003',
    email: 'bob@example.com',
    name: 'Bob Wilson',
    role: 'CUSTOMER',
  },
  customer4: {
    id: 'customer-004',
    email: 'alice@example.com',
    name: 'Alice Johnson',
    role: 'CUSTOMER',
  },
  customer5: {
    id: 'customer-005',
    email: 'david@example.com',
    name: 'David Chen',
    role: 'CUSTOMER',
  },
  customer6: {
    id: 'customer-006',
    email: 'emily@example.com',
    name: 'Emily Brown',
    role: 'CUSTOMER',
  },
  customer7: {
    id: 'customer-007',
    email: 'michael@example.com',
    name: 'Michael Scott',
    role: 'CUSTOMER',
  },
  customer8: {
    id: 'customer-008',
    email: 'sarah@example.com',
    name: 'Sarah Williams',
    role: 'CUSTOMER',
  },
  // Employee
  employee: {
    id: 'employee-001',
    email: 'john.mechanic@gearup.com',
    name: 'John Mechanic',
    role: 'EMPLOYEE',
  },
};

/**
 * Get current mock user from localStorage (for persistence across page reloads)
 * If not set, defaults to customer1 (John Doe - has a PAID bill)
 */
const getMockUserFromStorage = (): MockUser => {
  if (typeof window === 'undefined') return MOCK_USERS.customer1; // SSR default
  
  const stored = localStorage.getItem('mockUser');
  if (stored) {
    const user = MOCK_USERS[stored as keyof typeof MOCK_USERS];
    if (user) return user;
  }
  
  // Default to customer1 (John Doe who has a PAID bill)
  return MOCK_USERS.customer1;
};

export const setMockUser = (userKey: keyof typeof MOCK_USERS) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mockUser', userKey);
  }
};

export const getCurrentMockUser = (): MockUser => {
  return getMockUserFromStorage();
};

export const getMockUserEmail = (): string => {
  return getMockUserFromStorage().email;
};

export const getMockUserRole = (): string => {
  return getMockUserFromStorage().role;
};

export const isAdmin = (): boolean => {
  return getMockUserFromStorage().role === 'ADMIN';
};

export const isCustomer = (): boolean => {
  return getMockUserFromStorage().role === 'CUSTOMER';
};

export const isEmployee = (): boolean => {
  return getMockUserFromStorage().role === 'EMPLOYEE';
};

/**
 * Mock user switcher for testing UI
 * Use this in your dev tools or settings page
 */
export const switchMockUser = (userKey: keyof typeof MOCK_USERS) => {
  setMockUser(userKey);
  console.log(`🔄 Switched to ${MOCK_USERS[userKey].role}: ${MOCK_USERS[userKey].name}`);
};
