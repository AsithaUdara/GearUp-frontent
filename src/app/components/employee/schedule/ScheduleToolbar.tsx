import { Search, CalendarPlus, Settings } from "lucide-react";

type Props = {
  onNewAppointment?: () => void;
  onSetAvailability?: () => void;
};

export default function ScheduleToolbar({ onNewAppointment, onSetAvailability }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search appointments..."
          className="w-full rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-red-600"
        />
      </div>
      <div className="flex rounded-md border overflow-hidden">
        <button className="px-3 py-2 text-xs font-medium hover:bg-gray-50">Day</button>
        <button className="px-3 py-2 text-xs font-medium bg-gray-100">Week</button>
        <button className="px-3 py-2 text-xs font-medium hover:bg-gray-50">Month</button>
      </div>
      <button onClick={onSetAvailability} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50">
        <Settings className="h-4 w-4" /> Set Availability
      </button>
      <button onClick={onNewAppointment} className="inline-flex items-center gap-2 rounded-md bg-red-600 text-white px-3 py-2 text-xs font-medium hover:bg-red-700">
        <CalendarPlus className="h-4 w-4" /> New Appointment
      </button>
    </div>
  );
}
