// src/app/components/employee/dashboard/TimeLoggingCard.tsx
"use client";

import { Pause, Square, Play } from "lucide-react";
import React, { useState, useEffect, useRef } from 'react';
import { startTaskTimeLog, stopTaskTimeLog } from '@/lib/trackingApi';

type TaskProps = {
  task: { id: string; title: string; } | null;
  user?: { getIdToken?: () => Promise<string> } | null;
};

const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map(v => v.toString().padStart(2, '0')).join(':');
};

export default function TimeLoggingCard({ task, user }: TaskProps) {
    const [isActive, setIsActive] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);

    // Reset timer when a new task is selected
    useEffect(() => {
        setIsActive(false);
        setTimeElapsed(0);
        startTimeRef.current = null;
    }, [task]);

    // Timer logic
    useEffect(() => {
        if (isActive && task) {
            if (startTimeRef.current === null) {
                startTimeRef.current = Date.now();
            }
            timerRef.current = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, task]);

    const handleStart = async () => {
        if (!task) return;
        
        try {
            setIsSaving(true);
            // Start the task in the backend (set status to in_progress)
            await startTaskTimeLog(task.id, user);
            setIsActive(true);
        } catch (error) {
            console.error('Failed to start task:', error);
            alert('Failed to start task. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePause = () => {
        setIsActive(false);
        // Don't save on pause - just pause the timer
        // Time will be saved when user clicks Stop
    };

    const handleStop = async () => {
        if (!task) return;
        
        setIsActive(false);
        
        if (timeElapsed > 0) {
            try {
                setIsSaving(true);
                const minutes = Math.floor(timeElapsed / 60);
                // Save the actual duration to the backend
                await stopTaskTimeLog(task.id, minutes, user);
                // Reset timer after saving
                setTimeElapsed(0);
                startTimeRef.current = null;
            } catch (error) {
                console.error('Failed to stop task:', error);
                alert('Failed to save time log. Please try again.');
            } finally {
                setIsSaving(false);
            }
        } else {
            setTimeElapsed(0);
            startTimeRef.current = null;
        }
    };
  
    const mainContent = (
      <>
        <h3 className="text-lg font-semibold mb-3">Time Logging</h3>
        <div className="rounded-lg bg-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500">Current Task</p>
              <p className="text-sm font-semibold">{task ? task.title : 'No Task Selected'}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600 leading-none tabular-nums">{formatTime(timeElapsed)}</div>
              <div className="text-xs text-gray-500">Task Duration</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
             <button 
                  onClick={isActive ? handlePause : handleStart}
                  disabled={!task || isSaving}
                  className="inline-flex w-24 justify-center items-center gap-2 rounded-lg bg-black text-white px-3 py-1.5 text-xs hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {isSaving ? 'Saving...' : (isActive ? 'Pause' : 'Start')}
             </button>
             <button 
                  onClick={handleStop}
                  disabled={!task || isSaving || (!isActive && timeElapsed === 0)}
                  className="inline-flex w-24 justify-center items-center gap-2 rounded-lg bg-red-600 text-white px-3 py-1.5 text-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Square className="h-3.5 w-3.5" /> Stop
             </button>
          </div>
        </div>
      </>
    );

    const placeholderContent = (
        <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center text-sm p-4">Select a task from the list below to start the timer.</p>
        </div>
    );
    
  return (
    // Keep the card compact: remove h-full so it doesn't stretch vertically,
    // add a small min-height so it still looks balanced when empty.
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-transform hover:shadow-md hover:-translate-y-0.5 relative min-h-[120px] h-full">
      {task ? mainContent : placeholderContent}
    </div>
  );
}