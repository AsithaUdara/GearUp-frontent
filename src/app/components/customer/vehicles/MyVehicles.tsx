"use client";
import React, { useEffect, useState } from "react";
import { LucideCar, LucidePlus, LucideEdit, LucideTrash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { subscribeVehicles, deleteVehicle, type VehicleDoc, updateVehicle, fetchVehicles } from "@/lib/vehicles";
import Link from "next/link";

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState<VehicleDoc[]>([]);
  const { user } = useAuth();
  const [editing, setEditing] = useState<VehicleDoc | null>(null);
  const [editMake, setEditMake] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editPlate, setEditPlate] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editMsg, setEditMsg] = useState<string | null>(null);
  const [editErr, setEditErr] = useState<string | null>(null);
  useEffect(() => {
    if (!user) return;
    // Fetch once to populate immediately after refresh, then keep in sync via listener
    let unsub: null | (() => void) = null;
    (async () => {
      try {
        const initial = await fetchVehicles(user.uid);
        setVehicles(initial);
      } catch (e) {
        console.warn('initial vehicles fetch failed', e);
      }
      unsub = subscribeVehicles(user.uid, (items) => setVehicles(items));
    })();
    return () => {
      if (unsub) unsub();
    };
  }, [user]);
  return (
    <>

          <div className="p-8">
            {/* Actions */}
            <div className="flex justify-end mb-8">
              <Link 
                href="/customer/vehicle_registration" 
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary/90 transition-colors"
              >
                <LucidePlus size={20} />
                <span>Register New Vehicle</span>
              </Link>
            </div>

            {/* Vehicles Grid */}
            {vehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="group bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    {/* Vehicle Image */}
                    <div 
                      className="w-full h-48 bg-center bg-cover bg-no-repeat transition-transform duration-300 group-hover:scale-[1.02]"
                      style={{ backgroundImage: `url('${vehicle.photoURL || "https://via.placeholder.com/800x400?text=No+Photo"}')` }}
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
                          <button
                            onClick={() => {
                              setEditing(vehicle);
                              setEditMake(vehicle.make);
                              setEditModel(vehicle.model);
                              setEditYear(String(vehicle.year));
                              setEditPlate(vehicle.numberPlate);
                              setEditFile(null);
                              setEditMsg(null);
                              setEditErr(null);
                            }}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            title="Edit"
                          >
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
                <Link 
                  href="/customer/vehicle_registration" 
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary/90 transition-colors"
                >
                  <LucidePlus size={20} />
                  <span>Register Your First Vehicle</span>
                </Link>
              </div>
            )}
          </div>

          {/* Edit Vehicle Modal */}
          {editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-lg rounded-lg bg-white shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Edit Vehicle</h3>
                  <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700">×</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">Make</label>
                    <input className="h-11 rounded-lg border border-gray-200 px-3" value={editMake} onChange={(e) => setEditMake(e.target.value)} />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">Model</label>
                    <input className="h-11 rounded-lg border border-gray-200 px-3" value={editModel} onChange={(e) => setEditModel(e.target.value)} />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">Year</label>
                    <input className="h-11 rounded-lg border border-gray-200 px-3" value={editYear} onChange={(e) => setEditYear(e.target.value)} />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">License Plate</label>
                    <input className="h-11 rounded-lg border border-gray-200 px-3" value={editPlate} onChange={(e) => setEditPlate(e.target.value)} />
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <label className="text-sm font-medium mb-1">Replace Photo (optional)</label>
                    <input type="file" accept="image/*" onChange={(e) => setEditFile(e.target.files?.[0] || null)} />
                    
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    disabled={savingEdit}
                    onClick={async () => {
                      if (!user || !editing) return;
                      setSavingEdit(true);
                      setEditErr(null);
                      setEditMsg(null);
                      try {
                        await updateVehicle(user.uid, editing.id, {
                          make: editMake,
                          model: editModel,
                          year: editYear,
                          numberPlate: editPlate,
                        }, editFile || undefined);
                        setEditMsg("Vehicle updated successfully.");
                        // Close modal after short delay
                        setTimeout(() => setEditing(null), 700);
                      } catch (err: any) {
                        console.error(err);
                        setEditErr(err?.message || "Failed to update vehicle.");
                      } finally {
                        setSavingEdit(false);
                      }
                    }}
                    className={`rounded-lg h-11 px-5 bg-primary text-white font-semibold ${savingEdit ? 'opacity-80 cursor-not-allowed' : ''}`}
                  >
                    {savingEdit ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button onClick={() => setEditing(null)} className="rounded-lg h-11 px-5 bg-gray-100 text-[#181111] font-semibold hover:bg-gray-200">Cancel</button>
                  {editMsg && <div className="px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm border border-green-300">{editMsg}</div>}
                  {editErr && <div className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm border border-red-300">{editErr}</div>}
                </div>
              </div>
            </div>
          )}
    </>
  );
}