// app/components/admin/UsersTable.tsx
'use client';
import type { User } from '@/app/admin/users/page';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const statusStyles = {
  Active: "bg-green-100 text-green-800",
  Deactivated: "bg-gray-100 text-gray-800",
};

const roleStyles = {
    ADMIN: "border-primary text-primary",
    Admin: "border-primary text-primary",
    EMPLOYEE: "border-blue-500 text-blue-600",
    Employee: "border-blue-500 text-blue-600",
    CUSTOMER: "border-gray-300 text-muted-foreground",
    Customer: "border-gray-300 text-muted-foreground",
    "No Role": "border-red-300 text-red-600",
};

// Accept users as a prop for filtering
// type User is imported from page

type Props = {
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
};

export default function UsersTable({ users, onEditUser, onDeleteUser }: Props) {
  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Last Login</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                </td>
                <td className="px-4 py-4">
                    <span className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold ${roleStyles[user.role]}`}>
                        {user.role === "No Role" ? user.role : user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
                    </span>
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                    {new Date(user.lastLogin).toLocaleString()}
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[user.status]}`}>{user.status}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="p-1 rounded-full text-muted-foreground hover:bg-gray-100 hover:text-foreground">
                      <MoreVertical className="h-5 w-5" />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => onEditUser(user)}
                                className={`${active ? 'bg-gray-100 text-foreground' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                              >
                                <Pencil className="mr-3 h-4 w-4" /> Edit User
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => onDeleteUser(user)}
                                className={`${active ? 'bg-red-50 text-primary' : 'text-primary'} group flex w-full items-center px-4 py-2 text-sm`}
                              >
                                <Trash2 className="mr-3 h-4 w-4" /> Deactivate User
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
