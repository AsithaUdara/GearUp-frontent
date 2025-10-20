"use client";

import { Pause, Square, PenSquare } from "lucide-react";

export default function TimeLoggingCard() {
  return (
    <div className="rounded-lg border border-white bg-white p-5 shadow-md transition hover:shadow-lg hover:-translate-y-0.5">
      <h3 className="text-lg font-semibold mb-3">Time Logging</h3>
      <div className="rounded-lg bg-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] text-gray-500">Current Task</p>
            <p className="text-sm font-semibold">Oil Change - Toyota Camry</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600 leading-none">01:25:42</div>
            <div className="text-[11px] text-gray-500">Task Duration</div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg bg-black text-white px-3 py-1.5 text-xs hover:opacity-90">
            <Pause className="h-3.5 w-3.5" /> Pause
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-red-600 text-white px-3 py-1.5 text-xs hover:bg-red-700">
            <Square className="h-3.5 w-3.5" /> Stop
          </button>
          <button
            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50"
            onClick={() => {
              const el = document.getElementById("task-1");
              el?.scrollIntoView({ behavior: "smooth", block: "center" });
              el?.classList.add("ring-2", "ring-red-400");
              setTimeout(() => el?.classList.remove("ring-2", "ring-red-400"), 1200);
            }}
          >
            <PenSquare className="h-3.5 w-3.5" /> Update Task
          </button>
        </div>
      </div>
    </div>
  );
}
