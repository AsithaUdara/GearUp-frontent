"use client";

import { useEffect, useMemo, useState } from "react";
import CurrentServiceTask from "./CurrentServiceTask";
import DailySummary from "./DailySummary";
import ServiceCompletionReport from "./ServiceCompletionReport";
import { 
  fetchTasksByEmployeeId, 
  updateTaskProgress, 
  fetchServicesByVehicle,
  fetchModificationRequestsByVehicle,
  fetchPartsRequestsByVehicle,
  fetchPendingModificationRequestsForEmployee,
  createTaskFromRequest,
  notifyCustomerTaskCompleted,
  WorkTask,
  ModificationRequest,
  PartsRequest
} from "@/lib/workScheduleData";
import { setServiceTasks, updateAssignedTasks, updateCompletedTasks } from "@/lib/serviceTasksStore";
import { ClipboardList, Clock, CheckCircle2, Bell, Car, User } from "lucide-react";

export default function ServiceProgressPage() {
  // In a real app, derive employeeId from auth context. Using a mock id for now
  const employeeId = "emp-1";

  const [currentTask, setCurrentTask] = useState<WorkTask | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<WorkTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<WorkTask[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [reportVehicle, setReportVehicle] = useState<string | null>(null);
  const [reportCustomer, setReportCustomer] = useState<string | null>(null);
  const [reportServices, setReportServices] = useState<WorkTask[]>([]);
  const [reportModifications, setReportModifications] = useState<ModificationRequest[]>([]);
  const [reportPartsRequests, setReportPartsRequests] = useState<PartsRequest[]>([]);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<ModificationRequest[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      const res = await fetchTasksByEmployeeId(employeeId);
      if (!mounted) return;
      setCurrentTask(res.currentTask ?? null);
      setAssignedTasks(res.assigned);
      setCompletedTasks(res.completed);
      
      // Update the store for real-time sync with dashboard
      setServiceTasks(res.assigned, res.completed);
      
      // Load pending customer requests
      const pendingReqs = await fetchPendingModificationRequestsForEmployee(employeeId);
      if (!mounted) return;
      setPendingRequests(pendingReqs);
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, [employeeId]);

  // Group completed tasks by vehicle for daily summary
  const dailySummaryByVehicle = useMemo(() => {
    const grouped = completedTasks.reduce((acc, task) => {
      if (!acc[task.vehicle]) {
        acc[task.vehicle] = [];
      }
      acc[task.vehicle].push(task);
      return acc;
    }, {} as Record<string, WorkTask[]>);
    return grouped;
  }, [completedTasks]);

  // Group assigned tasks by vehicle
  // Exclude completed tasks from the Assigned Tasks view per UX request
  const filteredAssignedTasks = useMemo(() => assignedTasks.filter((t) => t.status !== 'completed'), [assignedTasks]);

  const groupedAssignedTasks = useMemo(() => {
    const grouped = filteredAssignedTasks.reduce((acc, task) => {
      if (!acc[task.vehicle]) {
        acc[task.vehicle] = [];
      }
      acc[task.vehicle].push(task);
      return acc;
    }, {} as Record<string, WorkTask[]>);
    return grouped;
  }, [filteredAssignedTasks]);

  const numAssigned = filteredAssignedTasks.length;
  const numInProgress = filteredAssignedTasks.filter((t) => t.status === "in-progress").length;
  const numCompleted = completedTasks.length;

  const handleTaskUpdate = async (updated: WorkTask | null) => {
    if (!updated) return;
    setCurrentTask(updated);
    setAssignedTasks((prev) => {
      const next = prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));
      updateAssignedTasks(() => next); // Update store
      return next;
    });
    if (updated.status === "completed") {
      setCompletedTasks((prev) => {
        const exists = prev.some((x) => x.id === updated.id);
        const next = exists ? prev.map((x) => (x.id === updated.id ? updated : x)) : [...prev, updated];
        updateCompletedTasks(() => next); // Update store
        return next;
      });
      
      // Notify customer in real-time when task is completed
      try {
        await notifyCustomerTaskCompleted(updated.id);
        setNotificationMessage(`Task ${updated.serviceId} completed and customer notified!`);
        setTimeout(() => setNotificationMessage(null), 5000);
      } catch (error) {
        console.error("Failed to notify customer:", error);
      }
    }
  };

  const handleViewCompletionReport = async (task: WorkTask) => {
    setReportVehicle(task.vehicle);
    setReportCustomer(task.customer);
    
    // Fetch all services for this vehicle
    const allServices = await fetchServicesByVehicle(task.vehicle);
    setReportServices(allServices);
    
    // Fetch modification requests for this vehicle
    const modifications = await fetchModificationRequestsByVehicle(task.vehicle);
    setReportModifications(modifications);
    
    // Fetch parts requests for this vehicle
    const partsRequests = await fetchPartsRequestsByVehicle(task.vehicle);
    setReportPartsRequests(partsRequests);
    
    setShowReport(true);
  };

  const handleNotifyCustomer = async () => {
    if (!reportVehicle) return;
    try {
      // In a real app, this would send a notification/email to the customer
      setNotificationMessage(`Completion report sent to customer for ${reportVehicle}`);
      setTimeout(() => setNotificationMessage(null), 5000);
    } catch (error) {
      console.error("Failed to notify customer:", error);
    }
  };

  const handleCreateTaskFromRequest = async (request: ModificationRequest) => {
    try {
      const newTask = await createTaskFromRequest(
        request.vehicle,
        request.customer,
        request.title,
        employeeId,
        request.id
      );
      setAssignedTasks((prev) => {
        const next = [...prev, newTask];
        updateAssignedTasks(() => next); // Update store
        return next;
      });
      setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));
      setNotificationMessage(`New task created from customer request: ${request.title}`);
      setTimeout(() => setNotificationMessage(null), 5000);
    } catch (error) {
      console.error("Failed to create task from request:", error);
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
    // Make in-progress light blue and pending light orange per design request
    const styles: Record<WorkTask["status"], string> = {
      "in-progress": "bg-blue-50 text-blue-700",
      completed: "bg-green-50 text-green-700",
      pending: "bg-amber-50 text-amber-700",
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
      {/* Notification Banner */}
      {notificationMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <Bell className="h-5 w-5 text-green-700" />
          <p className="text-sm font-medium text-gray-900">{notificationMessage}</p>
          <button
            onClick={() => setNotificationMessage(null)}
            className="ml-auto text-gray-600 hover:text-gray-800"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}
      
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
            <div className="p-2 rounded-full bg-red-100">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">In Progress</div>
              <div className="text-lg font-semibold text-gray-900">{numInProgress}</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-50">
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
        {/* Left: Current Task + Daily Summary - 6/12 width */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-6">
          {/* Current Task Section */}
          {currentTask ? (
            <CurrentServiceTask task={currentTask} onTaskUpdate={persistAndSet} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-gray-400 mb-2">
                <ClipboardList className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-600 font-medium">No current task assigned.</p>
              <p className="text-sm text-gray-500 mt-2">Select a task from the Assigned Tasks section to get started.</p>
            </div>
          )}

          {/* Daily Summary - Moved to left column */}
          <DailySummary 
            summaryByVehicle={dailySummaryByVehicle}
            onViewReport={handleViewCompletionReport}
            fetchServicesByVehicle={fetchServicesByVehicle}
            fetchModificationRequestsByVehicle={fetchModificationRequestsByVehicle}
            fetchPartsRequestsByVehicle={fetchPartsRequestsByVehicle}
          />
        </div>
        
        {/* Right: New Customer Requests + Assigned Tasks - 6/12 width */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-6">
          {/* New Customer Requests Section */}
          {pendingRequests.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-600" />
                  <div className="text-lg font-semibold">New Customer Requests</div>
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                    {pendingRequests.length}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border border-red-200 rounded-lg p-4 bg-red-50 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{request.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{request.description}</div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>{request.customer} • {request.vehicle}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleCreateTaskFromRequest(request)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                      >
                        Create Task
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <div className="text-lg font-semibold text-gray-500">New Customer Requests</div>
                </div>
              </div>
              <div className="text-center py-8 text-gray-400 text-sm">
                No new customer requests at this time
              </div>
            </div>
          )}

          {/* Assigned Tasks Section */}
          {Object.keys(groupedAssignedTasks).length > 0 && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
              <div className="text-xl font-bold text-gray-900 mb-4">Assigned Tasks</div>
              <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                {Object.entries(groupedAssignedTasks).map(([vehicle, tasks]) => (
                  <div key={vehicle} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Car className="h-4 w-4" />
                      <span>{vehicle}</span>
                    </div>
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => selectAssignedAsCurrent(task)}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{task.serviceType}</div>
                            <div className="text-xs text-gray-500 mt-1">{task.serviceId}</div>
                          </div>
                          {statusBadge(task.status)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                          <User className="h-3 w-3" />
                          <span>{task.customer}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service Completion Report Modal */}
      {showReport && reportVehicle && reportCustomer && (
        <ServiceCompletionReport
          vehicle={reportVehicle}
          customer={reportCustomer}
          allServices={reportServices}
          modificationRequests={reportModifications}
          partsRequests={reportPartsRequests}
          onClose={() => setShowReport(false)}
          onNotifyCustomer={handleNotifyCustomer}
        />
      )}
    </div>
  );
}