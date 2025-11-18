type TimeLog = {
  taskId: string;
  taskTitle: string;
  seconds: number;
  startTime: Date;
  endTime?: Date;
};

type TimeLoggingState = {
  todayLogs: TimeLog[];
  activeLog: TimeLog | null;
};

let state: TimeLoggingState = {
  todayLogs: [],
  activeLog: null,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getTimeLoggingState(): TimeLoggingState {
  return state;
}

export function getTotalSecondsToday(): number {
  return state.todayLogs.reduce((total, log) => total + log.seconds, 0);
}

export function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return [hours, minutes, seconds]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
}

export function startTimeLog(taskId: string, taskTitle: string) {
  state = {
    ...state,
    activeLog: {
      taskId,
      taskTitle,
      seconds: 0,
      startTime: new Date(),
    },
  };
  notify();
}

export function updateActiveLogTime(seconds: number) {
  if (state.activeLog) {
    state = {
      ...state,
      activeLog: {
        ...state.activeLog,
        seconds,
      },
    };
    notify();
  }
}

export function stopTimeLog() {
  if (state.activeLog) {
    const completedLog: TimeLog = {
      ...state.activeLog,
      endTime: new Date(),
    };
    
    state = {
      todayLogs: [...state.todayLogs, completedLog],
      activeLog: null,
    };
    notify();
  }
}

export function subscribeToTimeLogging(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
