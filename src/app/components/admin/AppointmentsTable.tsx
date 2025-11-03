// app/components/admin/AppointmentsTable.tsx
export default function AppointmentsTable() {
  const rows = [
    { time: "09:00 AM", customer: "John Doe", vehicle: "Toyota Camry", service: "Oil Change", assignee: "Mike R.", status: "Confirmed" },
    { time: "11:30 AM", customer: "Jane Smith", vehicle: "Honda Civic", service: "Brake Inspection", assignee: "Sarah K.", status: "Awaiting Parts" },
    { time: "02:00 PM", customer: "Peter Jones", vehicle: "Ford F-150", service: "Tire Rotation", assignee: "Mike R.", status: "In Progress" },
  ];
  const statusStyles: Record<string, string> = {
    Confirmed: "bg-green-100 text-green-800",
    "Awaiting Parts": "bg-yellow-100 text-yellow-800",
    "In Progress": "bg-blue-100 text-blue-800",
  };

  return (
    <div className="rounded-lg border border-border bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs text-muted-foreground uppercase">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Assigned To</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{r.time}</td>
                <td className="px-4 py-3">{r.customer}</td>
                <td className="px-4 py-3">{r.vehicle}</td>
                <td className="px-4 py-3">{r.service}</td>
                <td className="px-4 py-3">{r.assignee}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[r.status]}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
