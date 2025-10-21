"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const title = pathname === "/employee" ? "Welcome, Employee!" : pathname.startsWith("/employee/schedule") ? "Schedule" : "";

  return (
    <header className="px-8 py-5">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{title}</h1>
          <p className="text-xs text-gray-500">Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-64 rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
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
