// Employee work schedule and tasks - now using real tracking-service API

const TRACKING_SERVICE_URL = process.env.NEXT_PUBLIC_TRACKING_SERVICE_URL || 'http://localhost:8086';

export type WorkTask = {
  id: string | number;
  taskId?: string;
  serviceId: string;
  vehicle: string;
  customer: string;
  serviceType: string;
  assigneeId: string; // employee/user id
  status: "pending" | "in-progress" | "completed";
  progressStep?: 1 | 2 | 3 | 4 | 5; // 1-5 progress for current task
  notes?: string;
  time?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
};

// Mock dataset
const TASKS: WorkTask[] = [
  {
    id: "task-1",
    serviceId: "SVC-2024-00789",
    vehicle: "Toyota Camry - 2021",
    customer: "Jane Smith",
    serviceType: "Brake Pad Replacement",
    assigneeId: "emp-1",
    status: "in-progress",
    progressStep: 3,
    notes: "Caliper pins inspected",
    time: "10:35 AM",
  },
  {
    id: "task-2",
    serviceId: "SVC-2024-00785",
    vehicle: "Honda Civic - 2019",
    customer: "John Doe",
    serviceType: "Oil Change",
    assigneeId: "emp-1",
    status: "completed",
    progressStep: 5,
    time: "10:15 AM",
  },
  {
    id: "task-3",
    serviceId: "SVC-2024-00786",
    vehicle: "Ford F-150 - 2020",
    customer: "Peter Jones",
    serviceType: "Brake Inspection",
    assigneeId: "emp-1",
    status: "completed",
    progressStep: 5,
    time: "11:30 AM",
  },
  {
    id: "task-4",
    serviceId: "SVC-2024-00787",
    vehicle: "Toyota Corolla - 2018",
    customer: "Emily Clark",
    serviceType: "Tire Rotation",
    assigneeId: "emp-1",
    status: "pending",
    progressStep: 1,
    time: "01:45 PM",
  },
];

export async function fetchTasksByEmployeeId(employeeId: string): Promise<{
  currentTask: WorkTask | null;
  assigned: WorkTask[];
  completed: WorkTask[];
}> {
  try {
    const response = await fetch(`${TRACKING_SERVICE_URL}/api/tracking/employee/${employeeId}/tasks`);
    
    if (!response.ok) {
      console.error(`Failed to fetch tasks: ${response.statusText}`);
      return { currentTask: null, assigned: [], completed: [] };
    }
    
    const data = await response.json();
    
    // Convert backend format to frontend format
    const convertTask = (task: any): WorkTask => ({
      id: task.id,
      taskId: task.taskId,
      serviceId: task.serviceId,
      vehicle: task.vehicle,
      customer: task.customer,
      serviceType: task.serviceType,
      assigneeId: task.assigneeId,
      status: task.status.replace('_', '-') as "pending" | "in-progress" | "completed",
      progressStep: task.progressStep,
      notes: task.notes,
      time: task.updatedAt ? new Date(task.updatedAt).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      }) : undefined,
      estimatedDuration: task.estimatedDuration,
      actualDuration: task.actualDuration,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
    });
    
    return {
      currentTask: data.currentTask ? convertTask(data.currentTask) : null,
      assigned: data.assignedTasks.map(convertTask),
      completed: data.completedTasks.map(convertTask),
    };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { currentTask: null, assigned: [], completed: [] };
  }
}

