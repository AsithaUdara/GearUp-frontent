'use client';

import { Users, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MetricsData {
  appointments: number;
  appointmentsChange: string;
  newCustomers: number;
  newCustomersChange: string;
  growth: string;
}

export default function KpiCards() {
  const [metrics, setMetrics] = useState<MetricsData>({
    appointments: 342,
    appointmentsChange: '+3.1%',
    newCustomers: 97,
    newCustomersChange: '+5.5%',
    growth: '12.4%',
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8087/api/analytics/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { id: 'appt', label: 'Appointments', value: metrics.appointments.toString(), delta: metrics.appointmentsChange, icon: Wrench, accent: 'text-red-600' },
    { id: 'cust', label: 'New Customers', value: metrics.newCustomers.toString(), delta: metrics.newCustomersChange, icon: Users, accent: 'text-blue-600' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
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



