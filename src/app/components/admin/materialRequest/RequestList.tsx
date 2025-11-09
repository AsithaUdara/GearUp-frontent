'use client';

import React from 'react';
import { MaterialRequest } from './types';

type Props = {
  items: MaterialRequest[];
  onSelect: (req: MaterialRequest) => void;
};

export default function RequestList({ items, onSelect }: Props) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
        No requests.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
      {items.map((r) => (
        <li key={r.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(r)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{r.partName} · Qty {r.quantity}</p>
              <p className="text-xs text-gray-600">Requested by {r.requestedBy} on {new Date(r.requestedAt).toLocaleString()}</p>
            </div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              r.status === 'pending' ? 'bg-amber-100 text-amber-700' : r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {r.status}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
