import { TrendingUp, Users, Wrench } from 'lucide-react';

export default function KpiCards() {
  const items = [
    { id: 'appt', label: 'Appointments', value: '342', delta: '+3.1%', icon: Wrench, accent: 'text-red-600' },
    { id: 'cust', label: 'New Customers', value: '97', delta: '+5.5%', icon: Users, accent: 'text-blue-600' },
    { id: 'growth', label: 'Growth', value: '12.4%', delta: <span className="text-emerald-700">▲</span>, icon: TrendingUp, accent: 'text-emerald-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map(({ id, label, value, delta, icon: Icon, accent }) => (
        <div key={id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">{label}</div>
              <div className="text-lg font-semibold text-gray-900 mt-1">{value}</div>
              <div className="text-[11px] text-gray-600 mt-0.5">{delta}</div>
            </div>
            <Icon className={`h-5 w-5 ${accent}`} />
          </div>
        </div>
      ))}
    </div>
  );
}



