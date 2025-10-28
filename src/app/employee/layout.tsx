// src/app/employee/layout.tsx
import type { Metadata } from "next";
import Sidebar from "@/app/components/employee/Sidebar";
import Header from "@/app/components/employee/Header";

export const metadata: Metadata = {
  title: "Employee Dashboard | GearUp",
};

export default function EmployeeLayout({
  children,
  // --- FIX APPLIED HERE: Changed Node to ReactNode ---
}: Readonly<{ children: React.ReactNode }>) { 
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="flex-1">
        <Header />
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}