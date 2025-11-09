"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { Plus, Ban, Search, ChevronLeft, ChevronRight, MoreHorizontal, CheckCircle2, CalendarDays, Pencil, Trash2, X, Calendar, Clock, User, Mail, Phone, FileText, Briefcase } from "lucide-react";
import AddSlotForm from "./AddSlotForm";
import EditSlotForm from "./EditSlotForm";
import { Slot, SlotInput, ServiceType, Booking } from "./types";
import { getAllBookings, getTimeSlots, getAllEmployees, getAllServices, createBooking, getAvailableTimeSlotsForCustomer, BookingDTO, TimeSlotDTO, EmployeeDTO, ServiceDTO, CreateBookingRequest } from "@/app/services/appointmentService";

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
  const [selectedDate, setSelectedDate] = useState<string>(ymd(new Date()));
  const availRef = useRef<HTMLDivElement>(null);

  // API Data State
  const [apiBookings, setApiBookings] = useState<BookingDTO[]>([]);
  const [apiTimeSlots, setApiTimeSlots] = useState<TimeSlotDTO[]>([]);
  const [apiEmployees, setApiEmployees] = useState<EmployeeDTO[]>([]);
  const [apiServices, setApiServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from appointment service
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsData, employeesData, servicesData] = await Promise.all([
          getAllBookings(),
          getAllEmployees(),
          getAllServices(),
        ]);
        setApiBookings(bookingsData);
        setApiEmployees(employeesData);
        setApiServices(servicesData);
      } catch (error) {
        console.error('Error fetching appointment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Blocked dates state
  const [blocks, setBlocks] = useState<string[]>([]);

  // Legacy states - no longer using mock data
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Array<{ id: string; date: string; time: string; title: string }>>([]);

  function addSlot(input: SlotInput) {
    const id = rid();
    setSlots(prev => [{ id, ...input, bookings: [] }, ...prev]);
    setShowAdd(false);
  }

  function updateSlot(id: string, input: SlotInput) {
    setSlots(prev => prev.map(s => s.id === id ? { id, ...input, bookings: s.bookings } : s));
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

    // Add real bookings from API (only database data)
    for (const booking of apiBookings) {
      const slotDate = booking.timeSlot?.slotDate;
      if (!slotDate) continue;
      
      const d = fromYmd(slotDate);
      if (d.getMonth() === current.getMonth() && d.getFullYear() === current.getFullYear()) {
        // Apply filters
        if (filters.serviceType !== 'all' && booking.serviceName !== filters.serviceType) continue;
        if (filters.technician) {
          const empName = apiEmployees.find(e => e.id === booking.assignedEmployeeId)?.name || '';
          if (!empName.toLowerCase().includes(filters.technician.toLowerCase())) continue;
        }

        const key = monthStr(d.getDate());
        const arr = map.get(key) ?? [];
        const time = booking.timeSlot?.startTime?.substring(0, 5) || '00:00';
        const label = `${booking.customerName} — ${booking.serviceName}`;
        arr.push({ id: booking.id.toString(), type: "booking", label, time });
        map.set(key, arr);
      }
    }

    // Add blocked dates
    for (const b of blocks) {
      const d = fromYmd(b);
      if (d.getMonth() === current.getMonth() && d.getFullYear() === current.getFullYear()) {
        const key = monthStr(d.getDate());
        const arr = map.get(key) ?? [];
        arr.push({ id: `blk-${key}` , type: "blocked", label: "Blocked" });
        map.set(key, arr);
      }
    }

    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey, blocks, apiBookings, apiEmployees, filters]);

  const totalDays = daysInMonth(current);
  const offset = startOffset(current);
  const grid = Array.from({ length: Math.ceil((offset + totalDays)/7) * 7 }, (_, idx) => {
    const dayNum = idx - offset + 1;
    return dayNum >= 1 && dayNum <= totalDays ? dayNum : 0;
  });

  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(current);
  const todayKey = ymd(new Date());

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg border-2 border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-red-100 rounded-xl">
            <CalendarDays className="h-7 w-7 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointment & Slot Management</h1>
            <p className="text-gray-600 mt-1">Manage appointments, block dates, and prevent scheduling conflicts</p>
          </div>
        </div>
        
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-200">
            <div className="flex items-center gap-2 text-red-700 text-sm font-medium mb-1">
              <CalendarDays className="h-4 w-4" />
              Total Appointments
            </div>
            <div className="text-2xl font-bold text-red-600">{apiBookings.length}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-1">
              <Clock className="h-4 w-4" />
              Blocked Dates
            </div>
            <div className="text-2xl font-bold text-blue-600">{blocks.length}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border-2 border-emerald-200">
            <div className="text-emerald-700 text-sm font-medium mb-1">Active Services</div>
            <div className="text-2xl font-bold text-emerald-600">{apiServices.length}</div>
          </div>
        </div>
      </div>

      {/* Top controls row: search + actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              placeholder="Search appointments by customer name..." 
              className="w-full rounded-xl border-2 border-gray-200 pl-12 pr-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-gray-300"
            />
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowBlockRange(true)} 
              className="rounded-xl border-2 border-red-200 bg-white text-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition-all inline-flex items-center gap-2 shadow-sm"
            >
              <Ban className="h-4 w-4" />
              Block Date Range
            </button>
            <button 
              onClick={() => setShowBooking(true)} 
              className="rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-3 text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all inline-flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              New Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Month navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              aria-label="Previous month"
              className="rounded-xl border-2 border-gray-200 bg-white p-2.5 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              onClick={() => setCurrent(prev => new Date(prev.getFullYear(), prev.getMonth()-1, 1))}
            >
              <ChevronLeft className="h-5 w-5 text-gray-700"/>
            </button>
            <div className="text-xl font-bold text-gray-900 min-w-[200px] text-center">{monthLabel}</div>
            <button
              aria-label="Next month"
              className="rounded-xl border-2 border-gray-200 bg-white p-2.5 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              onClick={() => setCurrent(prev => new Date(prev.getFullYear(), prev.getMonth()+1, 1))}
            >
              <ChevronRight className="h-5 w-5 text-gray-700"/>
            </button>
            <button
              className="ml-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
              onClick={() => { const d = new Date(); setCurrent(d); setSelectedDate(ymd(d)); }}
            >
              Today
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Jump to date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { const iso = e.target.value; setSelectedDate(iso); const d = fromYmd(iso); setCurrent(new Date(d.getFullYear(), d.getMonth(), 1)); }}
              className="rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-gray-300 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Toolbar - Quick Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">Quick Actions:</span>
            <button 
              onClick={() => blockDate(selectedDate)} 
              className="inline-flex items-center gap-2 rounded-xl bg-white border-2 border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
            >
              <Ban className="h-4 w-4"/> Block Selected Date
            </button>
            <button 
              onClick={() => unblockDate(selectedDate)} 
              className="inline-flex items-center gap-2 rounded-xl bg-white border-2 border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4"/> Unblock Selected
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <span className="text-gray-700">Legend:</span>
            <div className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-black shadow-sm"/> Booked
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm"/> Available
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-600 shadow-sm"/> Blocked
            </div>
          </div>
        </div>
      </div>

      {/* Calendar with availability panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 rounded-2xl border-2 border-gray-200 bg-white shadow-lg overflow-hidden">
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-gradient-to-r from-gray-100 to-gray-200 text-sm font-bold text-gray-800">
            {"Sun Mon Tue Wed Thu Fri Sat".split(" ").map(d => (
              <div key={d} className="bg-white px-4 py-3 text-center border-b-2 border-gray-200">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 bg-gray-100 p-1 rounded-xl">
            {grid.map((day, idx) => {
              if (day === 0) return <div key={idx} className="bg-gray-50 min-h-[110px] rounded-lg"/>;
              const key = ymd(new Date(current.getFullYear(), current.getMonth(), day));
              const evts = eventsByDay.get(key) ?? [];
              const isSelected = key === selectedDate;
              const isToday = key === todayKey;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(key)}
                  aria-selected={isSelected}
                  className={`group bg-white p-3 min-h-[110px] text-left cursor-pointer transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg shadow-sm hover:shadow-md ${
                    isToday ? 'ring-2 ring-blue-500 ring-inset' : ''
                  } ${
                    isSelected ? 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-500' : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className="text-sm font-bold text-gray-700 mb-2 flex items-center justify-between">
                    <span className={`${isToday ? 'text-blue-600 bg-blue-100 rounded-full px-2 py-0.5' : ''} ${isSelected ? 'text-red-700' : 'group-hover:text-red-600'}`}>
                      {day}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {evts.some(x => x.type === 'blocked') && (
                      <div className="inline-flex items-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white px-2.5 py-1 text-[10px] font-semibold shadow-sm">
                        <Ban className="h-2.5 w-2.5 mr-1" />
                        Blocked
                      </div>
                    )}
                    {(() => {
                      const bookings = evts.filter(x => x.type === 'booking') as Array<{ id: string; type: 'booking'; label: string; time: string }>;
                      return (
                        <div className="flex flex-col gap-1.5">
                          {bookings.slice(0, 2).map(b => (
                            <div key={b.id} className="rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 px-2 py-1.5 text-[10px] border border-gray-300 shadow-sm hover:shadow transition-shadow">
                              <div className="font-bold text-gray-700">{b.time}</div>
                              <div className="truncate text-gray-600">{b.label}</div>
                            </div>
                          ))}
                          {bookings.length > 2 && (
                            <div className="text-[10px] font-semibold text-gray-600 px-1.5 py-0.5 bg-gray-100 rounded-md">+{bookings.length - 2} more</div>
                          )}
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
        <div ref={availRef} className="rounded-2xl border-2 border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <CalendarDays className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Slots & Appointments
                </h3>
                <div className="text-sm font-medium text-gray-600">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
            <p className="text-xs text-gray-600 ml-12">Check conflicts • Add slots • Block times</p>
          </div>
          <div className="p-6">
            <SlotsForDate
              date={selectedDate}
              slots={slots}
              apiBookings={apiBookings}
              apiEmployees={apiEmployees}
              onEdit={(s) => { setEditing(s); setShowEdit(true); }}
              onDelete={(id) => deleteSlot(id)}
            />
          </div>
        </div>
      </div>

      {/* Upcoming appointments table */}
      <UpcomingAppointments 
        selectedDate={selectedDate} 
        bookings={bookings}
        apiBookings={apiBookings}
        apiEmployees={apiEmployees}
      />

      {/* Add Slot Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" role="dialog">
          <div className="w-full max-w-lg rounded-2xl border-2 border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-200 bg-gradient-to-r from-red-50 to-red-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-red-600" />
                  Add Time Slot
                </h3>
                <p className="text-sm text-gray-600 mt-1">Create availability for customer bookings</p>
              </div>
              <button className="rounded-xl p-2 text-gray-600 hover:bg-white hover:text-red-600 transition-all" onClick={() => setShowAdd(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <AddSlotForm onSubmit={addSlot} initial={addInitial} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Slot Modal */}
      {showEdit && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" role="dialog">
          <div className="w-full max-w-lg rounded-2xl border-2 border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-blue-600" />
                  Edit Time Slot
                </h3>
                <p className="text-sm text-gray-600 mt-1">Modify slot details or availability</p>
              </div>
              <button className="rounded-xl p-2 text-gray-600 hover:bg-white hover:text-blue-600 transition-all" onClick={() => { setShowEdit(false); setEditing(null); }}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
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

      {/* New Appointment Modal */}
      {showBooking && (
        <NewAppointmentModal
          selectedDate={selectedDate}
          services={apiServices}
          blockedDates={blocks}
          onClose={() => setShowBooking(false)}
          onSuccess={async () => {
            setShowBooking(false);
            // Refresh data
            const bookingsData = await getAllBookings();
            setApiBookings(bookingsData);
          }}
        />
      )}
    </div>
  );
}

