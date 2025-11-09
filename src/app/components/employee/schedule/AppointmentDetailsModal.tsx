"use client";
import { Pencil, X, XCircle } from "lucide-react";
import Link from "next/link";

type AppointmentDetails = {
  id: string;
  customerName: string;
  contact?: string;
  email?: string;
  vehicle?: { make?: string; model?: string; year?: string; vin?: string; plate?: string };
  services?: string[];
  date?: string;
  time?: string;
  assignee?: string;
  status?: string;
  communications?: Array<{ title: string; detail: string; at: string }>;
};

type Props = {
  open: boolean;
  details: AppointmentDetails;
  onClose: () => void;
  onConfirm?: () => void;
  onRequestReschedule?: () => void;
  allowActions?: boolean;
  showScheduleLink?: boolean;
};

export default function AppointmentDetailsModal({ open, details, onClose, onConfirm, onRequestReschedule, allowActions = true, showScheduleLink = false }: Props) {
  if (!open) return null;
  const s = details;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:p-8">
  <div className="w-full max-w-5xl rounded-xl border border-blue-200 bg-white shadow-xl transition-transform hover:shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-heading text-lg font-semibold">Appointment Details</h2>
          <div className="flex items-center gap-2">
            {showScheduleLink && (
              <Link href="/employee/schedule" className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700">
                View My Schedule
              </Link>
            )}
            {allowActions && (
              <>
                <button onClick={() => onConfirm?.()} className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
                  Confirm
                </button>
                <button onClick={() => onRequestReschedule?.()} className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
                  Request Reschedule
                </button>
              </>
            )}
            {/* print removed for employee details view */}
            <button aria-label="Close" onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-6">
          <div className="text-xs text-gray-500">#{s.id}</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-white p-4">
              <div className="mb-2 text-sm font-semibold">Customer Details</div>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Name:</span> {s.customerName}</div>
                {s.contact && <div><span className="font-medium">Contact:</span> {s.contact}</div>}
                {s.email && <div><span className="font-medium">Email:</span> {s.email}</div>}
              </div>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="mb-2 text-sm font-semibold">Vehicle Information</div>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Vehicle:</span> {s.vehicle?.make} {s.vehicle?.model}, {s.vehicle?.year}</div>
                {s.vehicle?.vin && <div><span className="font-medium">VIN:</span> {s.vehicle.vin}</div>}
                {s.vehicle?.plate && <div><span className="font-medium">Plate:</span> {s.vehicle.plate}</div>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-white p-4">
              <div className="mb-2 text-sm font-semibold">Service Details</div>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Service:</span> {s.services?.join(", ")}</div>
                <div><span className="font-medium">Date & Time:</span> {s.date}, {s.time}</div>
              </div>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="mb-2 text-sm font-semibold">Appointment Status</div>
              <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                <span className="h-2 w-2 rounded-full bg-yellow-500"></span> {s.status ?? "Scheduled"}
              </span>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="mb-4 text-sm font-semibold">Communication Log</div>
            <div className="space-y-6">
              {(s.communications ?? []).map((c, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto] items-start gap-4 text-sm">
                  <div>
                    <div className="font-medium">{c.title}</div>
                    <div className="text-gray-600">{c.detail}</div>
                  </div>
                  <div className="text-xs text-gray-500">{c.at}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
