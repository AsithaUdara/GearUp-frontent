export default function CalendarMonth() {
  // Static month grid (placeholder)
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-transform hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-4">
        <button className="text-sm">2024</button>
        <div className="text-sm font-medium">October 2025</div>
        <button className="text-sm">2026</button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={`${d}-${i}`} className="py-1">{d}</div>
        ))}
      </div> 
      <div className="mt-2 grid grid-cols-7 gap-2 text-center">
        {Array.from({ length: 35 }, (_, i) => {
          const day = i - 1; // start with blank to offset
          const isToday = day === 5;
          return (
            <div
              key={i}
              className={
                "rounded-md py-3 text-sm " +
                (day <= 0 || day > 31
                  ? "text-transparent"
                  : isToday
                  ? "bg-red-600 text-white"
                  : "hover:bg-gray-50")
              }
            >
              {day > 0 && day <= 31 ? day : "\u00A0"}
            </div>
          );
        })}
      </div>
    </div>
  );
}
