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
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-lg font-semibold">Appointments Trend (Last 12 weeks)</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarDays className="h-4 w-4" />
          Weekly
        </div>
      </div>

      <div className="relative">
        <svg width={width} height={height} className="w-full h-auto">
          {/* grid */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = pad + i * ((height - pad * 2) / 4);
            return <line key={i} x1={pad} x2={width - pad} y1={y} y2={y} stroke="#eef2f7" />;
          })}
          {/* area */}
          <path d={areaPath} fill="#fee2e2" opacity="0.8" />
          {/* line */}
          <path d={linePath} fill="none" stroke="#dc2626" strokeWidth="2" />
          {/* dots */}
          {points.map((p, i) => (
            <circle key={i} cx={toX(i)} cy={toY(p.y)} r="3" fill="#dc2626" />
          ))}
        </svg>
      </div>
    </div>
  );
}



