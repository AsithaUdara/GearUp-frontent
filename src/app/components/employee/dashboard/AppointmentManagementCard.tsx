import Link from "next/link";

interface AppointmentItem {
  id: string;
  time: string;
  title: string;
  customer: string;
  vehicle: string;
  highlighted?: boolean;
}

const items: AppointmentItem[] = [
  { id: "1", time: "10:00 AM", title: "Diagnostic Test", customer: "Sarah Connor", vehicle: "Honda Accord", highlighted: true },
  { id: "2", time: "02:00 PM", title: "Annual Service", customer: "David Chen", vehicle: "Lexus RX" },
  { id: "3", time: "04:00 PM", title: "Tire Change", customer: "Emily Rodriguez", vehicle: "Jeep Wrangler" },
];

export default function AppointmentManagementCard() {
  return (
    <div className="rounded-lg border border-white bg-white p-5 shadow-md transition hover:shadow-lg hover:-translate-y-0.5">
      <h3 className="text-lg font-semibold mb-3">Appointment Management</h3>
      <ul className="space-y-3">
        {items.map((a) => (
          <li
            key={a.id}
            className={`rounded-lg border border-gray-200 p-3 ${a.highlighted ? "border-red-200 bg-red-50" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  {a.highlighted && <span className="h-5 w-1 rounded bg-red-500" />}
                  <p className="text-sm font-semibold">
                    {a.time} - {a.title}
                  </p>
                </div>
                <p className="text-[11px] text-gray-600">
                  {a.customer} - {a.vehicle}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-xs font-medium text-red-600 hover:underline">Confirm</button>
                <button className="text-xs text-gray-600 hover:underline">Reschedule</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <Link href="#" className="text-xs font-medium text-red-600 hover:underline">
          View All Appointments
        </Link>
      </div>
    </div>
  );
}
