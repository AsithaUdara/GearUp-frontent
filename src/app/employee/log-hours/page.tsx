// src/app/employee/log-hours/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import TimeLoggingCard from "@/app/components/employee/dashboard/TimeLoggingCard";
import AssignedTasksList, { Task } from "@/app/components/employee/dashboard/AssignedTasksList";
import WorkHoursSummaryCompactCard from "@/app/components/employee/dashboard/WorkHoursSummaryCompactCard";
import { Search } from "lucide-react";

const mockTasks: Task[] = [
  { id: "1", title: "Oil Change - Toyota Camry", customer: "John Doe", vehicle: "V-XYZ123", status: "In Progress" },
  { id: "2", title: "Brake Inspection - Honda Civic", customer: "Jane Smith", vehicle: "V-ABC456", status: "Completed" },
  { id: "3", title: "Tire Rotation - Ford F-150", customer: "Mike Johnson", vehicle: "V-QWE789", status: "Pending" },
  { id: "4", title: "Diagnostic Test - Ford F-150", customer: "Sam Wilson", vehicle: "V-QWE789", status: "In Progress" },
];

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{subtitle}</p>
    </div>
);

export default function LogHoursPage() {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // The "clocked in" status is now managed by this parent page
    const [isClockedIn, setIsClockedIn] = useState(false);

    const filteredTasks = useMemo(() => {
      if (!searchQuery) return mockTasks;
      return mockTasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [searchQuery]);

    // Handler functions that will be passed down to the Shift Timer
    const handleClockIn = () => {
        console.log("Shift started.");
        setIsClockedIn(true);
    };

    const handleClockOut = () => {
        console.log("Shift ended.");
        setIsClockedIn(false);
    };

    return (
        <section className="space-y-8 p-8">
            <SectionHeader 
                title="Time & Task Logging" 
                subtitle="Manage your shift and log progress on assigned tasks." 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                <div>
                     <h2 className="text-lg font-semibold text-gray-800 mb-2">My Shift</h2>
                     <WorkHoursSummaryCompactCard 
                        isClockedIn={isClockedIn}
                        onClockIn={handleClockIn}
                        onClockOut={handleClockOut}
                     />
                </div>
                <div>
                     <h2 className="text-lg font-semibold text-gray-800 mb-2">Current Task Timer</h2>
                    <TimeLoggingCard 
                        task={selectedTask} 
                        isClockedIn={isClockedIn} 
                    />
                </div>
            </div>

            <div className="mt-12">
                 <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">My Assigned Tasks</h2>
                        <p className="text-sm text-gray-500">Select a task from this list to begin logging time against it.</p>
                    </div>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tasks..."
                            className="w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                 </div>

                <div className="mt-4">
                  <AssignedTasksList 
                      tasks={filteredTasks}
                      onTaskSelect={setSelectedTask} 
                      selectedTaskId={selectedTask ? selectedTask.id : null}
                  />
                </div>
            </div>
        </section>
    );
}