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
    appointments: 0,
    appointmentsChange: '+3.1%',
    newCustomers: 97,
    newCustomersChange: '+5.5%',
    growth: '12.4%',
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch total appointments from appointment service database
        const bookingsResponse = await fetch('http://localhost:9090/api/v1/bookings');
        let totalAppointments = 0; // Start with 0
        
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          totalAppointments = bookingsData.length;
          console.log('Fetched bookings count from database:', totalAppointments);
          console.log('Bookings data:', bookingsData);
        } else {
          console.error('Failed to fetch bookings:', bookingsResponse.status);
        }

        // Fetch other metrics from analytics service
        try {
          const analyticsResponse = await fetch('http://localhost:9090/api/analytics/metrics');
          if (analyticsResponse.ok) {
            const data = await analyticsResponse.json();
            console.log('Analytics data:', data);
            setMetrics({
              ...data,
              appointments: totalAppointments, // Override with actual database count
            });
          } else {
            console.log('Analytics service unavailable, using bookings count only');
            // If analytics service fails, still update with bookings count
            setMetrics(prev => ({
              ...prev,
              appointments: totalAppointments,
            }));
          }
        } catch (analyticsError) {
          console.log('Analytics service error, using bookings count only:', analyticsError);
          setMetrics(prev => ({
            ...prev,
            appointments: totalAppointments,
          }));
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





