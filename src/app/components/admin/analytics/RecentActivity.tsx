'use client';

import { Clock3, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';

type Activity = {
  id?: number;
  timestamp: string;
  event: string;
  status: 'OK' | 'ATTENTION' | 'WARNING';
  timeAgo: string;
};

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([
    { timestamp: '2025-11-06T10:00:00', event: 'Appointment confirmed: BMW 3 Series', status: 'OK', timeAgo: '2m ago' },
    { timestamp: '2025-11-06T09:45:00', event: 'Inventory low: Oil Filter (OF-67890)', status: 'ATTENTION', timeAgo: '15m ago' },
    { timestamp: '2025-11-06T09:00:00', event: 'Service completed: Toyota Camry', status: 'OK', timeAgo: '1h ago' },
    { timestamp: '2025-11-06T07:00:00', event: 'Payment failed: Invoice #1458', status: 'WARNING', timeAgo: '3h ago' },
    { timestamp: '2025-11-06T04:00:00', event: 'New customer registered: Sarah Lee', status: 'OK', timeAgo: '6h ago' },
  ]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('http://localhost:8087/api/analytics/activities/recent?limit=5');
        if (response.ok) {
          const data = await response.json();
          setActivities(data);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  function badge(status: Activity['status']) {
    if (status === 'OK') return { cls: 'text-emerald-700 bg-emerald-100', icon: CheckCircle2, label: 'OK' };
    if (status === 'ATTENTION') return { cls: 'text-amber-700 bg-amber-100', icon: Clock3, label: 'Attention' };
    return { cls: 'text-red-700 bg-red-100', icon: XCircle, label: 'Issue' };
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-lg font-semibold">Recent Activity</h3>
        <button className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          View details <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-100">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">When</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Event</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activities.map((activity, index) => {
              const b = badge(activity.status);
              const Icon = b.icon;
              return (
                <tr key={activity.id || index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-600">{activity.timeAgo}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{activity.event}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${b.cls}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {b.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}



