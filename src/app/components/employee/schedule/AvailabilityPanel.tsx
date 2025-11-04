type Props = {
  onOpenSetAvailability?: () => void;
};

export default function AvailabilityPanel({ onOpenSetAvailability }: Props) {
  const days = [
    { name: "Monday", enabled: true },
    { name: "Tuesday", enabled: true },
    { name: "Wednesday", enabled: true },
    { name: "Thursday", enabled: true },
    { name: "Friday", enabled: true },
    { name: "Saturday", enabled: false },
    { name: "Sunday", enabled: false },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-transform hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">Your Availability</div>
        {onOpenSetAvailability && (
          <button onClick={onOpenSetAvailability} className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-medium hover:bg-gray-50">
            Set Availability
          </button>
        )}
      </div>
      <div className="space-y-3">
        {days.map((d) => (
          <div key={d.name} className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked={d.enabled} /> {d.name}
            </label>
            <div className="flex items-center gap-2">
              <input type="time" defaultValue="09:00" className="rounded-md border p-1 text-xs" />
              <span className="text-xs">-</span>
              <input type="time" defaultValue="17:00" className="rounded-md border p-1 text-xs" />
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full rounded-md bg-red-600 py-2 text-xs font-medium text-white hover:bg-red-700">Save Changes</button>
    </div>
  );
}
