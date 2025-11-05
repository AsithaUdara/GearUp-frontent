"use client";

type AppointmentRow = {
  id: string;
  time: string;
  customer: string;
  vehicle: string;
  service: string;
  status: string;
};

type Props = {
  title?: string;
  rows: AppointmentRow[];
  onView?: (row: AppointmentRow) => void;
  onConfirm?: (row: AppointmentRow) => void;
  onRequest?: (row: AppointmentRow) => void;
};

export default function UpcomingAppointmentsTable({ title = "Upcoming Appointments", rows, onView, onConfirm, onRequest }: Props) {
  const statusStyles: Record<string, string> = {
    Confirmed: "bg-green-100 text-green-700",
    "Awaiting Parts": "bg-yellow-100 text-yellow-700",
    "In Progress": "bg-blue-100 text-blue-700",
    "Reschedule Requested": "bg-orange-100 text-orange-700",
    "Pending": "bg-gray-100 text-gray-600",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-transform hover:shadow-md hover:-translate-y-0.5">
      <div className="text-sm font-medium mb-3">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-gray-500">
            <tr className="border-b border-gray-200">
              <th className="py-2">TIME</th>
              <th className="py-2">CUSTOMER</th>
              <th className="py-2">VEHICLE</th>
              <th className="py-2">SERVICE</th>
              <th className="py-2">STATUS</th>
              { (onView || onConfirm || onRequest) && <th className="py-2">ACTIONS</th> }
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-gray-200 last:border-0 hover:bg-gray-50"
              >
                <td
                  className="py-2 cursor-pointer"
                  onClick={() => onView?.(r)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onView?.(r); }}
                >
                  {r.time}
                </td>
                <td className="py-2" onClick={() => onView?.(r)}>{r.customer}</td>
                <td className="py-2" onClick={() => onView?.(r)}>{r.vehicle}</td>
                <td className="py-2" onClick={() => onView?.(r)}>{r.service}</td>
                <td className="py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${statusStyles[r.status] || "bg-gray-100 text-gray-600"}`}>{r.status}</span>
                </td>
                { (onView || onConfirm || onRequest) && (
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      {/* View button */}
                      {onView && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onView?.(r); }}
                          className="text-xs rounded-md border border-transparent px-3 py-1 text-red-600 hover:bg-red-50"
                          aria-label={`View ${r.customer}'s appointment`}
                        >
                          View
                        </button>
                      )}

                      {/* Confirm button - only when handler provided */}
                      {onConfirm && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onConfirm?.(r); }}
                          className="text-xs rounded-md border border-green-200 bg-green-50 px-3 py-1 text-green-700 hover:bg-green-100"
                          aria-label={`Confirm ${r.customer}'s appointment`}
                        >
                          Confirm
                        </button>
                      )}

                      {/* Reschedule button - only when handler provided */}
                      {onRequest && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRequest?.(r); }}
                          className="text-xs rounded-md border border-orange-200 bg-orange-50 px-3 py-1 text-orange-700 hover:bg-orange-100"
                          aria-label={`Request reschedule for ${r.customer}`}
                        >
                          Reschedule
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
