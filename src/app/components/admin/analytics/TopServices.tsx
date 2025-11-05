import { Wrench } from 'lucide-react';

export default function TopServices() {
  const items = [
    { name: 'Oil Change', count: 126 },
    { name: 'Brake Service', count: 94 },
    { name: 'Tire Rotation', count: 83 },
    { name: 'Battery Check', count: 57 },
    { name: 'Diagnostics', count: 41 },
  ];
  const max = Math.max(...items.map(i => i.count));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-lg font-semibold">Top Services</h3>
        <Wrench className="h-4 w-4 text-red-600" />
      </div>
      <div className="space-y-3">
        {items.map((s) => (
          <div key={s.name}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{s.name}</span>
              <span className="text-gray-600">{s.count}</span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-2 bg-red-600 rounded-full"
                style={{ width: `${Math.round((s.count / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



