import { CalendarClock } from "lucide-react";

export default function ScheduleCard() {
  return (
    <div className="rounded-lg border border-white bg-white p-5 shadow-md transition hover:shadow-lg hover:-translate-y-0.5">
      <h3 className="font-heading text-lg font-semibold mb-3">My Schedule</h3>
      <div className="space-y-2.5">
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 h-4 w-4 text-gray-500" />
          <div>
            <div className="text-xs font-semibold">10:00 AM - 11:00 AM</div>
            <div className="text-[11px] text-gray-600">Service: Toyota Camry</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 h-4 w-4 text-gray-500" />
          <div>
            <div className="text-xs font-semibold">11:00 AM - 12:00 PM</div>
            <div className="text-[11px] text-gray-600">Service: Ford F-150</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 h-4 w-4 text-gray-500" />
          <div>
            <div className="text-xs font-semibold">12:00 PM - 1:00 PM</div>
            <div className="text-[11px] text-gray-600">Lunch Break</div>
          </div>
        </div>
      </div>
    </div>
  );
}
