export type ServiceType =
  | 'General Service'
  | 'Oil Change'
  | 'Diagnostics'
  | 'Tire Rotation'
  | 'Brake Service';

// Updated Booking type to include title property
export type Booking = {
  id: string;
  slotId: string;
  date: string; // ISO date string (yyyy-mm-dd)
  time: string; // HH:mm
  customer: string;
  serviceType: ServiceType;
  bay: string;
  technician: string;
  title: string; // Added title property
};

export type Slot = {
  id: string;
  date: string; // ISO date string (yyyy-mm-dd)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  notes?: string;
  serviceType?: ServiceType;
  bay?: string; // e.g., Bay 1, Bay 2
  technician?: string; // optional assigned technician name
  bookings: Booking[]; // Added bookings property
  isAvailable?: boolean; // Tracks if the time slot is available for booking
};

// Updated SlotInput type to exclude bookings property
export type SlotInput = Omit<Slot, 'id' | 'bookings'> & {
  capacity: number;
  available: number;
};
