'use client';

import React, { useState } from 'react';
import { MaterialRequest } from './types';

type Props = {
  request: MaterialRequest;
  onApprove: (id: string, note?: string) => void;
  onReject: (id: string, note?: string) => void;
};

export default function ApproveRequestForm({ request, onApprove, onReject }: Props) {
  const [note, setNote] = useState('');

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Approval</h3>
      <label className="block text-sm font-medium text-gray-700">Note (optional)</label>
      <textarea
        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add an approval or rejection note"
      />
      <div className="mt-3 flex gap-2 justify-end">
        <button
          className="inline-flex items-center rounded-md bg-emerald-600 text-white text-sm px-4 py-2 hover:bg-emerald-700"
          onClick={() => onApprove(request.id, note)}
        >
          Approve
        </button>
        <button
          className="inline-flex items-center rounded-md bg-rose-600 text-white text-sm px-4 py-2 hover:bg-rose-700"
          onClick={() => onReject(request.id, note)}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
