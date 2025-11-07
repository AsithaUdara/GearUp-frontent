// single small in-memory store for unavailable dates (shared between schedule and dashboard)
let dates: string[] = [
  // initial sample blocked date (matches schedule page sample)
  "2025-10-25",
];

const listeners = new Set<() => void>();

function notify() {
  for (const l of Array.from(listeners)) l();
}

export function getUnavailableDates() {
  return dates;
}

export function subscribeUnavailable(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setUnavailableDates(next: string[]) {
  dates = next;
  notify();
}

export function addUnavailableDate(d: string) {
  if (!dates.includes(d)) {
    dates = [...dates, d];
    notify();
  }
}

export function removeUnavailableDate(d: string) {
  const prev = dates;
  const next = prev.filter((x) => x !== d);
  if (next.length !== prev.length) {
    dates = next;
    notify();
  }
}
