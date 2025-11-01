import React from "react";
import { cn } from "@/lib/utils";
import CustomerLayout from "@/app/components/customer/CustomerLayout";
import PaymentPageClient from "./PaymentPageClient";

import { LucideCar, LucideCalendar, LucideHistory, LucideSettings,LucideCreditCard, LucideLogOut, LucideBot,LucideStar, LucideKey, LucideSearch, LucideCheck, LucideWrench, LucidePlus } from "lucide-react";

const navItems = [
  { icon: LucideCar, label: "Dashboard", active: true, href: "/customer/dashboard" },
  { icon: LucideCalendar, label: "Book Appointment", href: "/customer/book-appointment" },
  { icon: LucideHistory, label: "Service History", href: "/customer/service-history" },
  { icon: LucideCar, label: "My Vehicles", href: "/customer/vehicles" },
  { icon: LucideSettings, label: "Settings", href: "/customer/settings" },
  { icon: LucideBot, label: "AI Chatbot", href: "/customer/chatbot" },
  { icon: LucideStar, label: "Feedback", href: "/feedback" },
  { icon: LucideCreditCard, label: "Payment", href: "/customer/payment" }
];


export default function PaymentPage() {
  return (
    
    <CustomerLayout>


      <div className="flex min-h-screen bg-[#f8f6f6] font-display">
         {/* Sidebar */}
                <aside className="w-72 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col justify-between p-4">
                  <div>
                    <div className="flex items-center gap-3 p-2 mb-6">
                      <div className="flex items-center justify-center size-10 bg-primary rounded-full">
                        <LucideCar className="text-white" />
                      </div>
                      <h2 className="text-[#181111] text-xl font-bold">AutoCare</h2>
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDprZ0np2z1F4LbIms0gu2QjPMO0i-d8SJObWlfbTX-BuKMHC_1nbxtzLZfONaXhf6_50BdX0fGX3IUUAw3ehweGS7aMn-Zhsh0NWy_stCMsuIc35jiM9lAX6B8RXw2nqUjHx0fhGsm8uU2tJXuG6vUL1i3Bg4-CV-w5wFog2Ylku75Lgca01vwEmTmuMxgj-qXbMYjRPCE4ti9TRODZGDCIv68NLXRDsnG2gd8XnKUk-Tko7bCpJCLsN6aAh7D_LWMRp5IQcNpgmA')` }} />
                      <div className="flex flex-col">
                        <h1 className="text-[#181111] text-base font-medium leading-normal">John Doe</h1>
                        <p className="text-gray-500 text-sm font-normal leading-normal">john.doe@email.com</p>
                      </div>
                    </div>
                    <nav className="flex flex-col gap-2 mb-6">
                      {navItems.map((item, idx) => {
                        const IconComponent = item.icon;
                        return (
                          <a
                            key={item.label}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer",
                              item.active
                                ? "bg-primary/20 text-primary"
                                : "hover:bg-gray-100 text-[#181111]"
                            )}
                          >
                            <IconComponent className={item.active ? "text-primary" : "text-[#181111]"} />
                            <p className={cn("text-sm font-medium leading-normal", item.active ? "text-primary" : "text-[#181111]")}>{item.label}</p>
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

        <main className="flex-1 p-8 bg-[#f8f6f6]">
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <div className="flex min-w-72 flex-col gap-3">
              <p className="text-[#181111] text-4xl font-black leading-tight tracking-[-0.033em]">Payments</p>
              <p className="text-gray-500 text-base font-normal leading-normal">Manage your invoices and view the final amount due.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-4">
            <PaymentPageClient />
          </div>
        </main>
      </div>
    </CustomerLayout>
  );
}
