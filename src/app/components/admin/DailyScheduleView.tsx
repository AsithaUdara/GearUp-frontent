// app/components/admin/DailyScheduleView.tsx
'use client';
import { motion } from 'framer-motion';
import type { Appointment } from '@/app/admin/appointments/page';
import { Clock, User, Wrench } from 'lucide-react';

const employees = ['Mike R.', 'Sarah K.', 'Unassigned'];

const statusColors = {
    'Scheduled': 'bg-gray-200 border-gray-400 text-gray-700',
    'In Progress': 'bg-blue-100 border-blue-400 text-blue-800',
    'Awaiting Parts': 'bg-yellow-100 border-yellow-400 text-yellow-800',
    'Completed': 'bg-green-100 border-green-400 text-green-800',
    'Paid': 'bg-purple-100 border-purple-400 text-purple-800',
};

const calculatePosition = (startTime: string, duration: number) => {
    const [hour, minute] = startTime.split(':').map(Number);
    const startMinutes = hour * 60 + minute;
    const dayStartMinutes = 8 * 60;
    const left = ((startMinutes - dayStartMinutes) / (12 * 60)) * 100;
    const width = (duration / (12 * 60)) * 100;
    return { left: `${left}%`, width: `${width}%` };
};

type Props = {
    appointments: Appointment[];
    onViewDetails: (appointment: Appointment) => void;
}

export default function DailyScheduleView({ appointments, onViewDetails }: Props) {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="space-y-6">
        {employees.map(employee => (
          <div key={employee}>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-heading font-bold text-lg">{employee}</h3>
            </div>
            <div className="relative h-16 w-full rounded-lg bg-gray-100/50 border border-dashed border-gray-300">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="absolute h-full border-r border-gray-200" style={{ left: `${(i + 1) * (100 / 12)}%` }}>
                  <span className="absolute -top-5 text-xs text-muted-foreground">{i + 9}:00</span>
                </div>
              ))}
              {appointments
                .filter(a => a.assignedEmployee === employee || (employee === 'Unassigned' && !a.assignedEmployee))
                .map(appt => {
                  const { left, width } = calculatePosition(appt.startTime, appt.duration);
                  return (
                    <motion.div
                      key={appt.id}
                      className={`absolute top-0 h-full p-2 rounded-lg cursor-pointer flex flex-col justify-center ${statusColors[appt.status]}`}
                      style={{ left, width, minWidth: '50px' }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02, zIndex: 10, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      onClick={() => onViewDetails(appt)}
                    >
                      <p className="text-xs font-bold truncate">{appt.service}</p>
                      <p className="text-[10px] truncate">{appt.customer.name} - {appt.customer.vehicle}</p>
                    </motion.div>
                  );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
