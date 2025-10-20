export default function WorkHoursSummaryCompactCard() {
  return (
    <div className="rounded-lg border border-white bg-white p-5 shadow-md transition hover:shadow-lg hover:-translate-y-0.5">
      <h3 className="text-lg font-semibold mb-3">Log Work Hours</h3>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm">
          Today's Hours: <span className="text-red-600 font-medium">4h 30m</span>
        </p>
        <p className="text-xs text-gray-500">Clocked in: 8:00 AM</p>
      </div>
      <div className="flex gap-3">
        <button className="flex-1 py-2 rounded-xl bg-gray-200 text-gray-800 text-sm hover:bg-gray-300">Start Timer</button>
        <button className="flex-1 py-2 rounded-xl bg-black text-white text-sm hover:opacity-90">End Shift</button>
      </div>
    </div>
  );
}
