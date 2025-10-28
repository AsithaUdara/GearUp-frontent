// src/app/employee/page.tsx
'use client'; 

import { useState } from 'react'; 
import AssignedTasksList, { Task } from "@/app/components/employee/dashboard/AssignedTasksList"; 
import ScheduleCard from "@/app/components/employee/dashboard/ScheduleCard";
import AppointmentManagementCard from "@/app/components/employee/dashboard/AppointmentManagementCard";
import WorkHoursSummaryCompactCard from "@/app/components/employee/dashboard/WorkHoursSummaryCompactCard";
import TimeLoggingCard from "@/app/components/employee/dashboard/TimeLoggingCard";
import StatsCards from "@/app/components/employee/dashboard/StatsCards";
import QuickActionsBar from "@/app/components/employee/dashboard/QuickActionsBar";

const mockTasks: Task[] = [
  { id: "1", title: "Oil Change - Toyota Camry", customer: "John Doe", vehicle: "V-XYZ123", status: "In Progress" },
  { id: "2", title: "Brake Inspection - Honda Civic", customer: "Jane Smith", vehicle: "V-ABC456", status: "Completed" },
  { id: "3", title: "Tire Rotation - Ford F-150", customer: "Mike Johnson", vehicle: "V-QWE789", status: "Pending" },
];

export default function EmployeeOverviewPage() {
  const [tasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(tasks[0] || null); // Default to first task

  // --- FIX: Add the state for shift management, just like in log-hours ---
  const [isClockedIn, setIsClockedIn] = useState(false);

  // Handler functions for the Shift Timer component
  const handleClockIn = () => {
    console.log("Dashboard shift started.");
    setIsClockedIn(true);
  };
  const handleClockOut = () => {
    console.log("Dashboard shift ended.");
    setIsClockedIn(false);
  };
  
  // Handler for the Task List component
  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task); 
    console.log("Task selected on dashboard:", task.title);
  };
  
  return (
    <section className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <StatsCards />
        <QuickActionsBar />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* --- FIX: Pass required props to the Shift Timer --- */}
          <WorkHoursSummaryCompactCard 
            isClockedIn={isClockedIn}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
          />
          {/* --- FIX: Pass required props to the Task Timer --- */}
          <TimeLoggingCard 
            task={selectedTask}
            isClockedIn={isClockedIn} 
          />
        </div>
        <AssignedTasksList 
          tasks={tasks} 
          onTaskSelect={handleTaskSelect} 
          selectedTaskId={selectedTask ? selectedTask.id : null} 
        />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <ScheduleCard />
        <AppointmentManagementCard />
      </div>
    </section>
  );
}