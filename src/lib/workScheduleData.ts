// API integration for employee work schedule and tasks
// Uses real backend APIs instead of mock data

import {
  getEmployeeTasks,
  updateTaskProgress as apiUpdateTaskProgress,
  getTasksByVehicle as apiGetTasksByVehicle,
  getPendingModificationRequests,
  getModificationRequestsByVehicle as apiGetModificationRequestsByVehicle,
  getPartsRequestsByVehicle as apiGetPartsRequestsByVehicle,
  createTaskFromModificationRequest,
  notifyCustomerTaskCompleted as apiNotifyCustomerTaskCompleted,
  TaskResponse,
  ModificationRequestResponse,
  PartsRequestResponse,
  UpdateTaskRequest,
} from './trackingApi';

export type WorkTask = {
  id: string;
  serviceId: string;
  vehicle: string;
  customer: string;
  serviceType: string;
  assigneeId: string; // employee/user id
  status: "pending" | "in-progress" | "completed";
  progressStep?: 1 | 2 | 3 | 4 | 5; // 1-5 progress for current task
  notes?: string;
  time?: string;
};

// Helper function to convert backend TaskResponse to frontend WorkTask
function mapTaskResponseToWorkTask(task: TaskResponse): WorkTask {
  return {
    id: task.taskId,
    serviceId: task.serviceId,
    vehicle: task.vehicle,
    customer: task.customer,
    serviceType: task.serviceType,
    assigneeId: task.assigneeId,
    status: task.status === 'in_progress' ? 'in-progress' : task.status as "pending" | "completed",
    progressStep: task.progressStep as 1 | 2 | 3 | 4 | 5 | undefined,
    notes: task.notes,
    time: task.time || (task.completedAt ? new Date(task.completedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : undefined),
  };
}

// Helper function to convert frontend status to backend status
function mapStatusToBackend(status: WorkTask["status"]): "pending" | "in_progress" | "completed" {
  return status === "in-progress" ? "in_progress" : status;
}

/**
 * Fetch tasks by employee ID from backend API
 */
export async function fetchTasksByEmployeeId(
  employeeId: string,
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<{
  currentTask: WorkTask | null;
  assigned: WorkTask[];
  completed: WorkTask[];
}> {
  try {
    const response = await getEmployeeTasks(employeeId, user);
    
    return {
      currentTask: response.currentTask ? mapTaskResponseToWorkTask(response.currentTask) : null,
      assigned: response.assignedTasks.map(mapTaskResponseToWorkTask),
      completed: response.completedTasks.map(mapTaskResponseToWorkTask),
    };
  } catch (error) {
    console.error('Failed to fetch employee tasks:', error);
    // Re-throw with more context for UI to display
    if (error instanceof Error) {
      throw new Error(`Unable to load tasks: ${error.message}`);
    }
    throw new Error('Unable to load tasks. Please check if the backend is running.');
  }
}

/**
 * Update task progress via backend API
 */
export async function updateTaskProgress(
  taskId: string,
  progressStep: 1 | 2 | 3 | 4 | 5,
  status?: WorkTask["status"],
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<WorkTask | undefined> {
  try {
    const updateRequest: UpdateTaskRequest = {
      status: status ? mapStatusToBackend(status) : "in_progress",
      progressStep,
    };
    
    const response = await apiUpdateTaskProgress(taskId, updateRequest, user);
    return mapTaskResponseToWorkTask(response);
  } catch (error) {
    console.error('Failed to update task progress:', error);
    return undefined;
  }
}

/**
 * Fetch all services for a specific vehicle from backend API
 */
export async function fetchServicesByVehicle(
  vehicle: string,
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<WorkTask[]> {
  try {
    const tasks = await apiGetTasksByVehicle(vehicle, user);
    return tasks.map(mapTaskResponseToWorkTask);
  } catch (error) {
    console.error('Failed to fetch services by vehicle:', error);
    return [];
  }
}

// Modification Request type
export type ModificationRequest = {
  id: string;
  serviceId: string;
  vehicle: string;
  customer: string;
  type: 'add_service' | 'remove_service' | 'change_service' | 'urgent_repair';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  requestedBy: string;
  requestedAt: string;
  estimatedCost?: number;
  estimatedDuration?: number;
  assignedToEmployeeId?: string;
};

// Parts/Material Request type
export type PartsRequest = {
  id: string;
  material: string;
  quantity: number;
  status: 'Approved' | 'Pending' | 'Rejected';
  date: string;
  vehicle?: string;
  serviceId?: string;
  notes?: string;
};

// Helper function to convert backend ModificationRequestResponse to frontend ModificationRequest
function mapModificationRequestResponse(request: ModificationRequestResponse): ModificationRequest {
  return {
    id: request.requestId,
    serviceId: request.serviceId,
    vehicle: request.vehicle,
    customer: request.customer,
    type: request.type,
    title: request.title,
    description: request.description,
    status: request.status,
    requestedBy: request.requestedBy,
    requestedAt: request.requestedAt || new Date().toISOString(),
    estimatedCost: request.estimatedCost ? Number(request.estimatedCost) : undefined,
    estimatedDuration: request.estimatedDuration,
    assignedToEmployeeId: request.assignedToEmployeeId,
  };
}

// Helper function to convert backend PartsRequestResponse to frontend PartsRequest
function mapPartsRequestResponse(request: PartsRequestResponse): PartsRequest {
  return {
    id: request.requestId,
    material: request.material,
    quantity: request.quantity,
    status: request.status,
    date: request.date,
    vehicle: request.vehicle,
    serviceId: request.serviceId,
    notes: request.notes,
  };
}

/**
 * Fetch modification requests for a vehicle from backend API
 */
export async function fetchModificationRequestsByVehicle(
  vehicle: string,
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<ModificationRequest[]> {
  try {
    const requests = await apiGetModificationRequestsByVehicle(vehicle, user);
    return requests.map(mapModificationRequestResponse);
  } catch (error) {
    console.error('Failed to fetch modification requests by vehicle:', error);
    return [];
  }
}

/**
 * Fetch pending/approved modification requests for employee from backend API
 */
export async function fetchPendingModificationRequestsForEmployee(
  employeeId: string,
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<ModificationRequest[]> {
  try {
    const requests = await getPendingModificationRequests(employeeId, user);
    return requests.map(mapModificationRequestResponse);
  } catch (error) {
    console.error('Failed to fetch pending modification requests:', error);
    return [];
  }
}

/**
 * Notify customer when task is completed via backend API
 */
export async function notifyCustomerTaskCompleted(
  taskId: string,
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<boolean> {
  try {
    return await apiNotifyCustomerTaskCompleted(taskId, user);
  } catch (error) {
    console.error('Failed to notify customer:', error);
    return false;
  }
}

/**
 * Fetch parts requests for a vehicle from backend API
 */
export async function fetchPartsRequestsByVehicle(
  vehicle: string,
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<PartsRequest[]> {
  try {
    const requests = await apiGetPartsRequestsByVehicle(vehicle, user);
    return requests.map(mapPartsRequestResponse);
  } catch (error) {
    console.error('Failed to fetch parts requests by vehicle:', error);
    return [];
  }
}

/**
 * Create new task from modification request via backend API
 */
export async function createTaskFromRequest(
  vehicle: string,
  customer: string,
  serviceType: string,
  assigneeId: string,
  modificationRequestId?: string,
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<WorkTask> {
  if (!modificationRequestId) {
    throw new Error('modificationRequestId is required to create task from request');
  }
  
  try {
    const response = await createTaskFromModificationRequest(modificationRequestId, assigneeId, user);
    return mapTaskResponseToWorkTask(response);
  } catch (error) {
    console.error('Failed to create task from request:', error);
    throw error;
  }
}
