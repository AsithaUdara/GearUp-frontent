"use client";
import { X } from "lucide-react";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { preferredDate?: string; preferredTime?: string; reason?: string }) => void;
};

export default function RescheduleRequestModal({ open, onClose, onSubmit }: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ preferredDate: date, preferredTime: time, reason });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:p-8">
      <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-heading text-lg font-semibold">Request Reschedule</h3>
          <button aria-label="Close" onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-gray-600">Preferred Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-md border p-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Preferred Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-md border p-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-600">Reason / Note</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-md border p-2 text-sm" placeholder="Provide a reason for reschedule (e.g., parts delay, workload, etc.)" />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md border px-3 py-2 text-sm">Cancel</button>
            <button type="submit" className="rounded-md bg-red-600 px-3 py-2 text-sm text-white">Send Request</button>
          </div>
        </form>
      </div>
    </div>
  );
}
