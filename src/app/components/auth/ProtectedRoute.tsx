// src/app/components/auth/ProtectedRoute.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// TODO: Replace with your actual auth logic
const isAuthenticated = () => {
  // Example: check localStorage or context
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('user');
  }
  return false;
};

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/'); // Redirect to landing/login if not authenticated
    }
  }, [router]);
  return <>{children}</>;
}
