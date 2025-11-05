// app/components/admin/PartRequestModal.tsx
'use client';
import { X } from "lucide-react";
import { motion } from "framer-motion";

type Props = { 
  isOpen: boolean; 
  onClose: () => void;
};

export default function PartRequestModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit the form data to the backend API
    console.log("Submitting part request...");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-lg bg-white shadow-xl" 
        role="dialog" 
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-heading text-xl font-bold">Request New Parts</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label htmlFor="partName" className="text-sm font-medium">Part Name or SKU</label>
            <input id="partName" placeholder="e.g., Brake Pads - BP-1138" className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="text-sm font-medium">Quantity</label>
              <input id="quantity" type="number" defaultValue={1} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label htmlFor="serviceId" className="text-sm font-medium">Link to Service ID (Optional)</label>
              <input id="serviceId" placeholder="e.g., SVC-00123" className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:brightness-110">Submit Request</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
