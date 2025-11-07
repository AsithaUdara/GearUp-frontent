"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type MaterialRequest = {
  id: string;
  part: string;
  quantity: number;
  status: string;
  requestedAt: string;
};

const mockRequests: MaterialRequest[] = [
  { id: "R1", part: "Brake Pads", quantity: 4, status: "Requested", requestedAt: "2025-11-03" },
  { id: "R2", part: "Oil Filter", quantity: 2, status: "On Order", requestedAt: "2025-11-01" },
];

export default function MaterialRequestsCard() {
  const router = useRouter();
  const [requests, setRequests] = useState<MaterialRequest[]>(mockRequests);

  const handleMarkReceived = (id: string) => {
    setRequests((prev) => prev.map(r => r.id === id ? { ...r, status: 'Received' } : r));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Material Requests</h3>
        <button onClick={() => router.push('/employee/parts-request')} className="text-sm text-red-600 hover:underline">Request Part</button>
      </div>

      <ul className="mt-3 space-y-3">
        {requests.map((r) => (
          <li key={r.id} className="rounded-lg border border-gray-100 p-3 bg-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold">{r.part} <span className="text-xs text-gray-500">x{r.quantity}</span></div>
                <div className="text-xs text-gray-600">Requested: {r.requestedAt}</div>
                <div className="text-xs text-gray-600">Status: {r.status}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {r.status !== 'Received' && (
                  <button onClick={() => handleMarkReceived(r.id)} className="text-xs text-green-600 hover:underline">Mark Received</button>
                )}
                <button onClick={() => router.push('/employee/parts-request')} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">View</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
