/**
 * Appointments API Client
 * 
 * Fetches appointment data from backend service (replaces Firestore)
 */

'use client';

import { api } from '../apiClient';

export type Appointment = {
  id: string;
  userId: string;
  serviceName: string;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAppointmentDto = {
  serviceName: string;
  appointmentDate: string;
  timeSlot: string;
  notes?: string;
};

/**
 * Get all appointments for current user
 */
export async function getUserAppointments(userId: string): Promise<Appointment[]> {
  return api.get<Appointment[]>(`/api/appointments/user/${userId}`);
}

/**
 * Get upcoming appointments for current user
 */
export async function getUpcomingAppointments(userId: string): Promise<Appointment[]> {
  return api.get<Appointment[]>(`/api/appointments/user/${userId}/upcoming`);
}

/**
 * Get appointment by ID
 */
export async function getAppointment(appointmentId: string): Promise<Appointment> {
  return api.get<Appointment>(`/api/appointments/${appointmentId}`);
}

/**
 * Create new appointment
 */
export async function createAppointment(data: CreateAppointmentDto): Promise<Appointment> {
  return api.post<Appointment>('/api/appointments', data);
}

/**
 * Update appointment
 */
export async function updateAppointment(
  appointmentId: string,
  data: Partial<CreateAppointmentDto>
): Promise<Appointment> {
  return api.put<Appointment>(`/api/appointments/${appointmentId}`, data);
}

/**
 * Cancel appointment
 */
export async function cancelAppointment(appointmentId: string): Promise<Appointment> {
  return api.patch<Appointment>(`/api/appointments/${appointmentId}/cancel`, {});
}

/**
 * Delete appointment
 */
export async function deleteAppointment(appointmentId: string): Promise<void> {
  return api.delete(`/api/appointments/${appointmentId}`);
}
