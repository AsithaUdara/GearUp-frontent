"use client";
import { useMemo, useState } from "react";

type Appointment = {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  customer: string;
  vehicle?: string;
  service?: string;
  status?: string;
};

type Props = {
  appointments?: Appointment[];
  unavailableDates?: string[];
  onView?: (a: Appointment) => void;
};

function monthName(m: number) {
  return ["January","February","March","April","May","June","July","August","September","October","November","December"][m];
}

export default function CalendarInteractive({ appointments = [], unavailableDates = [], onView }: Props) {
  const today = new Date();
  // initialize calendar to the month containing the first unavailable date (if any),
  // otherwise fall back to current month
  const initialCurrent = (() => {
    if (unavailableDates && unavailableDates.length > 0) {
      const first = unavailableDates[0];
      const [y, m] = first.split("-").map(Number);
      if (!Number.isNaN(y) && !Number.isNaN(m)) return new Date(y, m - 1, 1);
    }
    if (appointments && appointments.length > 0) {
      const d = appointments[0].date;
      if (d) {
        const [y, m] = d.split("-").map(Number);
        if (!Number.isNaN(y) && !Number.isNaN(m)) return new Date(y, m - 1, 1);
      }
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  })();

  const [current, setCurrent] = useState(() => initialCurrent);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = useMemo(() => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeek = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ day: number | null; dateStr?: string }> = [];
    // leading blanks
    for (let i = 0; i < startWeek; i++) cells.push({ day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      cells.push({ day: d, dateStr });
    }
    // trailing blanks to fill 7*rows
    while (cells.length % 7 !== 0) cells.push({ day: null });
    return { year, month, cells };
  }, [current]);

  // map appointments by date for quick lookup
  const apptMap = useMemo(() => {
    const m: Record<string, Appointment[]> = {};
    for (const a of appointments) {
      if (!a.date) continue;
      m[a.date] = m[a.date] ?? [];
      m[a.date].push(a);
    }
    return m;
  }, [appointments]);

  function prevMonth() {
    setCurrent((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrent((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  }

  function jumpToDate(value: string) {
    if (!value) return;
    const [y, m, d] = value.split("-").map(Number);
    setCurrent(new Date(y, m - 1, 1));
    setSelectedDate(value);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-transform hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="px-3 py-1 rounded-md border">‹</button>
          <div className="text-sm font-medium">{monthName(current.getMonth())} {current.getFullYear()}</div>
          <button onClick={nextMonth} className="px-3 py-1 rounded-md border">›</button>
        </div>
        <div className="flex items-center gap-2">
          <input aria-label="Go to date" type="date" onChange={(e) => jumpToDate(e.target.value)} className="text-sm rounded-md border px-2 py-1" />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={`${d}-${i}`} className="py-1">{d}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2 text-center">
        {days.cells.map((c, idx) => {
          const hasAppts = c.dateStr ? (apptMap[c.dateStr] ?? []).length > 0 : false;
          const isSelected = c.dateStr && selectedDate === c.dateStr;
          const isToday = c.dateStr === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
          const isUnavailable = c.dateStr ? unavailableDates.includes(c.dateStr) : false;
          return (
            <div
              key={idx}
              onClick={() => { if (c.dateStr) setSelectedDate(c.dateStr); }}
              className={
                "rounded-md py-3 text-sm min-h-[56px] flex flex-col items-center justify-start gap-2 " +
                (c.day === null
                  ? "text-transparent"
                  : isSelected
                  ? "bg-gray-50 ring-1 ring-blue-200"
                  : isToday
                  ? "bg-red-600 text-white"
                  : isUnavailable
                  ? "bg-red-100 text-red-700"
                  : "hover:bg-gray-50")
              }
            >
              {c.day ?? '\u00A0'}
              {hasAppts && c.day !== null && (
                <div className="mt-auto">
                  <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full ${isUnavailable ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-white border border-gray-200 text-gray-700'} text-xs`}>{(apptMap[c.dateStr!] ?? []).length}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedDate(null)}>
          <div className="w-full max-w-2xl rounded-lg border bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{selectedDate}</div>
              <button onClick={() => setSelectedDate(null)} className="text-sm text-gray-500">Close</button>
            </div>
            <div className="mt-3 space-y-3">
              {(() => {
                const dayAppts = apptMap[selectedDate!] ?? [];
                const isSelUnavailable = selectedDate ? unavailableDates.includes(selectedDate) : false;
                if (dayAppts.length === 0) {
                  return (
                    <div className="text-sm text-gray-500">{isSelUnavailable ? "This day is marked Unavailable." : "No appointments"}</div>
                  );
                }
                return dayAppts.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-md border p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      if (onView) onView(a);
                      setSelectedDate(null);
                    }}
                  >
                    <div className="text-sm font-semibold">{a.time ?? ""} — {a.customer}</div>
                    <div className="text-xs text-gray-600">{a.service} · {a.vehicle}</div>
                    <div className="text-xs text-gray-500 mt-1">Status: {a.status}</div>
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
