"use client";

import { useSyncExternalStore } from "react";
import { ClipboardList, Clock, CheckCircle2, Clock3 } from "lucide-react";
import { getServiceTasks, subscribeToServiceTasks } from "@/lib/serviceTasksStore";
import { getTotalSecondsToday, formatSeconds, subscribeToTimeLogging } from "@/lib/timeLoggingStore";

const getServerSnapshot = () => ({ assignedTasks: [], completedTasks: [] });
const getTimeServerSnapshot = () => 0;

// Cache server snapshots outside component
const emptyTasksSnapshot = { assignedTasks: [], completedTasks: [] };
const emptyTimeSnapshot = 0;

export default function StatsCards() {
  const { assignedTasks, completedTasks } = useSyncExternalStore(
    subscribeToServiceTasks,
    getServiceTasks,
    () => emptyTasksSnapshot
  );

  const totalSeconds = useSyncExternalStore(
    subscribeToTimeLogging,
    getTotalSecondsToday,
    () => emptyTimeSnapshot
  );

  const numAssigned = assignedTasks.length;
  const numInProgress = assignedTasks.filter((t) => t.status === "in-progress").length;
  const numCompleted = completedTasks.length;
  const hoursLogged = formatSeconds(totalSeconds);

  const stats = [
    { id: "assigned", label: "Assigned Today", value: numAssigned, icon: ClipboardList, bgColor: "bg-gray-100", iconColor: "text-gray-700" },
    { id: "progress", label: "In Progress", value: numInProgress, icon: Clock, bgColor: "bg-red-100", iconColor: "text-red-600" },
    { id: "completed", label: "Completed", value: numCompleted, icon: CheckCircle2, bgColor: "bg-green-50", iconColor: "text-green-700" },
    { id: "hours", label: "Hours Logged", value: hoursLogged, icon: Clock3, bgColor: "bg-blue-50", iconColor: "text-blue-700" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(({ id, label, value, icon: Icon, bgColor, iconColor }) => (
        <div key={id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${bgColor}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <div className="text-xs text-gray-500">{label}</div>
              <div className="text-lg font-semibold text-gray-900">{value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

