const API_BASE_URL = process.env.NEXT_PUBLIC_APPOINTMENT_SERVICE_URL || 'http://localhost:8084';

export interface AppointmentData {
  serviceId: number;
  timeSlotId: number;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;  // Changed from 'duration' to match backend
  price: number;
  isActive: boolean;        // Changed from 'active' to match backend
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeSlot {
  id: number;
  serviceId?: number;
  serviceName?: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;     // Changed from 'available' to match backend
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface BookingResponse {
  id: number;
  userId: string;
  serviceId: number;
  timeSlotId: number;
  customerName: string;
  phone: string;
  email: string;
  vehicleModel: string;
  vehicleYear: string;
  specialRequests?: string;
  status: string;
  createdAt: string;
}

// Check backend health
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/actuator/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

// Get available services
export const getServices = async (): Promise<ApiResponse<Service[]>> => {
  try {
    console.log('Fetching services from:', `${API_BASE_URL}/api/services`);
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
    console.log('Services response:', data);
    
    // Filter only active services
    const activeServices = Array.isArray(data) ? data.filter(service => service.isActive) : [];
    
    return { success: true, data: activeServices };
  } catch (error) {
    console.error('Error fetching services:', error);
    return { success: false, error: 'Network error: Unable to connect to appointment service' };
  }
};

// Get available time slots for a date
export const getAvailableTimeSlots = async (
  date: string, 
  serviceId?: number
): Promise<ApiResponse<TimeSlot[]>> => {
  try {
    let url = `${API_BASE_URL}/api/timeslots?date=${date}`;
    if (serviceId) {
      url += `&serviceId=${serviceId}`;
    }
    
    console.log('Fetching time slots from:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.message || `HTTP ${response.status}: Failed to fetch time slots` 
      };
    }
    
    const data = await response.json();
    console.log('Time slots response:', data);
    
    // Filter only available time slots
    const availableSlots = Array.isArray(data) ? data.filter(slot => slot.isAvailable) : [];
    
    return { success: true, data: availableSlots };
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return { success: false, error: 'Network error: Unable to connect to appointment service' };
  }
};

// Create appointment/booking
export const createAppointment = async (appointmentData: AppointmentData): Promise<ApiResponse<BookingResponse>> => {
  try {
    console.log('Creating appointment with data:', appointmentData);
    const response = await fetch(`${API_BASE_URL}/api/v1/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.message || `HTTP ${response.status}: Failed to create appointment` 
      };
    }
    
    const data = await response.json();
    console.log('Create appointment response:', data);
    return { 
      success: true, 
      data: data, 
      message: 'Appointment created successfully' 
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { success: false, error: 'Network error: Unable to connect to appointment service' };
  }
};

// Get user's bookings
export const getUserBookings = async (userId: string): Promise<ApiResponse<BookingResponse[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/bookings?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.message || `HTTP ${response.status}: Failed to fetch bookings` 
      };
    }
    
    const data = await response.json();
    return { success: true, data: data };
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return { success: false, error: 'Network error: Unable to connect to appointment service' };
  }
};

// Get booking by ID
export const getBookingById = async (bookingId: number): Promise<ApiResponse<BookingResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.message || `HTTP ${response.status}: Failed to fetch booking` 
      };
    }
    
    const data = await response.json();
    return { success: true, data: data };
  } catch (error) {
    console.error('Error fetching booking:', error);
    return { success: false, error: 'Network error: Unable to connect to appointment service' };
  }
};

// Utility function to format time slots for UI
export const formatTimeSlot = (timeSlot: TimeSlot): string => {
  const startTime = new Date(`2000-01-01T${timeSlot.startTime}`);
  const endTime = new Date(`2000-01-01T${timeSlot.endTime}`);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

// Utility function to check if a date is available for booking
export const isDateAvailable = (date: string): boolean => {
  const selectedDate = new Date(date);
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30); // Allow booking up to 30 days in advance
  
  return selectedDate > today && selectedDate <= maxDate;
};