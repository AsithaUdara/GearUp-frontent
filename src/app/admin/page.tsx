// app/admin/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminRootPage() {
  const router = useRouter();
  useEffect(() => {
    // Redirect from /admin to /admin/dashboard
    router.replace('/admin/dashboard');
  }, [router]);
  return null; // Render nothing while redirecting
}