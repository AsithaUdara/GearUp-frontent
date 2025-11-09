import { ListTodo, CheckCircle2, Clock3, AlertCircle } from "lucide-react";

export default function StatsCards() {
  // Mock data for tasks
  const tasks = [
    { id: "1", title: "Oil Change - Toyota Camry", customer: "John Doe", vehicle: "V-XYZ123", status: "In Progress" },
    { id: "2", title: "Brake Inspection - Honda Civic", customer: "Jane Smith", vehicle: "V-ABC456", status: "Completed" },
    { id: "3", title: "Tire Rotation - Ford F-150", customer: "Mike Johnson", vehicle: "V-QWE789", status: "Pending" },
  ];

  // Calculate stats
  const allTasksToday = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
  const hoursLoggedText = "4h 30m";

  const stats = [
    { id: "all", label: "All Tasks Today", value: allTasksToday, icon: ListTodo },
    { id: "completed", label: "Completed Tasks", value: completedTasks, icon: CheckCircle2 },
    { id: "pending", label: "Pending Tasks", value: pendingTasks, icon: AlertCircle },
    { id: "hours", label: "Hours Logged", value: hoursLoggedText, icon: Clock3 },
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
