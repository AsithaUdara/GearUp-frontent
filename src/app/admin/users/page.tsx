// app/admin/users/page.tsx
'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import UsersToolbar from '@/app/components/admin/UsersToolbar';
import UsersTable from '@/app/components/admin/UsersTable';
import UserEditModal from '@/app/components/admin/UserEditModal';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Customer' | 'Employee' | 'Admin';
  status: 'Active' | 'Deactivated';
  lastLogin: string;
};

const mockUsers: User[] = [
  { id: 'usr_005', name: 'Admin User', email: 'admin@gearup.com', role: 'Admin', status: 'Active', lastLogin: '2025-10-01T10:00:00Z' },
  { id: 'usr_003', name: 'Mike R.', email: 'mike.r@gearup.com', role: 'Employee', status: 'Active', lastLogin: '2025-10-01T09:30:00Z' },
  { id: 'usr_004', name: 'Sarah K.', email: 'sarah.k@gearup.com', role: 'Employee', status: 'Active', lastLogin: '2025-09-30T17:00:00Z' },
  { id: 'usr_001', name: 'John Doe', email: 'john.doe@email.com', role: 'Customer', status: 'Active', lastLogin: '2025-09-29T14:22:00Z' },
  { id: 'usr_002', name: 'Jane Smith', email: 'jane.smith@email.com', role: 'Customer', status: 'Active', lastLogin: '2025-09-28T11:05:00Z' },
  { id: 'usr_006', name: 'Peter Jones', email: 'peter.jones@email.com', role: 'Customer', status: 'Deactivated', lastLogin: '2025-08-15T18:00:00Z' },
];

export default function UsersPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [searchQuery, roleFilter]);

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
  const confirmDelete = () => {
    if(userToDelete){
        console.log(`Deleting user: ${userToDelete.name}`);
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
      <UserEditModal 
        user={editingUser}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
      {isDeleteModalOpen && (() => { confirmDelete(); return null; })()}
    </motion.div>
  );
}
