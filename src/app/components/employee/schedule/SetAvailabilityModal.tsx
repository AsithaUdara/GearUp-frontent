"use client";
import { X, Download } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SetAvailabilityModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:p-8">
      <div className="w-full max-w-5xl rounded-xl border border-gray-200 bg-white shadow-xl transition-transform hover:shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Set Your Availability</h2>
            <p className="text-sm text-gray-600">Click on a date to set your work hours or block out dates for vacation.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50">
              <Download className="h-4 w-4" /> Export
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-red-600 text-white px-3 py-2 text-xs font-medium hover:bg-red-700">
              Save Changes
            </button>
            <button aria-label="Close" onClick={onClose} className="rounded-md p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
          {/* Calendar mock */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between p-2 text-sm text-gray-700">
              <button className="rounded-md px-2 py-1 hover:bg-gray-50">2024</button>
              <div className="font-medium">October 2025</div>
              <button className="rounded-md px-2 py-1 hover:bg-gray-50">2026</button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500">
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={`${d}-${i}`} className="py-1">{d}</div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2 text-center">
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 1;
                const isRange = day >= 6 && day <= 9; // pink range
                const isPrimary = [5,12,17,22,27].includes(day); // blue dots
                return (
                  <div key={i} className="relative rounded-md py-3 text-sm hover:bg-gray-50">
                    {day > 0 && day <= 31 ? (
                      <>
                        <span className={`relative z-10 ${isPrimary ? "inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white" : ""}`}>{day}</span>
                        {isRange && <span className="absolute inset-y-0 left-1 right-1 -z-0 rounded-full bg-red-100" />}
                      </>
                    ) : (
                      "\u00A0"
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex rounded-md border bg-gray-50 text-xs">
              <button className="flex-1 px-3 py-2 font-medium bg-white rounded-l-md">Available</button>
              <button className="flex-1 px-3 py-2">Unavailable</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">Start Time</label>
                  <input defaultValue="09:00" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">End Time</label>
                  <input defaultValue="17:00" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
                </div>
              </div>
              <hr className="my-2 border-gray-200" />
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" /> Set as recurring</label>
                <label className="flex items-center gap-2"><input type="checkbox" /> Apply to all Saturdays</label>
              </div>
              <hr className="my-2 border-gray-200" />
              <button className="w-full rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200">Block Out Date</button>
            </div>
          </div>

          {/* Bottom list */}
          <div className="lg:col-span-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold">Upcoming Unavailable Periods</div>
              <div className="space-y-3">
                {[
                  { title: "October 25, 2024", sub: "All day" },
                  { title: "November 5, 2024 - November 10, 2024", sub: "Vacation" },
                  { title: "Every Friday", sub: "Unavailable from 2:00 PM" },
                ].map((it, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                    <div>
                      <div className="text-sm font-medium">{it.title}</div>
                      <div className="text-xs text-gray-600">{it.sub}</div>
                    </div>
                    <button className="rounded-md px-2 py-1 text-xs hover:bg-gray-100">Edit</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
