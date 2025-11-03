import { Clock3, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';

type Activity = {
  id: string;
  when: string;
  message: string;
  type: 'success' | 'warn' | 'error';
};

const items: Activity[] = [
  { id: 'a1', when: '2m ago', message: 'Appointment confirmed: BMW 3 Series', type: 'success' },
  { id: 'a2', when: '15m ago', message: 'Inventory low: Oil Filter (OF-67890)', type: 'warn' },
  { id: 'a3', when: '1h ago', message: 'Service completed: Toyota Camry', type: 'success' },
  { id: 'a4', when: '3h ago', message: 'Payment failed: Invoice #1458', type: 'error' },
  { id: 'a5', when: '6h ago', message: 'New customer registered: Sarah Lee', type: 'success' },
];

export default function RecentActivity() {
  function badge(t: Activity['type']) {
    if (t === 'success') return { cls: 'text-emerald-700 bg-emerald-100', icon: CheckCircle2 };
    if (t === 'warn') return { cls: 'text-amber-700 bg-amber-100', icon: Clock3 };
    return { cls: 'text-red-700 bg-red-100', icon: XCircle };
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
            {items.map((i) => {
              const b = badge(i.type);
              const Icon = b.icon;
              return (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-600">{i.when}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{i.message}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${b.cls}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {i.type === 'success' ? 'OK' : i.type === 'warn' ? 'Attention' : 'Issue'}
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



