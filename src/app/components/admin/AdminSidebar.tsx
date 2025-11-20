// app/components/admin/AdminSidebar.tsx
'use client';

import { LayoutDashboard, Calendar, Users, UserCheck, Wrench, Clock, Package, BarChart3, Star, LogOut, CreditCard,Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { signOut } from '@/lib/authService';
import Hero from '../landing/Hero';

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/appointment', label: 'Appointments', icon: Calendar },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/services', label: 'Service Templates', icon: Wrench },
  { href: '/admin/modifications', label: 'Modifications', icon: Settings },
  { href: '/admin/available-slots', label: 'Available Slots', icon: Clock },
  { href: '/admin/material-request', label: 'Material Request', icon: Package },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/assign', label: 'Assign Employees', icon: UserCheck },
  { href: '/admin/payments', label: 'Payment', icon: CreditCard },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white text-lg font-bold">🔧</span>
          </div>
          <span className="font-bold text-lg text-gray-800">GearUp Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            return (
              <li key={link.href}>
                <Link 
                  href={link.href} 
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-red-50 text-red-600 border-l-4 border-red-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
