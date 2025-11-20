'use client';

import React from 'react';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';
import KpiCards from './KpiCards';
import TrendsChart from './TrendsChart';
import TopServices from './TopServices';
import RecentActivity from './RecentActivity';

export default function AdminAnalyticsPage() {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                  <p className="mt-1 text-sm text-gray-600">Monitor business performance and service metrics in real-time</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Activity className="h-4 w-4" />
              <span>Live Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* KPI Cards Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Key Performance Indicators</h2>
          </div>
          <KpiCards />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2">
            <TrendsChart />
          </div>
          <div className="xl:col-span-1">
            <TopServices />
          </div>
        </div>

        {/* Recent Activity Section */}
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}





