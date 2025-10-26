"use client";
import React, { useEffect, useState } from "react";
import AssignForm from "./AssignForm";

export interface Employee {
  id: number;
  name: string;
}

export interface AssignedApp {
  id: number;
  customerName: string;
  serviceType: string;
}

export default function AssignPage() {
  const [appointments, setAppointments] = useState<AssignedApp[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetch("/api/appointments?status=approved")
      .then((res) => res.json())
      .then(setAppointments);
    fetch("/api/employees/available")
      .then((res) => res.json())
      .then(setEmployees);
  }, []);

  return (
    <div className="flex justify-center">
      {/* <h1 className="text-2xl font-bold mb-6">Assign Employees</h1> */}
      <AssignForm appointments={appointments} employees={employees} />
    </div>
  );
}
