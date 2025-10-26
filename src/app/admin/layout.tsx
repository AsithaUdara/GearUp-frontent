"use client";
import React from "react";
import Link from "next/link";
import Header from "../components/landing/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 shadow-sm">
        <Header onLoginClick={() => {}} />
      </header>

      {/* Main layout area */}
      <div className="flex flex-1 mt-20">
        {/* Sidebar */}
        <aside className="w-64 bg-primary text-white shadow-lg flex flex-col p-4 space-y-6">
          <div>
            <h2 className="text-2xl font-heading font-bold tracking-wide uppercase">
              Admin Dashboard
            </h2>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Manage Operations
            </p>
          </div>

          <nav className="space-y-2">
            <NavLink href="/admin/appointment" label="Appointments" icon="📋" />
            <NavLink href="/admin/assign" label="Assign Employees" icon="🧰" />
          </nav>

          <div className="mt-auto pt-4 border-t border-white/20 text-sm text-white/70">
            &copy; {new Date().getFullYear()} Service Center Admin
          </div>
        </aside>

        {/* Content area */}
        <main className="flex-1 bg-background p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

/* ✅ Local NavLink helper component for consistent style */
function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-md font-medium 
                 transition-colors duration-200 ease-in-out 
                 hover:bg-white hover:text-primary bg-primary/0 text-white"
    >
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  );
}
