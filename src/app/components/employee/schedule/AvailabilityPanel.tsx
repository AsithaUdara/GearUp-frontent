"use client";
import { useState, useSyncExternalStore } from "react";
import { subscribe, getAvailability, updateAvailability, DayAvailability } from "@/lib/availabilityStore";

type Props = {
  onOpenSetAvailability?: () => void;
};

// Server snapshot function cached outside component
const getServerSnapshot = () => [];

export default function AvailabilityPanel({ onOpenSetAvailability }: Props) {
  const storedAvailability = useSyncExternalStore(subscribe, getAvailability, getServerSnapshot);
  const [localAvailability, setLocalAvailability] = useState<DayAvailability[]>(storedAvailability);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state when store updates
  if (JSON.stringify(localAvailability) !== JSON.stringify(storedAvailability) && !hasChanges) {
    setLocalAvailability(storedAvailability);
  }

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const updated = [...localAvailability];
    updated[index] = { ...updated[index], enabled: checked };
    setLocalAvailability(updated);
    setHasChanges(true);
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...localAvailability];
    updated[index] = { ...updated[index], [field]: value };
    setLocalAvailability(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    updateAvailability(localAvailability);
    setHasChanges(false);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-transform hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">Your Availability</div>
        {onOpenSetAvailability && (
          <button onClick={onOpenSetAvailability} className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-medium hover:bg-gray-50">
            Manage Availability
          </button>
        )}
      </div>
      <div className="space-y-3">
        {localAvailability.map((d, index) => (
          <div key={d.day} className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={d.enabled} 
                onChange={(e) => handleCheckboxChange(index, e.target.checked)}
              /> 
              {d.day}
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="time" 
                value={d.startTime} 
                onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                className="rounded-md border p-1 text-xs" 
              />
              <span className="text-xs">-</span>
              <input 
                type="time" 
                value={d.endTime} 
                onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                className="rounded-md border p-1 text-xs" 
              />
            </div>
          </div>
        ))}
      </div>
      <button 
        onClick={handleSave}
        disabled={!hasChanges}
        className={`mt-4 w-full rounded-md py-2 text-xs font-medium text-white transition-colors ${
          hasChanges 
            ? 'bg-red-600 hover:bg-red-700 cursor-pointer' 
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {hasChanges ? 'Save Availability' : 'No Changes'}
      </button>
    </div>
  );
}
