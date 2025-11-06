"use client";
import React from "react";
import Header from "../components/landing/Header";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-foreground font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 shadow-sm">
        <Header onLoginClick={() => {}} />
      </header>

      {/* Main layout area */}
      <div className="flex flex-1 mt-20">
        {/* Sidebar - Using AdminSidebar component */}
        <AdminSidebar />

        {/* Content area */}
        <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
