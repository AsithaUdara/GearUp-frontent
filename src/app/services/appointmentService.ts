/**
 * Appointment Service API Client
 * Connects to appointment-service backend (port 8084)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_APPOINTMENT_SERVICE_URL || 'http://localhost:8084/api';

// ==================== TYPES ====================

export interface TimeSlotDTO {
  id: number;
  serviceId: number;
  serviceName: string;
  slotDate: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  isAvailable: boolean;
  bookings?: BookingDTO[];
}

export interface BookingDTO {
  id: number;
  serviceId: number;
  serviceName: string;
  timeSlotId: number;
  userId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  assignedEmployeeId?: number;
  assignedEmployeeName?: string;
  bookingDate?: string;
  createdAt: string;
  updatedAt: string;
  // Nested TimeSlot data from backend
  timeSlot?: {
    id: number;
    serviceId: number;
    serviceName: string;
    slotDate: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  };
}

export interface EmployeeDTO {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  isActive: boolean;
}

export interface ServiceDTO {
  id: number;
  name: string;
  description?: string;
  duration: number; // minutes
  price?: number;
  isActive: boolean;
}

export interface CreateTimeSlotRequest {
  serviceId: number;
  slotDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  isAvailable?: boolean;
}

export interface BlockDateRequest {
  serviceId: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface CreateBookingRequest {
  serviceId: number;
  timeSlotId: number;
  userId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
}

// ==================== API CALLS ====================

// ------------------ TIME SLOTS ------------------

export async function getTimeSlots(date?: string, serviceId?: number): Promise<TimeSlotDTO[]> {
  try {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (serviceId) params.append('serviceId', serviceId.toString());
    
    const url = `${API_BASE_URL}/timeslots${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch time slots: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching time slots:', error);
    throw error;
  }
}

// Get time slots for customer (excludes already booked slots)
export async function getAvailableTimeSlotsForCustomer(date?: string, serviceId?: number): Promise<TimeSlotDTO[]> {
  try {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (serviceId) params.append('serviceId', serviceId.toString());
    
    const url = `${API_BASE_URL}/timeslots/customer${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch available time slots: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching available time slots for customer:', error);
    throw error;
  }
}

export async function getTimeSlotById(id: number): Promise<TimeSlotDTO> {
  const response = await fetch(`${API_BASE_URL}/timeslots/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch time slot: ${response.statusText}`);
  }
  return await response.json();
}

export async function createTimeSlot(request: CreateTimeSlotRequest): Promise<TimeSlotDTO> {
  const response = await fetch(`${API_BASE_URL}/timeslots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create time slot: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function updateTimeSlotAvailability(id: number, isAvailable: boolean): Promise<TimeSlotDTO> {
  const response = await fetch(`${API_BASE_URL}/timeslots/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isAvailable }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update time slot: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function deleteTimeSlot(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/timeslots/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete time slot: ${response.statusText}`);
  }
}

// Block date range (sets isAvailable = false for all slots in range)
export async function blockDateRange(request: BlockDateRequest): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/timeslots/block-range`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to block date range: ${response.statusText}`);
  }
}

// ------------------ BOOKINGS ------------------

export async function createBooking(request: CreateBookingRequest): Promise<BookingDTO> {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to create booking: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

export async function getAllBookings(): Promise<BookingDTO[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`);
    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
}

export async function getAssignedBookings(): Promise<BookingDTO[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/assigned`);
    if (!response.ok) {
      throw new Error(`Failed to fetch assigned bookings: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching assigned bookings:', error);
    throw error;
  }
}

export async function getBookingById(id: number): Promise<BookingDTO> {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch booking: ${response.statusText}`);
  }
  return await response.json();
}

export async function assignEmployee(bookingId: number, employeeId: number, timeSlot?: string): Promise<BookingDTO> {
  const params = new URLSearchParams();
  params.append('employeeId', employeeId.toString());
  if (timeSlot) params.append('timeSlot', timeSlot);
  
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/assign?${params.toString()}`, {
    method: 'PUT',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to assign employee: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function cancelBooking(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to cancel booking: ${response.statusText}`);
  }
}

// ------------------ EMPLOYEES ------------------

export async function getAllEmployees(): Promise<EmployeeDTO[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/employees`);
    if (!response.ok) {
      throw new Error(`Failed to fetch employees: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}

export async function getEmployeeById(id: number): Promise<EmployeeDTO> {
  const response = await fetch(`${API_BASE_URL}/employees/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch employee: ${response.statusText}`);
  }
  return await response.json();
}

// ------------------ SERVICES ------------------

export async function getAllServices(): Promise<ServiceDTO[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/services`);
    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export async function getServiceById(id: number): Promise<ServiceDTO> {
  const response = await fetch(`${API_BASE_URL}/services/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch service: ${response.statusText}`);
  }
  return await response.json();
}

// ------------------ UTILITIES ------------------

/**
 * Check if a time slot has any bookings (to prevent double-booking)
 */
export function hasConflict(slot: TimeSlotDTO): boolean {
  return (slot.bookings?.length ?? 0) > 0 && slot.isAvailable;
}

/**
 * Get all bookings for a specific date
 */
export function getBookingsForDate(bookings: BookingDTO[], date: string): BookingDTO[] {
  return bookings.filter(b => b.timeSlot?.slotDate === date);
}

/**
 * Check if employee is already assigned to another booking at the same time
 */
export function hasEmployeeConflict(
  bookings: BookingDTO[], 
  employeeId: number, 
  date: string, 
  startTime: string, 
  endTime: string
): boolean {
  return bookings.some(b => 
    b.assignedEmployeeId === employeeId &&
    b.timeSlot?.slotDate === date &&
    b.status !== 'CANCELLED' &&
    // Check time overlap
    !(b.timeSlot?.endTime! <= startTime || b.timeSlot?.startTime! >= endTime)
  );
}
