"use client";

import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  customer: string;
  vehicle: string;
  status: "In Progress" | "Completed" | "Pending";
};

const statusStyles: Record<Task["status"], string> = {
  "In Progress": "text-amber-600",
  "Completed": "text-emerald-600",
  "Pending": "text-gray-500",
};

const mockTasks: Task[] = [
  { id: "1", title: "Oil Change - Toyota Camry", customer: "John Doe", vehicle: "V-XYZ123", status: "In Progress" },
  { id: "2", title: "Brake Inspection - Honda Civic", customer: "Jane Smith", vehicle: "V-ABC456", status: "Completed" },
  { id: "3", title: "Tire Rotation - Ford F-150", customer: "Mike Johnson", vehicle: "V-QWE789", status: "Pending" },
];

export default function AssignedTasksList() {
  return (
    <div className="rounded-lg border border-white bg-white p-6 shadow-sm transition-transform hover:shadow-md hover:-translate-y-0.5">
      <h3 className="font-heading text-lg font-semibold mb-3">Assigned Tasks</h3>
      <ul className="space-y-4">
        {mockTasks.map((t, idx) => (
          <li id={idx === 0 ? "task-1" : undefined} key={t.id} className="p-3 border border-gray-200 rounded-lg flex justify-between items-center transition">
            <div>
              <p className="text-sm font-semibold">{t.title}</p>
              <p className="text-xs text-gray-500">{t.customer} - {t.vehicle}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={cn("text-xs", statusStyles[t.status])}>{t.status}</span>
              <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">View Details</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
