// src/app/employee/page.tsx
'use client'; 

import { useState } from 'react'; 
import AssignedTasksList, { Task } from "@/app/components/employee/dashboard/AssignedTasksList"; 
import ScheduleCard from "@/app/components/employee/dashboard/ScheduleCard";
import AppointmentManagementCard from "@/app/components/employee/dashboard/AppointmentManagementCard";
// --- FIX: The WorkHoursSummaryCompactCard is no longer imported ---
import TimeLoggingCard from "@/app/components/employee/dashboard/TimeLoggingCard";
import StatsCards from "@/app/components/employee/dashboard/StatsCards";
import QuickActionsBar from "@/app/components/employee/dashboard/QuickActionsBar";
import ServiceProgressCard from "@/app/components/employee/dashboard/ServiceProgressCard";
import NotificationsCard from "@/app/components/employee/dashboard/NotificationsCard";
import CommunicationShortcuts from "@/app/components/employee/dashboard/CommunicationShortcuts";
import AttendanceQuickAccess from "@/app/components/employee/dashboard/AttendanceQuickAccess";

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
        <QuickActionsBar />
        <ServiceProgressCard />
        
        {/* --- FIX: The grid and the WorkHoursSummaryCompactCard have been removed --- */}
        {/* The TimeLoggingCard can now sit directly in the layout */}
        <TimeLoggingCard 
          task={selectedTask} 
          // The `isClockedIn` prop is correctly removed
        />
        
        <AssignedTasksList 
          tasks={tasks} 
          onTaskSelect={handleTaskSelect} 
          selectedTaskId={selectedTask ? selectedTask.id : null} 
        />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <NotificationsCard />
        <ScheduleCard />
        <AttendanceQuickAccess />
        <AppointmentManagementCard />
        <CommunicationShortcuts />
      </div>
    </section>
  );
}