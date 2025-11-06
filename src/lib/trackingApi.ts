// API service for tracking service backend
// Handles all API calls to the tracking service

const getBaseUrl = () => {
  // Check if we should bypass gateway and connect directly to tracking service
  // Default to direct connection since tracking service runs on 8086
  const useDirectConnection = process.env.NEXT_PUBLIC_USE_DIRECT_TRACKING !== 'false';
  
  if (useDirectConnection) {
    // Connect directly to tracking service on port 8086
    const url = 'http://localhost:8086/api/tracking';
    console.log('[TrackingAPI] Using direct connection to tracking service:', url);
    return url;
  }
  
  // Use API Gateway on port 8080 (only if explicitly disabled direct connection)
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8080';
  const url = `${base}/api/tracking`;
  console.log('[TrackingAPI] Using API Gateway:', url);
  return url;
};

// Helper function to get auth headers
const getAuthHeaders = async (user?: { getIdToken?: () => Promise<string> } | null): Promise<HeadersInit> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (user && typeof user.getIdToken === 'function') {
    try {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Failed to get auth token:', error);
    }
  }
  
  return headers;
};

// Types matching backend DTOs
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface TaskResponse {
  id?: number;
  taskId: string;
  serviceId: string;
  vehicle: string;
  customer: string;
  serviceType: string;
  assigneeId: string;
  status: TaskStatus;
  progressStep?: number;
  notes?: string;
  time?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface TaskListResponse {
  currentTask: TaskResponse | null;
  assignedTasks: TaskResponse[];
  completedTasks: TaskResponse[];
  totalAssigned: number;
  totalInProgress: number;
  totalCompleted: number;
}

export interface ProgressResponse {
  id?: number;
  progressId: string;
  serviceId: string;
  vehicleModel: string;
  vehicleYear: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  estimatedCompletion?: string;
  currentStep?: number;
  totalSteps?: number;
  overallStatus?: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
  technicianId?: string;
  technicianName?: string;
  locationName?: string;
  lastUpdate?: string;
  progressPercentage?: number;
}

export interface ModificationRequestResponse {
  id?: number;
  requestId: string;
  serviceId: string;
  vehicle: string;
  customer: string;
  type: 'add_service' | 'remove_service' | 'change_service' | 'urgent_repair';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  requestedBy: string;
  assignedToEmployeeId?: string;
  estimatedCost?: number;
  estimatedDuration?: number;
  requestedAt?: string;
  approvedAt?: string;
  completedAt?: string;
}

export interface PartsRequestResponse {
  id?: number;
  requestId: string;
  material: string;
  quantity: number;
  status: 'Approved' | 'Pending' | 'Rejected';
  date: string;
  vehicle?: string;
  serviceId?: string;
  requestedBy?: string;
  notes?: string;
  cost?: number;
}

export interface UpdateTaskRequest {
  status: TaskStatus;
  progressStep?: number;
  notes?: string;
  actualDuration?: number;
}

// API Functions

/**
 * Get all tasks for an employee
 */
export async function getEmployeeTasks(
  employeeId: string,
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<TaskListResponse> {
  const baseUrl = getBaseUrl();
  const headers = await getAuthHeaders(user);
  const url = `${baseUrl}/employee/${employeeId}/tasks`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(
        `Failed to fetch employee tasks (${response.status}): ${errorText || response.statusText}. ` +
        `URL: ${url}. ` +
        `Please ensure the backend is running and accessible at ${baseUrl}`
      );
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const baseUrl = getBaseUrl();
      const isGateway = !baseUrl.includes('8086');
      
      throw new Error(
        `Network error: Unable to connect to backend API at ${baseUrl}. ` +
        `Please ensure the backend services are running. ` +
        (isGateway 
          ? `Expected API Gateway at: ${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}. ` +
            `Alternatively, set NEXT_PUBLIC_USE_DIRECT_TRACKING=true to connect directly to tracking service on port 8086.`
          : `Expected Tracking Service at: http://localhost:8086`)
      );
    }
    throw error;
  }
}

