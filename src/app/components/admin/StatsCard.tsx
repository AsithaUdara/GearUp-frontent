// app/components/admin/StatsCard.tsx
import { Wrench, CheckCircle, Clock, Users } from "lucide-react";

export default function StatsCard() {
  const stats = [
    { label: "Services In Progress", value: "5", icon: Wrench },
    { label: "Completed Today", value: "14", icon: CheckCircle },
    { label: "Hours Logged Today", value: "32h", icon: Clock },
    { label: "New Customers", value: "7", icon: Users },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm font-medium text-muted-foreground">{stat.label}</p>
            <stat.icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-2 font-heading text-4xl font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
