"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LucideCar, LucideCalendar, LucideHistory, LucideSettings, LucideLogOut, LucideBot, LucidePlus, LucideEdit, LucideTrash2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import CustomerLayout from "@/app/components/customer/CustomerLayout";
import { useAuth } from "@/context/AuthContext";
import { subscribeVehicles, deleteVehicle, type VehicleDoc } from "@/lib/vehicles";


const navItems = [
  { icon: LucideCar, label: "Dashboard", href: "/customer/dashboard" },
  { icon: LucideCalendar, label: "Book Appointment", href: "/customer/book-appointment" },
  { icon: LucideHistory, label: "Service History", href: "/customer/service-history" },
  { icon: LucideCar, label: "My Vehicles", active: true, href: "/customer/vehicles" },
  { icon: LucideSettings, label: "Settings", href: "/customer/settings" },
  { icon: LucideBot, label: "AI Chatbot", href: "/customer/chatbot" },
];

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState<VehicleDoc[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeVehicles(user.uid, (items) => setVehicles(items));
    return () => unsub && unsub();
  }, [user]);

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
      <div className="flex min-h-screen font-display">
        {/* Sidebar */}
  <aside className="w-72 rounded-2xl m-4 border border-glass-border bg-glass-bg/80 backdrop-blur-lg shadow-md flex-shrink-0 flex flex-col justify-between p-4 transition-all duration-300 hover:shadow-lg hover:bg-glass-bg/90 hover:ring-1 hover:ring-white/10">
          <div>
            <div className="flex items-center justify-center p-2 mb-6">
              <img 
                src="https://res.cloudinary.com/dgyqfax25/image/upload/v1730351497/gearup_logo_nwij8d.webp" 
                alt="GearUp Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                style={{
                  backgroundImage: `url('${(user?.photoURL) || (user?.displayName || user?.email ? "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(user?.displayName || user?.email || "User") : "https://api.dicebear.com/7.x/initials/svg?seed=User")}')`
                }}
              />
              <div className="flex flex-col">
                <h1 className="text-[#181111] text-base font-medium leading-normal">{user?.displayName || "Your name"}</h1>
                <p className="text-gray-500 text-sm font-normal leading-normal">{user?.email}</p>
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
                      "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
                      item.active
                        ? "bg-primary/20 text-primary backdrop-blur-sm"
                        : "hover:bg-white/10 hover:backdrop-blur-sm hover:shadow text-[#181111]"
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
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/50 hover:backdrop-blur-sm hover:shadow-sm cursor-pointer w-full transition-all duration-200"
            >
              <LucideLogOut className="text-[#181111]" />
              <p className="text-[#181111] text-sm font-medium leading-normal">Log Out</p>
            </button>
          </div>
        </aside>

        {/* Main Content */}
  <main className="flex-1">
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
                  <div key={vehicle.id} className="group bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    {/* Vehicle Image */}
                    <div 
                      className="w-full h-48 bg-center bg-cover bg-no-repeat transition-transform duration-300 group-hover:scale-[1.02]"
                      style={{ backgroundImage: `url('${vehicle.photoURL || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop"}')` }}
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
                          <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" title="Edit (coming soon)">
                            <LucideEdit size={16} className="text-gray-600" />
                          </button>
                          <button
                            onClick={async () => { if (user) await deleteVehicle(user.uid, vehicle.id); }}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                            title="Delete"
                          >
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
    </CustomerLayout>
  );
}