"use client";
import ScheduleToolbar from "../../components/employee/schedule/ScheduleToolbar";
import AvailabilityPanel from "../../components/employee/schedule/AvailabilityPanel";
import CalendarInteractive from "../../components/employee/schedule/CalendarInteractive";
import UpcomingAppointmentsTable from "../../components/employee/schedule/UpcomingAppointmentsTable";
import SetAvailabilityModal from "../../components/employee/schedule/SetAvailabilityModal";
import AppointmentDetailsModal from "../../components/employee/schedule/AppointmentDetailsModal";
import RescheduleRequestModal from "../../components/employee/schedule/RescheduleRequestModal";
import { useState } from "react";

type Appointment = {
  id: string;
  date: string;
  time: string;
  customer: string;
  vehicle: string;
  service: string;
  assignee: string;
  status: string;
  communications?: Array<{ title: string; detail: string; at: string }>;
  past?: boolean;
};

export default function EmployeeSchedulePage() {
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([
    // sample blocked dates
    "2025-10-25",
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: "A1", date: "2025-11-05", time: "09:00 AM", customer: "John Doe", vehicle: "Toyota Camry", service: "Oil Change", assignee: "You", status: "Assigned", past: false, communications: [] },
    { id: "A2", date: "2025-11-05", time: "11:30 AM", customer: "Jane Smith", vehicle: "Honda Civic", service: "Brake Inspection", assignee: "You", status: "Awaiting Parts", past: false, communications: [] },
    { id: "A3", date: "2025-10-28", time: "02:00 PM", customer: "Peter Jones", vehicle: "Ford F-150", service: "Tire Rotation", assignee: "You", status: "Completed", past: true, communications: [] },
  ]);

  const [selected, setSelected] = useState<Appointment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  function handleView(row: Appointment) {
    setSelected(row);
    setDetailsOpen(true);
  }

  function handleConfirm() {
    if (!selected) return;
    setAppointments((prev) => prev.map((a) => (a.id === selected.id ? { ...a, status: "Confirmed", communications: [...(a.communications ?? []), { title: "Confirmed", detail: "Employee confirmed the appointment.", at: new Date().toLocaleString() }] } : a)));
    setDetailsOpen(false);
  }

  function handleConfirmRow(r: Appointment) {
    const appt = appointments.find((a) => a.id === r.id);
    if (!appt) return;
    setSelected(appt);
    setAppointments((prev) => prev.map((a) => (a.id === appt.id ? { ...a, status: "Confirmed", communications: [...(a.communications ?? []), { title: "Confirmed", detail: "Employee confirmed the appointment.", at: new Date().toLocaleString() }] } : a)));
  }

  function handleRequestReschedule() {
    setRescheduleOpen(true);
  }

  function handleRequestRow(r: Appointment) {
    const appt = appointments.find((a) => a.id === r.id);
    if (!appt) return;
    setSelected(appt);
    setRescheduleOpen(true);
  }

  function handleSubmitReschedule(payload: { preferredDate?: string; preferredTime?: string; reason?: string }) {
    if (!selected) return;
    const note = `Reschedule requested: ${payload.preferredDate ?? ""} ${payload.preferredTime ?? ""} - ${payload.reason ?? ""}`;
    setAppointments((prev) => prev.map((a) => (a.id === selected.id ? { ...a, status: "Reschedule Requested", communications: [...(a.communications ?? []), { title: "Reschedule Requested", detail: note, at: new Date().toLocaleString() }] } : a)));
    setRescheduleOpen(false);
    setDetailsOpen(false);
  }

  const upcoming = appointments.filter((a) => !a.past);
  const history = appointments.filter((a) => a.past);

  return (
    <div className="space-y-6">
      <ScheduleToolbar />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarInteractive
            appointments={appointments.map(a => ({ id: a.id, date: a.date, time: a.time, customer: a.customer, vehicle: a.vehicle, service: a.service, status: a.status }))}
            unavailableDates={unavailableDates}
            onView={(a) => handleView(appointments.find((x) => x.id === a.id) as Appointment)}
          />
        </div>
        <div className="lg:col-span-1">
          <AvailabilityPanel onOpenSetAvailability={() => setAvailabilityOpen(true)} />
        </div>
      </div>

      <UpcomingAppointmentsTable
        title="Upcoming Appointments"
        rows={upcoming.map((a) => ({ id: a.id, time: `${a.date} ${a.time}`, customer: a.customer, vehicle: a.vehicle, service: a.service, status: a.status }))}
        onView={(r) => handleView(appointments.find((x) => x.id === r.id) as Appointment)}
      />

      <UpcomingAppointmentsTable
        title="Appointment History"
        rows={history.map((a) => ({ id: a.id, time: `${a.date} ${a.time}`, customer: a.customer, vehicle: a.vehicle, service: a.service, status: a.status }))}
        onView={(r) => handleView(appointments.find((x) => x.id === r.id) as Appointment)}
      />

  <SetAvailabilityModal open={availabilityOpen} onClose={() => setAvailabilityOpen(false)} unavailableDates={unavailableDates} onSave={(d) => setUnavailableDates(d)} />

      {selected && (
        <AppointmentDetailsModal
          open={detailsOpen}
          details={{
            id: selected.id,
            customerName: selected.customer,
            contact: undefined,
            email: undefined,
            vehicle: { make: selected.vehicle },
            services: [selected.service],
            date: selected.date,
            time: selected.time,
            assignee: selected.assignee,
            status: selected.status,
            communications: selected.communications,
          }}
          onClose={() => setDetailsOpen(false)}
          onConfirm={handleConfirm}
          onRequestReschedule={handleRequestReschedule}
          allowActions={selected.status !== "Completed"}
        />
      )}

      <RescheduleRequestModal open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} onSubmit={handleSubmitReschedule} />
    </div>
  );
}
