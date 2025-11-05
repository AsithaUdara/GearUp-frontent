// API integration for tracking-service backend
// Base URL for tracking-service (running on port 8086)

const TRACKING_SERVICE_URL = process.env.NEXT_PUBLIC_TRACKING_SERVICE_URL || 'http://localhost:8086';

export type WorkTask = {
  id: number;
  taskId: string;
  serviceId: string;
  vehicle: string;
  customer: string;
  serviceType: string;
  assigneeId: string;
  status: "pending" | "in_progress" | "completed";
  progressStep?: number;
  notes?: string;
  time?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
};

export type TaskListResponse = {
  currentTask: WorkTask | null;
  assignedTasks: WorkTask[];
  completedTasks: WorkTask[];
  totalAssigned: number;
  totalInProgress: number;
  totalCompleted: number;
};

export type DailySummaryResponse = {
  date: string;
  completedCount: number;
  vehiclesServiced: string[];
  employeeId: string;
  tasks: Array<{
    vehicle: string;
    tasks: WorkTask[];
  }>;
};

export type ModificationRequest = {
  id: number;
  requestId: string;
  serviceId: string;
  vehicle: string;
  customer: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "in_progress" | "completed";
  assignedTo?: string | null;
  taskId?: string | null;
  estimatedCost?: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
};

export type PartsRequest = {
  id: number;
  requestId: string;
  taskId: string;
  partName: string;
  partNumber?: string;
  quantity: number;
  status: "pending" | "ordered" | "received" | "installed";
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
  receivedAt?: string | null;
};

export type CreateTaskRequest = {
  serviceId: string;
  vehicle: string;
  customer: string;
  serviceType: string;
  assigneeId: string;
  estimatedDuration?: number;
  notes?: string;
};

export type UpdateTaskRequest = {
  status?: "pending" | "in_progress" | "completed";
  progressStep?: number;
  notes?: string;
  actualDuration?: number;
};

/**
 * Fetch tasks for a specific employee
 */
export async function fetchTasksByEmployeeId(employeeId: string): Promise<TaskListResponse> {
  try {
    const response = await fetch(`${TRACKING_SERVICE_URL}/api/tracking/employee/${employeeId}/tasks`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }
    
    const data: TaskListResponse = await response.json();
    
    // Convert backend status format (in_progress) to frontend format (in-progress)
    const convertTask = (task: WorkTask): WorkTask => ({
      ...task,
      status: task.status.replace('_', '-') as any,
      time: task.updatedAt ? new Date(task.updatedAt).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      }) : undefined,
    });
    
    return {
      ...data,
      currentTask: data.currentTask ? convertTask(data.currentTask) : null,
      assignedTasks: data.assignedTasks.map(convertTask),
      completedTasks: data.completedTasks.map(convertTask),
    };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    // Return empty data on error
    return {
      currentTask: null,
      assignedTasks: [],
      completedTasks: [],
      totalAssigned: 0,
      totalInProgress: 0,
      totalCompleted: 0,
    };
  }
}

/**
 * Fetch daily summary for an employee
 */
export async function fetchDailySummary(employeeId: string): Promise<DailySummaryResponse | null> {
  try {
    const response = await fetch(`${TRACKING_SERVICE_URL}/api/tracking/employee/${employeeId}/summary`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch summary: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    return null;
  }
}

/**
 * Create a new task
 */
export async function createTask(taskData: CreateTaskRequest): Promise<WorkTask | null> {
  try {
    const response = await fetch(`${TRACKING_SERVICE_URL}/api/tracking/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }
    
    const task = await response.json();
    return {
      ...task,
      status: task.status.replace('_', '-'),
    };
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

/**
 * Update an existing task
 */
export async function updateTask(taskId: string, updates: UpdateTaskRequest): Promise<WorkTask | null> {
  try {
    // Convert frontend status format to backend format
    const backendUpdates = {
      ...updates,
      status: updates.status?.replace('-', '_'),
    };
    
    const response = await fetch(`${TRACKING_SERVICE_URL}/api/tracking/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendUpdates),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.statusText}`);
    }
    
    const task = await response.json();
    return {
      ...task,
      status: task.status.replace('_', '-'),
      time: task.updatedAt ? new Date(task.updatedAt).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      }) : undefined,
    };
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
}

/**
 * Get all tasks for a specific vehicle
 */
export async function fetchServicesByVehicle(vehicle: string): Promise<WorkTask[]> {
  try {
    const response = await fetch(`${TRACKING_SERVICE_URL}/api/tracking/tasks/vehicle/${encodeURIComponent(vehicle)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.statusText}`);
    }
    
    const tasks = await response.json();
    return tasks.map((task: WorkTask) => ({
      ...task,
      status: task.status.replace('_', '-'),
      time: task.updatedAt ? new Date(task.updatedAt).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      }) : undefined,
    }));
  } catch (error) {
    console.error('Error fetching services by vehicle:', error);
    return [];
  }
}

/**
 * Fetch modification requests for a vehicle
 */
export async function fetchModificationRequestsByVehicle(vehicle: string): Promise<ModificationRequest[]> {
  try {
    const response = await fetch(`${TRACKING_SERVICE_URL}/api/tracking/modification-requests/vehicle/${encodeURIComponent(vehicle)}`);
    
    if (!response.ok) {
      return []; // Return empty array if endpoint doesn't exist yet
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching modification requests:', error);
    return [];
  }
}

/**
 * Fetch parts requests for a vehicle
 */
export async function fetchPartsRequestsByVehicle(vehicle: string): Promise<PartsRequest[]> {
  try {
    const response = await fetch(`${TRACKING_SERVICE_URL}/api/tracking/parts-requests/vehicle/${encodeURIComponent(vehicle)}`);
    
    if (!response.ok) {
      return []; // Return empty array if endpoint doesn't exist yet
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching parts requests:', error);
    return [];
  }
}

/**
 * Fetch pending modification requests for an employee
 */
export async function fetchPendingModificationRequestsForEmployee(employeeId: string): Promise<ModificationRequest[]> {
  try {
    const response = await fetch(`${TRACKING_SERVICE_URL}/api/tracking/modification-requests/pending/${employeeId}`);
    
    if (!response.ok) {
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return [];
  }
}

/**
 * Create a task from a modification request
 */
export async function createTaskFromRequest(
  vehicle: string,
  customer: string,
  title: string,
  employeeId: string,
  requestId: number
): Promise<WorkTask | null> {
  const taskData: CreateTaskRequest = {
    serviceId: `MOD-${requestId}`,
    vehicle,
    customer,
    serviceType: title,
    assigneeId: employeeId,
    notes: `Created from modification request #${requestId}`,
  };
  
  return await createTask(taskData);
}

/**
 * Notify customer when task is completed (placeholder)
 */
export async function notifyCustomerTaskCompleted(taskId: number): Promise<void> {
  // This would integrate with your notification service
  console.log(`Notification sent for completed task: ${taskId}`);
}
