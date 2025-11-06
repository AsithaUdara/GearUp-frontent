// small in-memory store for appointments (dashboard + schedule sync)
// small in-memory store for appointments (dashboard + schedule sync)
// define local type used by the store
export type Appointment = {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  customer: string;
  vehicle?: string;
  service?: string;
  status?: string;
  past?: boolean;
};

let appointments: Appointment[] = [
  { id: "A1", date: "2025-11-05", time: "09:00 AM", customer: "John Doe", vehicle: "Toyota Camry", service: "Oil Change", status: "Assigned", past: false },
  { id: "A2", date: "2025-11-05", time: "11:30 AM", customer: "Jane Smith", vehicle: "Honda Civic", service: "Brake Inspection", status: "Awaiting Parts", past: false },
  { id: "A3", date: "2025-10-28", time: "02:00 PM", customer: "Peter Jones", vehicle: "Ford F-150", service: "Tire Rotation", status: "Completed", past: true },
];

const listeners = new Set<() => void>();

function notify() {
  for (const l of Array.from(listeners)) l();
}

export function getAppointments() {
  return appointments;
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setAppointments(next: Appointment[]) {
  appointments = next;
  notify();
}

export function updateAppointment(updated: Partial<Appointment> & { id: string }) {
  appointments = appointments.map((a) => (a.id === updated.id ? { ...a, ...updated } : a));
  notify();
}

export function addAppointment(a: Appointment) {
  appointments = [...appointments, a];
  notify();
}

export function removeAppointment(id: string) {
  appointments = appointments.filter((a) => a.id !== id);
  notify();
}
