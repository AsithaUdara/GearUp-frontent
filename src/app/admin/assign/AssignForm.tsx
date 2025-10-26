"use client";
import React, { useState } from "react";
import { AssignedApp, Employee } from "./page";
import EmployeeSelect from "./EmployeeSelect";

interface Props {
  appointments: AssignedApp[];
  employees: Employee[];
}

export default function AssignForm({ appointments, employees }: Props) {
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssign = async () => {
    // Reset any previous error
    setError(null);

    if (!selectedAppId || !selectedEmpId) {
      setError("Please select both appointment and employee.");
      return;
    }

    // 💡 Check if selected appointment is approved
    const selectedApp = appointments.find((a) => a.id === selectedAppId);
    if (!selectedApp || (selectedApp as any).status !== "approved") {
      // If status is not approved, show an error
      setError("Only approved appointments can be assigned.");
      return;
    }

    setLoading(true);

    try {
      await fetch("/api/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedAppId,
          employeeId: selectedEmpId,
        }),
      });
      alert("Employee assigned successfully!");
      setSelectedAppId(null);
      setSelectedEmpId(null);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while assigning. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg w-full bg-background border border-border shadow-sm rounded-xl p-6 space-y-5">
      <h2 className="text-2xl font-heading font-bold text-primary mb-2">
        Assign Employee
      </h2>
      <p className="text-muted-foreground text-sm mb-4">
        Link an approved appointment with an available employee.
      </p>

      {/* Appointment Select */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">
          Select Appointment
        </label>
        <select
          value={selectedAppId ?? ""}
          onChange={(e) => setSelectedAppId(Number(e.target.value))}
          className="block w-full rounded-md border border-border bg-white px-3 py-2 font-body text-sm text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 transition-all"
        >
          <option value="">Choose an appointment</option>
          {appointments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.customerName} — {a.serviceType}
            </option>
          ))}
        </select>
      </div>

      {/* Employee Select */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">
          Select Employee
        </label>
        <EmployeeSelect
          employees={employees}
          selectedEmpId={selectedEmpId}
          onChange={setSelectedEmpId}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleAssign}
        disabled={loading}
        className={`w-full rounded-md px-4 py-2 font-semibold text-sm text-white transition-colors duration-200 ${
          loading
            ? "bg-primary/50 cursor-not-allowed"
            : "bg-primary hover:bg-primary/90"
        }`}
      >
        {loading ? "Assigning..." : "Assign Employee"}
      </button>
    </div>
  );
}
