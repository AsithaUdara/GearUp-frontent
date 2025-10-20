"use client";
import ScheduleToolbar from "../../components/employee/schedule/ScheduleToolbar";
import AvailabilityPanel from "../../components/employee/schedule/AvailabilityPanel";
import CalendarMonth from "../../components/employee/schedule/CalendarMonth";
import UpcomingAppointmentsTable from "../../components/employee/schedule/UpcomingAppointmentsTable";
import NewAppointmentModal from "../../components/employee/schedule/NewAppointmentModal";
import AppointmentConfirmationModal from "../../components/employee/schedule/AppointmentConfirmationModal";
import AppointmentDetailsModal from "../../components/employee/schedule/AppointmentDetailsModal";
import SetAvailabilityModal from "../../components/employee/schedule/SetAvailabilityModal";
import { useState } from "react";

export default function EmployeeSchedulePage() {
  const [openNew, setOpenNew] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState<string | undefined>(undefined);
  const [lastAppointment, setLastAppointment] = useState<any | null>(null);

  return (
    <div className="space-y-6">
      <ScheduleToolbar onNewAppointment={() => setOpenNew(true)} onSetAvailability={() => setAvailabilityOpen(true)} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarMonth />
        </div>
        <div className="lg:col-span-1">
          <AvailabilityPanel />
        </div>
      </div>
      <UpcomingAppointmentsTable />
      <NewAppointmentModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        onSubmit={(data) => {
          // frontend-only: generate a fake confirmation number and store details
          const fakeNumber = `#${Math.floor(100000 + Math.random() * 900000)}`;
          setConfirmationNumber(fakeNumber);
          setLastAppointment({
            id: fakeNumber.replace("#", "APPT-"),
            customerName: data.customerName || "",
            contact: data.customerContact,
            email: undefined,
            vehicle: {
              make: data.vehicleMake,
              model: data.vehicleModel,
              vin: data.vehicleVin,
            },
            services: data.serviceType ? [data.serviceType] : [],
            date: data.preferredDate,
            time: data.preferredTime,
            assignee: "Unassigned",
            status: "Scheduled",
            communications: [
              { title: "Confirmation created", detail: "Appointment created via New Appointment form.", at: new Date().toLocaleString() },
            ],
          });
          setConfirmOpen(true);
        }}
      />
      <AppointmentConfirmationModal
        open={confirmOpen}
        confirmationNumber={confirmationNumber}
        onViewDetails={() => {
          setConfirmOpen(false);
          setDetailsOpen(true);
        }}
        onReturn={() => {
          setConfirmOpen(false);
          // stays on schedule page; could navigate to dashboard if needed later
        }}
        onClose={() => setConfirmOpen(false)}
      />
      {lastAppointment && (
        <AppointmentDetailsModal
          open={detailsOpen}
          details={lastAppointment}
          onClose={() => setDetailsOpen(false)}
        />
      )}
      <SetAvailabilityModal open={availabilityOpen} onClose={() => setAvailabilityOpen(false)} />
    </div>
  );
}
