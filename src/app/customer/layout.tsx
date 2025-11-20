"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CustomerLayout from "@/app/components/customer/CustomerLayout";
import CustomerSidebar from "@/app/components/customer/CustomerSidebar";

export default function CustomerSectionLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    // Wait for auth to finish loading before checking
    if (loading) return;
    
    // If no user after loading, redirect to home
    if (!user) {
      console.log('No authenticated user in customer layout, redirecting to home');
      router.push("/");
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </CustomerLayout>
    );
  }

  // Don't render anything if no user (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <CustomerLayout>
      <div className="min-h-screen font-display flex">
        <CustomerSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </CustomerLayout>
  );
}
