"use client";

import React from "react";
import AssignedAppointmentTable from "./AssignedAppointmentTable";

export default function AssignedAppointmentsPage() {
  return (
    <div className="flex-col container mx-auto py-10 p-4 items-center justify-center">
      <h1 className="text-2xl font-bold mb-6 justify-center items-center">
        Assigned Appointments
      </h1>
      <AssignedAppointmentTable />
    </div>
  );
}
