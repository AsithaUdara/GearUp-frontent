"use client";
import ScheduleToolbar from "../../components/employee/schedule/ScheduleToolbar";
import AvailabilityPanel from "../../components/employee/schedule/AvailabilityPanel";
import CalendarMonth from "../../components/employee/schedule/CalendarMonth";
import UpcomingAppointmentsTable from "../../components/employee/schedule/UpcomingAppointmentsTable";
import SetAvailabilityModal from "../../components/employee/schedule/SetAvailabilityModal";
import { useState } from "react";

export default function EmployeeSchedulePage() {
  const [availabilityOpen, setAvailabilityOpen] = useState(false);

  return (
    <div className="space-y-6">
  <ScheduleToolbar />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarMonth />
        </div>
        <div className="lg:col-span-1">
          <AvailabilityPanel onOpenSetAvailability={() => setAvailabilityOpen(true)} />
        </div>
      </div>
      <UpcomingAppointmentsTable />
      <SetAvailabilityModal open={availabilityOpen} onClose={() => setAvailabilityOpen(false)} />
    </div>
  );
}
