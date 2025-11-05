"use client";
import { CalendarClock } from "lucide-react";
import { useSyncExternalStore } from "react";
import { subscribe, getAppointments } from "@/lib/appointmentsStore";
import { subscribeUnavailable, getUnavailableDates } from "@/lib/unavailableDatesStore";
import Link from "next/link";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ScheduleCard() {
  const appointments = useSyncExternalStore(subscribe, getAppointments);
  const unavailableDates = useSyncExternalStore(subscribeUnavailable, getUnavailableDates);

  const today = todayISO();
  const todaysTasks = appointments.filter((a) => a.date === today && !a.past);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="font-heading text-lg font-semibold mb-3">My Schedule</h3>

      <div className="mb-3">
        <h4 className="text-sm font-medium mb-2">Today's Tasks</h4>
        {todaysTasks.length === 0 ? (
          <p className="text-xs text-gray-600">No tasks scheduled for today.</p>
        ) : (
          <ul className="space-y-3">
            {todaysTasks.map((t) => (
              <li key={t.id} className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-xs font-semibold">{t.time ?? "—"} — {t.service}</div>
                  <div className="text-[11px] text-gray-600">{t.customer} — {t.vehicle}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Unavailable Dates</h4>
        {unavailableDates.length === 0 ? (
          <p className="text-xs text-gray-600">No unavailable dates set.</p>
        ) : (
          <ul className="list-disc pl-5 text-[13px] text-gray-700">
            {unavailableDates.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3">
        <Link href="/employee/schedule" className="text-xs font-medium text-red-600 hover:underline">View Schedule</Link>
      </div>
    </div>
  );
}
