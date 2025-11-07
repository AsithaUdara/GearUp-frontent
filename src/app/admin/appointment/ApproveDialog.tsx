"use client";

import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  PhoneIcon,
  MailIcon,
  CarIcon,
  ClockIcon,
  TagIcon,
  PencilIcon,
  AlertCircleIcon,
} from "lucide-react";
import { Appointment } from "./types";

interface Employee {
  id: number;
  name: string;
}

interface ApproveDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
  onApprove: (
    id: number,
    timeSlot: string,
    employeeId?: string,
    notifyCustomer?: boolean,
    isAssignment?: boolean
  ) => void;
  onAssign: (
    id: number,
    timeSlot: string,
    employeeId?: string,
    onAssignmentSuccess?: () => void
  ) => void;
  onAssignmentSuccess?: () => void;
}

export default function ApproveDialog({
  appointment,
  open,
  onClose,
  onApprove,
  onAssign,
  onAssignmentSuccess,
}: ApproveDialogProps) {
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [serviceAdvisor, setServiceAdvisor] = useState<string>("");
  const [conflictWarning, setConflictWarning] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeFreeSlots, setEmployeeFreeSlots] = useState<string[]>([]);

  // Reset local state when a new appointment is loaded
  useEffect(() => {
    if (appointment) {
      setNewTimeSlot(
        `${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`
      );
      setServiceAdvisor("");
      setConflictWarning(false);
    }
  }, [appointment]);

  // Load employees once when component mounts
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch("/api/employees/available");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Employee[] = await res.json();
        setEmployees(data);
        console.log("✅ Employees loaded successfully:", data);
      } catch (err) {
        console.error("❌ Failed to fetch employees:", err);
        toast.error("Failed to load employee list.");
      }
    }
    fetchEmployees();
  }, []);

  // Load employee free slots when advisor or date changes
  useEffect(() => {
    async function fetchEmployeeSlots() {
      if (serviceAdvisor && appointment?.date) {
        try {
          const res = await fetch(
            `/api/employees/${serviceAdvisor}/free-slots?date=${appointment.date}`
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data: string[] = await res.json();
          setEmployeeFreeSlots(data);
        } catch (err) {
          console.error("Failed to fetch free slots:", err);
          toast.error("Failed to load employee free slots.");
          setEmployeeFreeSlots([]);
        }
      } else {
        setEmployeeFreeSlots([]);
      }
    }
    fetchEmployeeSlots();
  }, [serviceAdvisor, appointment?.date]);

  function handleApprove() {
    if (!appointment) return;
    if (conflictWarning) {
      toast.warning("Capacity conflict detected. Proceed with caution.");
    }
    onApprove(appointment.id, newTimeSlot, serviceAdvisor, false, false);
    onClose();
  }

  async function handleAssign() {
    if (!appointment || !serviceAdvisor) {
      toast.warning("Please select an employee to assign the appointment.");
      return;
    }

    console.log("🚀 Assigning employee...", {
      appointmentId: appointment.id,
      employeeId: serviceAdvisor,
      timeSlot: newTimeSlot,
    });

    try {
      const url = `http://localhost:8084/api/bookings/${
        appointment.id
      }/assign?employeeId=${serviceAdvisor}&timeSlot=${encodeURIComponent(
        newTimeSlot
      )}`;
      const res = await fetch(url, { method: "PUT" });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const updatedBooking = await res.json();

      console.log("✅ Employee assigned successfully!", {
        bookingId: updatedBooking.id,
        assignedEmployeeId: serviceAdvisor,
        response: updatedBooking,
      });

      toast.success("Employee assigned successfully!");

      // Call the parent's assignment success handler
      if (onAssignmentSuccess) {
        onAssignmentSuccess();
      }

      onAssign(
        appointment.id,
        newTimeSlot,
        serviceAdvisor,
        onAssignmentSuccess
      );
    } catch (err) {
      console.error("❌ Failed to assign employee:", err);
      toast.error("Failed to assign employee. Please try again.");
    }

    onClose();
  }

  if (!appointment) return null;

  const getStatusVariant = (status: Appointment["status"]) => {
    switch (status) {
      case "PENDING":
        return "pending";
      case "CONFIRMED":
        return "approved";
      case "CANCELLED":
        return "cancelled";
      default:
        return "default";
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[800px] p-6 max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold">
            Approve Appointment&nbsp;
            <span className="text-primary">#{appointment.id}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Review and confirm the appointment details below.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid md:grid-cols-2 gap-8 py-4">
          {/* Left column */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CarIcon className="h-5 w-5 text-primary" /> Customer & Vehicle
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Customer Name:</div>
              <div>{appointment.customerName}</div>
              <div className="font-medium">Contact:</div>
              <div className="flex flex-col">
                <a
                  href={`tel:${appointment.customerPhone}`}
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <PhoneIcon className="h-4 w-4" />
                  {appointment.customerPhone}
                </a>
                <a
                  href={`mailto:${appointment.customerEmail}`}
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <MailIcon className="h-4 w-4" />
                  {appointment.customerEmail}
                </a>
              </div>
            </div>

            <Separator className="my-4" />

            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TagIcon className="h-5 w-5 text-primary" /> Service Summary
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Service:</div>
              <div>{appointment.serviceName}</div>
              {appointment.notes && (
                <>
                  <div className="font-medium">Notes:</div>
                  <div>{appointment.notes}</div>
                </>
              )}
            </div>

            <Separator className="my-4" />

            <h3 className="font-semibold text-lg flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-primary" /> Status
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>
          </div>

          {/* Right column */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <PencilIcon className="h-5 w-5 text-primary" /> Approval &
              Assignment
            </h3>
            <div className="grid gap-4 rounded-lg border p-4 shadow-sm">
              <div className="grid gap-2">
                <Label>Time Slot</Label>
                <Input
                  value={`${appointment.timeSlot?.startTime ?? ""} - ${
                    appointment.timeSlot?.endTime ?? ""
                  }`}
                  readOnly
                />
                <p className="text-sm text-muted-foreground">
                  Date:{" "}
                  {appointment.timeSlot?.slotDate
                    ? format(new Date(appointment.timeSlot.slotDate), "PPP")
                    : ""}
                </p>
                {conflictWarning && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <AlertCircleIcon className="h-4 w-4" />
                    Potential capacity conflict!
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Employee</Label>
                <Select
                  value={serviceAdvisor}
                  onValueChange={(value) => setServiceAdvisor(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent className="z-[999]" position="popper">
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={String(emp.id)}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {employeeFreeSlots.length > 0 && (
                <div className="grid gap-2">
                  <Label>Available Time Slots</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {employeeFreeSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={newTimeSlot === slot ? "default" : "outline"}
                        onClick={() => setNewTimeSlot(slot)}
                        size="sm"
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <AlertDialogFooter className="bg-gray-50 px-6 py-4 -mx-6 -mb-6 flex justify-between">
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <Button
            variant="secondary"
            onClick={handleAssign}
            disabled={!serviceAdvisor}
          >
            Assign Appointment
          </Button>
          <AlertDialogAction asChild>
            <Button onClick={handleApprove}>Approve Appointment</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
