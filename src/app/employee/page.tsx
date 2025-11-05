// src/app/employee/page.tsx
'use client'; 

import { useState } from 'react'; 
import AssignedTasksList, { Task } from "@/app/components/employee/dashboard/AssignedTasksList"; 
import ScheduleCard from "@/app/components/employee/dashboard/ScheduleCard";
import SmallCalendar from "@/app/components/employee/dashboard/SmallCalendar";
import AppointmentManagementCard from "@/app/components/employee/dashboard/AppointmentManagementCard";
// --- FIX: The WorkHoursSummaryCompactCard is no longer imported ---
import TimeLoggingCard from "@/app/components/employee/dashboard/TimeLoggingCard";
import StatsCards from "@/app/components/employee/dashboard/StatsCards";
import ServiceProgressCard from "@/app/components/employee/dashboard/ServiceProgressCard";
import NotificationsCard from "@/app/components/employee/dashboard/NotificationsCard";
import AttendanceQuickAccess from "@/app/components/employee/dashboard/AttendanceQuickAccess";
import UpcomingAppointmentsCard from "@/app/components/employee/dashboard/UpcomingAppointmentsCard";
import QuickCommunicationCard from "@/app/components/employee/dashboard/QuickCommunicationCard";
import MaterialRequestsCard from "@/app/components/employee/dashboard/MaterialRequestsCard";

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
        {/* Swap: show Time Logging above Service Progress for a tighter flow */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <div className="md:col-span-2">
            <TimeLoggingCard task={selectedTask} />
          </div>
          <div className="md:col-span-1">
            <AttendanceQuickAccess />
          </div>
        </div>

        <ServiceProgressCard />
        
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
        <NotificationsCard />
  <SmallCalendar />
  <ScheduleCard />
      </div>
      {/* Inline row for quick communication and material requests */}
      <div className="col-span-1 lg:col-span-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickCommunicationCard />
          <MaterialRequestsCard />
        </div>
      </div>
    </section>
  );
}