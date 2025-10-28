export type ServiceType =
  | 'General Service'
  | 'Oil Change'
  | 'Diagnostics'
  | 'Tire Rotation'
  | 'Brake Service';

export type Slot = {
  id: string;
  date: string; // ISO date string (yyyy-mm-dd)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  capacity: number; // total capacity
  available: number; // remaining availability
  notes?: string;
  serviceType?: ServiceType;
  bay?: string; // e.g., Bay 1, Bay 2
  technician?: string; // optional assigned technician name
};

export type SlotInput = Omit<Slot, "id" | "available"> & { available?: number };
