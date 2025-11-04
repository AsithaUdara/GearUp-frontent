"use client";
import { useState } from "react";

export default function AttendanceQuickAccess() {
  const [clockedIn, setClockedIn] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Attendance</h4>
        <span className="text-xs text-gray-500">Today</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{clockedIn ? "Clocked In" : "Clocked Out"}</div>
          <div className="text-xs text-gray-400">{clockedIn ? "Since 08:05 AM" : "Not clocked in"}</div>
        </div>
        <button
          onClick={() => setClockedIn((s) => !s)}
          className={`rounded-md px-4 py-2 text-sm font-medium ${clockedIn ? "bg-gray-100 text-gray-700" : "bg-red-600 text-white"}`}
        >
          {clockedIn ? "Clock Out" : "Clock In"}
        </button>
      </div>
    </div>
  );
}
