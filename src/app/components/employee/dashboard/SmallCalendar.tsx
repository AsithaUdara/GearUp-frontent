"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import { subscribe, getAppointments, Appointment as StoreAppointment } from "@/lib/appointmentsStore";

type Appointment = { id: string; date: string };

type Props = {
  appointments?: Appointment[];
  unavailableDates?: string[];
  onDayClick?: (date: string) => void;
};

function monthName(m: number) {
  return ["January","February","March","April","May","June","July","August","September","October","November","December"][m];
}

// Server snapshot function cached outside component to avoid infinite loop
const emptyAppointmentsSnapshot: StoreAppointment[] = [];

export default function SmallCalendar({ appointments = [], unavailableDates = [], onDayClick }: Props) {
  const today = new Date();
  const [current, setCurrent] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  // subscribe to shared appointments store and merge with any passed-in appointments
  const storeAppointments = useSyncExternalStore(
    subscribe, 
    getAppointments,
    () => emptyAppointmentsSnapshot
  );

  const mergedAppointments = useMemo(() => {
    return (appointments && appointments.length > 0) ? [...appointments, ...storeAppointments] : storeAppointments;
  }, [appointments, storeAppointments]);

  const days = useMemo(() => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeek = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ day: number | null; dateStr?: string }> = [];
    for (let i = 0; i < startWeek; i++) cells.push({ day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      cells.push({ day: d, dateStr });
    }
    while (cells.length % 7 !== 0) cells.push({ day: null });
    return { year, month, cells };
  }, [current]);

  const apptMap = useMemo(() => {
    const m: Record<string, Array<Appointment | StoreAppointment>> = {};
    for (const a of mergedAppointments) {
      if (!a || !('date' in a)) continue;
      const d = a.date;
      m[d] = m[d] ?? [];
      m[d].push(a);
    }
    return m;
  }, [mergedAppointments]);

  const prev = () => setCurrent(c => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const next = () => setCurrent(c => new Date(c.getFullYear(), c.getMonth() + 1, 1));

  function handleClick(dateStr?: string) {
    if (!dateStr) return;
    if (onDayClick) onDayClick(dateStr);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 relative overflow-visible">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{monthName(current.getMonth())} {current.getFullYear()}</div>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="text-xs px-2 py-1 rounded border">‹</button>
          <button onClick={next} className="text-xs px-2 py-1 rounded border">›</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-500 mb-1">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={`${d}-${i}`} className="py-0.5">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm relative">
        {days.cells.map((c, idx) => {
          const count = c.dateStr ? (apptMap[c.dateStr] ?? 0) : 0;
          const hasAppointments = Array.isArray(count) ? count.length > 0 : count > 0;
          const isToday = c.dateStr === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
          const isUnavailable = c.dateStr ? unavailableDates.includes(c.dateStr) : false;
          
          return (
            <button
              key={idx}
              onClick={() => handleClick(c.dateStr)}
              className={`rounded-md py-2 min-h-[34px] flex flex-col items-center justify-center text-xs relative ${
                c.day === null 
                  ? 'invisible' 
                  : isToday 
                    ? 'bg-red-600 text-white' 
                    : isUnavailable 
                      ? 'bg-red-100 text-red-700' 
                      : 'hover:bg-gray-50'
              }`}
            >
              <div>{c.day ?? '\u00A0'}</div>
              {/* Show dot indicator for dates with appointments */}
              {hasAppointments && (
                <div className={`absolute bottom-1 w-1 h-1 rounded-full ${
                  isToday ? 'bg-white' : 'bg-red-600'
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
