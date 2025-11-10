// src/app/employee/page.tsx
"use client"; 
// Force dynamic rendering so Next won't try to prerender this client-heavy page
export const dynamic = 'force-dynamic';

import { useState } from 'react'; 
import AssignedTasksList, { Task } from "@/app/components/employee/dashboard/AssignedTasksList"; 
import ScheduleCard from "@/app/components/employee/dashboard/ScheduleCard";
import SmallCalendar from "@/app/components/employee/dashboard/SmallCalendar";
import AppointmentManagementCard from "@/app/components/employee/dashboard/AppointmentManagementCard";
// --- FIX: The WorkHoursSummaryCompactCard is no longer imported ---
import TimeLoggingCard from "@/app/components/employee/dashboard/TimeLoggingCard";
import StatsCards from "@/app/components/employee/dashboard/StatsCards";
import UpcomingAppointmentsCard from "@/app/components/employee/dashboard/UpcomingAppointmentsCard";

const mockTasks: Task[] = [
  { id: "1", title: "Oil Change - Toyota Camry", customer: "John Doe", vehicle: "V-XYZ123", status: "In Progress" },
  { id: "2", title: "Brake Inspection - Honda Civic", customer: "Jane Smith", vehicle: "V-ABC456", status: "Completed" },
  { id: "3", title: "Tire Rotation - Ford F-150", customer: "Mike Johnson", vehicle: "V-QWE789", status: "Pending" },
];

export default function EmployeeOverviewPage() {
  const [tasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(tasks[0] || null); // Default to the first task for the timer

  // --- FIX: All state and handlers for `isClockedIn` have been removed ---

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task); 
  };
  
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
  <StatsCards />
        {/* Time Logging Card - full width */}
        <TimeLoggingCard task={selectedTask} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssignedTasksList 
            tasks={tasks} 
            onTaskSelect={handleTaskSelect} 
            selectedTaskId={selectedTask ? selectedTask.id : null} 
          />
          {/* Upcoming appointments quick access (reusable) */}
          <div>
            {/* keep same padding/visual rhythm as AssignedTasks */}
            <UpcomingAppointmentsCard />
          </div>
  </div>

        {/* Quick communication and material requests were here but should span full page - moved to bottom */}
      </div>
      <div className="lg:col-span-1 space-y-6">
  <SmallCalendar />
  <ScheduleCard />
      </div>
    </section>
  );
}