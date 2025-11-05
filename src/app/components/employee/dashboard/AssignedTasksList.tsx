// src/app/components/employee/dashboard/AssignedTasksList.tsx
"use client";

import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation'; // --- MODIFICATION: Import the router ---

export type Task = {
  id: string;
  title: string;
  customer: string;
  vehicle: string;
  status: "In Progress" | "Completed" | "Pending";
};

type TaskListProps = {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
  selectedTaskId: string | null;
}

const statusStyles: Record<Task["status"], string> = {
  "In Progress": "text-amber-600",
  "Completed": "text-emerald-600",
  "Pending": "text-gray-500",
};

export default function AssignedTasksList({ tasks, onTaskSelect, selectedTaskId }: TaskListProps) {
  const router = useRouter(); // --- MODIFICATION: Initialize the router ---

  // --- MODIFICATION: Create a handler for the button click ---
  const handleViewDetails = (e: React.MouseEvent, taskId: string) => {
    // This stops the click from also triggering the onTaskSelect of the parent li
    e.stopPropagation(); 
    
    console.log(`Navigating to details for task ${taskId}`);
    router.push(`/employee/tasks/${taskId}`);
  };

  return (
    <div className="rounded-lg border border-white bg-white p-5 shadow-md transition hover:shadow-lg hover:-translate-y-0.5">
      <h3 className="text-lg font-semibold mb-3">Assigned Tasks</h3>
      {tasks.length === 0 ? (
        <p className="text-gray-500 text-sm p-4 text-center">No tasks match your search.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li 
              key={task.id}
              onClick={() => onTaskSelect(task)}
              className={cn(
                "p-3 border rounded-lg flex justify-between items-center transition cursor-pointer hover:bg-gray-50",
                selectedTaskId === task.id ? "bg-red-50 border-red-300" : "border-gray-200"
              )}
            >
              <div>
                <p className="text-sm font-semibold">{task.title}</p>
                <p className="text-xs text-gray-500">{task.customer} - {task.vehicle}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={cn("text-xs font-semibold", statusStyles[task.status])}>{task.status}</span>
                {/* --- MODIFICATION: Attach the onClick handler to the button --- */}
                <button 
                  onClick={(e) => handleViewDetails(e, task.id)}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700"
                >
                  View Details
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}