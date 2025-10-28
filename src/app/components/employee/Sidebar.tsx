// src/app/components/employee/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  CalendarClock,
  Clock8,
  GaugeCircle,
  MessageSquareText,
  LogOut,
  Wrench // --- MODIFICATION: Added a more appropriate icon ---
} from "lucide-react";

const items = [
  { key: "dashboard", href: "/employee", label: "Dashboard", icon: Home, enabled: true },
  { key: "schedule", href: "/employee/schedule", label: "View Work Schedule", icon: CalendarClock, enabled: true },
  { key: "log-hours", href: "/employee/log-hours", label: "Log Hours", icon: Clock8, enabled: true },
  { key: "progress", href: "#", label: "Service Progress", icon: GaugeCircle, enabled: false },
  
  // --- FIX APPLIED HERE ---
  // Key, href, icon, and enabled status are now correct.
  { key: "parts-request", href: "/employee/parts-request", label: "Materials and Parts Request", icon: Wrench, enabled: true },
  
  { key: "communication", href: "#", label: "Communication", icon: MessageSquareText, enabled: false }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-white shadow-md flex flex-col h-screen">
      <div className="h-16 flex items-center justify-center border-b border-white">
        <div className="flex items-center gap-2">
          <Image src="/logos/gearup_logo.png" alt="GearUp logo" width={24} height={24} />
          <span className="text-xl font-bold tracking-tight text-gray-900">GearUp</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-2">
        <ul className="space-y-2">
          {items.map(({ key, href, label, icon: Icon, enabled }) => {
            // Updated logic to properly check for active state
            const active = (pathname === href) || (href !== '/employee' && pathname.startsWith(href));

            return (
              <li key={key}>
                {enabled ? (
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium cursor-pointer",
                      active ? "bg-red-600 text-white" : "text-gray-900 hover:bg-gray-200"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ) : (
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium cursor-not-allowed opacity-50 text-gray-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="px-3 py-3 border-t border-white">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );
}