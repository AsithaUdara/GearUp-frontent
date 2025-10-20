"use client";

import { useState } from "react";
import CurrentServiceTask from "./CurrentServiceTask";
import DailySummary from "./DailySummary";

export default function ServiceProgressPage() {
  const [currentTask, setCurrentTask] = useState({
    serviceId: "SVC-2024-00789",
    vehicle: "Toyota Camry - 2021",
    customer: "Jane Smith",
    serviceType: "Brake Pad Replacement",
    status: "Parts Replacement",
    notes: "",
    attachments: [] as File[]
  });

  const handleTaskUpdate = (updatedTask: typeof currentTask) => {
    setCurrentTask(updatedTask);
  };

  const [dailySummary] = useState([
    { id: "SVC-2024-00785", type: "Oil Change", time: "10:15 AM", status: "completed" },
    { id: "SVC-2024-00786", type: "Brake Inspection", time: "11:30 AM", status: "completed" },
    { id: "SVC-2024-00787", type: "Tire Rotation", time: "01:45 PM", status: "completed" },
    { id: "SVC-2024-00788", type: "Full Service", time: "03:00 PM", status: "completed" },
    { id: "SVC-2024-00782", type: "AC Check", time: "04:10 PM", status: "completed" }
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Current Service Task - Takes up 2 columns */}
      <div className="lg:col-span-2">
        <CurrentServiceTask 
          task={currentTask}
          onTaskUpdate={handleTaskUpdate}
        />
      </div>
      
      {/* Daily Summary - Takes up 1 column */}
      <div className="lg:col-span-1">
        <DailySummary summary={dailySummary} />
      </div>
    </div>
  );
}