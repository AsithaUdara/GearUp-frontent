'use client';

import React, { useState } from 'react';
import { Slot, SlotInput, ServiceType } from './types';

type Props = {
  slot: Slot;
  onSubmit: (id: string, input: SlotInput) => void;
  onCancel?: () => void;
};

export default function EditSlotForm({ slot, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<SlotInput>({
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    capacity: slot.capacity,
    available: slot.available,
    notes: slot.notes || '',
    serviceType: slot.serviceType || 'General Service',
    bay: slot.bay || 'Bay 1',
    technician: slot.technician || ''
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
    onSubmit(slot.id, form);
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

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" className="inline-flex items-center rounded-md border border-gray-300 text-gray-700 text-sm px-4 py-2 hover:bg-gray-50" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="inline-flex items-center rounded-md bg-black text-white text-sm px-4 py-2 hover:bg-neutral-800">
          Save Changes
        </button>
      </div>
    </form>
  );
}
