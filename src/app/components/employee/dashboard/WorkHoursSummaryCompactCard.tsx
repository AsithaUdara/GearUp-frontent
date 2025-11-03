// src/app/components/employee/dashboard/WorkHoursSummaryCompactCard.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

// Props that this component now accepts to be controlled by a parent
interface ShiftTimerProps {
  isClockedIn: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
}

const formatShiftDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    return `${paddedHours}h ${paddedMinutes}m`;
};

export default function WorkHoursSummaryCompactCard({ isClockedIn, onClockIn, onClockOut }: ShiftTimerProps) {
    // Timer-specific state remains within the component
    const [shiftSeconds, setShiftSeconds] = useState(0);
    const [clockInTime, setClockInTime] = useState<Date | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    
    useEffect(() => {
        if (isClockedIn) {
            // If the shift just started, capture the time
            if (shiftSeconds === 0) setClockInTime(new Date());

            timerRef.current = setInterval(() => {
                setShiftSeconds(prevSeconds => prevSeconds + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isClockedIn]);

    const handleStartShift = () => {
        setShiftSeconds(0); // Reset local timer on new shift start
        onClockIn(); // Tell the parent page that the shift has started
    };
    
    return (
        <div className="rounded-lg border bg-white p-5 shadow-md transition h-full">
            <h3 className="text-lg font-semibold mb-4">Log Work Hours</h3>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-gray-500 text-sm">Today's Hours</p>
                    <p className="text-2xl font-bold text-red-600 tabular-nums">
                        {formatShiftDuration(shiftSeconds)}
                    </p>
                </div>
                {clockInTime && isClockedIn && (
                    <p className="text-sm text-gray-500">
                        Clocked in: {clockInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}
            </div>
            <div className="mt-4 flex gap-3">
                {!isClockedIn ? (
                     <button
                        onClick={handleStartShift}
                        className="w-full rounded-lg bg-gray-200 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
                    > Start Shift </button>
                ) : (
                    <button
                        onClick={onClockOut}
                        className="w-full rounded-lg bg-black py-2 text-sm font-semibold text-white hover:opacity-90"
                    > End Shift </button>
                )}
            </div>
        </div>
    );
}