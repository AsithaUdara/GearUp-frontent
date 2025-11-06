import { Bell } from "lucide-react";

const notifications = [
  { id: 1, text: "New parts request approved", time: "2m" },
  { id: 2, text: "Assigned to job #APPT-1023", time: "1h" },
  { id: 3, text: "Message from admin: check schedule", time: "3h" },
];

export default function NotificationsCard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-gray-600" />
          <h4 className="text-sm font-semibold">Notifications</h4>
        </div>
        <button className="text-xs text-gray-500 hover:underline">Mark all read</button>
      </div>
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li key={n.id} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{n.text}</span>
            <span className="text-xs text-gray-400">{n.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