/**
 * Update task progress
 */
export async function updateTaskProgress(
  taskId: string,
  updateRequest: UpdateTaskRequest,
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<TaskResponse> {
  const baseUrl = getBaseUrl();
  const headers = await getAuthHeaders(user);
  
  const response = await fetch(`${baseUrl}/tasks/${taskId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updateRequest),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update task: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get service progress for customer
 */
export async function getServiceProgress(
  serviceId: string,
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<ProgressResponse> {
  const baseUrl = getBaseUrl();
  const headers = await getAuthHeaders(user);
  const url = `${baseUrl}/progress/service/${serviceId}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(
        `Failed to fetch service progress (${response.status}): ${errorText || response.statusText}. ` +
        `URL: ${url}. ` +
        `Please ensure the backend is running and accessible at ${baseUrl}`
      );
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const baseUrl = getBaseUrl();
      const isGateway = !baseUrl.includes('8086');
      
      throw new Error(
        `Network error: Unable to connect to backend API at ${baseUrl}. ` +
        `Please ensure the backend services are running. ` +
        (isGateway 
          ? `Expected API Gateway at: ${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}. ` +
            `Alternatively, set NEXT_PUBLIC_USE_DIRECT_TRACKING=true to connect directly to tracking service on port 8086.`
          : `Expected Tracking Service at: http://localhost:8086`)
      );
    }
    throw error;
  }
}

/**
 * Get tasks by vehicle
 */
export async function getTasksByVehicle(
  vehicle: string,
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<TaskResponse[]> {
  const baseUrl = getBaseUrl();
  const headers = await getAuthHeaders(user);
  
  const response = await fetch(`${baseUrl}/tasks/vehicle/${encodeURIComponent(vehicle)}`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks by vehicle: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get pending modification requests for employee
 */
export async function getPendingModificationRequests(
  employeeId: string,
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<ModificationRequestResponse[]> {
  const baseUrl = getBaseUrl();
  const headers = await getAuthHeaders(user);
  
  const response = await fetch(`${baseUrl}/employee/${employeeId}/modification-requests/pending`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch pending modification requests: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get modification requests by vehicle
 */
export async function getModificationRequestsByVehicle(
  vehicle: string,
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<ModificationRequestResponse[]> {
  const baseUrl = getBaseUrl();
  const headers = await getAuthHeaders(user);
  
  const response = await fetch(`${baseUrl}/vehicle/${encodeURIComponent(vehicle)}/modification-requests`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch modification requests: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get parts requests by vehicle
 */
export async function getPartsRequestsByVehicle(
  vehicle: string,
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<PartsRequestResponse[]> {
  const baseUrl = getBaseUrl();
  const headers = await getAuthHeaders(user);
  
  const response = await fetch(`${baseUrl}/vehicle/${encodeURIComponent(vehicle)}/parts-requests`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch parts requests: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Create task from modification request
 */
export async function createTaskFromModificationRequest(
  requestId: string,
  employeeId: string,
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<TaskResponse> {
  const baseUrl = getBaseUrl();
  const headers = await getAuthHeaders(user);
  
  const response = await fetch(`${baseUrl}/modification-requests/${requestId}/create-task?employeeId=${employeeId}`, {
    method: 'POST',
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create task from request: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Notify customer when task is completed
 * Note: This might need to be implemented via notification service
 */
export async function notifyCustomerTaskCompleted(
  taskId: string,
  user?: { getIdToken?: () => Promise<string> } | null
): Promise<boolean> {
  // This endpoint might not exist yet, but we'll try to call it
  // If it doesn't exist, the backend can implement it later
  try {
    const baseUrl = getBaseUrl();
    const headers = await getAuthHeaders(user);
    
    const response = await fetch(`${baseUrl}/tasks/${taskId}/notify`, {
      method: 'POST',
      headers,
    });
    
    return response.ok;
  } catch (error) {
    console.warn('Notification endpoint not available:', error);
    return false;
  }
}

