'use client';

import { CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TrendData {
  date: string;
  count: number;
  period: string;
}

// Simple inline SVG area+line chart with API data
export default function TrendsChart() {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [points, setPoints] = useState([
    { x: 0, y: 38 },
    { x: 1, y: 42 },
    { x: 2, y: 40 },
    { x: 3, y: 48 },
    { x: 4, y: 46 },
    { x: 5, y: 55 },
    { x: 6, y: 60 },
    { x: 7, y: 58 },
    { x: 8, y: 64 },
    { x: 9, y: 71 },
    { x: 10, y: 68 },
    { x: 11, y: 75 },
  ]);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const response = await fetch('http://localhost:8087/api/analytics/appointments/trend?weeks=12');
        if (response.ok) {
          const data: TrendData[] = await response.json();
          setTrendData(data);
          
          // Convert API data to points for the chart
          if (data.length > 0) {
            const newPoints = data.map((item, index) => ({
              x: index,
              y: item.count
            }));
            setPoints(newPoints);
          }
        }
      } catch (error) {
        console.error('Error fetching trend data:', error);
      }
    };

    fetchTrend();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTrend, 30000);
    return () => clearInterval(interval);
  }, []);

  const width = 720;
  const height = 260;
  const pad = 24;
  const maxY = 80;
  const stepX = (width - pad * 2) / (points.length - 1);

  const toX = (i: number) => pad + i * stepX;
  const toY = (v: number) => height - pad - (v / maxY) * (height - pad * 2);

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.y)}`)
    .join(' ');
  const areaPath = `${linePath} L ${toX(points.length - 1)} ${height - pad} L ${toX(0)} ${height - pad} Z`;

  return (
    <div className="rounded-xl border-2 border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Appointment Trends</h3>
          <p className="text-sm text-gray-500 mt-1">Weekly performance over the last 12 weeks</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
          <CalendarDays className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Weekly View</span>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-100">
        <svg width={width} height={height} className="w-full h-auto">
          {/* grid lines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = pad + i * ((height - pad * 2) / 4);
            return <line key={i} x1={pad} x2={width - pad} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />;
          })}
          {/* area gradient */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#areaGradient)" />
          {/* line */}
          <path d={linePath} fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* dots */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={toX(i)} cy={toY(p.y)} r="6" fill="white" stroke="#dc2626" strokeWidth="3" />
              <circle cx={toX(i)} cy={toY(p.y)} r="3" fill="#dc2626" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}





