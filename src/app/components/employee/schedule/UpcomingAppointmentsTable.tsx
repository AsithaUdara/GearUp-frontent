export default function UpcomingAppointmentsTable() {
  const rows = [
    { time: "09:00 AM", customer: "John Doe", vehicle: "Toyota Camry", service: "Oil Change", assignee: "Mike R.", status: "Confirmed" },
    { time: "11:30 AM", customer: "Jane Smith", vehicle: "Honda Civic", service: "Brake Inspection", assignee: "Sarah K.", status: "Awaiting Parts" },
    { time: "02:00 PM", customer: "Peter Jones", vehicle: "Ford F-150", service: "Tire Rotation", assignee: "Mike R.", status: "In Progress" },
  ];

  const statusStyles: Record<string, string> = {
    Confirmed: "bg-green-100 text-green-700",
    "Awaiting Parts": "bg-yellow-100 text-yellow-700",
    "In Progress": "bg-blue-100 text-blue-700",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-transform hover:shadow-md hover:-translate-y-0.5">
      <div className="text-sm font-medium mb-3">Upcoming Appointments - October 5, 2024</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-gray-500">
            <tr className="border-b border-gray-200">
              <th className="py-2">TIME</th>
              <th className="py-2">CUSTOMER</th>
              <th className="py-2">VEHICLE</th>
              <th className="py-2">SERVICE</th>
              <th className="py-2">ASSIGNED TO</th>
              <th className="py-2">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-200 last:border-0">
                <td className="py-2">{r.time}</td>
                <td className="py-2">{r.customer}</td>
                <td className="py-2">{r.vehicle}</td>
                <td className="py-2">{r.service}</td>
                <td className="py-2">{r.assignee}</td>
                <td className="py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${statusStyles[r.status]}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
