'use client';

import React from 'react';
import KpiCards from './KpiCards';
import TrendsChart from './TrendsChart';
import TopServices from './TopServices';
import RecentActivity from './RecentActivity';

export default function AdminAnalyticsPage() {
  return (
    <div className="w-full pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-64 lg:pr-8 xl:pr-10 2xl:pr-12 pt-4 sm:pt-6 flex flex-col min-h-screen">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
          <p className="mt-1 text-sm text-gray-600">Business metrics, service trends, and operational insights.</p>
        </div>
      </div>

      <div className="mt-6">
        <KpiCards />
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TrendsChart />
        </div>
        <div className="xl:col-span-1">
          <TopServices />
        </div>
      </div>

      <div className="mt-6">
        <RecentActivity />
      </div>
    </div>
  );
}