// List and manage slots for a given date (admin panel)
function SlotsForDate({ 
  date, 
  slots, 
  apiBookings,
  apiEmployees,
  onEdit, 
  onDelete 
}: { 
  date: string; 
  slots: Slot[]; 
  apiBookings: BookingDTO[];
  apiEmployees: EmployeeDTO[];
  onEdit: (slot: Slot) => void; 
  onDelete: (id: string) => void; 
}) {
  // Get real bookings for this date from API
  const dateBookings = apiBookings.filter(b => b.timeSlot?.slotDate === date);
  
  // Detect double bookings - same time slot with multiple bookings
  const timeSlotMap = new Map<number, BookingDTO[]>();
  dateBookings.forEach(booking => {
    const slotId = booking.timeSlotId;
    if (!timeSlotMap.has(slotId)) {
      timeSlotMap.set(slotId, []);
    }
    timeSlotMap.get(slotId)!.push(booking);
  });

  // Find conflicts
  const conflicts = Array.from(timeSlotMap.entries())
    .filter(([_, bookings]) => bookings.length > 1)
    .map(([slotId, bookings]) => ({ slotId, bookings }));

  // Show "no appointments" message if no bookings exist
  if (dateBookings.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-900">No appointments for this date</p>
        <p className="text-xs text-gray-500 mt-1">Customers can book time slots if they are available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conflicts.length > 0 && (
        <div className="text-center py-2 mb-3 bg-red-50 rounded-lg border border-red-300">
          <p className="text-xs font-bold text-red-900">⚠️ {conflicts.length} DOUBLE BOOKING CONFLICT{conflicts.length !== 1 ? 'S' : ''} DETECTED!</p>
          <p className="text-xs text-red-700 mt-1">Same time slot has multiple bookings - please resolve immediately</p>
        </div>
      )}
      <div className="text-center py-2 mb-3 bg-emerald-50 rounded-lg border border-emerald-200">
        <p className="text-xs font-medium text-emerald-900">✓ Showing {dateBookings.length} appointment{dateBookings.length !== 1 ? 's' : ''} from database</p>
      </div>
        {dateBookings
          .sort((a, b) => (a.timeSlot?.startTime || '').localeCompare(b.timeSlot?.startTime || ''))
          .map(booking => {
            const employeeName = booking.assignedEmployeeName || 'Not assigned';
            const statusBgColor = 
              booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 
              booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
              booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 
              'bg-blue-100 text-blue-700';
            
            // Check if this booking has a conflict (double-booked slot)
            const hasConflict = timeSlotMap.get(booking.timeSlotId)!.length > 1;
            
            return (
              <div key={booking.id} className={`rounded-lg border p-3 hover:shadow-md transition-shadow ${hasConflict ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {booking.timeSlot?.startTime?.substring(0, 5)}–{booking.timeSlot?.endTime?.substring(0, 5)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-medium">
                        {booking.serviceName}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBgColor}`}>
                        {booking.status}
                      </span>
                      {hasConflict && (
                        <span className="inline-flex items-center rounded-full bg-red-200 text-red-900 px-2 py-0.5 text-xs font-bold">
                          ⚠️ DOUBLE BOOKED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">{booking.customerName}</span>
                      <span> • {booking.customerPhone}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="font-medium">Assigned to:</span> {employeeName}
                    </div>
                    {booking.notes && (
                      <div className="text-xs text-gray-500 mt-1 italic">
                        "{booking.notes}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h3 className="text-base font-semibold">Add Manual Appointment</h3>
            <p className="text-xs text-gray-600 mt-0.5">{slot.date} • {slot.startTime}-{slot.endTime}</p>
          </div>
          <button type="button" className="rounded-md px-2 py-1 text-sm hover:bg-gray-50" onClick={onClose}>Close</button>
        </div>
        <div className="p-4 grid grid-cols-1 gap-3">
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
function UpcomingAppointments({ 
  selectedDate, 
  bookings, 
  apiBookings, 
  apiEmployees 
}: { 
  selectedDate: string; 
  bookings: Array<{ id: string; date: string; time: string; title: string }>; 
  apiBookings: BookingDTO[];
  apiEmployees: EmployeeDTO[];
}) {
  // Get bookings for the selected date from API
  const dateBookings = apiBookings.filter(b => b.timeSlot?.slotDate === selectedDate);
  
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getEmployeeName = (employeeId?: number) => {
    if (!employeeId) return 'Not assigned';
    return apiEmployees.find(e => e.id === employeeId)?.name || 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-700';
      case 'PENDING':
        return 'bg-amber-100 text-amber-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="text-base font-semibold text-gray-900">Scheduled Appointments</h3>
        <p className="text-xs text-gray-600 mt-0.5">
          Monitor bookings • Detect conflicts • {selectedDate} 
          <span className="ml-2 font-medium">({dateBookings.length} {dateBookings.length === 1 ? 'booking' : 'bookings'})</span>
        </p>
      </div>
      <div className="overflow-x-auto">
        {dateBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">No appointments scheduled for this date</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {dateBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {formatTime(booking.timeSlot?.startTime || '')} - {formatTime(booking.timeSlot?.endTime || '')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{booking.customerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="text-xs">{booking.customerPhone}</div>
                    <div className="text-xs text-gray-500">{booking.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{booking.serviceName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span className={booking.assignedEmployeeId ? '' : 'text-amber-600 font-medium'}>
                      {booking.assignedEmployeeName || 'Not assigned'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">
                    {booking.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Professional New Appointment Modal
function NewAppointmentModal({ 
  selectedDate, 
  services, 
  blockedDates,
  onClose, 
  onSuccess 
}: { 
  selectedDate: string; 
  services: ServiceDTO[]; 
  blockedDates: string[];
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Select service & date, Step 2: Fill customer details
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [date, setDate] = useState(selectedDate);
  const [availableSlots, setAvailableSlots] = useState<TimeSlotDTO[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check if selected date is blocked
  const isDateBlocked = blockedDates.includes(date);

  // Fetch available slots when service or date changes
  useEffect(() => {
    if (selectedServiceId && date) {
      // Don't fetch if date is blocked
      if (isDateBlocked) {
        setAvailableSlots([]);
        setLoadingSlots(false);
        return;
      }
      fetchAvailableSlots();
    }
  }, [selectedServiceId, date, isDateBlocked]);

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      // Use customer endpoint to exclude already booked slots
      const slots = await getAvailableTimeSlotsForCustomer(date, selectedServiceId!);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedSlot = availableSlots.find(s => s.id === selectedSlotId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlotId || !selectedServiceId) {
      setError('Please select a service and time slot');
      return;
    }

    if (!customerName.trim()) {
      setError('Customer name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const request: CreateBookingRequest = {
        serviceId: selectedServiceId,
        timeSlotId: selectedSlotId,
        userId: `admin_created_${Date.now()}`,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      await createBooking(request);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Failed to create booking. Please try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (time: string) => {
    const[hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-red-600 to-red-700">
          <div>
            <h2 className="text-xl font-bold text-white">New Appointment</h2>
            <p className="text-sm text-red-100 mt-0.5">
              {step === 1 ? 'Select service and time slot' : 'Enter customer details'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-2 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step === 1 ? 'bg-red-600 text-white' : 'bg-green-500 text-white'}`}>
                {step === 1 ? '1' : '✓'}
              </div>
              <span className={`text-sm font-medium ${step === 1 ? 'text-gray-900' : 'text-green-600'}`}>
                Service & Time
              </span>
            </div>
            <div className="h-0.5 w-16 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step === 2 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <span className={`text-sm font-medium ${step === 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                Customer Info
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {step === 1 ? (
            // Step 1: Select Service, Date, and Time Slot
            <>
              {/* Select Service */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-red-600" />
                  Select Service *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.filter(s => s.isActive).map(service => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => {
                        setSelectedServiceId(service.id);
                        setSelectedSlotId(null); // Reset slot selection
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedServiceId === service.id
                          ? 'border-red-600 bg-red-50 ring-2 ring-red-200'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{service.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {service.duration} minutes
                        {service.price && ` • Rs. ${service.price.toFixed(2)}`}
                      </div>
                      {service.description && (
                        <div className="text-xs text-gray-500 mt-1">{service.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-600" />
                  Select Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setSelectedSlotId(null); // Reset slot selection
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Available Time Slots */}
              {selectedServiceId && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    Available Time Slots *
                  </label>
                  
                  {loadingSlots ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                      <p className="text-sm">Loading available slots...</p>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className={`text-center py-8 rounded-lg border ${isDateBlocked ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                      <Calendar className={`h-10 w-10 mx-auto mb-2 ${isDateBlocked ? 'text-red-500' : 'text-amber-500'}`} />
                      <p className={`text-sm font-medium ${isDateBlocked ? 'text-red-900' : 'text-amber-900'}`}>
                        {isDateBlocked ? 'This date is blocked' : 'No available slots'}
                      </p>
                      <p className={`text-xs mt-1 ${isDateBlocked ? 'text-red-700' : 'text-amber-700'}`}>
                        {isDateBlocked ? 'No bookings can be made on this date' : 'Please select a different date'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {availableSlots.map(slot => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`p-3 rounded-lg border-2 text-center text-sm font-medium transition-all ${
                            selectedSlotId === slot.id
                              ? 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-200'
                              : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                          }`}
                        >
                          <div>{formatTime(slot.startTime)}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatTime(slot.endTime)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 1 Actions */}
              <div className="flex justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedServiceId || !selectedSlotId) {
                      setError('Please select a service and time slot');
                      return;
                    }
                    setError('');
                    setStep(2);
                  }}
                  disabled={!selectedServiceId || !selectedSlotId}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Customer Details →
                </button>
              </div>
            </>
          ) : (
            // Step 2: Customer Details
            <>
              {/* Booking Summary */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Booking Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Service:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedService?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium text-gray-900">{date}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Time:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {selectedSlot && `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-red-600" />
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter full name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Customer Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-red-600" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-red-600" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+94-77-123-4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-600" />
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or information..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <Ban className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-900">{error}</p>
                </div>
              )}

              {/* Step 2 Actions */}
              <div className="flex justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting || !customerName.trim()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Create Appointment
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
