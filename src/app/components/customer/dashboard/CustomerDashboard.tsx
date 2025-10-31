"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LucideCar, LucideCalendar, LucideHistory, LucideSettings, LucideLogOut, LucideBot, LucideKey, LucideSearch, LucideCheck, LucideWrench, LucidePlus } from "lucide-react";
import CustomerLayout from "@/app/components/customer/CustomerLayout";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { subscribeVehicles, type VehicleDoc } from "@/lib/vehicles";

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
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleDoc[]>([]);

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

  // Get the first (most recent) vehicle or null
  const primaryVehicle = vehicles.length > 0 ? vehicles[0] : null;

  return (
    <CustomerLayout>
      <div className="flex min-h-screen font-display">
        {/* Sidebar */}
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
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/30 hover:backdrop-blur-md hover:shadow-md cursor-pointer w-full transition-all duration-200"
            >
              <LucideLogOut className="text-[#181111]" />
              <p className="text-[#181111] text-sm font-medium leading-normal">Log Out</p>
            </button>
          </div>
        </aside>

        {/* Main Content */}
  <main className="flex-1">
          {/* Hero Section */}
          <div className="relative w-full overflow-hidden">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <img 
                src="https://res.cloudinary.com/dgyqfax25/image/upload/v1761888664/upscaled_1920x1080_j8cwcf.png"
                alt="GearUp Hero"
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                <div className="container mx-auto px-8">
                  <div className="max-w-2xl">
                    <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-4">
                      Welcome back, {user?.displayName?.split(' ')[0] || 'there'}!
                    </h1>
                    <p className="text-white/90 text-lg md:text-xl font-normal leading-relaxed">
                      GearUp Autoshop is your expert partner for all vehicle services. We provide reliable maintenance and repairs for any car, handled by certified technicians using modern tools. We focus on clear service and guaranteed work, ensuring you get back on the road safely and with confidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
            {/* Vehicle Card & Appointment */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {primaryVehicle ? (
                <div className="group flex flex-col items-stretch justify-start rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="flex flex-col lg:flex-row items-stretch">
                    <div
                      className="w-full lg:w-1/2 bg-center bg-no-repeat aspect-video bg-cover rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none transition-transform duration-300 group-hover:scale-[1.02]"
                      style={{
                        backgroundImage: `url('${primaryVehicle.photoURL || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop"}')`
                      }}
                    />
                    <div className="flex flex-col justify-center p-6 gap-2 flex-1">
                      <p className="text-[#181111] text-lg font-bold leading-tight tracking-[-0.015em]">My Vehicle</p>
                      <p className="text-gray-500 text-base font-normal leading-normal">
                        {primaryVehicle.year} {primaryVehicle.make} {primaryVehicle.model}
                      </p>
                      <p className="text-gray-500 text-base font-normal leading-normal">
                        License Plate: {primaryVehicle.numberPlate}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg bg-white shadow-sm p-12 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <LucideCar className="text-gray-400 mb-4" size={64} />
                  <p className="text-[#181111] text-lg font-bold mb-2">No Vehicle Registered</p>
                  <p className="text-gray-500 text-base mb-4">Add your first vehicle to get started.</p>
                  <a
                    href="/customer/vehicle_registration"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <LucidePlus size={20} />
                    <span>Register Vehicle</span>
                  </a>
                </div>
              )}
              
              {/* Upcoming Appointment */}
              <div className="p-4 bg-white rounded-lg shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
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
                <button className="flex items-center justify-center gap-3 p-6 rounded-lg bg-primary text-white shadow-sm hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <LucidePlus />
                  <p className="text-base font-medium">Book a New Appointment</p>
                </button>
                <button className="flex items-center justify-center gap-3 p-6 rounded-lg bg-white text-[#181111] shadow-sm hover:bg-gray-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <LucideHistory />
                  <p className="text-base font-medium">View Service History</p>
                </button>
              </div>
              
              {/* Recent Service History */}
              <div className="p-4 bg-white rounded-lg shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
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
          </div>
        </main>
      </div>
    </CustomerLayout>
  );
}
