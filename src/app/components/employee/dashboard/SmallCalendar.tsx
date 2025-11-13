"use client";
import { useMemo, useRef, useState, useSyncExternalStore, useEffect } from "react";
import { subscribe, getAppointments, Appointment as StoreAppointment } from "@/lib/appointmentsStore";
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

// Server snapshot function cached outside component to avoid infinite loop
const getServerSnapshot = () => [];

export default function SmallCalendar({ appointments = [], unavailableDates = [], onDayClick }: Props) {
  const today = new Date();
  const [current, setCurrent] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ left: number; top: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) &&
          containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSelectedDate(null);
        setPopupPos(null);
      }
    }

    if (selectedDate) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectedDate]);

  // subscribe to shared appointments store and merge with any passed-in appointments

  const storeAppointments = useSyncExternalStore(
    subscribe, 
    getAppointments,
    getServerSnapshot
  );
  const mergedAppointments: Array<Appointment | StoreAppointment> = (appointments && appointments.length > 0) ? [...appointments, ...storeAppointments] : storeAppointments;

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

  function handleClick(dateStr?: string, ev?: React.MouseEvent<HTMLButtonElement>) {
    if (!dateStr) return;
    setSelectedDate(dateStr);
    if (onDayClick) onDayClick(dateStr);
    // Position popup below the clicked cell, within the calendar card
    if (ev && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const targetRect = (ev.currentTarget as HTMLButtonElement).getBoundingClientRect();
      
      // Calculate position below the clicked cell
      const left = targetRect.left - containerRect.left;
      const top = targetRect.bottom - containerRect.top + 8; // 8px gap below cell
      
      setPopupPos({ left, top });
    } else {
      setPopupPos(null);
    }
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
        <div 
          ref={popupRef}
          style={{ 
            left: `${popupPos.left}px`, 
            top: `${popupPos.top}px`,
            maxWidth: 'calc(100% - 1rem)'
          }} 
          className="absolute z-50 min-w-[280px] w-auto"
        >
          <div className="rounded-lg border border-gray-300 bg-white shadow-xl">
            {/* Header with date */}
            <div className="border-b border-gray-200 px-3 py-2 bg-gray-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-gray-900">{selectedDate}</div>
                <button 
                  onClick={() => setSelectedDate(null)} 
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Appointments list */}
            <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
              {(() => {
                const dayAppts = apptMap[selectedDate] ?? [];
                const isSelUnavailable = selectedDate ? unavailableDates.includes(selectedDate) : false;
                if (!dayAppts || dayAppts.length === 0) {
                  return (
                    <div className="text-xs text-gray-500 text-center py-3">
                      {isSelUnavailable ? "This day is marked Unavailable." : "No appointments"}
                    </div>
                  );
                }
                return dayAppts.map((a) => (
                  <div key={a.id} className="border border-gray-200 rounded-md p-2 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-900">
                          {'time' in a ? a.time : ''} — {'customer' in a ? a.customer : ''}
                        </div>
                        <div className="text-[11px] text-gray-600 mt-0.5">
                          {'service' in a ? a.service : ''} · {'vehicle' in a ? a.vehicle : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="text-[11px] text-gray-500">
                        Status: <span className="font-medium">{'status' in a ? a.status : ''}</span>
                      </div>
                      <button 
                        onClick={() => { 
                          router.push(`/employee/schedule?date=${selectedDate}&appt=${a.id}`); 
                        }} 
                        className="text-[11px] bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                      >
                        View
                      </button>
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
