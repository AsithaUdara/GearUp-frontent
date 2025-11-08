'use client';

import { Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TopService {
  serviceName: string;
  count: number;
  percentage: number;
}

export default function TopServices() {
  const [services, setServices] = useState<TopService[]>([
    { serviceName: 'Oil Change', count: 126, percentage: 36.8 },
    { serviceName: 'Brake Service', count: 94, percentage: 27.5 },
    { serviceName: 'Tire Rotation', count: 83, percentage: 24.3 },
    { serviceName: 'Battery Check', count: 57, percentage: 16.7 },
    { serviceName: 'Diagnostics', count: 41, percentage: 12.0 },
  ]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:8087/api/analytics/services/top?limit=5');
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        }
      } catch (error) {
        console.error('Error fetching top services:', error);
      }
    };

    fetchServices();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const max = Math.max(...services.map(i => i.count));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-lg font-semibold">Top Services</h3>
        <Wrench className="h-4 w-4 text-red-600" />
      </div>
      <div className="space-y-3">
        {services.map((s) => (
          <div key={s.serviceName}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{s.serviceName}</span>
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



