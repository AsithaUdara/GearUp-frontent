"use client";
import React, { useEffect, useState } from "react";
import { LucideCar, LucidePlus, LucideEdit, LucideTrash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { subscribeVehicles, deleteVehicle, type VehicleDoc } from "@/lib/vehicles";

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState<VehicleDoc[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeVehicles(user.uid, (items) => setVehicles(items));
    return () => unsub && unsub();
  }, [user]);

  return (
    <>
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
    </>
  );
}