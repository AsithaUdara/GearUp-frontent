'use client';

import React, { useState, useEffect } from 'react';
import { SlotInput, ServiceType } from './types';
import { getAllServices, ServiceDTO } from '@/app/services/appointmentService';

type Props = {
  onSubmit: (input: SlotInput) => void;
  initial?: Partial<SlotInput>;
};

function ymdLocal(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function AddSlotForm({ onSubmit, initial }: Props) {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  const [form, setForm] = useState<SlotInput>({
    date: initial?.date ?? ymdLocal(new Date()),
    startTime: initial?.startTime ?? '09:00',
    endTime: initial?.endTime ?? '10:00',
    capacity: initial?.capacity ?? 5,
    available: initial?.available ?? (initial?.capacity ?? 5),
    notes: initial?.notes ?? '',
    serviceType: (initial?.serviceType as ServiceType) ?? 'General Service',
    bay: initial?.bay ?? 'Bay 1',
    technician: initial?.technician ?? ''
  });

  // Fetch services from API
  useEffect(() => {
    async function fetchServices() {
      try {
        setLoadingServices(true);
        const servicesData = await getAllServices();
        setServices(servicesData);
        // Set default service type to first service if available
        if (servicesData.length > 0 && !initial?.serviceType) {
          setForm(prev => ({ ...prev, serviceType: servicesData[0].name as ServiceType }));
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoadingServices(false);
      }
    }
    fetchServices();
  }, [initial?.serviceType]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'capacity' || name === 'available' ? Number(value) : value
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.endTime <= form.startTime) return;
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-red-600"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-red-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End</label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-red-600"
              required
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Capacity</label>
          <input
            type="number"
            name="capacity"
            min={1}
            value={form.capacity}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-red-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Available</label>
          <input
            type="number"
            name="available"
            min={0}
            max={form.capacity}
            value={form.available}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-red-600"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Service Type</label>
          {loadingServices ? (
            <div className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500">
              Loading services...
            </div>
          ) : (
            <select
              name="serviceType"
              value={form.serviceType as ServiceType}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-red-600"
              required
            >
              {services.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Technician (Optional)</label>
          <input
            type="text"
            name="technician"
            placeholder="Enter technician name"
            value={form.technician || ''}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-red-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={2}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-red-600"
          placeholder="Optional"
        />
      </div>

      <div className="flex justify-end">
        <button type="submit" className="inline-flex items-center rounded-md bg-black text-white text-sm px-4 py-2 hover:bg-neutral-800">
          Add Slot
        </button>
      </div>
    </form>
  );
}
