// src/app/components/employee/Header.tsx
"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react"; // Removed 'Search' as it's no longer used

export default function Header() {
  const pathname = usePathname();
  // Simple logic to set the title based on the current page
  const title = pathname === "/employee" ? "Welcome, Employee!" 
              : pathname.startsWith("/employee/log-hours") ? "Log Hours" 
              : pathname.startsWith("/employee/schedule") ? "Schedule" 
              : "Employee Portal"; // A good default

  return (
    <header className="px-8 py-5">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-xs text-gray-500">Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-4">

          {/* --- SEARCH BAR DIV REMOVED FROM HERE --- */}

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