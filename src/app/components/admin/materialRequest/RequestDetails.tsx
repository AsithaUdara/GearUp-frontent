'use client';

import React from 'react';
import { MaterialRequest } from './types';

type Props = {
  request: MaterialRequest;
  onBack?: () => void;
};

export default function RequestDetails({ request, onBack }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Request Details</h3>
        {onBack && (
          <button onClick={onBack} className="text-sm text-gray-600 hover:text-gray-800">Back to list</button>
        )}
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-gray-500">Part</dt>
          <dd className="font-medium text-gray-900">{request.partName}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Quantity</dt>
          <dd className="font-medium text-gray-900">{request.quantity}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Requested By</dt>
          <dd className="font-medium text-gray-900">{request.requestedBy}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Requested At</dt>
          <dd className="font-medium text-gray-900">{new Date(request.requestedAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Status</dt>
          <dd className="font-medium text-gray-900 capitalize">{request.status}</dd>
        </div>
        {request.details && (
          <div className="sm:col-span-2">
            <dt className="text-gray-500">Details</dt>
            <dd className="font-medium text-gray-900">{request.details}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
