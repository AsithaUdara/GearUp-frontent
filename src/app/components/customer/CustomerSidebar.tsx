"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LucideCar,
  LucideCalendar,
  LucideHistory,
  LucideSettings,
  LucideBot,
  LucideLogOut,
  LucideCreditCard,
  LucideBell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LucideCar, label: "Dashboard", href: "/customer/dashboard" },
  {
    icon: LucideCalendar,
    label: "Book Appointment",
    href: "/customer/appointment",
  },
  { icon: LucideHistory, label: "Service History", href: "/customer/progress" },
  { icon: LucideCar, label: "My Vehicles", href: "/customer/vehicles" },
  { icon: LucideCreditCard, label: "Payment", href: "/customer/payment" },
  { icon: LucideBell, label: "Notifications", href: "/notifications" },
  { icon: LucideSettings, label: "Settings", href: "/customer/settings" },
  { icon: LucideBot, label: "AI Chatbot", href: "/customer/chatbot" },
];

export default function CustomerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      // Clear any auth tokens or session data
      localStorage.removeItem("userRole");
      localStorage.removeItem("authToken");
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="w-72 rounded-2xl m-4 border border-glass-border bg-glass-bg/80 backdrop-blur-lg shadow-md flex-shrink-0 flex flex-col justify-between p-4 transition-all duration-300 hover:shadow-lg hover:bg-glass-bg/90 hover:ring-1 hover:ring-white/10">
      <div>
        <div className="flex items-center justify-center p-2 mb-6">
          <img
            src="https://res.cloudinary.com/dgyqfax25/image/upload/v1761887497/gearup_logo_nwij8d.webp"
            alt="GearUp Logo"
            className="h-16 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            style={{
              backgroundImage: `url('${
                user?.displayName || user?.email
                  ? "https://api.dicebear.com/7.x/initials/svg?seed=" +
                    encodeURIComponent(
                      user?.displayName || user?.email || "User"
                    )
                  : "https://api.dicebear.com/7.x/initials/svg?seed=User"
              }')`,
            }}
          />
          <div className="flex flex-col">
            <h1 className="text-[#181111] text-base font-medium leading-normal">
              {user?.displayName || "Your name"}
            </h1>
            <p className="text-gray-500 text-sm font-normal leading-normal">
              {user?.email}
            </p>
          </div>
        </div>
        <nav className="flex flex-col gap-2 mb-6">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const active = pathname === item.href;
            return (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
                  active
                    ? "bg-primary/20 text-primary backdrop-blur-sm"
                    : "hover:bg-white/10 hover:backdrop-blur-sm hover:shadow text-[#181111]"
                )}
              >
                <IconComponent
                  className={active ? "text-primary" : "text-[#181111]"}
                />
                <p
                  className={cn(
                    "text-sm font-medium leading-normal",
                    active ? "text-primary" : "text-[#181111]"
                  )}
                >
                  {item.label}
                </p>
              </a>
            );
          })}
        </nav>
      </div>
      <div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-sm hover:shadow cursor-pointer w-full transition-all duration-200"
        >
          <LucideLogOut className="text-[#181111]" />
          <p className="text-[#181111] text-sm font-medium leading-normal">
            Log Out
          </p>
        </button>
      </div>
    </aside>
  );
}
