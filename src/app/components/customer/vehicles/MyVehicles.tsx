"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { LucideCar, LucideCalendar, LucideHistory, LucideSettings, LucideLogOut, LucideBot, LucidePlus, LucideEdit, LucideTrash2 } from "lucide-react";

// Sample vehicles data - in real app, this would come from an API
const sampleVehicles = [
  {
    id: 1,
    make: "Tesla",
    model: "Model 3",
    year: "2023",
    numberPlate: "TESLA-EV",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC96kFC2N6X_QEBz7fhbchg_BIHb0r09fqvP2hUm6PSxxh_wVXn7RhTdRQPb4nTfRfQ2cbivXH3ZY1m2m8AZI9KdN6znubj6esOtlDcbwj9bApNhtUgiQtAYdqJO68BCQsBrJ4wOnsSm_LMlPoDYCFLPc_2ec2Psux0R1a7hBpequgECXCTZ_rU210Jjs8fpbLL9WdrZtywDVmATnNYYssr0unmy2wIyEUk3iVCxigAESl-vEN_Boa5wT_7KJD1_zcnsfl3PdcN3P4"
  },
  {
    id: 2,
    make: "Toyota",
    model: "Camry",
    year: "2022",
    numberPlate: "ABC-1234",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop"
  }
];

const navItems = [
  { icon: LucideCar, label: "Dashboard", href: "/customer/dashboard" },
  { icon: LucideCalendar, label: "Book Appointment", href: "/customer/book-appointment" },
  { icon: LucideHistory, label: "Service History", href: "/customer/service-history" },
  { icon: LucideCar, label: "My Vehicles", active: true, href: "/customer/vehicles" },
  { icon: LucideSettings, label: "Settings", href: "/customer/settings" },
  { icon: LucideBot, label: "AI Chatbot", href: "/customer/chatbot" },
];

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState(sampleVehicles);

  return (
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

      {/* Main Content */}
      <main className="flex-1 bg-[#f8f6f6]">
        <header className="flex h-20 items-center justify-between px-4 md:px-10 lg:px-20 border-b border-gray-200 bg-white">
          <div></div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90 transition-colors">
            <LucideCar />
            <span>Book Appointment</span>
          </button>
        </header>

        <div className="p-8">
          {/* Header Section */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
            <div className="flex min-w-72 flex-col gap-3">
              <p className="text-[#181111] text-4xl font-black leading-tight tracking-[-0.033em]">My Vehicles</p>
              <p className="text-gray-500 text-base font-normal leading-normal">Manage your registered vehicles and add new ones.</p>
            </div>
            <a 
              href="/customer/vehicle_registration" 
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary/90 transition-colors"
            >
              <LucidePlus size={20} />
              <span>Register New Vehicle</span>
            </a>
          </div>

          {/* Vehicles Grid */}
          {vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Vehicle Image */}
                  <div 
                    className="w-full h-48 bg-center bg-cover bg-no-repeat"
                    style={{ backgroundImage: `url('${vehicle.image}')` }}
                  />
                  
                  {/* Vehicle Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-[#181111] text-lg font-bold leading-tight">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-gray-500 text-sm font-normal mt-1">
                          License Plate: {vehicle.numberPlate}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                          <LucideEdit size={16} className="text-gray-600" />
                        </button>
                        <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 transition-colors">
                          <LucideTrash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Vehicle Actions */}
                    <div className="flex flex-col gap-2">
                      <button className="w-full rounded-lg h-10 px-4 bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
                        Book Service
                      </button>
                      <button className="w-full rounded-lg h-10 px-4 bg-gray-100 text-[#181111] text-sm font-medium hover:bg-gray-200 transition-colors">
                        View History
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <LucideCar className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-[#181111] text-xl font-bold mb-2">No Vehicles Registered</h3>
              <p className="text-gray-500 text-base mb-6">
                You haven't registered any vehicles yet. Add your first vehicle to get started.
              </p>
              <a 
                href="/customer/vehicle_registration" 
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary/90 transition-colors"
              >
                <LucidePlus size={20} />
                <span>Register Your First Vehicle</span>
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}