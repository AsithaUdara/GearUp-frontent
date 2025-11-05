"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Appointment } from "@/app/admin/appointment/page"; // Import Appointment interface
import { toast } from "sonner";
import AssignedAppointmentTable from "./AssignedAppointmentTable"; // Import the new table component

export default function AssignedAppointmentsPage() {
  const [assignedAppointments, setAssignedAppointments] = useState<Appointment[]>([]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignedAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/assigned-appointments");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: Appointment[] = await res.json();
      setAssignedAppointments(data);
    } catch (e: any) {
      setError(e.message);
      toast.error("Failed to fetch assigned appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignedAppointments();
  }, [fetchAssignedAppointments]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Assigned Appointments</h1>
      <AssignedAppointmentTable
        appointments={assignedAppointments}
        loading={loading}
        error={error}
        refreshAppointments={fetchAssignedAppointments} // Pass the refresh function
      />
    </div>
  );
}
