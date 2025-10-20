"use client";
import { CheckCircle2, X } from "lucide-react";

type Props = {
  open: boolean;
  confirmationNumber?: string;
  onViewDetails: () => void;
  onReturn: () => void;
  onClose: () => void;
};

export default function AppointmentConfirmationModal({ open, confirmationNumber, onViewDetails, onReturn, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:p-8">
  <div className="w-full max-w-xl rounded-xl border border-gray-200 bg-white shadow-xl transition-transform hover:shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-sm font-medium text-gray-600">Appointment Confirmation Success</h2>
          <button aria-label="Close" onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-8 py-10">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <h3 className="mb-2 text-center text-lg font-semibold">Appointment Confirmed!</h3>
          <p className="mx-auto mb-6 max-w-md text-center text-sm text-gray-600">
            Your appointment has been successfully confirmed. Your confirmation number is
            {" "}
            <span className="font-medium">{confirmationNumber ?? "#123456"}</span>.
            {" "}You can view your appointment details or return to the dashboard.
          </p>
          <div className="mx-auto flex max-w-sm flex-col gap-3">
            <button onClick={onViewDetails} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              View Appointment Details
            </button>
            <button onClick={onReturn} className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200">
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
