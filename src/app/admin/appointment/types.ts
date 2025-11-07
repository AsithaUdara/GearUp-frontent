// app/services/appointment-service/types.ts
export interface Appointment {
  id: number;
  userId: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  notes?: string;
  date: string;
  timeSlot: {
    startTime: string;
    endTime: string;
    slotDate: string;
  };
}
