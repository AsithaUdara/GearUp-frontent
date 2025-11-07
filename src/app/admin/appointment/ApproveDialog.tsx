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
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Appointment } from "./page";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  PhoneIcon,
  MailIcon,
  CarIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  PencilIcon,
  DollarSignIcon,
  AlertCircleIcon,
} from "lucide-react";

interface Employee {
  id: number;
  name: string;
}

interface ApproveDialogProps {
  appointment: Appointment | null;
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
  open: boolean;
  onAssignmentSuccess?: () => void; // Add this line
}

export default function ApproveDialog({
  appointment,
  onClose,
  onApprove,
  onAssign,
  open,
  onAssignmentSuccess, // Destructure the new prop
}: ApproveDialogProps) {
  const [newTimeSlot, setNewTimeSlot] = useState(appointment?.timeSlot || "");
  const [serviceAdvisor, setServiceAdvisor] = useState<string | undefined>(
    undefined
  );
  // const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [conflictWarning, setConflictWarning] = useState(false); // Placeholder for actual conflict detection
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeFreeSlots, setEmployeeFreeSlots] = useState<string[]>([]);

  React.useEffect(() => {
    if (appointment) {
      setNewTimeSlot(appointment.timeSlot);
      setServiceAdvisor(undefined);
      // setNotifyCustomer(true);
      setConflictWarning(false); // Reset on new appointment
    }
  }, [appointment]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees/available");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: Employee[] = await res.json();
        setEmployees(data);
        console.log("Fetched employees:", data);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        toast.error("Failed to load employee list.");
      }
    };
    fetchEmployees();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    const fetchEmployeeSlots = async () => {
      if (serviceAdvisor && appointment?.date) {
        try {
          const res = await fetch(
            `/api/employees/${serviceAdvisor}/free-slots?date=${appointment.date}`
          );
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data: string[] = await res.json();
          setEmployeeFreeSlots(data);
          console.log("Fetched employee free slots:", data);
        } catch (error) {
          console.error("Failed to fetch employee free slots:", error);
          toast.error("Failed to load employee free slots.");
          setEmployeeFreeSlots([]); // Clear slots on error
        }
      } else {
        setEmployeeFreeSlots([]); // Clear slots if no employee or date selected
      }
    };
    fetchEmployeeSlots();
  }, [serviceAdvisor, appointment?.date]); // Re-fetch when selected employee or date changes

  const handleApproveAction = () => {
    if (appointment) {
      // In a real app, you'd perform a more robust capacity check
      if (conflictWarning) {
        toast.warning("Capacity conflict detected. Proceed with caution.");
      }
      onApprove(
        appointment.id,
        newTimeSlot,
        serviceAdvisor,
        false, // notifyCustomer is always false now
        false // This is an approval, not a direct assignment
      );
      onClose();
    }
  };

  const handleAssignAction = () => {
    if (appointment && serviceAdvisor) {
      onAssign(
        appointment.id,
        newTimeSlot,
        serviceAdvisor,
        onAssignmentSuccess
      );
      onClose();
    } else {
      toast.warning("Please select an employee to assign the appointment.");
    }
  };

  // Dummy list of employees for the select dropdown
  // const employees = [
  //   { id: "emp1", name: "Alice Johnson" },
  //   { id: "emp2", name: "Bob Williams" },
  //   { id: "emp3", name: "Charlie Brown" },
  // ];

  if (!appointment) return null; // Don't render if no appointment is selected

  const getStatusVariant = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return "pending";
      case "approved":
        return "approved";
      case "assigned":
        return "assigned";
      case "checked-in":
        return "checked-in";
      case "in-service":
        return "in-service";
      case "completed":
        return "completed";
      case "no-show":
        return "no-show";
      case "cancelled":
        return "cancelled";
      case "rejected":
        return "rejected";
      case "rescheduled":
        return "rescheduled";
      case "locked":
        return "locked";
      default:
        return "default";
    }
  };

  const getPriorityVariant = (priority: Appointment["priority"]) => {
    switch (priority) {
      case "Urgent":
        return "destructive";
      case "VIP":
        return "default";
      case "Normal":
      default:
        return "secondary";
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[800px] p-6 max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold">
            Approve Appointment #
            <span className="text-primary">{appointment.appointmentId}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Review and confirm the appointment details below.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid md:grid-cols-2 gap-8 py-4">
          {/* Left Column: Details */}
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
                  href={`tel:${appointment.customerContact.phone}`}
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <PhoneIcon className="h-4 w-4" />
                  {appointment.customerContact.phone}
                </a>
                <a
                  href={`mailto:${appointment.customerContact.email}`}
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <MailIcon className="h-4 w-4" />
                  {appointment.customerContact.email}
                </a>
              </div>
              <div className="font-medium">Vehicle:</div>
              <div>{appointment.vehicleModel}</div>
              <div className="font-medium">License Plate:</div>
              <div>{appointment.appointmentId}</div>
              {/* Assuming appointmentId can be used as a placeholder for license plate for now */}
            </div>

            <Separator className="my-4" />

            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TagIcon className="h-5 w-5 text-primary" /> Service Summary
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Service Type:</div>
              <div>{appointment.serviceType}</div>
              <div className="font-medium">Duration:</div>
              <div>{appointment.duration} minutes</div>
              <div className="font-medium">Price Estimate:</div>
              <div>
                {appointment.priceEstimate
                  ? `$${appointment.priceEstimate.toFixed(2)}`
                  : "N/A"}
              </div>
              {appointment.specialNotes && (
                <>
                  <div className="font-medium">Notes:</div>
                  <div>{appointment.specialNotes}</div>
                </>
              )}
            </div>

            <Separator className="my-4" />

            <h3 className="font-semibold text-lg flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-primary" /> Status & Priority
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(appointment.status)}>
                {appointment.status.charAt(0).toUpperCase() +
                  appointment.status.slice(1)}
              </Badge>
              <Badge variant={getPriorityVariant(appointment.priority)}>
                {appointment.priority}
              </Badge>
            </div>
          </div>

          {/* Right Column: Approval Controls */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <PencilIcon className="h-5 w-5 text-primary" /> Approval &
              Assignment
            </h3>
            <div className="grid gap-4 rounded-lg border p-4 shadow-sm">
              <div className="grid gap-2">
                <Label htmlFor="newTimeSlot" className="text-left">
                  Time Slot
                </Label>
                <Input
                  id="newTimeSlot"
                  type="text"
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Current: {appointment.timeSlot} on{" "}
                  {format(new Date(appointment.date), "PPP")}
                </p>
                {conflictWarning && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <AlertCircleIcon className="h-4 w-4" />
                    Potential capacity conflict!
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="serviceAdvisor" className="text-left">
                  Employee
                </Label>
                <Select
                  value={serviceAdvisor}
                  onValueChange={(value) => {
                    console.log("Selected employee ID:", value);
                    setServiceAdvisor(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an employee">
                      {serviceAdvisor
                        ? employees.find(
                            (emp) => emp.id.toString() === serviceAdvisor
                          )?.name
                        : "Select an employee"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-[999]" position="popper">
                    {employees.map((employee) => (
                      <SelectItem
                        key={employee.id}
                        value={employee.id.toString()}
                      >
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {employeeFreeSlots.length > 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="freeTimeSlot" className="text-left">
                    Available Time Slots
                  </Label>
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

              {/* <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify-customer"
                  checked={notifyCustomer}
                  onCheckedChange={(checked: boolean) =>
                    setNotifyCustomer(checked)
                  }
                />
                <Label htmlFor="notify-customer">Notify customer</Label>
              </div> */}
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
            onClick={handleAssignAction}
            disabled={!serviceAdvisor}
          >
            Assign Appointment
          </Button>
          <AlertDialogAction asChild>
            <Button onClick={handleApproveAction}>Approve Appointment</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
