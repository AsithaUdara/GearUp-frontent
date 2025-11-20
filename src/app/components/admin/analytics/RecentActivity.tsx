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
    <div className="rounded-xl border-2 border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-500 mt-1">Latest system events and notifications</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
          View All
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border-2 border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Event Description</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {activities.map((activity, index) => {
              const b = badge(activity.status);
              const Icon = b.icon;
              return (
                <tr key={activity.id || index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">{activity.timeAgo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{activity.event}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${b.cls}`}>
                      <Icon className="h-4 w-4" />
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





