'use client';

import React, { useState } from 'react';
import { SlotInput, ServiceType } from './types';

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Service Type</label>
          <select
            name="serviceType"
            value={form.serviceType as ServiceType}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-red-600"
          >
            {(['General Service','Oil Change','Diagnostics','Tire Rotation','Brake Service'] as ServiceType[]).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bay</label>
          <select
            name="bay"
            value={form.bay || ''}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-red-600"
          >
            {['Bay 1','Bay 2','Bay 3'].map(b => (<option key={b} value={b}>{b}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Technician</label>
          <input
            type="text"
            name="technician"
            placeholder="Optional"
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
