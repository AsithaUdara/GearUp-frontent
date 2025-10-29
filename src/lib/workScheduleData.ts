// Simple mock data for employee work schedule and tasks

export type WorkTask = {
  id: string;
  serviceId: string;
  vehicle: string;
  customer: string;
  serviceType: string;
  assigneeId: string; // employee/user id
  status: "pending" | "in-progress" | "completed";
  progressStep?: 1 | 2 | 3 | 4 | 5; // 1-5 progress for current task
  notes?: string;
  time?: string;
};

// Mock dataset
const TASKS: WorkTask[] = [
  {
    id: "task-1",
    serviceId: "SVC-2024-00789",
    vehicle: "Toyota Camry - 2021",
    customer: "Jane Smith",
    serviceType: "Brake Pad Replacement",
    assigneeId: "emp-1",
    status: "in-progress",
    progressStep: 3,
    notes: "Caliper pins inspected",
    time: "10:35 AM",
  },
  {
    id: "task-2",
    serviceId: "SVC-2024-00785",
    vehicle: "Honda Civic - 2019",
    customer: "John Doe",
    serviceType: "Oil Change",
    assigneeId: "emp-1",
    status: "completed",
    progressStep: 5,
    time: "10:15 AM",
  },
  {
    id: "task-3",
    serviceId: "SVC-2024-00786",
    vehicle: "Ford F-150 - 2020",
    customer: "Peter Jones",
    serviceType: "Brake Inspection",
    assigneeId: "emp-1",
    status: "completed",
    progressStep: 5,
    time: "11:30 AM",
  },
  {
    id: "task-4",
    serviceId: "SVC-2024-00787",
    vehicle: "Toyota Corolla - 2018",
    customer: "Emily Clark",
    serviceType: "Tire Rotation",
    assigneeId: "emp-1",
    status: "pending",
    progressStep: 1,
    time: "01:45 PM",
  },
];

export async function fetchTasksByEmployeeId(employeeId: string): Promise<{
  currentTask: WorkTask | null;
  assigned: WorkTask[];
  completed: WorkTask[];
}> {
  // Simulate async fetch
  await new Promise((r) => setTimeout(r, 150));

  const assignedToEmp = TASKS.filter((t) => t.assigneeId === employeeId);
  const currentTask = assignedToEmp.find((t) => t.status === "in-progress") ?? null;
  const completed = assignedToEmp.filter((t) => t.status === "completed");

  return {
    currentTask,
    assigned: assignedToEmp,
    completed,
  };
}

export async function updateTaskProgress(
  taskId: string,
  progressStep: 1 | 2 | 3 | 4 | 5,
  status?: WorkTask["status"]
) {
  const t = TASKS.find((x) => x.id === taskId);
  if (!t) return;
  t.progressStep = progressStep;
  if (status) t.status = status;
  // Simulate async persistence
  await new Promise((r) => setTimeout(r, 100));
  return t;
}
