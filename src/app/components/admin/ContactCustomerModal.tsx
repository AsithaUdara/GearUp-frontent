// app/components/admin/ContactCustomerModal.tsx
'use client';
import { X } from "lucide-react";
import { motion } from "framer-motion";

type Props = { 
  isOpen: boolean; 
  onClose: () => void;
};

export default function ContactCustomerModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would trigger the backend to send an email/SMS
    console.log("Sending message...");
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
          <h2 className="font-heading text-xl font-bold">Contact Customer</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label htmlFor="customer" className="text-sm font-medium">Customer Name or Email</label>
            <input id="customer" placeholder="Search for a customer..." className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="message" className="text-sm font-medium">Message</label>
            <textarea id="message" rows={5} placeholder="Type your message to the customer..." className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Send as Email</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Send as SMS</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:brightness-110">Send Message</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
