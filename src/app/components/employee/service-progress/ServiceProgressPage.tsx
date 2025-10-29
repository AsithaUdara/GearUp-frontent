"use client";

import { useEffect, useMemo, useState } from "react";
import CurrentServiceTask from "./CurrentServiceTask";
import DailySummary from "./DailySummary";
import { fetchTasksByEmployeeId, updateTaskProgress, WorkTask } from "@/lib/workScheduleData";
import { ClipboardList, Clock, CheckCircle2 } from "lucide-react";

export default function ServiceProgressPage() {
  // In a real app, derive employeeId from auth context. Using a mock id for now
  const employeeId = "emp-1";

  const [currentTask, setCurrentTask] = useState<WorkTask | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<WorkTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<WorkTask[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchTasksByEmployeeId(employeeId).then((res) => {
      if (!mounted) return;
      setCurrentTask(res.currentTask ?? null);
      setAssignedTasks(res.assigned);
      setCompletedTasks(res.completed);
    });
    return () => {
      mounted = false;
    };
  }, [employeeId]);

  const dailySummary = useMemo(
    () =>
      completedTasks.map((t) => ({
        id: t.serviceId,
        type: t.serviceType,
        time: t.time ?? "",
        status: "completed",
      })),
    [completedTasks]
  );

  const numAssigned = assignedTasks.length;
  const numInProgress = assignedTasks.filter((t) => t.status === "in-progress").length;
  const numCompleted = completedTasks.length;

  const handleTaskUpdate = (updated: WorkTask | null) => {
    if (!updated) return;
    setCurrentTask(updated);
    setAssignedTasks((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    if (updated.status === "completed") {
      setCompletedTasks((prev) => {
        const exists = prev.some((x) => x.id === updated.id);
        const next = exists ? prev.map((x) => (x.id === updated.id ? updated : x)) : [...prev, updated];
        return next;
      });
    }
  };

  const persistAndSet = async (next: WorkTask) => {
    const persisted = await updateTaskProgress(
      next.id,
      (next.progressStep ?? 1) as 1 | 2 | 3 | 4 | 5,
      next.status
    );
    handleTaskUpdate(persisted ?? next);
  };

  const selectAssignedAsCurrent = (t: WorkTask) => {
    setCurrentTask(t);
  };

  const statusBadge = (status: WorkTask["status"]) => {
    const styles: Record<WorkTask["status"], string> = {
      "in-progress": "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
    };
    const textMap: Record<WorkTask["status"], string> = {
      "in-progress": "In Progress",
      completed: "Completed",
      pending: "Pending",
    };
    return (
      <span className={`text-xs rounded-full px-2 py-0.5 ${styles[status]}`}>{textMap[status]}</span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top summary row to utilize header space */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gray-100">
              <ClipboardList className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Assigned Today</div>
              <div className="text-lg font-semibold text-gray-900">{numAssigned}</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <Clock className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <div className="text-xs text-gray-500">In Progress</div>
              <div className="text-lg font-semibold text-gray-900">{numInProgress}</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Completed</div>
              <div className="text-lg font-semibold text-gray-900">{numCompleted}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left: Current Task - 6/12 width */}
        <div className="lg:col-span-6 xl:col-span-6">
          {currentTask ? (
            <CurrentServiceTask task={currentTask} onTaskUpdate={persistAndSet} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-gray-600">No current task assigned.</div>
          )}
        </div>
        
        {/* Right: Assigned + Summary - 6/12 width */}
        <div className="lg:col-span-6 xl:col-span-6">
          <div className="space-y-8 lg:sticky lg:top-6">
            {assignedTasks.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-semibold">Assigned Tasks</div>
                </div>
                <ul className="divide-y divide-gray-100">
                  {assignedTasks.map((t) => (
                    <li key={t.id} className="py-3 grid grid-cols-[1fr_auto] items-center gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{t.serviceId} — {t.serviceType}</div>
                        <div className="text-xs text-gray-500 truncate">{t.customer} • {t.vehicle}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                        {statusBadge(t.status)}
                        <button
                          type="button"
                          onClick={() => selectAssignedAsCurrent(t)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-100"
                          title="Edit"
                        >
                          Edit
                        </button>
                        {t.status !== "completed" && (
                          <button
                            type="button"
                            onClick={() => persistAndSet({ ...t, status: "in-progress" })}
                            className="rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                            title="Start/Resume"
                          >
                            Start
                          </button>
                        )}
                        {t.status !== "completed" && (
                          <button
                            type="button"
                            onClick={() => persistAndSet({ ...t, status: "completed", progressStep: 5 })}
                            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                            title="Mark Complete"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <DailySummary summary={dailySummary} />
          </div>
        </div>
      </div>
    </div>
  );
}