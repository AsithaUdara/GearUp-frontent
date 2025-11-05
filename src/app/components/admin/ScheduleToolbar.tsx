// app/components/admin/ScheduleToolbar.tsx
import { Search, CalendarPlus, Settings } from "lucide-react";

type Props = {
  onNewAppointment?: () => void;
  onSetAvailability?: () => void;
};

export default function ScheduleToolbar({ onNewAppointment, onSetAvailability }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex-1 min-w-[250px]">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search appointments, customers, or vehicles..."
          className="w-full rounded-full border border-border bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>
      <div className="flex rounded-md border overflow-hidden bg-white text-sm">
        <button className="px-4 py-2 text-muted-foreground hover:bg-gray-50">Day</button>
        <button className="px-4 py-2 bg-gray-100 font-semibold text-foreground border-x">Week</button>
        <button className="px-4 py-2 text-muted-foreground hover:bg-gray-50">Month</button>
      </div>
      <button onClick={onSetAvailability} className="inline-flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
        <Settings className="h-4 w-4" /> Set Availability
      </button>
      <button onClick={onNewAppointment} className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:brightness-110">
        <CalendarPlus className="h-4 w-4" /> New Appointment
      </button>
    </div>
  );
}
