"use client";
import { useSyncExternalStore } from "react";
import { subscribe as subscribeAppts, getAppointments, updateAppointment } from "@/lib/appointmentsStore";
import Link from "next/link";

// Server snapshot function cached outside component
const getServerSnapshot = () => [];

export default function AppointmentManagementCard() {

  const appointments = useSyncExternalStore(subscribeAppts, getAppointments, getServerSnapshot);

  const appointments = useSyncExternalStore(subscribeAppts, getAppointments, getAppointments);

  // show only the next upcoming appointment (non-past), sorted by date then time
  const sorted = [...appointments].sort((a, b) => {
    if (a.date === b.date) return (a.time || "").localeCompare(b.time || "");
    return a.date.localeCompare(b.date);
  });

  const upcoming = sorted.filter((a) => !a.past);
  const next = upcoming.length > 0 ? upcoming[0] : null;

  const handleConfirm = (id: string) => updateAppointment({ id, status: "Confirmed" });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="font-heading text-lg font-semibold mb-3">Appointment Management</h3>

      <div className="mb-3 text-sm font-medium">Upcoming Appointment</div>

      {!next ? (
        <p className="text-xs text-gray-600">No upcoming appointments.</p>
      ) : (
        <div className="rounded-lg border border-gray-100 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{next.date} {next.time ? `— ${next.time}` : ""} — {next.service ?? "Service"}</div>
              <div className="text-[12px] text-gray-600">{next.customer} — {next.vehicle}</div>
              <div className="text-[12px] text-gray-500 mt-1">Status: <span className="font-medium">{next.status ?? "Unknown"}</span></div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Link href={`/employee/schedule?appointmentId=${encodeURIComponent(next.id)}`} className="text-xs text-red-600 hover:underline">View</Link>
              {next.status !== "Confirmed" && (
                <button onClick={() => handleConfirm(next.id)} className="text-xs text-green-600 hover:underline">Confirm</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Link href="/employee/schedule" className="text-xs font-medium text-red-600 hover:underline">View Schedule</Link>
      </div>
    </div>
  );
}
