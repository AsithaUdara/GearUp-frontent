"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  unavailableDates?: string[];
  onSave?: (dates: string[]) => void;
};

export default function SetAvailabilityModal({ open, onClose, unavailableDates = [], onSave }: Props) {
  // hooks must be called unconditionally to satisfy React rules of hooks
  const [local, setLocal] = useState<string[]>([...unavailableDates]);
  const [newDate, setNewDate] = useState("");

  // sync the local list when modal opens or when parent prop changes
  useEffect(() => {
    if (open) setLocal([...unavailableDates]);
  }, [open, unavailableDates]);

  if (!open) return null;

  function addDate() {
    if (!newDate) return;
    if (!local.includes(newDate)) setLocal((s: string[]) => [...s, newDate]);
    setNewDate("");
  }

  function removeDate(d: string) {
    setLocal((s: string[]) => s.filter((x: string) => x !== d));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:p-8">
      <div className="w-full max-w-3xl rounded-xl border border-gray-200 bg-white shadow-xl transition-transform hover:shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="space-y-1">
            <h2 className="font-heading text-xl font-semibold">Set Your Availability</h2>
            <p className="text-sm text-gray-600">Manage unavailable dates (vacation/blocked days). These will appear on the calendar.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { onSave?.(local); onClose(); }} className="inline-flex items-center gap-2 rounded-md bg-red-600 text-white px-3 py-2 text-xs font-medium hover:bg-red-700">Save Changes</button>
            <button aria-label="Close" onClick={onClose} className="rounded-md p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="rounded-md border px-3 py-2 text-sm" />
            <button onClick={addDate} className="rounded-md bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200">Add Blocked Date</button>
          </div>

          <div className="space-y-2">
            {local.length === 0 && <div className="text-sm text-gray-500">No blocked dates</div>}
            {local.map((d: string) => (
              <div key={d} className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
                <div className="text-sm">{d}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => removeDate(d)} className="text-sm text-red-600">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
