'use client';

import { Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TopService {
  serviceName: string;
  count: number;
  percentage: number;
}

interface Booking {
  id: number;
  serviceId: number;
  timeSlot?: {
    serviceName?: string;
  };
}

interface Service {
  id: number;
  serviceName: string;
}

export default function TopServices() {
  const [services, setServices] = useState<TopService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Fetch all bookings from appointment service
        const bookingsResponse = await fetch('http://localhost:9090/api/v1/bookings');
        
        if (bookingsResponse.ok) {
          const bookingsData: Booking[] = await bookingsResponse.json();
          console.log('Fetched bookings for popular services:', bookingsData);
          
          // Count bookings by service_id
          const serviceCounts: { [key: number]: { count: number; name: string } } = {};
          let totalBookings = bookingsData.length;
          
          bookingsData.forEach((booking) => {
            const serviceId = booking.serviceId;
            const serviceName = booking.timeSlot?.serviceName || `Service ${serviceId}`;
            
            if (!serviceCounts[serviceId]) {
              serviceCounts[serviceId] = { count: 0, name: serviceName };
            }
            serviceCounts[serviceId].count++;
          });
          
          // Convert to array and sort by count
          const topServices: TopService[] = Object.entries(serviceCounts)
            .map(([serviceId, data]) => ({
              serviceName: data.name,
              count: data.count,
              percentage: totalBookings > 0 ? (data.count / totalBookings) * 100 : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5 services
          
          console.log('Calculated top services:', topServices);
          setServices(topServices);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching top services:', error);
        setLoading(false);
      }
    };

    fetchServices();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const max = services.length > 0 ? Math.max(...services.map(i => i.count)) : 1;

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
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading popular services...</div>
        </div>
      ) : services.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">No bookings data available</div>
        </div>
      ) : (
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
      )}
    </div>
  );
}





