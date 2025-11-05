// app/components/admin/AdminSidebar.tsx
'use client';

import { LayoutDashboard, Calendar, Users, Wrench, LogOut, Star, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/services', label: 'Service Templates', icon: Wrench },
  { href: '/admin/payments', label: 'Payment Approval', icon: CreditCard },
  { href: '/admin/reviews', label: 'Reviews Management', icon: Star },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    // Clear any auth tokens or session data
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    router.push('/'); // Redirect to landing page after sign out
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-border flex flex-col">
      <div className="flex h-20 items-center justify-center border-b border-border">
        <Wrench className="h-7 w-7 text-primary" />
        <span className="ml-2 font-heading text-2xl font-bold">GearUp Admin</span>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link 
                href={link.href} 
                className={clsx(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 font-body text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-gray-100"
                )}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-border">
        <button 
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 font-body text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-primary"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
