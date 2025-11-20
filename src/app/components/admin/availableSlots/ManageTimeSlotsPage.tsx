"use client";

import React, { useMemo, useRef, useState } from "react";
import { Plus, Ban, Search, ChevronLeft, ChevronRight, MoreHorizontal, CheckCircle2, CalendarDays, Pencil, Trash2, X, Clock, User, Phone, Mail, FileText } from "lucide-react";
import AddSlotForm from "./AddSlotForm";
import EditSlotForm from "./EditSlotForm";
import { Slot, SlotInput, ServiceType, Booking } from "./types";
import { getAllServices, getTimeSlots, createBooking, ServiceDTO, TimeSlotDTO, CreateBookingRequest } from "@/app/services/appointmentService";

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
// Technician availability check - simplified for now (can be enhanced with real data later)
function isTechAvailable(tech: string | undefined | null, dateIso: string, time: string) {
  // For now, assume all technicians are available during business hours
  // This can be enhanced later by fetching real technician schedules from the backend
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
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Array<{ id: string; date: string; time: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [totalBookingsCount, setTotalBookingsCount] = useState(0);

  // Fetch time slots and bookings from the backend
  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch time slots for current month - we need to fetch for all days in the month
        const firstDay = firstDayOfMonth(current);
        const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0);
        
        const allSlots: Slot[] = [];
        
        // Fetch slots for each day in the current month
        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
          const dateStr = ymd(d);
          try {
            const slotsResponse = await fetch(`http://localhost:9090/api/v1/timeslots?date=${dateStr}`);
            if (slotsResponse.ok) {
              const slotsData = await slotsResponse.json();
              console.log(`Time slots for ${dateStr}:`, slotsData);
              
              // Transform API data to Slot format
              const daySlots: Slot[] = slotsData.map((slot: any) => ({
                id: slot.id.toString(),
                date: slot.slotDate, // API returns slotDate
                startTime: slot.startTime, // API returns LocalTime as string
                endTime: slot.endTime,
                serviceType: (slot.serviceName || 'General Service') as ServiceType,
                bay: `Bay ${slot.serviceId || 1}`,
                technician: 'Technician',
                bookings: [],
                isAvailable: slot.isAvailable // Track availability from backend
              }));
              
              allSlots.push(...daySlots);
            }
          } catch (err) {
            console.error(`Error fetching slots for ${dateStr}:`, err);
          }
        }
        
        console.log('All fetched slots:', allSlots);
        setSlots(allSlots);

        // Fetch bookings
        try {
          const bookingsResponse = await fetch('http://localhost:9090/api/v1/bookings');
          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            console.log('Bookings from API:', bookingsData);
            
            // Store total bookings count
            setTotalBookingsCount(bookingsData.length);
            
            // Transform API data to booking format
            const transformedBookings = bookingsData.map((booking: any) => {
              // Get date and time from the booking's timeSlot object (from API response)
              const slotDate = booking.timeSlot?.slotDate || ymd(new Date());
              const slotTime = booking.timeSlot?.startTime || '00:00';
              
              return {
                id: booking.id.toString(),
                date: slotDate,
                time: slotTime,
                title: `${booking.customerName || 'Customer'} — ${booking.timeSlot?.serviceName || 'Service'}`
              };
            });
            
            console.log('Transformed bookings:', transformedBookings);
            setBookings(transformedBookings);
          }
        } catch (err) {
          console.error('Error fetching bookings:', err);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [current]); // Re-fetch when month changes
  
  // Fetch available services for the New Appointment modal
  React.useEffect(() => {
    async function fetchServices() {
      try {
        const servicesData = await getAllServices();
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    }
    fetchServices();
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(ymd(new Date()));
  const availRef = useRef<HTMLDivElement>(null);

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
  async function addBooking(slotId: string, date: string, time: string, title: string, serviceType?: ServiceType): Promise<true | 'conflict' | 'tech-unavailable'> {
    // Parse customer name and service type from title
    const customerName = title.split(' — ')[0];
    const serviceTypeName = serviceType || (title.split(' — ')[1] as ServiceType);

    // Get the service ID from the service type name by matching with database services
    const serviceMap: Record<string, number> = {
      'Oil Change': 1,
      'Tire Rotation': 2,
      'Brake Inspection': 3,
      'Battery Check': 4,
      'General Inspection': 5,
      'General Service': 5, // Default to General Inspection
      'Diagnostics': 5,
      'Brake Service': 3
    };
    
    const serviceId = (serviceTypeName && serviceMap[serviceTypeName]) ? serviceMap[serviceTypeName] : 5;

    // Try to find the slot in local state first
    let slot = slots.find(s => s.id === slotId && s.date === date);
    let actualTimeSlotId: number;

    // If slot doesn't exist in local state (e.g., from "New Appointment" button)
    // Find an available time slot for the selected date and time
    if (!slot || isNaN(parseInt(slotId))) {
      try {
        // Fetch available time slots for this date
        const slotsResponse = await fetch(`http://localhost:9090/api/v1/timeslots?date=${date}`);
        if (!slotsResponse.ok) {
          console.error('Failed to fetch time slots');
          return 'conflict';
        }
        const availableSlots = await slotsResponse.json();
        
        // Find a slot that matches the service and time, and is available
        const matchingSlot = availableSlots.find((s: any) => 
          s.serviceName === serviceTypeName && 
          s.startTime <= time && 
          s.endTime >= time &&
          s.isAvailable
        );

        if (!matchingSlot) {
          console.error('No available time slot found for this service and time');
          return 'conflict';
        }

        actualTimeSlotId = matchingSlot.id;
      } catch (err) {
        console.error('Error finding available time slot:', err);
        return 'conflict';
      }
    } else {
      // Use the existing slot ID
      actualTimeSlotId = parseInt(slotId);

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
    }

    try {
      // Create booking in the database via API
      const response = await fetch('http://localhost:9090/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: serviceId,
          timeSlotId: actualTimeSlotId, // Use the actual time slot ID from database
          userId: 'admin-user-' + rid(), // Generate a user ID for admin bookings
          customerName: customerName,
          customerEmail: undefined, // No email provided in quick booking
          customerPhone: undefined, // No phone provided in quick booking
          notes: `Quick booking created by admin on ${new Date().toISOString()}`
        })
      });

      if (!response.ok) {
        console.error('Failed to create booking:', response.statusText);
        return 'conflict';
      }

      const bookingData = await response.json();
      console.log('Booking created successfully:', bookingData);

      // Update local state with the new booking
      const newBooking: Booking = {
        id: bookingData.id?.toString() || rid(),
        slotId,
        date,
        time,
        customer: customerName,
        serviceType: serviceTypeName as ServiceType,
        bay: slot?.bay || 'Bay 1',
        technician: slot?.technician || 'Technician',
        title,
      };

      setBookings(prev => [...prev, newBooking]);
      setSlots(prev => prev.map(s => s.id === slotId ? { ...s, bookings: [...s.bookings, newBooking] } : s));

      return true;
    } catch (error) {
      console.error('Error creating booking:', error);
      return 'conflict';
    }
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

  // Calculate statistics
  const stats = useMemo(() => {
    const today = ymd(new Date());
    const totalSlots = slots.length;
    const bookedSlots = slots.filter(s => s.isAvailable === false).length;
    const availableSlots = slots.filter(s => s.isAvailable === true).length;
    const todayBookings = bookings.filter(b => b.date === today).length;
    
    return {
      totalBookings: totalBookingsCount,
      totalSlots,
      bookedSlots,
      availableSlots,
      todayBookings
    };
  }, [slots, bookings, totalBookingsCount]);

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
            <p className="mt-2 text-sm text-gray-600">Manage time slots and appointments for your service center</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowNewAppointment(true)} 
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-red-700 shadow-sm transition-colors duration-200"
            >
              <Plus className="h-4 w-4" /> New Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Appointments */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarDays className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Appointments</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-blue-600">All bookings in database</span>
              </div>
            </div>
          </div>

          {/* Available Slots */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Available</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.availableSlots}</div>
                      <span className="ml-2 text-sm font-medium text-green-600">
                        {stats.totalSlots > 0 ? `${Math.round((stats.availableSlots / stats.totalSlots) * 100)}%` : '0%'}
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-green-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-green-600">Ready to book</span>
              </div>
            </div>
          </div>

          {/* Booked Slots */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Booked</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.bookedSlots}</div>
                      <span className="ml-2 text-sm font-medium text-yellow-600">
                        {stats.totalSlots > 0 ? `${Math.round((stats.bookedSlots / stats.totalSlots) * 100)}%` : '0%'}
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-yellow-600">Confirmed appointments</span>
              </div>
            </div>
          </div>

          {/* Today's Bookings */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Today's Appointments</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.todayBookings}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-red-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-red-600">Scheduled for today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Controls - Top Bar */}
      <div className="mb-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Month Navigation */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Previous month"
              className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50 transition-colors"
              onClick={() => setCurrent(prev => new Date(prev.getFullYear(), prev.getMonth()-1, 1))}
            >
              <ChevronLeft className="h-5 w-5"/>
            </button>
            <div className="text-lg font-bold text-gray-900 min-w-[180px] text-center">{monthLabel}</div>
            <button
              aria-label="Next month"
              className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50 transition-colors"
              onClick={() => setCurrent(prev => new Date(prev.getFullYear(), prev.getMonth()+1, 1))}
            >
              <ChevronRight className="h-5 w-5"/>
            </button>
            <button
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
              onClick={() => { const d = new Date(); setCurrent(d); setSelectedDate(ymd(d)); }}
            >
              Today
            </button>
          </div>

          {/* Center: Legend */}
          <div className="flex items-center gap-6 text-sm">
            <div className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-black inline-block"/> 
              <span className="text-gray-700">Booked</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block"/> 
              <span className="text-gray-700">Available</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-600 inline-block"/> 
              <span className="text-gray-700">Blocked</span>
            </div>
          </div>

          {/* Right: Date Picker */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Selected Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { const iso = e.target.value; setSelectedDate(iso); const d = fromYmd(iso); setCurrent(new Date(d.getFullYear(), d.getMonth(), 1)); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Calendar with availability panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-3">Loading calendar data...</span>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Manage slots side panel */}
        <div ref={availRef} className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Manage Appointments — {selectedDate}</h3>
          </div>
          <AppointmentsForDate selectedDate={selectedDate} />
        </div>
      </div>

      {/* Upcoming appointments table */}
      <div>
        <UpcomingAppointments selectedDate={selectedDate} bookings={bookings} />
      </div>

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
      {showBooking && bookingSlot && (
        <BookingModal
          slot={bookingSlot}
          onCreate={addBooking}
          onClose={() => { setShowBooking(false); setBookingSlot(null); }}
        />
      )}

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <NewAppointmentModal
          selectedDate={selectedDate}
          services={services}
          blockedDates={blocks}
          onClose={() => setShowNewAppointment(false)}
          onSuccess={() => {
            setShowNewAppointment(false);
            // Refresh data
            window.location.reload();
          }}
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
      {items.map(s => {
        const isBooked = s.isAvailable === false;
        return (
          <div key={s.id} className={`rounded-lg border p-3 ${isBooked ? 'border-gray-300 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`text-sm font-semibold ${isBooked ? 'text-gray-500' : 'text-gray-900'}`}>
                    {s.startTime}–{s.endTime} • {s.serviceType || 'Service'}
                  </div>
                  {isBooked && (
                    <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-medium">
                      Booked
                    </span>
                  )}
                  {!isBooked && (
                    <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium">
                      Available
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600">{s.bay || 'Bay'} {s.technician ? `• ${s.technician}` : ''}</div>
                {!isTechAvailable(s.technician, s.date, s.startTime) && (
                  <div className="mt-1 inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs">Technician unavailable</div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button 
                  className="inline-flex items-center rounded-md border border-black bg-white px-2 py-1 text-xs hover:bg-gray-100" 
                  onClick={() => onEdit(s)}
                >
                  <Pencil className="h-3 w-3 mr-1"/> Edit
                </button>
                <button 
                  className="inline-flex items-center rounded-md border border-red-600 text-red-600 bg-white px-2 py-1 text-xs hover:bg-red-50" 
                  onClick={() => onDelete(s.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1"/> Delete
                </button>
                {!isBooked && (
                  <button 
                    className="inline-flex items-center rounded-md border border-emerald-600 text-emerald-600 bg-white px-2 py-1 text-xs hover:bg-emerald-50" 
                    onClick={() => { (window as any).__openBookingModal?.(s); }}
                  >
                    Book
                  </button>
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
function BookingModal({ slot, onCreate, onClose }: { slot: Slot; onCreate: (slotId: string, date: string, time: string, title: string, serviceType?: ServiceType) => Promise<true | 'conflict' | 'tech-unavailable'>; onClose: () => void }) {
  const [time, setTime] = useState<string>(slot.startTime);
  const [customer, setCustomer] = useState<string>('');
  const [serviceType, setServiceType] = useState<ServiceType>(slot.serviceType || 'General Service');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Fetch services from API
  React.useEffect(() => {
    async function fetchServices() {
      try {
        setLoadingServices(true);
        const servicesData = await getAllServices();
        setServices(servicesData);
        setLoadingServices(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setLoadingServices(false);
      }
    }
    fetchServices();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!customer.trim()) {
      setError('Customer name is required.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const title = `${customer.trim()} — ${serviceType}`;
      const result = await onCreate(slot.id, slot.date, time, title, serviceType);
      
      if (result === 'conflict') {
        setError('This time slot is already booked or failed to create booking.');
        setIsSubmitting(false);
        return;
      }
      if (result === 'tech-unavailable') {
        setError('The assigned technician is unavailable at this time.');
        setIsSubmitting(false);
        return;
      }
      
      setError(null);
      onClose();
    } catch (err) {
      setError('Failed to create booking. Please try again.');
      setIsSubmitting(false);
    }
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
            <label className="block text-sm text-gray-700">Customer name *</label>
            <input 
              value={customer} 
              onChange={(e) => setCustomer(e.target.value)} 
              placeholder="Enter customer name"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-red-600" 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-red-600" />
            <div className="text-xs text-gray-500 mt-1">Must be within {slot.startTime} — {slot.endTime}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Service Type</label>
            {loadingServices ? (
              <div className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-500">
                Loading services...
              </div>
            ) : (
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value as ServiceType)} className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-red-600">
                {services.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            )}
          </div>
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="rounded-md bg-emerald-600 text-white px-4 py-2 text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Display appointments for a specific date in the side panel
function AppointmentsForDate({ selectedDate }: { selectedDate: string }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:9090/api/v1/bookings');
        if (response.ok) {
          const bookingsData = await response.json();
          // Filter bookings for the selected date
          const dateAppointments = bookingsData.filter((booking: any) => {
            if (booking.timeSlot && booking.timeSlot.slotDate) {
              return booking.timeSlot.slotDate === selectedDate;
            }
            return false;
          });
          // Sort by start time
          dateAppointments.sort((a: any, b: any) => {
            const timeA = a.timeSlot?.startTime || '';
            const timeB = b.timeSlot?.startTime || '';
            return timeA.localeCompare(timeB);
          });
          setAppointments(dateAppointments);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, [selectedDate]);

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'CONFIRMED': 'bg-green-100 text-green-700 border-green-200',
      'PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
      'COMPLETED': 'bg-blue-100 text-blue-700 border-blue-200',
      'CANCELLED': 'bg-red-100 text-red-700 border-red-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        <p className="text-xs text-gray-600 mt-2">Loading appointments...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <CalendarDays className="h-10 w-10 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No appointments for this date</p>
        <p className="text-xs text-gray-500 mt-1">Click "New Appointment" to create one</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto">
      {appointments.map((appointment) => (
        <div 
          key={appointment.id} 
          className="p-3 rounded-lg border bg-white hover:shadow-md transition-shadow"
        >
          {/* Time and Status */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-semibold text-sm">
                {appointment.timeSlot ? formatTime(appointment.timeSlot.startTime) : 'N/A'}
              </span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
          </div>

          {/* Customer Name */}
          <div className="flex items-center gap-2 mb-1">
            <User className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              {appointment.customerName || 'N/A'}
            </span>
          </div>

          {/* Service */}
          <div className="text-xs text-gray-600 mb-2 pl-5">
            {appointment.timeSlot?.serviceName || appointment.serviceName || 'N/A'}
          </div>

          {/* Contact Info */}
          {(appointment.customerEmail || appointment.customerPhone) && (
            <div className="space-y-1 pl-5">
              {appointment.customerEmail && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{appointment.customerEmail}</span>
                </div>
              )}
              {appointment.customerPhone && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone className="h-3 w-3" />
                  <span>{appointment.customerPhone}</span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="mt-2 pl-5">
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{appointment.notes}</span>
              </div>
            </div>
          )}

          {/* Assigned Employee */}
          {appointment.assignedEmployeeName && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Assigned to: <span className="text-gray-700 font-medium">{appointment.assignedEmployeeName}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Upcoming appointments table - displays real bookings from database
function UpcomingAppointments({ selectedDate, bookings }: { selectedDate: string; bookings: Array<{ id: string; date: string; time: string; title: string }>; }) {
  const [detailedBookings, setDetailedBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchDetailedBookings() {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:9090/api/v1/bookings');
        if (response.ok) {
          const bookingsData = await response.json();
          // Filter bookings for the selected date
          const todayBookings = bookingsData.filter((booking: any) => {
            if (booking.timeSlot && booking.timeSlot.slotDate) {
              return booking.timeSlot.slotDate === selectedDate;
            }
            return false;
          });
          setDetailedBookings(todayBookings);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDetailedBookings();
  }, [selectedDate]);

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'CONFIRMED': 'bg-emerald-100 text-emerald-700',
      'PENDING': 'bg-amber-100 text-amber-700',
      'COMPLETED': 'bg-blue-100 text-blue-700',
      'CANCELLED': 'bg-red-100 text-red-700',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      'CONFIRMED': 'Confirmed',
      'PENDING': 'Pending',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled',
    };
    return labelMap[status] || status;
  };

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="px-4 py-3 border-b text-sm font-medium">Upcoming Appointments — {selectedDate}</div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading appointments...</p>
          </div>
        ) : detailedBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <CalendarDays className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No appointments scheduled for this date</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Service</th>
                <th className="px-4 py-2 text-left">Contact</th>
                <th className="px-4 py-2 text-left">Assigned To</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {detailedBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {booking.timeSlot ? formatTime(booking.timeSlot.startTime) : 'N/A'}
                  </td>
                  <td className="px-4 py-2 font-medium">{booking.customerName || 'N/A'}</td>
                  <td className="px-4 py-2">{booking.timeSlot?.serviceName || booking.serviceName || 'N/A'}</td>
                  <td className="px-4 py-2">
                    <div className="text-xs">
                      {booking.customerEmail && <div className="text-gray-600">{booking.customerEmail}</div>}
                      {booking.customerPhone && <div className="text-gray-600">{booking.customerPhone}</div>}
                      {!booking.customerEmail && !booking.customerPhone && <span className="text-gray-400">No contact</span>}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {booking.assignedEmployeeName || <span className="text-gray-400">Unassigned</span>}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
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

// New Appointment Modal - Similar to customer booking flow
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
  const [step, setStep] = useState<1 | 2>(1);
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

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedSlot = availableSlots.find(s => s.id === selectedSlotId);

  // Fetch available time slots when service or date changes
  React.useEffect(() => {
    if (selectedServiceId && date) {
      setLoadingSlots(true);
      getTimeSlots(date, selectedServiceId)
        .then(slots => {
          // Filter out already booked slots
          const available = slots.filter(slot => slot.isAvailable);
          setAvailableSlots(available);
        })
        .catch(err => {
          console.error('Error fetching slots:', err);
          setAvailableSlots([]);
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedServiceId, date]);

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
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">New Appointment</h2>
            <p className="text-sm text-red-100">Create a booking for a customer</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === 1 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <span className={`text-sm font-medium ${step === 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                Service & Time
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300 max-w-[100px]"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === 2 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className={`text-sm font-medium ${step === 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                Customer Info
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {step === 1 ? (
            // Step 1: Select Service, Date, and Time Slot
            <>
              {/* Select Service */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-red-600" />
                  Select Service *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.map(service => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedServiceId === service.id
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{service.duration} minutes</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Date */}
              {selectedServiceId && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Select Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>
              )}

              {/* Select Time Slot */}
              {selectedServiceId && date && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    Select Time Slot *
                  </label>
                  {loadingSlots ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                      <p className="text-sm text-gray-600 mt-2">Loading available slots...</p>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No available time slots for this date</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                      {availableSlots.map(slot => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            selectedSlotId === slot.id
                              ? 'border-red-600 bg-red-50'
                              : 'border-gray-200 hover:border-red-300'
                          }`}
                        >
                          <div className="text-sm font-semibold">{formatTime(slot.startTime)}</div>
                          <div className="text-xs text-gray-600">{formatTime(slot.endTime)}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-end pt-4 border-t">
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
                <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium text-gray-900">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">{new Date(date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-gray-900">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  required
                />
              </div>

              {/* Customer Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-red-600" />
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-red-600" />
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-600" />
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or notes..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  disabled={submitting}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting || !customerName.trim()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
