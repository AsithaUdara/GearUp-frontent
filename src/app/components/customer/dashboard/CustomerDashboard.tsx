"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LucideKey, LucideSearch, LucideCheck, LucideWrench, LucidePlus, LucideCar, LucideHistory, LucideBot, LucideCalendar, LucideClock, LucideX } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { subscribeVehicles, type VehicleDoc, fetchVehicles } from "@/lib/vehicles";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

type AppointmentDoc = {
  id: string;
  userId: string;
  serviceName: string;
  appointmentDate: string;
  timeSlot: string;
  status: "scheduled" | "completed" | "cancelled";
  appointmentAt?: { seconds: number; nanoseconds: number } | null;
};

type ModificationDoc = {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleLabel?: string | null;
  subject?: string | null;
  message: string;
  status: "pending" | "approved" | "in_progress" | "completed" | "rejected";
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleDoc[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDoc[]>([]);
  const [apptLoading, setApptLoading] = useState(false);
  const [apptError, setApptError] = useState<string | null>(null);
  const [mods, setMods] = useState<ModificationDoc[]>([]);
  const [modLoading, setModLoading] = useState(false);
  const [modError, setModError] = useState<string | null>(null);

  // Fetch vehicles from backend (using Firebase uid)
  useEffect(() => {
    if (!user) return;
    let unsub: null | (() => void) = null;
    (async () => {
      try {
        const initial = await fetchVehicles(user.uid);
        setVehicles(initial);
      } catch (e) {
        console.warn('initial vehicles fetch (dashboard) failed', e);
      }
      unsub = subscribeVehicles(user.uid, (items) => setVehicles(items));
    })();
    return () => { if (unsub) unsub(); };
  }, [user]);

  // Fetch appointments from Firestore (temporary until backend accepts Firebase tokens)
  useEffect(() => {
    if (!user) {
      setApptLoading(false);
      return;
    }
    setApptLoading(true);
    setApptError(null);
    const q = query(collection(db, "appointments"), where("userId", "==", user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: AppointmentDoc[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setAppointments(list);
        setApptLoading(false);
      },
      (err) => {
        console.error("appointments listener error", err);
        setApptError(err?.message || "Failed to load appointments");
        setApptLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  // Fetch modifications from Firestore (temporary until backend accepts Firebase tokens)
  useEffect(() => {
    if (!user) {
      setModLoading(false);
      return;
    }
    setModLoading(true);
    setModError(null);
    const q = query(collection(db, "modifications"), where("userId", "==", user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: ModificationDoc[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setMods(list);
        setModLoading(false);
      },
      (err) => {
        console.error("modifications listener error", err);
        setModError(err?.message || "Failed to load modifications");
        setModLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const upcomingAppointment = useMemo(() => {
    if (!appointments.length) return null;
    const nowMs = Date.now();
    const withMs = appointments.map((a) => {
      let ms: number | null = null;
      if (a.appointmentAt && typeof a.appointmentAt.seconds === "number") {
        ms = a.appointmentAt.seconds * 1000 + Math.floor((a.appointmentAt.nanoseconds || 0) / 1e6);
      }
      return { ...a, _ms: ms } as AppointmentDoc & { _ms: number | null };
    });
    const future = withMs
      .filter((a) => a.status === "scheduled" && (a._ms == null || a._ms >= nowMs))
      .sort((a, b) => (a._ms ?? Infinity) - (b._ms ?? Infinity));
    if (future.length) return future[0];
    const scheduled = withMs.filter((a) => a.status === "scheduled").sort((a, b) => (a._ms ?? Infinity) - (b._ms ?? Infinity));
    return scheduled[0] || null;
  }, [appointments]);

  const primaryVehicle = vehicles.length > 0 ? vehicles[0] : null;
  const latestModification = useMemo(() => {
    if (!mods.length) return null;
    const withMs = mods.map((m) => {
      let ms: number | null = null;
      if (m.createdAt && typeof m.createdAt.seconds === "number") {
        ms = m.createdAt.seconds * 1000 + Math.floor((m.createdAt.nanoseconds || 0) / 1e6);
      }
      return { ...m, _ms: ms } as ModificationDoc & { _ms: number | null };
    });
    return withMs.sort((a, b) => (b._ms ?? 0) - (a._ms ?? 0))[0] || null;
  }, [mods]);
  const ongoingModification = useMemo(() => {
    if (!mods.length) return null;
    const ongoing = mods.filter((m) => m.status === "pending" || m.status === "approved" || m.status === "in_progress");
    const withMs = ongoing.map((m) => {
      let ms: number | null = null;
      if (m.createdAt && typeof m.createdAt.seconds === "number") {
        ms = m.createdAt.seconds * 1000 + Math.floor((m.createdAt.nanoseconds || 0) / 1e6);
      }
      return { ...m, _ms: ms } as ModificationDoc & { _ms: number | null };
    });
    return withMs.sort((a, b) => (b._ms ?? 0) - (a._ms ?? 0))[0] || null;
  }, [mods]);

  return (
    <>
      <div className="relative w-full overflow-hidden bg-black">
        <div className="relative w-full h-[400px] md:h-[500px]">
          <img 
            src="https://res.cloudinary.com/dgyqfax25/image/upload/v1761888664/upscaled_1920x1080_j8cwcf.png"
            alt="GearUp Hero"
            className="absolute inset-0 w-full h-full object-cover"
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
            {/* Profile strip removed to avoid duplicate avatar (already shown in sidebar/navbar) */}

            {/* Your Vehicles Grid */}
            {vehicles.length > 0 ? (
              <div className="rounded-lg bg-white shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-800 text-xl font-bold">Your Vehicles</h2>
                  <Link href="/customer/vehicles" className="text-red-600 font-medium hover:underline">Manage</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicles.map((v) => (
                    <div key={v.id} className="group flex rounded-lg overflow-hidden border border-gray-100">
                      <div
                        className="w-40 h-28 bg-center bg-cover flex-shrink-0"
                        style={{ backgroundImage: `url('${v.photoURL || "https://via.placeholder.com/400x200?text=No+Photo"}')` }}
                      />
                      <div className="p-4 flex-1">
                        <p className="text-sm text-gray-500">{v.numberPlate}</p>
                        <p className="text-gray-800 font-semibold">{v.year} {v.make} {v.model}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg bg-white shadow-sm p-12 text-center">
                <LucideCar className="text-gray-400 mb-4" size={64} />
                <p className="text-gray-800 text-lg font-bold mb-2">No Vehicles Registered</p>
                <p className="text-gray-500 mb-4">Add your first vehicle to get started.</p>
                <a href="/customer/vehicle_registration" className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700">
                  <LucidePlus size={20} /><span>Register Your First Vehicle</span>
                </a>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                href="/customer/appointment"
                className="flex items-center gap-3 p-6 rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="p-3 rounded-full bg-red-50">
                  <LucidePlus className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-800 font-bold text-lg">Book Appointment</p>
                  <p className="text-gray-500 text-sm">Schedule a service</p>
                </div>
              </Link>
              <a 
                href="/customer/vehicles"
                className="flex items-center gap-3 p-6 rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="p-3 rounded-full bg-red-50">
                  <LucideCar className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-800 font-bold text-lg">My Vehicles</p>
                  <p className="text-gray-500 text-sm">Manage your fleet</p>
                </div>
              </a>
            </div>

            {/* Recent Service History */}
            <div className="rounded-lg bg-white shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-800 text-xl font-bold">Recent Service History</h2>
                <Link href="/customer/service-history" className="text-red-600 font-medium hover:underline">View All</Link>
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
              <h3 className="text-gray-800 text-lg font-bold mb-4">Upcoming Appointment</h3>
              {apptLoading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : apptError ? (
                <div className="text-sm text-red-600">{apptError}</div>
              ) : upcomingAppointment ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <LucideCalendar size={18} />
                    <span className="text-sm font-medium">{upcomingAppointment.appointmentDate} at {upcomingAppointment.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <LucideWrench size={18} />
                    <span className="text-sm">{upcomingAppointment.serviceName}</span>
                  </div>
                  <Link 
                    href="/customer/appointment"
                    className="block w-full text-center rounded-lg bg-red-50 px-4 py-3 text-red-600 font-semibold hover:bg-red-100 transition-colors"
                  >
                    Manage Appointment
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <LucideWrench size={18} />
                    <span className="text-sm">No appointments scheduled</span>
                  </div>
                  <Link 
                    href="/customer/appointment"
                    className="block w-full text-center rounded-lg bg-red-50 px-4 py-3 text-red-600 font-semibold hover:bg-red-100 transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              )}
            </div>

            {/* Modification Requests (scrollable list) */}
            <div className="rounded-lg bg-white shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <h3 className="text-gray-800 text-lg font-bold mb-4">Modification Requests</h3>
              {modLoading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : modError ? (
                <div className="text-sm text-red-600">{modError}</div>
              ) : mods.length > 0 ? (
                <div className="space-y-3">
                  {/* Scrollable list of modifications */}
                  <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {mods
                      .filter((mod) => mod.status === "pending")
                      .sort((a, b) => {
                        const aMs = a.createdAt && typeof a.createdAt.seconds === "number" 
                          ? a.createdAt.seconds * 1000 
                          : 0;
                        const bMs = b.createdAt && typeof b.createdAt.seconds === "number" 
                          ? b.createdAt.seconds * 1000 
                          : 0;
                        return bMs - aMs; // Most recent first
                      })
                      .map((mod) => (
                        <div key={mod.id} className="p-3 rounded-lg border border-gray-200 hover:border-red-100 transition-colors">
                          {mod.vehicleLabel && (
                            <div className="text-xs text-gray-600 mb-1">{mod.vehicleLabel}</div>
                          )}
                          {mod.subject && (
                            <div className="text-sm font-semibold text-gray-800 mb-2">Topic: {mod.subject}</div>
                          )}
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-xs">
                            <LucideWrench size={14} className="text-yellow-700" />
                            <span className="text-yellow-700 capitalize">Pending</span>
                          </div>
                        </div>
                      ))}
                  </div>
                  <Link 
                    href="/customer/modification"
                    className="block w-full text-center rounded-lg bg-red-50 px-4 py-3 text-red-600 font-semibold hover:bg-red-100 transition-colors mt-3"
                  >
                    Manage Modifications
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <LucideWrench size={18} />
                    <span className="text-sm">No modification requests yet</span>
                  </div>
                  <Link 
                    href="/customer/modification"
                    className="block w-full text-center rounded-lg bg-red-50 px-4 py-3 text-red-600 font-semibold hover:bg-red-100 transition-colors"
                  >
                    Request Modification
                  </Link>
            <div className="rounded-lg bg-white shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <h3 className="text-gray-800 text-lg font-bold mb-4">Current Service Status</h3>
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
            <div className="rounded-lg bg-red-50 p-6 border border-red-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-full bg-red-600">
                  <LucideBot className="text-white" size={20} />
                </div>
                <h3 className="text-gray-800 text-lg font-bold">Need Help?</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Chat with our AI assistant for quick answers about your service.</p>
              <Link 
                href="/customer/chatbot"
                className="block w-full text-center rounded-lg bg-red-600 px-4 py-3 text-white font-semibold hover:bg-red-700 transition-colors"
              >
                Start Chat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
