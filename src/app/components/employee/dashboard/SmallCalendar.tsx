"use client";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { subscribe, getAppointments } from "@/lib/appointmentsStore";
import { useRouter } from "next/navigation";

type Appointment = { id: string; date: string };

type Props = {
  appointments?: Appointment[];
  unavailableDates?: string[];
  onDayClick?: (date: string) => void;
};

function monthName(m: number) {
  return ["January","February","March","April","May","June","July","August","September","October","November","December"][m];
}

export default function SmallCalendar({ appointments = [], unavailableDates = [], onDayClick }: Props) {
  const today = new Date();
  const [current, setCurrent] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ left: number; top: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // subscribe to shared appointments store and merge with any passed-in appointments
  const storeAppointments = useSyncExternalStore(subscribe, getAppointments, getAppointments as any);
  const mergedAppointments = (appointments && appointments.length > 0) ? appointments.concat(storeAppointments as any) : (storeAppointments as any);

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
    const m: Record<string, typeof storeAppointments[0][]> = {};
    for (const a of mergedAppointments) {
      if (!a || !('date' in a)) continue;
      const d = (a as any).date as string;
      m[d] = m[d] ?? [];
      m[d].push(a as any);
    }
    return m;
  }, [mergedAppointments]);

  const prev = () => setCurrent(c => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const next = () => setCurrent(c => new Date(c.getFullYear(), c.getMonth() + 1, 1));

  function handleClick(dateStr?: string, ev?: React.MouseEvent<HTMLButtonElement>) {
    if (!dateStr) return;
    setSelectedDate(dateStr);
    if (onDayClick) onDayClick(dateStr);
    // position popup relative to clicked cell (inside container)
    if (ev && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const targetRect = (ev.currentTarget as HTMLButtonElement).getBoundingClientRect();
      const left = targetRect.left - containerRect.left;
      const top = targetRect.top - containerRect.top + targetRect.height + 8; // below cell
      setPopupPos({ left, top });
    } else {
      setPopupPos(null);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 relative">
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

      <div ref={containerRef} className="grid grid-cols-7 gap-1 text-center text-sm relative">
        {days.cells.map((c, idx) => {
          const count = c.dateStr ? (apptMap[c.dateStr] ?? 0) : 0;
          const isToday = c.dateStr === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
          const isUnavailable = c.dateStr ? unavailableDates.includes(c.dateStr) : false;
          const isSelected = c.dateStr === selectedDate;
          return (
            <button
              key={idx}
              onClick={(e) => handleClick(c.dateStr, e)}
              className={`rounded-md py-2 min-h-[34px] flex flex-col items-center justify-center text-xs ${c.day===null? 'invisible' : isToday ? 'bg-red-600 text-white' : isUnavailable ? 'bg-red-100 text-red-700' : 'hover:bg-gray-50'} ${isSelected ? 'ring-2 ring-blue-200' : ''}`}
            >
              <div>{c.day ?? '\u00A0'}</div>
              {Array.isArray(count) ? ((count as any).length > 0 && <div className="mt-1 text-[10px] px-1 py-0.5 rounded-full bg-white border text-gray-700">{(count as any).length}</div>) : (count > 0 && <div className="mt-1 text-[10px] px-1 py-0.5 rounded-full bg-white border text-gray-700">{count}</div>)}
            </button>
          );
        })}
      </div>

      {/* popup with day details */}
      {selectedDate && popupPos && (
        <div style={{ left: popupPos.left, top: popupPos.top }} className="absolute w-80 z-40">
          <div className="rounded-lg border bg-white p-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{selectedDate}</div>
              <button onClick={() => setSelectedDate(null)} className="text-xs text-gray-500">Close</button>
            </div>
            <div className="mt-3 space-y-2">
              {(() => {
                const dayAppts = apptMap[selectedDate] ?? [];
                const isSelUnavailable = selectedDate ? unavailableDates.includes(selectedDate) : false;
                if (!dayAppts || dayAppts.length === 0) {
                  return <div className="text-sm text-gray-500">{isSelUnavailable ? "This day is marked Unavailable." : "No appointments"}</div>;
                }
                return dayAppts.map((a: any) => (
                  <div key={a.id} className="rounded-md border p-2">
                    <div className="text-sm font-semibold">{a.time ?? ""} — {a.customer}</div>
                    <div className="text-xs text-gray-600">{a.service} · {a.vehicle}</div>
                    <div className="text-xs text-gray-500 mt-1">Status: {a.status}</div>
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <button onClick={() => { router.push(`/employee/schedule?date=${selectedDate}&appt=${a.id}`); }} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">View</button>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
