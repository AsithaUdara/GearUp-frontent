// src/app/components/employee/dashboard/TimeLoggingCard.tsx
"use client";

import { Pause, Square, PenSquare, Play } from "lucide-react";
import React, { useState, useEffect, useRef } from 'react';

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
            timerRef.current = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, task]);
  
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
             {/* --- MODIFICATION: Button is only disabled if no task is selected --- */}
             <button 
                  onClick={() => setIsActive(!isActive)}
                  disabled={!task}
                  className="inline-flex w-24 justify-center items-center gap-2 rounded-lg bg-black text-white px-3 py-1.5 text-xs hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {isActive ? 'Pause' : 'Start'}
             </button>
             <button 
                  onClick={() => { setIsActive(false); setTimeElapsed(0); }}
                  disabled={!task}
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
        // --- MODIFICATION: The overlay has been removed ---
        <div className="rounded-lg border border-white bg-white p-6 shadow-sm transition-transform hover:shadow-md hover:-translate-y-0.5 h-full relative">
            {task ? mainContent : placeholderContent}
        </div>
    );
}