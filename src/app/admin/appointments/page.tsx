// app/admin/appointments/page.tsx
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ScheduleToolbar from '@/app/components/admin/ScheduleToolbar';
import DailyScheduleView from '@/app/components/admin/DailyScheduleView';
import AppointmentDetailModal from '@/app/components/admin/AppointmentDetailModal';
import NewAppointmentModal from '@/app/components/admin/NewAppointmentModal';
import SetAvailabilityModal from '@/app/components/admin/SetAvailabilityModal';

export type Appointment = {
  id: string;
  startTime: string;
  duration: number;
  customer: { name: string; vehicle: string; };
  service: string;
  tasks: { name: string; completed: boolean; }[];
  status: 'Scheduled' | 'In Progress' | 'Awaiting Parts' | 'Completed' | 'Paid';
  assignedEmployee: string | null;
};

const mockAppointments: Appointment[] = [
    { id: 'APP-001', startTime: '09:00', duration: 90, customer: { name: 'John Doe', vehicle: 'Toyota Camry' }, service: 'Brake Service', tasks: [{name: 'Brake pad replacement', completed: true}, {name: 'Brake fluid check', completed: false}], status: 'In Progress', assignedEmployee: 'Mike R.' },
    { id: 'APP-002', startTime: '11:00', duration: 30, customer: { name: 'Jane Smith', vehicle: 'Honda Civic' }, service: 'Oil Change', tasks: [{name: 'Oil & Filter change', completed: true}], status: 'Completed', assignedEmployee: 'Sarah K.' },
    { id: 'APP-003', startTime: '14:00', duration: 120, customer: { name: 'Peter Jones', vehicle: 'Ford F-150' }, service: 'Full Service', tasks: [{name: 'Full inspection', completed: false}, {name: 'Tire rotation', completed: false}], status: 'Scheduled', assignedEmployee: null },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="font-heading text-3xl font-bold">Daily Schedule &amp; Assignments</h1>
      <p className="mt-1 text-muted-foreground">Visualize daily slots, assign employees, and manage appointment progress.</p>
      
      <div className="mt-8">
        <ScheduleToolbar 
          onNewAppointment={() => setIsNewAppointmentModalOpen(true)}
          onSetAvailability={() => setIsAvailabilityModalOpen(true)}
        />
      </div>

      <div className="mt-6">
        <DailyScheduleView appointments={appointments} onViewDetails={handleViewDetails} />
      </div>

      {/* Modals for all actions */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
      <NewAppointmentModal 
        open={isNewAppointmentModalOpen}
        onClose={() => setIsNewAppointmentModalOpen(false)}
      />
      <SetAvailabilityModal
        open={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
      />
    </motion.div>
  );
}
