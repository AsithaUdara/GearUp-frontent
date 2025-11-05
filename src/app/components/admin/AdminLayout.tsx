"use client";
import React from "react";
import { LucideLayoutDashboard, LucideUsers, LucideCreditCard, LucideStar, LucideLogOut, LucideCar } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LucideLayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: LucideCreditCard, label: "Payment Approval", href: "/admin/payments" },
  { icon: LucideStar, label: "Reviews Management", href: "/admin/reviews" },
  { icon: LucideUsers, label: "Feedback", href: "/admin/feedback" },
];

export default function AdminLayout({ children, activeTab }: { children: React.ReactNode; activeTab?: string }) {
  return (
    <div className="flex min-h-screen bg-[#f8f6f6] font-display">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 p-2 mb-6">
            <div className="flex items-center justify-center size-10 bg-primary rounded-full">
              <LucideCar className="text-white" />
            </div>
            <h2 className="text-[#181111] text-xl font-bold">AutoCare Admin</h2>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-gray-300 flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="flex flex-col">
              <h1 className="text-[#181111] text-base font-medium leading-normal">Admin User</h1>
              <p className="text-gray-500 text-sm font-normal leading-normal">admin@autocare.com</p>
            </div>
          </div>
          <nav className="flex flex-col gap-2 mb-6">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.label;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-gray-100 text-[#181111]"
                  )}
                >
                  <IconComponent className={isActive ? "text-primary" : "text-[#181111]"} />
                  <p className={cn("text-sm font-medium leading-normal", isActive ? "text-primary" : "text-[#181111]")}>{item.label}</p>
                </a>
              );
            })}
          </nav>
        </div>
        <div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
            <LucideLogOut className="text-[#181111]" />
            <p className="text-[#181111] text-sm font-medium leading-normal">Log Out</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-[#f8f6f6]">
        {children}
      </main>
    </div>
  );
}
