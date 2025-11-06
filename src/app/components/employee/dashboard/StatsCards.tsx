import { Wrench, CheckCircle2, Clock3, ListChecks } from "lucide-react";

export default function StatsCards() {
  // Duplicate the small mock datasets here (dashboard-only). We intentionally
  // mirror the arrays used on ServiceProgressCard and LogHoursPage so the
  // summary cards reflect the same sample data without changing those pages.
  const services = [
    { id: 1, title: "Oil Change - Toyota Camry", progress: 65 },
    { id: 2, title: "Brake Inspection - Honda Civic", progress: 100 },
    { id: 3, title: "Tire Rotation - Ford F-150", progress: 30 },
  ];

  const tasks = [
    { id: "1", title: "Oil Change - Toyota Camry", customer: "John Doe", vehicle: "V-XYZ123", status: "In Progress" },
    { id: "2", title: "Brake Inspection - Honda Civic", customer: "Jane Smith", vehicle: "V-ABC456", status: "Completed" },
    { id: "3", title: "Tire Rotation - Ford F-150", customer: "Mike Johnson", vehicle: "V-QWE789", status: "Pending" },
  ];

  // derive values for the small stat cards
  const activeCount = services.filter((s) => s.progress < 100).length;
  const completedToday = services.filter((s) => s.progress === 100).length;

  // hours logged: this is sample data — reflect what the Log Hours page shows.
  // If you later add per-task logged durations, update this calculation here.
  const hoursLoggedText = "4h 30m";

  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;

  const stats = [
    { id: "active", label: "Active Services", value: activeCount, icon: Wrench },
    { id: "completed", label: "Completed Today", value: completedToday, icon: CheckCircle2 },
    { id: "hours", label: "Hours Logged", value: hoursLoggedText, icon: Clock3 },
    { id: "pending", label: "Pending Tasks", value: pendingTasks, icon: ListChecks },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(({ id, label, value, icon: Icon }) => (
        <div key={id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
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
