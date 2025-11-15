import { WorkTask } from "./workScheduleData";

type ServiceTasksState = {
  assignedTasks: WorkTask[];
  completedTasks: WorkTask[];
};

let state: ServiceTasksState = {
  assignedTasks: [],
  completedTasks: [],
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getServiceTasks(): ServiceTasksState {
  return state;
}

export function setServiceTasks(assignedTasks: WorkTask[], completedTasks: WorkTask[]) {
  state = { assignedTasks, completedTasks };
  notify();
}

export function updateAssignedTasks(updater: (tasks: WorkTask[]) => WorkTask[]) {
  state = { ...state, assignedTasks: updater(state.assignedTasks) };
  notify();
}

export function updateCompletedTasks(updater: (tasks: WorkTask[]) => WorkTask[]) {
  state = { ...state, completedTasks: updater(state.completedTasks) };
  notify();
}

export function subscribeToServiceTasks(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
