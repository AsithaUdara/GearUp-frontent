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
  "Completed": "text-gray-500",
  "Pending": "text-blue-600",
};

const statusBackgrounds: Record<Task["status"], string> = {
  "In Progress": "hover:bg-gray-50",
  "Completed": "bg-gray-100",
  "Pending": "hover:bg-gray-50",
};

export default function AssignedTasksList({ tasks, onTaskSelect, selectedTaskId }: TaskListProps) {
  // Sort tasks: Completed tasks go to the bottom, others sorted by status (Pending, In Progress)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === "Completed" && b.status !== "Completed") return 1;
    if (a.status !== "Completed" && b.status === "Completed") return -1;
    if (a.status === "In Progress" && b.status === "Pending") return -1;
    if (a.status === "Pending" && b.status === "In Progress") return 1;
    return 0;
  });

  const handleTaskClick = (task: Task) => {
    if (task.status !== "Completed") {
      onTaskSelect(task);
    }
  };

  return (
    <div className="rounded-lg border border-white bg-white p-5 shadow-md transition hover:shadow-lg hover:-translate-y-0.5">
      <h3 className="text-lg font-semibold mb-3">Assigned Tasks</h3>
      {tasks.length === 0 ? (
        <p className="text-gray-500 text-sm p-4 text-center">No tasks match your search.</p>
      ) : (
        <ul className="space-y-4">
          {sortedTasks.map((task) => (
            <li 
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className={cn(
                "p-3 border rounded-lg flex justify-between items-center transition",
                task.status !== "Completed" ? "cursor-pointer" : "cursor-not-allowed",
                statusBackgrounds[task.status],
                selectedTaskId === task.id ? "bg-red-50 border-red-300" : "border-gray-200"
              )}
            >
              <div>
                <p className={cn(
                  "text-sm font-semibold",
                  task.status === "Completed" && "text-gray-500"
                )}>{task.title}</p>
                <p className="text-xs text-gray-500">{task.customer} - {task.vehicle}</p>
              </div>
              <div className="flex items-center">
                <span className={cn(
                  "text-xs font-semibold px-2 py-1 rounded-full",
                  statusStyles[task.status],
                  task.status === "Completed" ? "bg-gray-100" : "bg-gray-50"
                )}>{task.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}