// src/app/components/employee/Header.tsx
"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  
  const title = 
      pathname === "/employee" ? "Welcome, Employee!" 
    : pathname.startsWith("/employee/schedule") ? "Schedule" 
    : pathname.startsWith("/employee/log-hours") ? "Log Hours"
    : pathname.startsWith("/employee/parts-request") ? "Parts & Materials Request"
    : pathname.startsWith("/employee/tasks") ? "Task Information"
    : "Employee Portal";

  return (
    // Replaced `border-b` with `shadow-sm`
    <header className="px-8 py-5 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-xs text-gray-500">Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 hover:bg-gray-100" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button>
          <img
            alt="Employee avatar"
            className="h-10 w-10 rounded-full object-cover"
            src="https://i.pravatar.cc/80?img=13"
          />
        </div>
      </div>
    </header>
  );
}