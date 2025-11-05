// app/admin/users/page.tsx
'use client';
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import UsersToolbar from '@/app/components/admin/UsersToolbar';
import UsersTable from '@/app/components/admin/UsersTable';
import UserEditModal from '@/app/components/admin/UserEditModal';
import { useAdminUsers } from '@/hooks/useAdminUsers';

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'Customer' | 'Employee' | 'Admin';
  status: 'Active' | 'Deactivated';
  lastLogin: string;
};

export default function UsersPage() {
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
    try {
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
        role: u.role,
        status: u.status,
        lastLogin: u.lastLoginAt || new Date().toISOString()
      }));
      
      setUsers(transformedUsers);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  const handleSuccess = () => {
    loadUsers(); // Refresh the list after create/update
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
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
      <h1 className="font-heading text-3xl font-bold">User Management</h1>
      <p className="mt-1 text-muted-foreground">View, filter, and manage all users in the system.</p>
      
      {/* Loading State */}
      {loading && users.length === 0 && (
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
      {(!loading || users.length > 0) && !error && (
        <>
          <div className="mt-8">
            <UsersToolbar 
              onNewUser={handleNewUser} 
              onSearch={setSearchQuery}
              onFilterRole={setRoleFilter}
              currentRole={roleFilter}
            />
          </div>
          <div className="mt-6">
            <UsersTable 
              users={filteredUsers}
              onEditUser={handleEditUser} 
              onDeleteUser={handleDeleteUser} 
            />
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
    </motion.div>
  );
}
