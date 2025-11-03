// app/components/admin/RecentActivityCard.tsx
import Link from "next/link";

const activities = [
  { time: "10:00 AM", title: "New Appointment Booked", details: "John Doe - Toyota Camry", status: "New" },
  { time: "09:45 AM", title: "Service Completed", details: "Jane Smith - Honda Civic", status: "Done" },
  { time: "09:30 AM", title: "Time Logged", details: "Mike R. logged 2h on Ford F-150", status: "Update" },
  { time: "09:15 AM", title: "Part Request Approved", details: "Brake Pads for Honda Civic", status: "Approved" },
];

export default function RecentActivityCard() {
  return (
    <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
      <h3 className="font-heading text-xl font-bold mb-4">Recent Activity</h3>
      <ul className="space-y-4">
        {activities.map((activity, index) => (
          <li key={index} className="flex items-start gap-4">
            <div className="flex-shrink-0 text-right">
              <p className="text-xs font-semibold text-foreground">{activity.time}</p>
            </div>
            <div className="relative w-full pl-4">
              <span className="absolute left-0 top-1 h-full w-px bg-border"></span>
              <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-white"></span>
              <p className="text-sm font-semibold">{activity.title}</p>
              <p className="text-xs text-muted-foreground">{activity.details}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Link href="#" className="font-body text-sm font-semibold text-primary hover:underline">
          View All Activity
        </Link>
      </div>
    </div>
  );
}
