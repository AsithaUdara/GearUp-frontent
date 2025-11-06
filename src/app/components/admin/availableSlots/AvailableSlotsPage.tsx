'use client';

import React, { useMemo, useState } from 'react';
import AddSlotForm from './AddSlotForm';
import EditSlotForm from './EditSlotForm';
import SlotList from './SlotList';
import { Slot, SlotInput } from './types';
// simple non-secure id generator to avoid external deps
const rid = (len = 8) => Math.random().toString(36).slice(2, 2 + len);

function createMock(): Slot[] {
  const today = new Date();
  const toISO = (d: Date) => d.toISOString().slice(0, 10);
  return [0, 1, 2].map((i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      id: rid(8),
      date: toISO(d),
      startTime: '09:00',
      endTime: '10:00',
      capacity: 5,
      available: Math.max(0, 5 - i),
      notes: i === 0 ? 'Morning slot' : undefined,
      bookings: [],
    };
  });
}

export default function AvailableSlotsPage() {
  const initial = useMemo(createMock, []);
  const [slots, setSlots] = useState<Slot[]>(initial);
  const [editing, setEditing] = useState<Slot | null>(null);

  function addSlot(input: SlotInput) {
    const id = rid(8);
    const { capacity, available, ...rest } = input;
    setSlots((prev) => [{ id, bookings: [], ...rest }, ...prev]);
  }

  function updateSlot(id: string, input: SlotInput) {
    const { capacity, available, ...rest } = input;
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...rest, bookings: s.bookings ?? [] } : s)));
    setEditing(null);
  }

  function deleteSlot(id: string) {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Slots</h1>
          <p className="text-sm text-gray-600">Create, edit, and manage appointment availability.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{editing ? 'Edit Slot' : 'Add New Slot'}</h2>
            {editing ? (
              <EditSlotForm slot={editing} onSubmit={updateSlot} onCancel={() => setEditing(null)} />
            ) : (
              <AddSlotForm onSubmit={addSlot} />
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <SlotList
            slots={slots}
            onEdit={setEditing}
            onDelete={deleteSlot}
          />
        </div>
      </div>
    </div>
  );
}