export async function updateTaskProgress(
  taskId: string | number,
  progressStep: 1 | 2 | 3 | 4 | 5,
  status?: WorkTask["status"]
) {
  try {
    const updates: any = {
      progressStep,
    };
    
    if (status) {
      updates.status = status.replace('-', '_'); // Convert to backend format
    }
    
    const response = await fetch(`${TRACKING_SERVICE_URL}/api/tracking/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      console.error(`Failed to update task: ${response.statusText}`);
      return null;
    }
    
    const task = await response.json();
    
    // Convert back to frontend format
    return {
      id: task.id,
      taskId: task.taskId,
      serviceId: task.serviceId,
      vehicle: task.vehicle,
      customer: task.customer,
      serviceType: task.serviceType,
      assigneeId: task.assigneeId,
      status: task.status.replace('_', '-') as "pending" | "in-progress" | "completed",
      progressStep: task.progressStep,
      notes: task.notes,
      time: task.updatedAt ? new Date(task.updatedAt).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      }) : undefined,
      estimatedDuration: task.estimatedDuration,
      actualDuration: task.actualDuration,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
    };
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
}

// Fetch all services for a specific vehicle
export async function fetchServicesByVehicle(vehicle: string): Promise<WorkTask[]> {
  try {
    const response = await fetch(`${TRACKING_SERVICE_URL}/api/tracking/tasks/vehicle/${encodeURIComponent(vehicle)}`);
    
    if (!response.ok) {
      console.error(`Failed to fetch services: ${response.statusText}`);
      return [];
    }
    
    const tasks = await response.json();
    return tasks.map((task: any) => ({
      id: task.id,
      taskId: task.taskId,
      serviceId: task.serviceId,
      vehicle: task.vehicle,
      customer: task.customer,
      serviceType: task.serviceType,
      assigneeId: task.assigneeId,
      status: task.status.replace('_', '-') as "pending" | "in-progress" | "completed",
      progressStep: task.progressStep,
      notes: task.notes,
      time: task.updatedAt ? new Date(task.updatedAt).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      }) : undefined,
      estimatedDuration: task.estimatedDuration,
      actualDuration: task.actualDuration,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
    }));
  } catch (error) {
    console.error('Error fetching services by vehicle:', error);
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

// Mock modification requests
const MODIFICATION_REQUESTS: ModificationRequest[] = [
  {
    id: "mod-1",
    serviceId: "SVC-2024-00789",
    vehicle: "Toyota Camry - 2021",
    customer: "Jane Smith",
    type: "add_service",
    title: "Brake Fluid Replacement",
    description: "Customer requested brake fluid replacement during brake pad service",
    status: "approved",
    requestedBy: "Jane Smith",
    requestedAt: new Date().toLocaleString(),
    estimatedCost: 3500,
    estimatedDuration: 20,
    assignedToEmployeeId: "emp-1"
  }
];

// Mock parts requests
const PARTS_REQUESTS: PartsRequest[] = [
  {
    id: "REQ-2024-001",
    material: "Brake Pads",
    quantity: 4,
    status: "Approved",
    date: new Date().toISOString().split('T')[0],
    vehicle: "Toyota Camry - 2021",
    serviceId: "SVC-2024-00789",
    notes: "Front brake pads required"
  },
  {
    id: "REQ-2024-002",
    material: "Engine Oil 5L",
    quantity: 2,
    status: "Approved",
    date: new Date().toISOString().split('T')[0],
    vehicle: "Honda Civic - 2019",
    serviceId: "SVC-2024-00785",
    notes: "Synthetic oil"
  },
  {
    id: "REQ-2024-003",
    material: "Brake Fluid",
    quantity: 1,
    status: "Approved",
    date: new Date().toISOString().split('T')[0],
    vehicle: "Toyota Camry - 2021",
    serviceId: "SVC-2024-00789",
    notes: "DOT 4 brake fluid"
  }
];

// Fetch modification requests for a vehicle
export async function fetchModificationRequestsByVehicle(vehicle: string): Promise<ModificationRequest[]> {
  try {
    const response = await fetch(`${TRACKING_SERVICE_URL}/api/tracking/modification-requests/vehicle/${encodeURIComponent(vehicle)}`);
    
    if (!response.ok) {
      // Return empty array if endpoint doesn't exist yet
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching modification requests:', error);
    return [];
  }
}

// Fetch pending/approved modification requests that need to be converted to tasks
export async function fetchPendingModificationRequestsForEmployee(employeeId: string): Promise<ModificationRequest[]> {
  try {
    const response = await fetch(`${TRACKING_SERVICE_URL}/api/tracking/modification-requests/pending/${employeeId}`);
    
    if (!response.ok) {
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching pending modification requests:', error);
    return [];
  }
}

// Notify customer when task is completed
export async function notifyCustomerTaskCompleted(taskId: string | number): Promise<boolean> {
  try {
    // In a real app, this would send a notification via API/WebSocket
    console.log(`Customer notified: Task ${taskId} completed`);
    // You can add actual notification API call here
    return true;
  } catch (error) {
    console.error('Error notifying customer:', error);
    return false;
  }
}

// Fetch parts requests for a vehicle
export async function fetchPartsRequestsByVehicle(vehicle: string): Promise<PartsRequest[]> {
  try {
    const response = await fetch(`${TRACKING_SERVICE_URL}/api/tracking/parts-requests/vehicle/${encodeURIComponent(vehicle)}`);
    
    if (!response.ok) {
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching parts requests:', error);
    return [];
  }
}

// Create new task from customer request (modification or new service)
export async function createTaskFromRequest(
  vehicle: string,
  customer: string,
  serviceType: string,
  assigneeId: string,
  modificationRequestId?: string
): Promise<WorkTask> {
  try {
    const taskData = {
      serviceId: modificationRequestId ? `MOD-${modificationRequestId}` : `SVC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
      vehicle,
      customer,
      serviceType,
      assigneeId,
      notes: modificationRequestId ? `Created from modification request #${modificationRequestId}` : undefined,
    };
    
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
      id: task.id,
      taskId: task.taskId,
      serviceId: task.serviceId,
      vehicle: task.vehicle,
      customer: task.customer,
      serviceType: task.serviceType,
      assigneeId: task.assigneeId,
      status: task.status.replace('_', '-') as "pending" | "in-progress" | "completed",
      progressStep: task.progressStep || 1,
      notes: task.notes,
      time: task.updatedAt ? new Date(task.updatedAt).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      }) : new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      estimatedDuration: task.estimatedDuration,
      actualDuration: task.actualDuration,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
    };
  } catch (error) {
    console.error('Error creating task from request:', error);
    throw error;
  }
}
