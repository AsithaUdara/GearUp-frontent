// hooks/useAdminUsers.ts
import { useState } from 'react';
import { auth } from '@/lib/firebase';

// Default to API Gateway on 8080; override with NEXT_PUBLIC_API_BASE_URL if set
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const ADMIN_USERS_ENDPOINT = `${API_BASE_URL}/api/v1/admin/users`;

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'Admin' | 'Employee' | 'Customer' | 'No Role'; // Handle No Role case
  status: 'Active' | 'Deactivated';
  createdAt: string;
  lastLoginAt?: string;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

interface UserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  deactivatedUsers: number;
  totalCustomers: number;
  totalEmployees: number;
  totalAdmins: number;
  newUsersThisMonth: number;
  newUsersToday: number;
  usersByRole: Record<string, number>;
  usersByStatus: Record<string, number>;
}

export function useAdminUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return await user.getIdToken();
  };

  const getAllUsers = async (params: {
    page?: number;
    size?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PageResponse<AdminUser>> => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const queryParams = new URLSearchParams();
      
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.size !== undefined) queryParams.append('size', params.size.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.status) queryParams.append('status', params.status);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDir) queryParams.append('sortDir', params.sortDir);

      const response = await fetch(
        `${ADMIN_USERS_ENDPOINT}?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        let errMsg = 'Failed to fetch users';
        try {
          const errorData = await response.json();
          if (errorData?.message) errMsg = errorData.message;
          else if (errorData?.error) errMsg = errorData.error;
        } catch { /* swallow */ }
        if (response.status === 401 || response.status === 403) {
          errMsg = 'Unauthorized: ensure you are logged in as an admin user.';
        }
        throw new Error(errMsg);
      }
      
      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserById = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const response = await fetch(`${ADMIN_USERS_ENDPOINT}/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized: admin privileges required.');
        }
        throw new Error('Failed to fetch user');
      }
      
      const result = await response.json();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (data: {
    email: string;
    name: string;
    role: 'ADMIN' | 'EMPLOYEE';
    phoneNumber?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      console.log('Creating employee with data:', data);
      
      const response = await fetch(`${ADMIN_USERS_ENDPOINT}/employees`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errMsg = `Failed to create employee (${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData?.message) errMsg = errorData.message;
          else if (errorData?.error) errMsg = errorData.error;
        } catch { /* ignore */ }
        if (response.status === 401 || response.status === 403) {
          errMsg = 'Unauthorized: admin privileges required to create employees.';
        }
        console.error('Error response:', errMsg);
        throw new Error(errMsg);
      }
      
      const result = await response.json();
      console.log('Success response:', result);
      return result.data;
    } catch (err) {
      console.error('Create employee error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: number, data: {
    email?: string;
    role: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
    status: 'Active' | 'Deactivated';
  }) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const response = await fetch(`${ADMIN_USERS_ENDPOINT}/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        let errMsg = 'Failed to update user';
        try {
          const errorData = await response.json();
          if (errorData?.message) errMsg = errorData.message;
          else if (errorData?.error) errMsg = errorData.error;
        } catch { }
        if (response.status === 401 || response.status === 403) {
          errMsg = 'Unauthorized: admin privileges required to update user.';
        }
        throw new Error(errMsg);
      }
      
      const result = await response.json();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserName = async (userId: number, data: { name: string }) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      console.log('[updateUserName] Calling PATCH', `${ADMIN_USERS_ENDPOINT}/${userId}/name`, data);
      const response = await fetch(`${ADMIN_USERS_ENDPOINT}/${userId}/name`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      console.log('[updateUserName] Response status:', response.status);

      if (!response.ok) {
        let errMsg = 'Failed to update name';
        try {
          const errorData = await response.json();
          console.error('[updateUserName] Error response:', errorData);
          if (errorData?.message) errMsg = errorData.message;
          else if (errorData?.error) errMsg = errorData.error;
        } catch (parseErr) { 
          console.error('[updateUserName] Could not parse error response', parseErr);
        }
        if (response.status === 401 || response.status === 403) {
          errMsg = 'Unauthorized: admin privileges required to update name.';
        }
        throw new Error(errMsg);
      }

      const result = await response.json();
      console.log('[updateUserName] Success:', result);
      return result.data;
    } catch (err) {
      console.error('[updateUserName] Exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deactivateUser = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${ADMIN_USERS_ENDPOINT}/${userId}/deactivate`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized: admin privileges required to deactivate user.');
        }
        throw new Error('Failed to deactivate user');
      }
      
      const result = await response.json();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const activateUser = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${ADMIN_USERS_ENDPOINT}/${userId}/activate`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized: admin privileges required to activate user.');
        }
        throw new Error('Failed to activate user');
      }
      
      const result = await response.json();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const response = await fetch(`${ADMIN_USERS_ENDPOINT}/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized: admin privileges required to delete user.');
        }
        throw new Error('Failed to delete user');
      }
      
      const result = await response.json();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserStats = async (): Promise<UserStatsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const response = await fetch(`${ADMIN_USERS_ENDPOINT}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized: admin privileges required to view stats.');
        }
        throw new Error('Failed to fetch stats');
      }
      
      const result = await response.json();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getAllUsers,
    getUserById,
    createEmployee,
    updateUser,
    updateUserName,
    deactivateUser,
    activateUser,
    deleteUser,
    getUserStats
  };
}
