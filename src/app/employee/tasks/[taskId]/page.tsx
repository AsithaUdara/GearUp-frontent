// src/app/employee/tasks/[taskId]/page.tsx
'use client';

import React, { use, useState, useEffect } from 'react';
import { Clock, User, Car, Calendar, Wrench, Package, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation'; // Import the router

// HELPER COMPONENTS (defined outside the main component to prevent re-render issues)
const InfoCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="border-b bg-gray-50/50 px-5 py-3">
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
);
  
const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex items-center gap-3">
      <div className="text-gray-500">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
);

// TYPES
type TaskStatus = 'In Progress' | 'Completed' | 'Pending' | 'Quality Check';
type PartStatus = 'Received' | 'Ordered' | 'Pending';

// MOCK DATA FUNCTION
const getMockTaskData = (taskId: string) => ({
  id: taskId,
  title: 'Oil Change - Toyota Camry',
  status: 'In Progress' as TaskStatus,
  customer: { name: 'John Doe' },
  vehicle: { make: 'Toyota', model: 'Camry', year: '2021', licensePlate: 'V-XYZ123', vin: '123XYZVIN456ABC' },
  appointment: { date: '2025-10-28', time: '10:00 AM - 11:00 AM', serviceAdvisor: 'Jane Smith' },
  assignedTo: 'Niroshan',
  workLogs: [
    { timestamp: '10:05 AM', note: 'Vehicle brought into the bay. Initial inspection started.' },
    { timestamp: '10:15 AM', note: 'Oil drained successfully. Old filter removed.' },
    { timestamp: '10:25 AM', note: 'New oil filter installed. Gasket checked.' },
  ],
  parts: [
    { id: 'P1', name: 'Synthetic Oil 5L', quantity: 1, status: 'Received' as PartStatus },
    { id: 'P2', name: 'Oil Filter #12345', quantity: 1, status: 'Received' as PartStatus },
    { id: 'P3', name: 'Air Filter #AF678', quantity: 1, status: 'Ordered' as PartStatus },
  ],
  documents: [
    { name: 'initial-damage.jpg', url: '/service-1.jpg' },
    { name: 'vin-scan.jpg', url: '/team-workshop.jpg' },
  ]
});

type ParamsPromise = Promise<{ taskId: string }>;

// STYLE MAPPINGS
const statusStyles: Record<TaskStatus, string> = {
  "In Progress": "bg-amber-100 text-amber-800",
  "Completed": "bg-emerald-100 text-emerald-800",
  "Pending": "bg-gray-100 text-gray-800",
  "Quality Check": "bg-blue-100 text-blue-800",
};

const partStatusStyles: Record<PartStatus, string> = {
    "Received": "bg-green-100 text-green-800",
    "Ordered": "bg-yellow-100 text-yellow-800",
    "Pending": "bg-gray-100 text-gray-800"
}

// --- MAIN PAGE COMPONENT ---
export default function TaskDetailPage({ params }: { params: ParamsPromise | { taskId: string } }) {
  const router = useRouter(); 
  const resolvedParams = use(params as ParamsPromise);
  
  const [taskData] = useState(() => getMockTaskData(resolvedParams.taskId));
  const [workLogs, setWorkLogs] = useState(taskData.workLogs);
  const [newNote, setNewNote] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const handleLogProgress = () => {
    if (!newNote.trim()) {
      alert("Please enter a progress note.");
      return;
    }
    const newLogEntry = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: newNote,
    };
    setWorkLogs([newLogEntry, ...workLogs]);
    setNewNote('');
  };

  const handleRequestNewPart = () => {
    router.push('/employee/parts-request');
  };

  if (!isClient) return null;

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{taskData.title}</h1>
          <p className="text-gray-500">Task ID: {taskData.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("px-3 py-1 text-xs font-bold rounded-full", statusStyles[taskData.status])}>
            {taskData.status}
          </span>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">
            Update Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <InfoCard title="Work & Progress Log">
            <ul className="space-y-4">
              {workLogs.map((log) => (
                <li key={`${log.timestamp}-${log.note}`} className="flex gap-4">
                  <div className="text-sm font-semibold text-gray-600 w-20 pt-1">{log.timestamp}</div>
                  <div className="text-sm text-gray-800 flex-1 border-l-2 pl-4">{log.note}</div>
                </li>
              ))}
            </ul>
            <div className="border-t pt-4 mt-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a new progress note..."
                  rows={3}
                  className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                <div className="text-right mt-2">
                    <button onClick={handleLogProgress} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900">Log Progress</button>
                </div>
            </div>
          </InfoCard>

          <InfoCard title="Parts & Materials">
            <ul className="divide-y divide-gray-200">
              {taskData.parts.map(part => (
                <li key={part.id} className="flex justify-between items-center py-3">
                  <div>
                    <p className="font-medium text-gray-800">{part.name}</p>
                    <p className="text-xs text-gray-500">Qty: {part.quantity}</p>
                  </div>
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", partStatusStyles[part.status])}>{part.status}</span>
                </li>
              ))}
            </ul>
            <div className="text-right border-t pt-4 mt-4">
                <button onClick={handleRequestNewPart} className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-100">Request New Part</button>
             </div>
          </InfoCard>
          
          <InfoCard title="Uploaded Documents">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {taskData.documents.map(doc => (
                      <div key={doc.name}>
                          <img src={doc.url} alt={doc.name} className="aspect-square w-full object-cover rounded-md border" />
                          <p className="text-xs text-center mt-1 truncate">{doc.name}</p>
                      </div>
                  ))}
              </div>
              <div className="text-right border-t pt-4 mt-4">
                 <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900">
                    <UploadCloud className="h-4 w-4" /> Upload File
                 </button>
              </div>
          </InfoCard>

        </div>
        
        <div className="lg:col-span-1 space-y-8">
          <InfoCard title="Customer Details">
             <div className="space-y-4">
                <InfoRow icon={<User size={16} />} label="Name" value={taskData.customer.name} />
                <InfoRow icon={<Wrench size={16} />} label="Assigned To" value={taskData.assignedTo} />
             </div>
          </InfoCard>
          <InfoCard title="Vehicle Details">
             <div className="space-y-4">
                <InfoRow icon={<Car size={16} />} label="Vehicle" value={`${taskData.vehicle.year} ${taskData.vehicle.make} ${taskData.vehicle.model}`} />
                <InfoRow icon={<Car size={16} />} label="License Plate" value={taskData.vehicle.licensePlate} />
                <InfoRow icon={<Car size={16} />} label="VIN" value={taskData.vehicle.vin} />
             </div>
          </InfoCard>
          <InfoCard title="Appointment Info">
             <div className="space-y-4">
                <InfoRow icon={<Calendar size={16} />} label="Date" value={taskData.appointment.date} />
                <InfoRow icon={<Clock size={16} />} label="Time" value={taskData.appointment.time} />
                <InfoRow icon={<User size={16} />} label="Service Advisor" value={taskData.appointment.serviceAdvisor} />
             </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}