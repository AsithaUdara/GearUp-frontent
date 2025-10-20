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
  CalendarDays,
  MessageSquareText,
  LogOut
} from "lucide-react";

const items = [
  { key: "dashboard", href: "/employee", label: "Dashboard", icon: Home, enabled: true },
  { key: "schedule", href: "/employee/schedule", label: "View Work Schedule", icon: CalendarClock, enabled: true },
  { key: "log-hours", href: "#", label: "Log Hours", icon: Clock8, enabled: false },
  { key: "service-progress", href: "/employee/service-progress", label: "Service Progress", icon: GaugeCircle, enabled: true },
  { key: "appointments", href: "#", label: "Appointments", icon: CalendarDays, enabled: false },
  { key: "communication", href: "/employee/communication", label: "Communication", icon: MessageSquareText, enabled: true }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-200 shadow-md flex flex-col h-screen fixed left-0 top-0 z-10">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Image src="/logos/gearup_logo.png" alt="GearUp logo" width={24} height={24} />
          <span className="text-xl font-bold tracking-tight text-gray-900">GearUp</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        <ul className="space-y-2">
          {items.map(({ key, href, label, icon: Icon, enabled }) => {
            const active =
              (key === "dashboard" && pathname === "/employee") ||
              pathname.startsWith(`/employee/${key}`);
            return (
              <li key={key}>
                {enabled ? (
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                      "cursor-pointer",
                      active ? "bg-red-600 text-white" : "text-gray-900 hover:bg-gray-200"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ) : (
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                      "cursor-not-allowed opacity-50",
                      "text-gray-900"
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
      <div className="px-3 py-3 border-t border-gray-200">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
          // onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
