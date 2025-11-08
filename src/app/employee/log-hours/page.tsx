// src/app/employee/log-hours/page.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import TimeLoggingCard from "@/app/components/employee/dashboard/TimeLoggingCard";
import AssignedTasksList, { Task } from "@/app/components/employee/dashboard/AssignedTasksList";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getEmployeeTasks, TaskResponse } from "@/lib/trackingApi";

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{subtitle}</p>
    </div>
);

// Helper function to map backend TaskResponse to frontend Task
function mapTaskResponseToTask(task: TaskResponse): Task {
  const statusMap: Record<string, Task["status"]> = {
    'pending': 'Pending',
    'in_progress': 'In Progress',
    'completed': 'Completed'
  };
  
  return {
    id: task.taskId,
    title: `${task.serviceType} - ${task.vehicle}`,
    customer: task.customer,
    vehicle: task.vehicle,
    status: statusMap[task.status] || 'Pending'
  };
}

export default function LogHoursPage() {
    const { user } = useAuth();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // TODO: Replace with actual employeeId from user profile or token
    // For now, using a mock employee ID - in production, get from user.uid or user profile
    const employeeId = "emp-001";

    // Fetch tasks from backend
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getEmployeeTasks(
                    employeeId,
                    user as { getIdToken?: () => Promise<string> } | null
                );
                
                // Debug: Log the response to see what we're getting
                console.log('API Response:', {
                    assignedTasks: response.assignedTasks?.length || 0,
                    inWorkTasks: response.inWorkTasks?.length || 0,
                    completedTasks: response.completedTasks?.length || 0,
                    totalAssigned: response.totalAssigned,
                    totalInProgress: response.totalInProgress,
                    totalCompleted: response.totalCompleted
                });
                console.log('Assigned Tasks:', response.assignedTasks);
                console.log('In Work Tasks:', response.inWorkTasks);
                
                // For "My Assigned Tasks", we want to show:
                // 1. All assigned tasks (which includes pending + in_progress)
                // 2. Also include in work tasks (in_progress) from work_task table to ensure we get all
                // Note: assignedTasks already includes inWorkTasks, but we include inWorkTasks separately
                // to ensure we don't miss any in_progress tasks
                const assignedTasksList = [
                    ...response.assignedTasks,
                    ...(response.inWorkTasks || [])
                ];
                
                // Remove duplicates based on taskId before mapping
                const uniqueAssignedTasks = Array.from(
                    new Map(assignedTasksList.map(task => [task.taskId, task])).values()
                );
                
                // Map to frontend Task format
                const mappedTasks = uniqueAssignedTasks.map(mapTaskResponseToTask);
                
                console.log('Final assigned tasks to display:', mappedTasks.length, mappedTasks);
                
                setTasks(mappedTasks);
                
                // If there's a current task, select it by default
                if (response.currentTask) {
                    setSelectedTask(mapTaskResponseToTask(response.currentTask));
                }
            } catch (err) {
                console.error('Failed to fetch tasks:', err);
                setError(err instanceof Error ? err.message : 'Failed to load tasks. Please check if the backend is running.');
                // Keep empty tasks array on error
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };

        if (employeeId) {
            fetchTasks();
        }
    }, [employeeId, user]);

    const filteredTasks = useMemo(() => {
      if (!searchQuery) return tasks;
      return tasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [searchQuery, tasks]);

    return (
        <section className="p-8 space-y-8">
            <SectionHeader 
                title="Task Time Logging" 
                subtitle="Select a task and use the timer to log your work." 
            />

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-800 text-sm">{error}</p>
                </div>
            )}

            {/* --- MODIFICATION: The layout is now a single column focused on the task timer --- */}
            <div className="max-w-2xl mx-auto">
                 <h2 className="text-lg font-semibold text-gray-800 mb-2">Current Task Timer</h2>
                <TimeLoggingCard 
                    task={selectedTask}
                    user={user as { getIdToken?: () => Promise<string> } | null}
                />
            </div>

            <div className="mt-12">
                 <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">My Assigned Tasks</h2>
                        <p className="text-sm text-gray-500">
                            {loading ? 'Loading tasks...' : 'Select a task from this list to begin logging time against it.'}
                        </p>
                    </div>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input 
                            type="text" 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            placeholder="Search tasks..." 
                            className="w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            disabled={loading}
                        />
                    </div>
                 </div>

                <div className="mt-4">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading tasks...</div>
                  ) : (
                    <AssignedTasksList 
                        tasks={filteredTasks}
                        onTaskSelect={setSelectedTask} 
                        selectedTaskId={selectedTask ? selectedTask.id : null}
                    />
                  )}
                </div>
            </div>
        </section>
    );
}