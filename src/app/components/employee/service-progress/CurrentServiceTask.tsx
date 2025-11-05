"use client";

import { useEffect, useState } from "react";
import { Upload, Clock, User, Car, Wrench } from "lucide-react";
import type { WorkTask } from "@/lib/workScheduleData";

interface CurrentServiceTaskProps {
  task: WorkTask;
  onTaskUpdate: (task: WorkTask) => void;
}

export default function CurrentServiceTask({ task, onTaskUpdate }: CurrentServiceTaskProps) {
  const [notes, setNotes] = useState(task.notes ?? "");
  const [status, setStatus] = useState(task.status);
  const [progressStep, setProgressStep] = useState<1 | 2 | 3 | 4 | 5>(task.progressStep ?? 1);

  // Sync local state when parent passes a different task
  useEffect(() => {
    setNotes(task.notes ?? "");
    setStatus(task.status);
    setProgressStep((task.progressStep as 1 | 2 | 3 | 4 | 5) ?? 1);
  }, [task.serviceId, task.status, task.notes, task.progressStep]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    onTaskUpdate({ ...task, notes: value });
  };

  const handleStatusChange = (value: WorkTask["status"]) => {
    setStatus(value);
    const updated: WorkTask = { ...task, status: value };
    if (value === "in-progress") {
      const nextStep = (task.progressStep as 1 | 2 | 3 | 4 | 5) || 1;
      setProgressStep(nextStep);
      updated.progressStep = nextStep;
    } else {
      updated.progressStep = undefined as unknown as 1 | 2 | 3 | 4 | 5;
    }
    onTaskUpdate(updated);
  };

  const handleProgressChange = (value: 1 | 2 | 3 | 4 | 5) => {
    setProgressStep(value);
    onTaskUpdate({ ...task, progressStep: value, status });
  };

  const handleMarkComplete = () => {
    setStatus("completed");
    setProgressStep(5);
    onTaskUpdate({ ...task, status: "completed", progressStep: 5 });
  };

  const handleUpdateStatus = () => {
    onTaskUpdate({ ...task, status, progressStep });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-red-100 rounded-full">
          <Clock className="h-5 w-5 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Current Service Task</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Service Details */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Service ID</label>
            <p className="text-lg font-semibold text-gray-900">{task.serviceId}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Customer</label>
            <div className="flex items-center gap-2 mt-1">
              <User className="h-4 w-4 text-red-600" />
              <p className="text-gray-900 font-medium">{task.customer}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Vehicle</label>
            <div className="flex items-center gap-2 mt-1">
              <Car className="h-4 w-4 text-red-600" />
              <p className="text-gray-900 font-medium">{task.vehicle}</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Service Type</label>
            <div className="flex items-center gap-2 mt-1">
              <Wrench className="h-4 w-4 text-red-600" />
              <p className="text-gray-900 font-medium">{task.serviceType}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Update Status */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Update Status
        </label>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as WorkTask["status"])}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Progress 1-5 - only visible when in progress */}
      {status === "in-progress" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Progress (1–5)</label>
          <div className="flex items-center gap-2">
            {[1,2,3,4,5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleProgressChange(n as 1|2|3|4|5)}
                className={`h-8 w-8 rounded-full border text-sm font-semibold ${progressStep >= n ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700 border-gray-300"}`}
                aria-pressed={progressStep === n}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Add detailed notes about the service, parts used, or issues encountered..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
        />
      </div>

      {/* Attachments */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            <button className="text-red-600 hover:text-red-700 font-medium">
              Upload a file
            </button>
            {" "}or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={handleUpdateStatus}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
        >
          Update Status
        </button>
        <button
          onClick={handleMarkComplete}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
        >
          Mark as Complete
          <span className="text-lg">✓</span>
        </button>
      </div>
    </div>
  );
}