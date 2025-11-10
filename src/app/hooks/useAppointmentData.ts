/**
 * Custom hook for managing appointment data from appointment-service
 */

import { useState, useEffect, useCallback } from 'react';
import {
  TimeSlotDTO,
  BookingDTO,
  EmployeeDTO,
  ServiceDTO,
  getAllBookings,
  getTimeSlots,
  getAllEmployees,
  getAllServices,
  updateTimeSlotAvailability,
  deleteTimeSlot,
} from '../services/appointmentService';

export interface AppointmentData {
  timeSlots: TimeSlotDTO[];
  bookings: BookingDTO[];
  employees: EmployeeDTO[];
  services: ServiceDTO[];
  loading: boolean;
  error: string | null;
}

export function useAppointmentData(selectedDate?: string) {
  const [data, setData] = useState<AppointmentData>({
    timeSlots: [],
    bookings: [],
    employees: [],
    services: [],
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch all data in parallel
      const [bookings, employees, services, timeSlots] = await Promise.all([
        getAllBookings(),
        getAllEmployees(),
        getAllServices(),
        selectedDate ? getTimeSlots(selectedDate) : Promise.resolve([]),
      ]);

      setData({
        timeSlots,
        bookings,
        employees,
        services,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching appointment data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data',
      }));
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const blockTimeSlot = async (slotId: number) => {
    try {
      await updateTimeSlotAvailability(slotId, false);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error blocking time slot:', error);
      throw error;
    }
  };

  const unblockTimeSlot = async (slotId: number) => {
    try {
      await updateTimeSlotAvailability(slotId, true);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error unblocking time slot:', error);
      throw error;
    }
  };

  const removeTimeSlot = async (slotId: number) => {
    try {
      await deleteTimeSlot(slotId);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error removing time slot:', error);
      throw error;
    }
  };

  return {
    ...data,
    refreshData: fetchData,
    blockTimeSlot,
    unblockTimeSlot,
    removeTimeSlot,
  };
}
