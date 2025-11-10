"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { format } from "date-fns";
import { Appointment } from "./page";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RescheduleDialogProps {
  appointment: Appointment | null;
  onClose: () => void;
  onReschedule: (id: number, newDate: Date, newTimeSlot: string) => void;
}

export default function RescheduleDialog({
  appointment,
  onClose,
  onReschedule,
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined
  );

  React.useEffect(() => {
    if (appointment) {
      setSelectedDate(new Date(appointment.date));
      setSelectedTime(appointment.timeSlot.split(" - ")[0]); // Pre-select start time
    }
  }, [appointment]);

  const timeSlots = [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  const handleRescheduleAction = () => {
    if (appointment && selectedDate && selectedTime) {
      const newTimeSlot = `${selectedTime} - ${
        timeSlots[timeSlots.indexOf(selectedTime) + 1] || "06:00 PM"
      }`;
      onReschedule(appointment.id, selectedDate, newTimeSlot);
      onClose();
    } else {
      toast.error("Please select a date and time.");
    }
  };

  return (
    <AlertDialog open={!!appointment} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reschedule Appointment</AlertDialogTitle>
          <AlertDialogDescription>
            Reschedule the appointment for{" "}
            <strong>{appointment?.customerName}</strong> (
            {appointment?.vehicleModel})
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="new-date">New Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    `w-full justify-start text-left font-normal ${
                      !selectedDate && "text-muted-foreground"
                    }`
                  )}
                  onClick={() => {
                    // If there is no selected date, open the calendar to today
                    if (!selectedDate) {
                      setSelectedDate(new Date());
                    }
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="new-time">Time Slot</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  className={cn(
                    buttonVariants({
                      variant: selectedTime === time ? "default" : "outline",
                      size: "sm",
                    })
                  )}
                  onClick={() => setSelectedTime(time)}
                >
                  <ClockIcon className="mr-1 h-3 w-3" />
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button
              className={cn(buttonVariants({ variant: "outline" }))}
              onClick={onClose}
            >
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              className={cn(buttonVariants({ variant: "default" }))}
              onClick={handleRescheduleAction}
            >
              Reschedule
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
