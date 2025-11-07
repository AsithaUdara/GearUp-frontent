"use client";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: Record<string, string>) => void;
};

export default function NewAppointmentModal({ open, onClose, onSubmit }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((v, k) => (data[k] = String(v)));
    onSubmit?.(data);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:p-8">
      <div
        ref={dialogRef}
        className="w-full max-w-4xl rounded-xl border border-gray-200 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-heading text-lg font-semibold">Add New Appointment</h2>
          <button aria-label="Close" onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Customer Name</label>
              <input name="customerName" placeholder="Enter customer name" className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Customer Contact</label>
              <input name="customerContact" placeholder="Enter customer contact" className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Vehicle Make</label>
              <input name="vehicleMake" placeholder="Enter vehicle make" className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Vehicle Model</label>
              <input name="vehicleModel" placeholder="Enter vehicle model" className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600" />
            </div>
          </div>

          {/* Row 3 */}
          <div>
            <label className="mb-1 block text-sm font-medium">Vehicle VIN</label>
            <input name="vehicleVin" placeholder="Enter vehicle VIN" className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600" />
          </div>

          {/* Row 4 */}
          <div>
            <label className="mb-1 block text-sm font-medium">Service Type</label>
            <select name="serviceType" className="w-full appearance-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600">
              <option value="">Select a service type</option>
              <option>Oil Change</option>
              <option>Brake Inspection</option>
              <option>Tire Rotation</option>
              <option>Engine Diagnostics</option>
              <option>Battery Replacement</option>
            </select>
          </div>


          {/* Row 5 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Preferred Date</label>
              <input type="date" name="preferredDate" placeholder="mm/dd/yyyy" className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Preferred Time</label>
              <input type="time" name="preferredTime" placeholder="--:-- --" className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600" />
            </div>
          </div>

          {/* Row 6 */}
          <div>
            <label className="mb-1 block text-sm font-medium">Special Notes</label>
            <textarea name="notes" placeholder="Enter any special requests or notes..." className="min-h-24 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200">Cancel</button>
            <button type="submit" className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Submit Appointment</button>
          </div>
        </form>
      </div>
    </div>
  );
}
