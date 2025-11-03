// app/components/admin/NewAppointmentModal.tsx
"use client";
import { X } from "lucide-react";

type Props = { open: boolean; onClose: () => void; };

export default function NewAppointmentModal({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-heading text-xl font-bold">Add New Appointment</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <form className="space-y-4 p-6 max-h-[80vh] overflow-y-auto">
          {/* Form fields here, using the same styling as the login modal */}
        </form>
      </div>
    </div>
  );
}
