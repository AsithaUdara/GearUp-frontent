export default function WorkHoursCard() {
  return (
    <div className="rounded-lg border border-white bg-white p-5 shadow-md transition hover:shadow-lg hover:-translate-y-0.5">
      <h3 className="text-lg font-semibold mb-3">Log Work Hours</h3>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm">Today's Hours: <span className="text-red-600">4h 30m</span></p>
        <p className="text-xs text-gray-500">Clocked in: 8:00 AM</p>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300">Start Timer</button>
        <button className="flex-1 py-2 bg-black text-white rounded-lg text-sm hover:opacity-90">End Shift</button>
      </div>
    </div>
  );
}
