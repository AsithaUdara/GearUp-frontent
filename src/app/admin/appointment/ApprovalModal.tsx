"use client";
import React from "react";
import { Appointment } from "./types";

interface ApprovalModalProps {
  appointment: Appointment;
  onClose: () => void;
  onApprove: () => void;
}

export default function ApprovalModal({
  appointment,
  onClose,
  onApprove,
}: ApprovalModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm">
      {/* Modal Card */}
      <div className="bg-background rounded-xl shadow-xl border border-border w-[26rem] p-6 font-body text-foreground animate-fadeIn">
        {/* Header */}
        <h2 className="font-heading text-2xl font-bold mb-4 text-primary">
          Review Appointment
        </h2>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <Detail label="Customer" value={appointment.customerName} />
          <Detail label="Service" value={appointment.serviceName} />
          <Detail label="Date" value={appointment.timeSlot.slotDate} />
          <Detail
            label="Time"
            value={`${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`}
          />
          <Detail label="Phone" value={appointment.customerPhone} />
          <Detail label="Email" value={appointment.customerEmail} />
          <Detail label="Notes" value={appointment.notes || "No notes"} />
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onApprove}
            className="px-4 py-2 rounded-md bg-green-500 hover:bg-green-700 text-white font-medium transition-colors duration-200"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-border hover:bg-gray-300 text-foreground font-medium transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* Small reusable detail row component */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between text-left bg-muted/30 rounded-md px-3 py-2 border border-border/40">
      <span className="font-semibold text-foreground/90">{label}:</span>
      <span className="text-muted-foreground ml-2">{value}</span>
    </p>
  );
}
