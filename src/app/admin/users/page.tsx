// app/admin/users/page.tsx
'use client';
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import UsersToolbar from '@/app/components/admin/UsersToolbar';
import UsersTable from '@/app/components/admin/UsersTable';
import UserEditModal from '@/app/components/admin/UserEditModal';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'Customer' | 'Employee' | 'Admin' | 'No Role'; // Handle users without roles
  status: 'Active' | 'Deactivated';
  lastLogin: string;
};

export default function UsersPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { getAllUsers, loading, error } = useAdminUsers();
  const [users, setUsers] = useState<User[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Load users from backend
  const loadUsers = async () => {
    // Wait for auth to be ready
    if (authLoading) {
      console.log('Waiting for authentication...');
      return;
    }
    
    // Check if user is authenticated
    if (!authUser && !auth.currentUser) {
      console.log('No authenticated user');
      return;
    }
    
    try {
      console.log('Loading users...');
      const result = await getAllUsers({
        page,
        size: 100, // Get more users for client-side filtering
        search: undefined,
        role: undefined,
        status: undefined
      });
      
      // Transform backend data to match frontend User type
      const transformedUsers: User[] = result.content.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role, // Keep the backend value (including "No Role")
        status: u.status,
        lastLogin: u.lastLoginAt || new Date().toISOString()
      }));
      
      setUsers(transformedUsers);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  // Load users when auth is ready and page changes
  useEffect(() => {
    if (!authLoading) {
      loadUsers();
    }
  }, [page, authLoading, authUser]);

  const handleSuccess = () => {
    loadUsers(); // Refresh the list after create/update
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
      // Case-insensitive role comparison to handle ADMIN vs Admin, EMPLOYEE vs Employee, etc.
      const matchesRole = roleFilter === 'All Roles' || 
                          user.role.toUpperCase() === roleFilter.toUpperCase();
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const handleNewUser = () => {
    setEditingUser(null);
    setIsEditModalOpen(true);
  };
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        const { deleteUser } = useAdminUsers();
        await deleteUser(userToDelete.id);
        alert(`User ${userToDelete.name} deleted successfully!`);
        await loadUsers(); // Refresh the list
      } catch (err) {
        console.error('Failed to delete user:', err);
        alert('Failed to delete user');
      }
    }
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">View, filter, and manage all users in the system.</p>
        </div>

        {/* Auth Loading State */}
      {authLoading && (
          <div className="mt-8 flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">Authenticating...</div>
          </div>
      )}
      
      {/* Loading State */}
      {!authLoading && loading && users.length === 0 && (
        <div className="mt-8 flex items-center justify-center py-12">
          <div className="text-lg text-muted-foreground">Loading users...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-8 rounded-lg bg-red-50 p-4 text-red-600">
          <p className="font-semibold">Error loading users</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={loadUsers}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

        {/* Content */}
        {!authLoading && (!loading || users.length > 0) && !error && (
          <>
            <div className="mb-6">
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                <UsersToolbar 
                  onNewUser={handleNewUser} 
                  onSearch={setSearchQuery}
                  onFilterRole={setRoleFilter}
                  currentRole={roleFilter}
                />
              </div>
            </div>

            <div>
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                <UsersTable 
                  users={filteredUsers}
                  onEditUser={handleEditUser} 
                  onDeleteUser={handleDeleteUser} 
                />
              </div>
            </div>
          </>
        )}
      
      <UserEditModal 
        user={editingUser}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleSuccess}
      />
      
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >
            <h3 className="mb-4 text-lg font-semibold text-foreground">Confirm Delete</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Are you sure you want to delete user <span className="font-semibold">{userToDelete.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </motion.div>
  );
}
