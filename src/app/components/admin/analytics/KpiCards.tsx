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
        const response = await fetch('http://localhost:9090/api/v1/analytics/metrics');
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
    { 
      id: 'appt', 
      label: 'Total Appointments', 
      value: metrics.appointments.toString(), 
      delta: metrics.appointmentsChange, 
      icon: Wrench, 
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-100'
    },
    { 
      id: 'cust', 
      label: 'New Customers', 
      value: metrics.newCustomers.toString(), 
      delta: metrics.newCustomersChange, 
      icon: Users, 
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100'
    },
  ];

  const isPositive = (delta: string) => delta.startsWith('+');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map(({ id, label, value, delta, icon: Icon, bgColor, iconColor, borderColor }) => (
        <div 
          key={id} 
          className={`relative overflow-hidden rounded-xl border-2 ${borderColor} bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{label}</p>
              <div className="mt-3 flex items-baseline gap-2">
                <h3 className="text-4xl font-bold text-gray-900">{value}</h3>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isPositive(delta) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {delta}
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">vs. last period</p>
            </div>
            <div className={`flex-shrink-0 p-3 rounded-xl ${bgColor}`}>
              <Icon className={`h-8 w-8 ${iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}



