// src/app/components/employee/dashboard/TimeLoggingCard.tsx
"use client";

import { Pause, Square, Play } from "lucide-react";
import React, { useState, useEffect, useRef } from 'react';
import { startTimeLog, updateActiveLogTime, stopTimeLog } from "@/lib/timeLoggingStore";

// --- MODIFICATION: `isClockedIn` is no longer part of the props ---
type TaskProps = {
  task: { id: string; title: string; } | null;
};

const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map(v => v.toString().padStart(2, '0')).join(':');
};

// --- MODIFICATION: The component no longer accepts `isClockedIn` ---
export default function TimeLoggingCard({ task }: TaskProps) {
    const [isActive, setIsActive] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Reset timer when a new task is selected
    useEffect(() => {
        setIsActive(false);
        setTimeElapsed(0);
    }, [task]);
    
    // --- MODIFICATION: The useEffect that watched for `isClockedIn` has been removed ---

    // Timer logic
    useEffect(() => {
        if (isActive && task) {
            timerRef.current = setInterval(() => {
                setTimeElapsed(prev => {
                    const newTime = prev + 1;
                    updateActiveLogTime(newTime);
                    return newTime;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, task]);
  
    const mainContent = (
      <>
        <h3 className="text-base font-semibold mb-1.5">Time Logging</h3>
        <div className="rounded-lg bg-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] text-gray-500 mb-0.5">Current Task</p>
              <p className="text-sm font-semibold">{task ? task.title : 'No Task Selected'}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-red-600 leading-none tabular-nums">{formatTime(timeElapsed)}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Task Duration</div>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
             {/* --- MODIFICATION: Button is only disabled if no task is selected --- */}
             <button 
                  onClick={() => {
                      if (!isActive && task) {
                          // Starting the timer
                          startTimeLog(task.id, task.title);
                          setIsActive(true);
                      } else if (isActive) {
                          // Pausing the timer
                          setIsActive(false);
                      }
                  }}
                  disabled={!task}
                  className="inline-flex w-20 justify-center items-center gap-1.5 rounded-lg bg-black text-white px-2.5 py-1 text-xs hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  {isActive ? 'Pause' : 'Start'}
             </button>
             <button 
                  onClick={() => { 
                      stopTimeLog();
                      setIsActive(false); 
                      setTimeElapsed(0); 
                  }}
                  disabled={!task}
                  className="inline-flex w-20 justify-center items-center gap-1.5 rounded-lg bg-red-600 text-white px-2.5 py-1 text-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Square className="h-3 w-3" /> Stop
             </button>
          </div>
        </div>
      </>
    );

    const placeholderContent = (
        <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center text-sm">Select a task from the list below to start the timer.</p>
        </div>
    );
    
  return (
    // Minimal padding and compact layout - removed h-full to prevent stretching
  <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-transform hover:shadow-md hover:-translate-y-0.5 relative">
      {task ? mainContent : placeholderContent}
    </div>
  );
}