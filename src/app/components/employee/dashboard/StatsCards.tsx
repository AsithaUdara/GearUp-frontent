import { Wrench, CheckCircle2, Clock3, ListChecks } from "lucide-react";

export default function StatsCards() {
  const stats = [
    { id: "active", label: "Active Services", value: 3, icon: Wrench },
    { id: "completed", label: "Completed Today", value: 7, icon: CheckCircle2 },
    { id: "hours", label: "Hours Logged", value: "4h 30m", icon: Clock3 },
    { id: "pending", label: "Pending Tasks", value: 5, icon: ListChecks },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(({ id, label, value, icon: Icon }) => (
        <div key={id} className="rounded-lg border border-white bg-white p-4 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">{label}</div>
              <div className="text-lg font-semibold mt-1">{value}</div>
            </div>
            <Icon className="h-5 w-5 text-red-600" />
          </div>
        </div>
      ))}
    </div>
  );
}
