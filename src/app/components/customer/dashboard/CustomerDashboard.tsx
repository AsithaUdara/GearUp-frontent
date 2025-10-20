"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { LucideCar, LucideCalendar, LucideHistory, LucideSettings, LucideLogOut, LucideBot, LucideKey, LucideSearch, LucideCheck, LucideWrench, LucidePlus } from "lucide-react";
import CustomerLayout from "@/app/components/customer/CustomerLayout";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

// Sidebar navigation items
const navItems = [
  { icon: LucideCar, label: "Dashboard", active: true, href: "/customer/dashboard" },
  { icon: LucideCalendar, label: "Book Appointment", href: "/customer/book-appointment" },
  { icon: LucideHistory, label: "Service History", href: "/customer/service-history" },
  { icon: LucideCar, label: "My Vehicles", href: "/customer/vehicles" },
  { icon: LucideSettings, label: "Settings", href: "/customer/settings" },
  { icon: LucideBot, label: "AI Chatbot", href: "/customer/chatbot" },
];

export default function CustomerDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer w-full"
            >
              <LucideLogOut className="text-[#181111]" />
              <p className="text-[#181111] text-sm font-medium leading-normal">Log Out</p>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-[#f8f6f6]">
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <div className="flex min-w-72 flex-col gap-3">
              <p className="text-[#181111] text-4xl font-black leading-tight tracking-[-0.033em]">Welcome back, John!</p>
              <p className="text-gray-500 text-base font-normal leading-normal">Here's a summary of your vehicle and services.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
            {/* Vehicle Card & Appointment */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex flex-col items-stretch justify-start rounded-lg bg-white shadow-sm">
                <div className="flex flex-col lg:flex-row items-stretch">
                  <div className="w-full lg:w-1/2 bg-center bg-no-repeat aspect-video bg-cover rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC96kFC2N6X_QEBz7fhbchg_BIHb0r09fqvP2hUm6PSxxh_wVXn7RhTdRQPb4nTfRfQ2cbivXH3ZY1m2m8AZI9KdN6znubj6esOtlDcbwj9bApNhtUgiQtAYdqJO68BCQsBrJ4wOnsSm_LMlPoDYCFLPc_2ec2Psux0R1a7hBpequgECXCTZ_rU210Jjs8fpbLL9WdrZtywDVmATnNYYssr0unmy2wIyEUk3iVCxigAESl-vEN_Boa5wT_7KJD1_zcnsfl3PdcN3P4')` }} />
                  <div className="flex flex-col justify-center p-6 gap-2 flex-1">
                    <p className="text-[#181111] text-lg font-bold leading-tight tracking-[-0.015em]">My Vehicle</p>
                    <p className="text-gray-500 text-base font-normal leading-normal">2023 Tesla Model 3</p>
                    <p className="text-gray-500 text-base font-normal leading-normal">License Plate: TESLA-EV</p>
                  </div>
                </div>
              </div>
              
              {/* Upcoming Appointment */}
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col items-stretch justify-start">
                  <p className="text-[#181111] text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Upcoming Appointment</p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-gray-500 text-base font-normal leading-normal">Scheduled for: December 15, 2023 at 10:00 AM</p>
                      <p className="text-gray-500 text-base font-normal leading-normal">Service Type: Annual Maintenance</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-lg h-10 px-4 bg-primary text-white text-sm font-medium">Reschedule</button>
                      <button className="rounded-lg h-10 px-4 bg-gray-200 text-[#181111] text-sm font-medium">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Book/View Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button className="flex items-center justify-center gap-3 p-6 rounded-lg bg-primary text-white shadow-sm hover:bg-primary/90">
                  <LucidePlus />
                  <p className="text-base font-medium">Book a New Appointment</p>
                </button>
                <button className="flex items-center justify-center gap-3 p-6 rounded-lg bg-white text-[#181111] shadow-sm hover:bg-gray-50">
                  <LucideHistory />
                  <p className="text-base font-medium">View Service History</p>
                </button>
              </div>
              
              {/* Recent Service History */}
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-[#181111] text-lg font-bold mb-4">Recent Service History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-sm font-medium text-gray-500 border-b border-gray-200">
                        <th className="py-2 px-4">Date</th>
                        <th className="py-2 px-4">Service</th>
                        <th className="py-2 px-4">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#181111]">
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4">2023-06-21</td>
                        <td className="py-3 px-4">Tire Rotation</td>
                        <td className="py-3 px-4">$50.00</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">2022-12-15</td>
                        <td className="py-3 px-4">Annual Maintenance</td>
                        <td className="py-3 px-4">$350.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <a className="text-primary text-sm font-medium mt-4 inline-block" href="#">View full history</a>
              </div>
            </div>
            
            {/* Service Status */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6 flex flex-col">
              <h3 className="text-[#181111] text-lg font-bold leading-tight tracking-[-0.015em] mb-6">Current Service Status</h3>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 flex-grow">
                {/* Checked In */}
                <div className="flex flex-col items-center gap-1 pt-2">
                  <div className="flex items-center justify-center size-8 rounded-full bg-primary text-white">
                    <LucideCheck className="text-base" />
                  </div>
                  <div className="w-px bg-primary h-full"></div>
                </div>
                <div className="flex flex-1 flex-col pb-8">
                  <p className="text-[#181111] text-base font-medium leading-normal">Checked In</p>
                  <p className="text-gray-500 text-sm font-normal leading-normal">Completed</p>
                </div>
                {/* In Service */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-px bg-primary h-2"></div>
                  <div className="flex items-center justify-center size-8 rounded-full bg-primary text-white">
                    <LucideWrench className="text-base" />
                  </div>
                  <div className="w-px bg-gray-300 h-full"></div>
                </div>
                <div className="flex flex-1 flex-col pb-8">
                  <p className="text-[#181111] text-base font-medium leading-normal">In Service</p>
                  <p className="text-primary text-sm font-normal leading-normal">In Progress</p>
                </div>
                {/* Quality Check */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-px bg-gray-300 h-2"></div>
                  <div className="flex items-center justify-center size-8 rounded-full bg-gray-200 text-gray-500">
                    <LucideSearch className="text-base" />
                  </div>
                  <div className="w-px bg-gray-300 h-full"></div>
                </div>
                <div className="flex flex-1 flex-col pb-8">
                  <p className="text-gray-500 text-base font-medium leading-normal">Quality Check</p>
                  <p className="text-gray-500 text-sm font-normal leading-normal">Pending</p>
                </div>
                {/* Ready for Pickup */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-px bg-gray-300 h-2"></div>
                  <div className="flex items-center justify-center size-8 rounded-full bg-gray-200 text-gray-500">
                    <LucideKey className="text-base" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-gray-500 text-base font-medium leading-normal">Ready for Pickup</p>
                  <p className="text-gray-500 text-sm font-normal leading-normal">Pending</p>
                </div>
              </div>
              <div className="mt-auto pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <LucideBot className="text-primary text-3xl" />
                  <div className="flex-1">
                    <h4 className="text-[#181111] text-base font-bold">Have a question?</h4>
                    <p className="text-gray-500 text-sm">Our AI chatbot can help with your queries and book slots.</p>
                  </div>
                  <button className="flex items-center justify-center rounded-full size-10 bg-primary text-white hover:bg-primary/90">
                    <LucideCar />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </CustomerLayout>
  );
}
