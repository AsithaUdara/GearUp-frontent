"use client";
import { useSyncExternalStore, useState } from "react";
import { subscribe, getAppointments, Appointment } from "@/lib/appointmentsStore";
import { useRouter } from "next/navigation";
import AppointmentDetailsModal from "@/app/components/employee/schedule/AppointmentDetailsModal";

export default function UpcomingAppointmentsCard({ max = 3 }: { max?: number }) {
  const router = useRouter();
  // Use getAppointments for both client and server snapshots
  const appointments = useSyncExternalStore(subscribe, getAppointments, getAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const upcoming = (appointments || []).filter((a) => !a.past).slice(0, max);

  const handleView = (a: Appointment) => {
    setSelectedAppointment(a);
    setModalOpen(true);
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
                <button onClick={() => handleView(a)} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700">View</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {selectedAppointment && (
        <AppointmentDetailsModal
          open={modalOpen}
          details={{
            id: selectedAppointment.id,
            customerName: selectedAppointment.customer,
            vehicle: { make: selectedAppointment.vehicle },
            services: [selectedAppointment.service || ""],
            date: selectedAppointment.date,
            time: selectedAppointment.time,
            assignee: "You",
            status: selectedAppointment.status,
          }}
          onClose={() => setModalOpen(false)}
          showScheduleLink={true}
        />
      )}
    </div>
  );
}

