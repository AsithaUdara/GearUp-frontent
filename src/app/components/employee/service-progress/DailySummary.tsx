"use client";

import { BarChart3, Filter } from "lucide-react";

interface SummaryItem {
  id: string;
  type: string;
  time: string;
  status: string;
}

interface DailySummaryProps {
  summary: SummaryItem[];
}

export default function DailySummary({ summary }: DailySummaryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-l-green-500 bg-green-50";
      case "in-progress":
        return "border-l-yellow-500 bg-yellow-50";
      case "pending":
        return "border-l-red-500 bg-red-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-fit">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-100 rounded-full">
            <BarChart3 className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Daily Summary</h2>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by ID, service..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Summary List */}
      <div className="space-y-3 mb-6">
        {summary.map((item) => (
          <div
            key={item.id}
            className={`border-l-4 p-3 rounded-r-md transition-all hover:shadow-sm ${getStatusColor(item.status)}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{item.id}</p>
                <p className="text-gray-600 text-xs mt-1">{item.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{item.time}</p>
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-white text-gray-700 mt-1">
                  {getStatusText(item.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Full Report */}
      <div className="text-center">
        <button className="text-red-600 hover:text-red-700 font-medium text-sm">
          View Full Report
        </button>
      </div>
    </div>
  );
}