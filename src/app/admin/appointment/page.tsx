"use client";
import React, { useEffect, useState } from "react";
import AppointmentTable from "./AppointmentTable";
import ApprovalModal from "./ApprovalModal";
import Header from "@/app/components/landing/Header";

export interface Appointment {
  id: number;
  customerName: string;
  vehicleModel: string;
  date: string;
  serviceType: string;
  status: "pending" | "approved" | "rejected";
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);

  useEffect(() => {
    fetch("/api/appointments")
      .then((res) => res.json())
      .then(setAppointments)
      .catch(console.error);
  }, []);

  const handleApprove = async (id: number) => {
    await fetch(`/api/appointments/${id}/approve`, { method: "POST" });
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a))
    );
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-wide uppercase mb-6 text-center">
          Appointments for Approval
        </h1>
        <AppointmentTable
          appointments={appointments}
          onApprove={handleApprove}
          onSelect={setSelectedApp}
        />

        {selectedApp && (
          <ApprovalModal
            appointment={selectedApp}
            onClose={() => setSelectedApp(null)}
            onApprove={() => handleApprove(selectedApp.id)}
          />
        )}
      </div>
    </>
  );
}
