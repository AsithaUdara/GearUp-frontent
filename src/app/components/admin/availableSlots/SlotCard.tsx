'use client';

import React from 'react';
import { Slot } from './types';

type Props = {
  slot: Slot;
  onEdit?: (slot: Slot) => void;
  onDelete?: (id: string) => void;
};

export default function SlotCard({ slot, onEdit, onDelete }: Props) {
  const { date, startTime, endTime, notes } = slot;

  return (
    <div className="rounded-xl border border-gray-200 bg-emerald-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{new Date(date).toDateString()}</h3>
          <p className="text-sm text-gray-600">{startTime} - {endTime}</p>
        </div>
      </div>

      {notes && <p className="text-sm text-gray-700">{notes}</p>}

      <div className="flex gap-2 justify-end">
        {onEdit && (
          <button
            onClick={() => onEdit(slot)}
            className="inline-flex items-center rounded-md bg-blue-600 text-white text-sm px-3 py-1.5 hover:bg-blue-700"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(slot.id)}
            className="inline-flex items-center rounded-md bg-rose-600 text-white text-sm px-3 py-1.5 hover:bg-rose-700"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
