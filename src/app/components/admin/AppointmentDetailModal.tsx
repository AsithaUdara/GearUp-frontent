// app/components/admin/AppointmentDetailModal.tsx
'use client';
import { X, User, Car, Calendar, Wrench, Check, Printer, DollarSign, MessageSquare } from 'lucide-react';
import type { Appointment } from '@/app/admin/appointments/page';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
};

export default function AppointmentDetailModal({ isOpen, onClose, appointment }: Props) {
  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-lg bg-white shadow-xl" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-heading text-xl font-bold">Appointment Details: #{appointment.id}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        
        <div className="p-6 max-h-[80vh] overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><User className="h-4 w-4"/>Customer & Vehicle</h3>
              <p>{appointment.customer.name}</p>
              <p className="text-muted-foreground text-sm">{appointment.customer.vehicle}</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Calendar className="h-4 w-4"/>Schedule</h3>
              <p>{appointment.startTime}, {appointment.duration} mins</p>
              <p className="text-muted-foreground text-sm">Assigned to: {appointment.assignedEmployee || 'Unassigned'}</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Wrench className="h-4 w-4"/>Tasks & Progress</h3>
              <ul className="space-y-2">
                {appointment.tasks.map(task => (
                  <li key={task.name} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={task.completed} readOnly className="h-4 w-4 accent-primary"/>
                    <span className={task.completed ? 'line-through text-muted-foreground' : ''}>{task.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Actions */}
          <div className="space-y-4">
            <div className="rounded-lg border bg-gray-50 p-4">
                <p className="font-semibold text-sm mb-2">Status</p>
                <select defaultValue={appointment.status} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Scheduled</option>
                    <option>In Progress</option>
                    <option>Awaiting Parts</option>
                    <option>Completed</option>
                    <option>Paid</option>
                </select>
            </div>
            <div className="rounded-lg border bg-gray-50 p-4">
                <p className="font-semibold text-sm mb-2">Assign Employee</p>
                <select defaultValue={appointment.assignedEmployee || ''} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Unassigned</option>
                    <option>Mike R.</option>
                    <option>Sarah K.</option>
                </select>
            </div>
            <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:brightness-110">
                    Save Changes
                </button>
                <button className="w-full flex items-center justify-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
                    <Printer className="h-4 w-4"/> Generate Bill
                </button>
                <button className="w-full flex items-center justify-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
                    <DollarSign className="h-4 w-4"/> Mark as Paid
                </button>
                <button className="w-full flex items-center justify-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
                    <MessageSquare className="h-4 w-4"/> Contact Customer
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
