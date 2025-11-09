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
    <div className="rounded-xl border-2 border-gray-100 bg-white p-6 shadow-sm h-full hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Popular Services</h3>
          <p className="text-sm text-gray-500 mt-1">Most requested services</p>
        </div>
        <div className="p-2 bg-red-50 rounded-lg">
          <Wrench className="h-5 w-5 text-red-600" />
        </div>
      </div>
      <div className="space-y-5">
        {services.map((s, index) => (
          <div key={s.serviceName} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-700 group-hover:bg-red-100 group-hover:text-red-700 transition-colors">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-gray-900">{s.serviceName}</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{s.count}</span>
            </div>
            <div className="relative h-3 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500 ease-out group-hover:from-red-600 group-hover:to-red-700"
                style={{ width: `${Math.round((s.count / max) * 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20"></div>
              </div>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {s.percentage.toFixed(1)}% of total
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



