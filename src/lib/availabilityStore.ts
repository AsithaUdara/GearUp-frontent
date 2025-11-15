// Store for employee availability schedule
export type DayAvailability = {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
};

let availability: DayAvailability[] = [
  { day: "Monday", enabled: true, startTime: "09:00", endTime: "17:00" },
  { day: "Tuesday", enabled: true, startTime: "09:00", endTime: "17:00" },
  { day: "Wednesday", enabled: true, startTime: "09:00", endTime: "17:00" },
  { day: "Thursday", enabled: true, startTime: "09:00", endTime: "17:00" },
  { day: "Friday", enabled: true, startTime: "09:00", endTime: "17:00" },
  { day: "Saturday", enabled: false, startTime: "09:00", endTime: "17:00" },
  { day: "Sunday", enabled: false, startTime: "09:00", endTime: "17:00" },
];

const listeners = new Set<() => void>();

function notify() {
  for (const l of Array.from(listeners)) l();
}

export function getAvailability() {
  return availability;
}

export function updateAvailability(newAvailability: DayAvailability[]) {
  availability = newAvailability;
  notify();
}

export function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
