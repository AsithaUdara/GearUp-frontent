"use client";

import React, { useMemo, useRef, useState } from "react";
import { Plus, Ban, Search, ChevronLeft, ChevronRight, MoreHorizontal, CheckCircle2, CalendarDays, Pencil, Trash2 } from "lucide-react";
import AddSlotForm from "./AddSlotForm";
import EditSlotForm from "./EditSlotForm";
import { Slot, SlotInput, ServiceType, Booking } from "./types";

// Small helpers
const rid = (len = 8) => Math.random().toString(36).slice(2, 2 + len);
// Format date as YYYY-MM-DD in LOCAL time (avoid UTC shifts)
function ymd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
// Parse YYYY-MM-DD as a LOCAL date (midnight)
function fromYmd(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date((y || 0), ((m || 1) - 1), (d || 1));
}
// Simple technician availability model (mock). days: 0=Sun..6=Sat
const techniciansAvailability: Record<string, { days: number[]; start: string; end: string }> = {
  Alex: { days: [1,2,3,4,5], start: '08:00', end: '17:00' },
  Jordan: { days: [1,2,3,4,5,6], start: '09:00', end: '13:00' },
  Mike: { days: [1,2,3,4,5], start: '10:00', end: '18:00' }
};

function isTechAvailable(tech: string | undefined | null, dateIso: string, time: string) {
  if (!tech) return true;
  const avail = techniciansAvailability[tech];
  if (!avail) return true;
  const d = fromYmd(dateIso);
  const day = d.getDay();
  if (!avail.days.includes(day)) return false;
  // compare hh:mm strings lexicographically
  if (time < avail.start || time >= avail.end) return false;
  return true;
}
function firstDayOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function daysInMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth()+1, 0).getDate(); }
function startOffset(d: Date) { return firstDayOfMonth(d).getDay(); }

// Calendar event types
export type DayEvent =
  | { id: string; type: "available"; label: string }
  | { id: string; type: "blocked"; label: string }
  | { id: string; type: "booking"; label: string; time: string };

