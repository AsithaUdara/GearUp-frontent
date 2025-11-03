"use client";
import React, { useEffect, useState } from "react";
import { LucideKey, LucideSearch, LucideCheck, LucideWrench, LucidePlus, LucideCar, LucideHistory, LucideBot } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { subscribeVehicles, type VehicleDoc } from "@/lib/vehicles";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleDoc[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeVehicles(user.uid, (items) => setVehicles(items));
    return () => unsub && unsub();
  }, [user]);

  const primaryVehicle = vehicles.length > 0 ? vehicles[0] : null;

  return (
    <>
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
                  GearUp Autoshop is your expert partner for all vehicle services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Vehicle Card */}
            {primaryVehicle ? (
              <div className="group flex flex-col rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex flex-col lg:flex-row">
                  <div
                    className="w-full lg:w-1/2 aspect-video bg-center bg-cover rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{ backgroundImage: `url('${primaryVehicle.photoURL || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"}')` }}
                  />
                  <div className="flex flex-col justify-center p-6 gap-2 flex-1">
                    <p className="text-[#181111] text-lg font-bold">My Vehicle</p>
                    <p className="text-gray-500">{primaryVehicle.year} {primaryVehicle.make} {primaryVehicle.model}</p>
                    <p className="text-gray-500">License Plate: {primaryVehicle.numberPlate}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg bg-white shadow-sm p-12 text-center">
                <LucideCar className="text-gray-400 mb-4" size={64} />
                <p className="text-[#181111] text-lg font-bold mb-2">No Vehicle Registered</p>
                <p className="text-gray-500 mb-4">Add your first vehicle to get started.</p>
                <a href="/customer/vehicle_registration" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-semibold">
                  <LucidePlus size={20} /><span>Register Vehicle</span>
                </a>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="/customer/book-appointment"
                className="flex items-center gap-3 p-6 rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:ring-1 hover:ring-primary/20"
              >
                <div className="p-3 rounded-full bg-primary/10">
                  <LucidePlus className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-[#181111] font-bold text-lg">Book Appointment</p>
                  <p className="text-gray-500 text-sm">Schedule a service</p>
                </div>
              </a>
              <a 
                href="/customer/vehicles"
                className="flex items-center gap-3 p-6 rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:ring-1 hover:ring-primary/20"
              >
                <div className="p-3 rounded-full bg-primary/10">
                  <LucideCar className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-[#181111] font-bold text-lg">My Vehicles</p>
                  <p className="text-gray-500 text-sm">Manage your fleet</p>
                </div>
              </a>
            </div>

            {/* Recent Service History */}
            <div className="rounded-lg bg-white shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#181111] text-xl font-bold">Recent Service History</h2>
                <a href="/customer/service-history" className="text-primary font-medium hover:underline">View All</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Service</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm">Jan 15, 2025</td>
                      <td className="py-3 px-2 text-sm">Oil Change</td>
                      <td className="py-3 px-2"><span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium"><LucideCheck size={14} />Completed</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm">Dec 10, 2024</td>
                      <td className="py-3 px-2 text-sm">Brake Inspection</td>
                      <td className="py-3 px-2"><span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium"><LucideCheck size={14} />Completed</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar - Appointment & Status */}
          <div className="flex flex-col gap-6">
            {/* Upcoming Appointment */}
            <div className="rounded-lg bg-white shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <h3 className="text-[#181111] text-lg font-bold mb-4">Upcoming Appointment</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <LucideWrench size={18} />
                  <span className="text-sm">No appointments scheduled</span>
                </div>
                <a 
                  href="/customer/book-appointment"
                  className="block w-full text-center rounded-lg bg-primary/10 px-4 py-3 text-primary font-semibold hover:bg-primary/20 transition-colors"
                >
                  Book Now
                </a>
              </div>
            </div>

            {/* Current Service Status */}
            <div className="rounded-lg bg-white shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <h3 className="text-[#181111] text-lg font-bold mb-4">Current Service Status</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-green-100">
                    <LucideCheck className="text-green-600" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Checked In</p>
                    <p className="text-xs text-gray-500">Your vehicle is with us</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-blue-100">
                    <LucideWrench className="text-blue-600" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">In Service</p>
                    <p className="text-xs text-gray-500">Our technicians are working</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-gray-200">
                    <LucideSearch className="text-gray-400" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-400">Quality Check</p>
                    <p className="text-xs text-gray-400">Pending</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-gray-200">
                    <LucideKey className="text-gray-400" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-400">Ready for Pickup</p>
                    <p className="text-xs text-gray-400">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Chatbot CTA */}
            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-6 border border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-primary">
                  <LucideBot className="text-white" size={20} />
                </div>
                <h3 className="text-[#181111] text-lg font-bold">Need Help?</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Chat with our AI assistant for quick answers about your service.</p>
              <a 
                href="/customer/chatbot"
                className="block w-full text-center rounded-lg bg-primary px-4 py-3 text-white font-semibold hover:bg-primary/90 transition-colors"
              >
                Start Chat
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
