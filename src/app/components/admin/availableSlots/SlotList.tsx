'use client';

import React from 'react';
import SlotCard from './SlotCard';
import { Slot } from './types';

type Props = {
  slots: Slot[];
  onEdit?: (slot: Slot) => void;
  onDelete?: (id: string) => void;
};

export default function SlotList({ slots, onEdit, onDelete }: Props) {
  if (!slots.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
        No slots yet. Add your first available slot.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {slots.map((slot) => (
        <SlotCard key={slot.id} slot={slot} onEdit={onEdit} onDelete={onDelete} />)
      )}
    </div>
  );
}