export default function ManageTimeSlotsPage() {
  const [current, setCurrent] = useState(() => new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [addInitial, setAddInitial] = useState<Partial<SlotInput> | undefined>();
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState<Slot | null>(null);
  const [showBlockRange, setShowBlockRange] = useState(false);
  const [view, setView] = useState<'day'|'week'|'month'>('month');
  const [showBooking, setShowBooking] = useState(false);
  const [bookingSlot, setBookingSlot] = useState<Slot | null>(null);
  const [slots, setSlots] = useState<Slot[]>(() => {
    const base = new Date();
    return [0,1,2,4,6].map(i => {
      const d = new Date(base); d.setDate(d.getDate()+i);
      return { id: rid(), date: ymd(d), startTime: "10:00", endTime:"11:00", serviceType: (i%2? 'Oil Change':'General Service') as ServiceType, bay: `Bay ${1 + (i%3)}`, technician: i%2? 'Alex' : 'Jordan', bookings: [] } as Slot;
    });
  });
  const [blocks, setBlocks] = useState<string[]>(() => {
    const d = new Date(); d.setDate(d.getDate()+3); return [ ymd(d) ];
  });
  const [bookings, setBookings] = useState<Array<{ id: string; date: string; time: string; title: string }>>([
    { id: rid(), date: ymd(new Date()), time: "10:00", title: "John Doe — Oil Change" },
    { id: rid(), date: ymd(new Date(new Date().setDate(new Date().getDate()+1))), time: "14:00", title: "Jane Smith — Tire Rotation" }
  ]);
  const [selectedDate, setSelectedDate] = useState<string>(ymd(new Date()));
  const availRef = useRef<HTMLDivElement>(null);

  function addSlot(input: SlotInput) {
    const id = rid();
    setSlots(prev => [{ id, ...input }, ...prev]);
    setShowAdd(false);
  }

  function updateSlot(id: string, input: SlotInput) {
    setSlots(prev => prev.map(s => s.id === id ? { id, ...input } as Slot : s));
    setShowEdit(false);
    setEditing(null);
  }

  function deleteSlot(id: string) {
    setSlots(prev => prev.filter(s => s.id !== id));
  }

  // Fixed conflict check to use actual booking time ranges
  function addBooking(slotId: string, date: string, time: string, title: string): true | 'conflict' | 'tech-unavailable' {
    const slot = slots.find(s => s.id === slotId && s.date === date);
    if (!slot) return 'conflict';

    // prevent overlapping bookings within the same slot
    if (slot.bookings.some(b => {
        const bookingStart = b.time;
        const bookingEnd = addMinutes(bookingStart, 60); // Assuming each booking lasts 60 minutes
        return time >= bookingStart && time < bookingEnd;
    })) {
        return 'conflict';
    }

    // check technician availability for requested time
    if (slot.technician && !isTechAvailable(slot.technician, date, time)) {
        return 'tech-unavailable';
    }

    const id = rid();
    const newBooking: Booking = {
        id,
        slotId,
        date,
        time,
        customer: title.split(' — ')[0],
        serviceType: title.split(' — ')[1] as ServiceType,
        bay: slot.bay || '',
        technician: slot.technician || '',
        title,
    };

    setBookings(prev => [...prev, newBooking]);
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, bookings: [...s.bookings, newBooking] } : s));

    return true;
  }

  // Helper function to add minutes to a time string
  function addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  }

  // expose a simple hook for child items to open booking modal (avoids prop drilling inside map)
  // attach to window during component lifetime
  React.useEffect(() => {
    (window as any).__openBookingModal = (s: Slot) => { setBookingSlot(s); setShowBooking(true); };
    return () => { try { delete (window as any).__openBookingModal; } catch {} };
  }, []);

  function blockDate(date: string) {
    setBlocks(prev => Array.from(new Set([...prev, date])));
  }
  function unblockDate(date: string) {
    setBlocks(prev => prev.filter(d => d !== date));
  }
  function blockRange(startIso: string, endIso: string) {
    const start = new Date(startIso);
    const end = new Date(endIso);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
    const s = start <= end ? start : end;
    const e = start <= end ? end : start;
    const cur = new Date(s);
    const list: string[] = [];
    while (cur <= e) {
      list.push(ymd(cur));
      cur.setDate(cur.getDate() + 1);
    }
    setBlocks(prev => Array.from(new Set([...prev, ...list])));
  }

  // Derive events per day for current month
  const monthKey = `${current.getFullYear()}-${current.getMonth()}`;
  const [filters, setFilters] = useState<{ serviceType: ServiceType | 'all'; bay: string | 'all'; technician: string }>(() => ({ serviceType: 'all', bay: 'all', technician: '' }));

  const eventsByDay = useMemo(() => {
    const map = new Map<string, DayEvent[]>();
    const monthStr = (day: number) => ymd(new Date(current.getFullYear(), current.getMonth(), day));

    for (const s of slots) {
      const d = fromYmd(s.date);
      if (d.getMonth() === current.getMonth() && d.getFullYear() === current.getFullYear()) {
        // apply filters
        if (filters.serviceType !== 'all' && s.serviceType !== filters.serviceType) continue;
        if (filters.bay !== 'all' && s.bay !== filters.bay) continue;
        if (filters.technician && !((s.technician||'').toLowerCase().includes(filters.technician.toLowerCase()))) continue;
        const day = d.getDate();
        const key = monthStr(day);
        const arr = map.get(key) ?? [];
        const label = `${s.startTime}-${s.endTime} ${s.serviceType ?? 'Service'}${s.bay ? ` — ${s.bay}`:''}`;
        arr.push({ id: s.id, type: "available", label });
        map.set(key, arr);
      }
    }

    for (const b of blocks) {
      const d = fromYmd(b);
      if (d.getMonth() === current.getMonth() && d.getFullYear() === current.getFullYear()) {
        const key = monthStr(d.getDate());
        const arr = map.get(key) ?? [];
        arr.push({ id: `blk-${key}` , type: "blocked", label: "Blocked" });
        map.set(key, arr);
      }
    }

    for (const a of bookings) {
      const d = fromYmd(a.date);
      if (d.getMonth() === current.getMonth() && d.getFullYear() === current.getFullYear()) {
        const key = monthStr(d.getDate());
        const arr = map.get(key) ?? [];
        arr.push({ id: a.id, type: "booking", label: a.title, time: a.time });
        map.set(key, arr);
      }
    }

    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey, slots, blocks, bookings, filters]);

  const totalDays = daysInMonth(current);
  const offset = startOffset(current);
  const grid = Array.from({ length: Math.ceil((offset + totalDays)/7) * 7 }, (_, idx) => {
    const dayNum = idx - offset + 1;
    return dayNum >= 1 && dayNum <= totalDays ? dayNum : 0;
  });

  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(current);
  const todayKey = ymd(new Date());

  return (
    <div className="w-full pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-64 lg:pr-8 xl:pr-10 2xl:pr-12 pt-4 sm:pt-6 flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Time Slots</h1>
          <p className="text-sm text-gray-600">Oversee the appointment calendar. Add, block, or unblock time slots for customer self-booking.</p>
        </div>
        <div className="flex gap-2">
          {/* top Add Slot button removed per UX request */}
        </div>
      </div>

      {/* Top controls row: search + actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px] max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
          <input placeholder="Search appointments..." className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-red-600"/>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => availRef.current?.scrollIntoView({ behavior: 'smooth' })} className="rounded-md border border-black bg-white px-3 py-2 text-sm hover:bg-gray-50">Manage Slots</button>
          <button onClick={() => setShowBooking(true)} className="rounded-md bg-red-600 text-white px-3 py-2 text-sm hover:bg-red-700">New Appointment</button>
        </div>
      </div>

      {/* Month navigation */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous month"
            className="rounded-md border border-gray-300 bg-white p-2 hover:bg-gray-50"
            onClick={() => setCurrent(prev => new Date(prev.getFullYear(), prev.getMonth()-1, 1))}
          >
            <ChevronLeft className="h-4 w-4"/>
          </button>
          <div className="text-sm font-semibold">{monthLabel}</div>
          <button
            aria-label="Next month"
            className="rounded-md border border-gray-300 bg-white p-2 hover:bg-gray-50"
            onClick={() => setCurrent(prev => new Date(prev.getFullYear(), prev.getMonth()+1, 1))}
          >
            <ChevronRight className="h-4 w-4"/>
          </button>
          <button
            className="ml-2 rounded-md border border-black bg-white px-3 py-1.5 text-xs hover:bg-gray-50"
            onClick={() => { const d = new Date(); setCurrent(d); setSelectedDate(ymd(d)); }}
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-gray-600">Selected date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { const iso = e.target.value; setSelectedDate(iso); const d = fromYmd(iso); setCurrent(new Date(d.getFullYear(), d.getMonth(), 1)); }}
            className="rounded-md border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => blockDate(selectedDate)} className="inline-flex items-center gap-2 rounded-md border border-red-600 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            <Ban className="h-4 w-4"/> Block Selected
          </button>
          <button onClick={() => unblockDate(selectedDate)} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50">
            Unblock Selected
          </button>
          <button onClick={() => setShowBlockRange(true)} className="inline-flex items-center gap-2 rounded-md border border-black bg-white px-3 py-2 text-sm hover:bg-gray-50">Block Range</button>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-black inline-block"/> Booked</div>
          <div className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"/> Available</div>
          <div className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-600 inline-block"/> Blocked</div>
        </div>
      </div>

      {/* Filters row for service center context */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700">Service Type</label>
          <select
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-red-600"
            value={filters.serviceType}
            onChange={(e) => setFilters((f) => ({ ...f, serviceType: e.target.value as any }))}
          >
            <option value="all">All</option>
            {(['General Service','Oil Change','Diagnostics','Tire Rotation','Brake Service'] as ServiceType[]).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Bay</label>
          <select
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-red-600"
            value={filters.bay}
            onChange={(e) => setFilters((f) => ({ ...f, bay: e.target.value as any }))}
          >
            <option value="all">All</option>
            {['Bay 1','Bay 2','Bay 3'].map(b => (<option key={b} value={b}>{b}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Technician</label>
          <input
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-red-600"
            placeholder="e.g. Alex"
            value={filters.technician}
            onChange={(e) => setFilters((f) => ({ ...f, technician: e.target.value }))}
          />
        </div>
      </div>

      {/* Calendar with availability panel */}
      <div className="mt-3 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 text-xs font-medium text-gray-600">
            {"Sun Mon Tue Wed Thu Fri Sat".split(" ").map(d => (
              <div key={d} className="bg-gray-50 px-3 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {grid.map((day, idx) => {
              if (day === 0) return <div key={idx} className="bg-gray-50"/>;
              const key = ymd(new Date(current.getFullYear(), current.getMonth(), day));
              const evts = eventsByDay.get(key) ?? [];
              const isSelected = key === selectedDate;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(key)}
                  aria-selected={isSelected}
                  className={`group bg-white p-2 min-h-[120px] text-left cursor-pointer transition-colors duration-150 ease-in-out focus:outline-none ${
                    key===todayKey ? 'ring-1 ring-red-600' : ''
                  } ${
                    isSelected ? 'bg-red-50' : 'hover:bg-red-50 hover:ring-1 hover:ring-red-300'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1 flex items-center justify-between">
                    <span className="group-hover:text-red-700">{day}</span>
                  </div>
                  <div className="space-y-1">
                    {
                      // Group events: bookings first, then a single available summary pill. Blocked shows as a separate pill.
                    }
                    {evts.some(x => x.type === 'blocked') && (
                      <div className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2.5 py-0.5 text-xs">Blocked</div>
                    )}
                    {(() => {
                      const bookings = evts.filter(x => x.type === 'booking') as Array<{ id: string; type: 'booking'; label: string; time: string }>;
                      return (
                        <div className="flex flex-col gap-1">
                          {bookings.map(b => (
                            <div key={b.id} className="rounded-md bg-neutral-100 text-black px-2 py-1 text-xs border border-black/10">
                              <div className="font-medium">{b.time}</div>
                              <div className="truncate">{b.label}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Manage slots side panel */}
        <div ref={availRef} className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Manage Appointments — {selectedDate}</h3>
            {/* side panel Add Slot button removed per UX request */}
          </div>
          <SlotsForDate
            date={selectedDate}
            slots={slots}
            onEdit={(s) => { setEditing(s); setShowEdit(true); }}
            onDelete={(id) => deleteSlot(id)}
          />
        </div>
      </div>
      

      {/* Upcoming appointments table */}
      <UpcomingAppointments selectedDate={selectedDate} bookings={bookings} />

      {/* Add Slot Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-base font-semibold">Add Slot</h3>
              <button className="rounded-md px-2 py-1 text-sm hover:bg-gray-50" onClick={() => setShowAdd(false)}>Close</button>
            </div>
            <div className="p-4">
              <AddSlotForm onSubmit={addSlot} initial={addInitial} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Slot Modal */}
      {showEdit && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-base font-semibold">Edit Slot</h3>
              <button className="rounded-md px-2 py-1 text-sm hover:bg-gray-50" onClick={() => { setShowEdit(false); setEditing(null); }}>Close</button>
            </div>
            <div className="p-4">
              <EditSlotForm slot={editing} onSubmit={updateSlot} onCancel={() => { setShowEdit(false); setEditing(null); }} />
            </div>
          </div>
        </div>
      )}

      {/* Block Range Modal */}
      {showBlockRange && (
        <BlockRangeModal
          defaultStart={selectedDate}
          defaultEnd={selectedDate}
          onSubmit={(start, end) => { blockRange(start, end); setShowBlockRange(false); }}
          onClose={() => setShowBlockRange(false)}
        />
      )}

      {/* Booking Modal */}
      {showBooking && (
        <BookingModal
          slot={{
            id: rid(),
            date: selectedDate,
            startTime: "09:00",
            endTime: "17:00",
            serviceType: "General Service",
            bay: "Bay 1",
            technician: "Alex",
            notes: "",
            bookings: [], // Added bookings property
          }}
          onCreate={addBooking}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}

// List and manage slots for a given date (admin panel)
function SlotsForDate({ date, slots, onEdit, onDelete }: { date: string; slots: Slot[]; onEdit: (slot: Slot) => void; onDelete: (id: string) => void; }) {
  const items = slots
    .filter(s => s.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (items.length === 0) {
    return (
      <div className="text-sm text-gray-600">
        No slots for this date. Use Add Slot to create availability with a time range, capacity, and service details.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(s => (
        <div key={s.id} className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">{s.startTime}–{s.endTime} • {s.serviceType || 'Service'}</div>
              <div className="text-xs text-gray-600">{s.bay || 'Bay'} {s.technician ? `• ${s.technician}` : ''}</div>
              {!isTechAvailable(s.technician, s.date, s.startTime) && (
                <div className="mt-1 inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs">Technician unavailable</div>
              )}
            </div>
              <div className="flex items-center gap-1">
                <button className="inline-flex items-center rounded-md border border-black bg-white px-2 py-1 text-xs hover:bg-gray-100" onClick={() => onEdit(s)}>
                  <Pencil className="h-3 w-3 mr-1"/> Edit
                </button>
                <button className="inline-flex items-center rounded-md border border-red-600 text-red-600 bg-white px-2 py-1 text-xs hover:bg-red-50" onClick={() => onDelete(s.id)}>
                  <Trash2 className="h-3 w-3 mr-1"/> Delete
                </button>
                <button className="inline-flex items-center rounded-md border border-emerald-600 text-emerald-600 bg-white px-2 py-1 text-xs hover:bg-emerald-50" onClick={() => { (window as any).__openBookingModal?.(s); }}>
                  Book
                </button>
              </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Modal component to block a date range
function BlockRangeModal({ defaultStart, defaultEnd, onSubmit, onClose }: { defaultStart: string; defaultEnd: string; onSubmit: (start: string, end: string) => void; onClose: () => void; }) {
  const [start, setStart] = useState<string>(defaultStart);
  const [end, setEnd] = useState<string>(defaultEnd);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-base font-semibold">Block Date Range</h3>
          <button className="rounded-md px-2 py-1 text-sm hover:bg-gray-50" onClick={onClose}>Close</button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-red-600"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-red-600"/>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50" onClick={onClose}>Cancel</button>
            <button className="rounded-md bg-red-600 text-white px-4 py-2 text-sm hover:bg-red-700" onClick={() => onSubmit(start, end)}>Block</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Booking modal used by admin to create a booking within a slot
function BookingModal({ slot, onCreate, onClose }: { slot: Slot; onCreate: (slotId: string, date: string, time: string, title: string) => true | 'conflict' | 'tech-unavailable'; onClose: () => void }) {
  const [time, setTime] = useState<string>(slot.startTime);
  const [customer, setCustomer] = useState<string>('');
  const [serviceType, setServiceType] = useState<ServiceType>('General Service');
  const [bay, setBay] = useState<string>('Bay 1');
  const [technician, setTechnician] = useState<string>('Alex');
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const title = `${customer.trim()} — ${serviceType}`;
    const result = onCreate(slot.id, slot.date, time, title);
    if (result === 'conflict') {
      setError('This time slot is already booked.');
      return;
    }
    if (result === 'tech-unavailable') {
      setError('The assigned technician is unavailable at this time.');
      return;
    }
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Book Appointment — {slot.date} {slot.startTime}-{slot.endTime}</h3>
          <button type="button" className="rounded-md px-2 py-1 text-sm hover:bg-gray-50" onClick={onClose}>Close</button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Customer name</label>
            <input value={customer} onChange={(e) => setCustomer(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-red-600" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-red-600" />
            <div className="text-xs text-gray-500 mt-1">Must be within {slot.startTime} — {slot.endTime}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Service Type</label>
            <select value={serviceType} onChange={(e) => setServiceType(e.target.value as ServiceType)} className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-red-600">
              {['General Service', 'Oil Change', 'Diagnostics', 'Tire Rotation', 'Brake Service'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Bay</label>
            <select value={bay} onChange={(e) => setBay(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-red-600">
              {['Bay 1', 'Bay 2', 'Bay 3'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Technician</label>
            <select value={technician} onChange={(e) => setTechnician(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-red-600">
              {['Alex', 'Jordan', 'Mike'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50" onClick={onClose}>Cancel</button>
            <button type="submit" className="rounded-md bg-emerald-600 text-white px-4 py-2 text-sm hover:bg-emerald-700">Confirm Booking</button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Right side availability panel component (local)
function AvailabilityPanel() {
  type Day = { name: string; enabled: boolean; start: string; end: string };
  const [days, setDays] = useState<Day[]>([
    { name: 'Monday', enabled: true, start: '09:00', end: '17:00' },
    { name: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
    { name: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
    { name: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
    { name: 'Friday', enabled: true, start: '09:00', end: '17:00' },
    { name: 'Saturday', enabled: false, start: '09:00', end: '17:00' },
    { name: 'Sunday', enabled: false, start: '09:00', end: '17:00' },
  ]);
  function update(i: number, patch: Partial<Day>) {
    setDays(prev => prev.map((d, idx) => idx===i ? { ...d, ...patch } : d));
  }
  return (
    <div className="space-y-2">
      {days.map((d, i) => (
        <div key={d.name} className="flex items-center justify-between gap-2 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="accent-red-600" checked={d.enabled} onChange={(e) => update(i, { enabled: e.target.checked })} />
            <span className="w-28">{d.name}</span>
          </label>
          <div className="flex items-center gap-2">
            <input type="time" value={d.start} onChange={(e) => update(i, { start: e.target.value })} className="rounded-md border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-red-600" />
            <span className="text-gray-400">—</span>
            <input type="time" value={d.end} onChange={(e) => update(i, { end: e.target.value })} className="rounded-md border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-red-600" />
          </div>
        </div>
      ))}
      <div className="pt-3">
        <button className="w-full rounded-md bg-red-600 text-white px-3 py-2 text-sm hover:bg-red-700">Save Changes</button>
      </div>
    </div>
  );
}

// Upcoming appointments table (local)
function UpcomingAppointments({ selectedDate, bookings }: { selectedDate: string; bookings: Array<{ id: string; date: string; time: string; title: string }>; }) {
  type Row = { time: string; customer: string; vehicle: string; service: string; assigned: string; status: 'Confirmed' | 'Awaiting Parts' | 'In Progress' };
  const mock: Row[] = [
    { time: '09:00 AM', customer: 'John Doe', vehicle: 'Toyota Camry', service: 'Oil Change', assigned: 'Mike R.', status: 'Confirmed' },
    { time: '11:30 AM', customer: 'Jane Smith', vehicle: 'Honda Civic', service: 'Brake Inspection', assigned: 'Sarah K.', status: 'Awaiting Parts' },
    { time: '02:00 PM', customer: 'Peter Jones', vehicle: 'Ford F-150', service: 'Tire Rotation', assigned: 'Mike R.', status: 'In Progress' },
  ];
  const badge = (s: Row['status']) => s === 'Confirmed'
    ? 'bg-emerald-100 text-emerald-700'
    : s === 'Awaiting Parts'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-blue-100 text-blue-700';

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="px-4 py-3 border-b text-sm font-medium">Upcoming Appointments — {selectedDate}</div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Time</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Vehicle</th>
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-left">Assigned To</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {mock.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2">{r.time}</td>
                <td className="px-4 py-2">{r.customer}</td>
                <td className="px-4 py-2">{r.vehicle}</td>
                <td className="px-4 py-2">{r.service}</td>
                <td className="px-4 py-2">{r.assigned}</td>
                <td className="px-4 py-2"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge(r.status)}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
