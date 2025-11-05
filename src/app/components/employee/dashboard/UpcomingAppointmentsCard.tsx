"use client";
import { useSyncExternalStore, useState } from "react";
import { subscribe, getAppointments, updateAppointment } from "@/lib/appointmentsStore";
import { useRouter } from "next/navigation";

export default function UpcomingAppointmentsCard({ max = 3 }: { max?: number }) {
  const router = useRouter();
  const appointments = useSyncExternalStore(subscribe, getAppointments) ?? [];
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const upcoming = appointments.filter((a: any) => !a.past).slice(0, max);

  const handleView = (a: any) => {
    router.push(`/employee/schedule?date=${a.date}&appt=${a.id}`);
  };

  const handleConfirm = async (a: any) => {
    setLoadingIds((s) => [...s, a.id]);
    try {
      updateAppointment({ id: a.id, status: "Confirmed" });
    } finally {
      setLoadingIds((s) => s.filter((id) => id !== a.id));
    }
  };

  const handleReschedule = (a: any) => {
    router.push(`/employee/schedule?reschedule=${a.id}&date=${a.date}`);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
        <button onClick={() => router.push('/employee/schedule')} className="text-sm text-red-600 hover:underline">View All</button>
      </div>

      <ul className="mt-3 space-y-3">
        {upcoming.length === 0 && <li className="text-sm text-gray-500">No upcoming appointments</li>}
        {upcoming.map((a: any) => (
          <li key={a.id} className="rounded-lg border border-gray-100 p-3 bg-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold">{a.time ? `${a.time} — ` : ''}{a.customer}</div>
                <div className="text-xs text-gray-600">{a.service} · {a.vehicle}</div>
                <div className="text-xs text-gray-500">{a.date} • {a.status}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => handleView(a)} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-50">View</button>
                <button onClick={() => handleConfirm(a)} disabled={loadingIds.includes(a.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-green-700">Confirm</button>
                <button onClick={() => handleReschedule(a)} className="text-xs text-gray-600 hover:underline">Reschedule</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

