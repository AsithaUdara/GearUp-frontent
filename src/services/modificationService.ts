const API_BASE_URL = process.env.NEXT_PUBLIC_MODIFICATION_SERVICE_URL || 'http://localhost:8089';

export interface ModificationService {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  estimatedDurationHours: number;
  isActive: boolean;
}

export interface ModificationRequest {
  serviceId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  preferredDate: string;
  notes?: string;
}

export interface ModificationRequestResponse {
  id: number;
  serviceId: number;
  serviceName: string;
  customerId: number;
  customerName: string;
  status: string;
  requestDate: string;
  preferredDate: string;
  notes?: string;
  adminNotes?: string;
  estimatedCost: number;
  finalCost?: number;
  approvedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Get all modification services
export const getModificationServices = async (): Promise<ApiResponse<ModificationService[]>> => {
  try {
    console.log('Fetching modification services from:', `${API_BASE_URL}/api/services`);
    const response = await fetch(`${API_BASE_URL}/api/services`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.message || `HTTP ${response.status}: Failed to fetch services` 
      };
    }
    
    const data = await response.json();
    console.log('Modification services response:', data);
    
    // Filter only active services
    const activeServices = Array.isArray(data) ? data.filter(service => service.isActive) : [];
    
    return { success: true, data: activeServices };
  } catch (error) {
    console.error('Error fetching modification services:', error);
    return { success: false, error: 'Network error: Unable to connect to modification service' };
  }
};

// Create modification request
export const createModificationRequest = async (requestData: ModificationRequest): Promise<ApiResponse<ModificationRequestResponse>> => {
  try {
    console.log('Creating modification request with data:', requestData);
    const response = await fetch(`${API_BASE_URL}/api/service-modifications/${requestData.serviceId}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.message || `HTTP ${response.status}: Failed to create modification request` 
      };
    }
    
    const data = await response.json();
    console.log('Create modification request response:', data);
    return { 
      success: true, 
      data: data, 
      message: 'Modification request submitted successfully' 
    };
  } catch (error) {
    console.error('Error creating modification request:', error);
    return { success: false, error: 'Network error: Unable to connect to modification service' };
  }
};

// Get service by ID
export const getModificationServiceById = async (serviceId: number): Promise<ApiResponse<ModificationService>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/services/${serviceId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.message || `HTTP ${response.status}: Failed to fetch service` 
      };
    }
    
    const data = await response.json();
    return { success: true, data: data };
  } catch (error) {
    console.error('Error fetching modification service:', error);
    return { success: false, error: 'Network error: Unable to connect to modification service' };
  }
};

// Check backend health
export const checkModificationServiceHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/actuator/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Modification service health check failed:', error);
    return false;
  }
};
