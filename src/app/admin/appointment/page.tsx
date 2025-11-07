"use client";
import React, { useEffect, useState, useCallback } from "react";
import AppointmentTable from "./AppointmentTable";
import ApproveDialog from "./ApproveDialog"; // Use ApproveDialog instead of ApprovalModal
import RejectCancelDialog from "./RejectCancelDialog"; // Import RejectCancelDialog
import RescheduleDialog from "./RescheduleDialog"; // Import RescheduleDialog
// import ViewDetailsDrawer from "./ViewDetailsDrawer"; // Import the new drawer component
import Header from "@/app/components/landing/Header";
import { toast } from "sonner";
import { Button, ButtonProps, buttonVariants } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  RotateCwIcon,
} from "lucide-react"; // Explicitly import icons
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation"; // Import useRouter

export interface Appointment {
  id: number;
  customerName: string;
  vehicleModel: string;
  date: string;
  timeSlot: string; // e.g., "9:00 AM - 10:00 AM"
  priority: "Normal" | "Urgent" | "VIP";
  customerContact: { phone: string; email: string };
  appointmentId: string; // short unique code
  duration: number; // estimated service time in minutes
  requestedBay?: string; // if applicable
  priceEstimate?: number | null; // or null if not available
  specialNotes?: string; // tooltip icon to preview
  serviceType: string;
  status:
    | "pending"
    | "approved"
    | "assigned"
    | "checked-in"
    | "in-service"
    | "completed"
    | "no-show"
    | "cancelled"
    | "rejected"
    | "rescheduled"
    | "locked";
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRejectCancelDialog, setShowRejectCancelDialog] = useState(false);
  const [rejectCancelActionType, setRejectCancelActionType] = useState<
    "reject" | "cancel"
  >("reject");
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"list" | "day" | "week">("list");

  const router = useRouter(); // Initialize useRouter

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/appointments");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      let data: Appointment[] = await res.json();

      // Apply quick filters if active
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split("T")[0];

      if (activeQuickFilter === "Today") {
        data = data.filter((app) => app.date === today);
      } else if (activeQuickFilter === "Tomorrow") {
        data = data.filter((app) => app.date === tomorrowString);
      } else if (activeQuickFilter === "Overdue") {
        data = data.filter(
          (app) =>
            new Date(app.date) < new Date(today) &&
            (app.status === "pending" ||
              app.status === "approved" ||
              app.status === "assigned")
        );
      } else if (activeQuickFilter === "Urgent") {
        data = data.filter((app) => app.priority === "Urgent");
      } else if (activeQuickFilter === "Unassigned") {
        data = data.filter(
          (app) => app.status === "approved" && !app.requestedBay
        );
      }
      // "By Service" filter would require another state and more complex logic

      setAppointments(data);
    } catch (e: any) {
      setError(e.message);
      toast.error("Failed to fetch appointments.");
    } finally {
      setLoading(false);
    }
  }, [activeQuickFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Update handleApprove to accept new parameters
  const handleApprove = async (
    id: number,
    timeSlot: string,
    employeeId?: string,
    notifyCustomer?: boolean,
    isAssignment?: boolean // New parameter to differentiate approve from assign
  ) => {
    try {
      // In a real application, this would be an API call to update the appointment
      console.log(
        `Approving appointment ${id} with timeSlot ${timeSlot}, employee: ${employeeId}, notify customer: ${notifyCustomer}, isAssignment: ${isAssignment}`
      );
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: isAssignment ? "assigned" : "approved", // Set status to 'assigned' if it's an assignment
                timeSlot: timeSlot,
                requestedBay: employeeId, // Using requestedBay to store employeeId for now
              }
            : a
        )
      );
      toast.success(
        isAssignment
          ? "Appointment assigned successfully!"
          : "Appointment approved successfully!"
      );
    } catch (e: any) {
      toast.error(
        isAssignment
          ? "Failed to assign appointment."
          : "Failed to approve appointment."
      );
    }
  };

  const handleAssign = async (
    id: number,
    timeSlot: string,
    employeeId?: string,
    onAssignmentSuccess?: () => void // New callback for assignment success
  ) => {
    try {
      // Find the appointment to be assigned from the current state
      const appointmentToAssign = appointments.find((app) => app.id === id);

      if (!appointmentToAssign) {
        throw new Error("Appointment not found for assignment.");
      }

      // Prepare the data to be sent to the assigned-appointments API
      const assignedData = {
        ...appointmentToAssign,
        timeSlot: timeSlot,
        requestedBay: employeeId,
        status: "assigned", // Update status to assigned
      };

      const res = await fetch("/api/assigned-appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignedData),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // After successful assignment, update the local state to reflect the change
      // This ensures the main appointments table (for approval) is also updated
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: "assigned",
                requestedBay: employeeId,
                timeSlot: timeSlot,
              }
            : a
        )
      );

      toast.success("Appointment assigned successfully!");
      onAssignmentSuccess?.(); // Call the callback to refresh the assigned appointments list
      router.push("/admin/assign"); // Navigate to the assigned appointments page
    } catch (e: any) {
      console.error("Failed to assign appointment:", e);
      toast.error("Failed to assign appointment.");
    }
  };

  const handleBulkAssign = async (ids: number[]) => {
    try {
      // This would be a real API call to assign appointments
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      setAppointments((prev) =>
        prev.map((a) => (ids.includes(a.id) ? { ...a, status: "assigned" } : a))
      );
      toast.success(`Assigned ${ids.length} appointments successfully!`);
    } catch (e: any) {
      toast.error("Failed to assign appointments.");
    }
  };

  const handleReject = async (
    id: number,
    reason: string,
    notifyCustomer: boolean
  ) => {
    try {
      console.log(
        `Rejecting appointment ${id} for reason: ${reason}, notify customer: ${notifyCustomer}`
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: "rejected", specialNotes: reason } : a
        )
      );
      toast.success("Appointment rejected successfully!");
    } catch (e: any) {
      toast.error("Failed to reject appointment.");
    }
  };

  const handleCancel = async (
    id: number,
    reason: string,
    notifyCustomer: boolean,
    reschedule?: boolean
  ) => {
    try {
      console.log(
        `Cancelling appointment ${id} for reason: ${reason}, notify customer: ${notifyCustomer}, reschedule: ${reschedule}`
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: "cancelled", specialNotes: reason } : a
        )
      );
      toast.success("Appointment cancelled successfully!");
      if (reschedule) {
        // Trigger reschedule dialog/flow here
        toast.info("Initiating reschedule process...");
      }
    } catch (e: any) {
      toast.error("Failed to cancel appointment.");
    }
  };

  const handleReschedule = async (
    id: number,
    newDate: Date,
    newTimeSlot: string
  ) => {
    try {
      console.log(
        `Rescheduling appointment ${id} to ${
          newDate.toISOString().split("T")[0]
        } ${newTimeSlot}`
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                date: newDate.toISOString().split("T")[0],
                timeSlot: newTimeSlot,
                status: "rescheduled",
              }
            : a
        )
      );
      toast.success("Appointment rescheduled successfully!");
    } catch (e: any) {
      toast.error("Failed to reschedule appointment.");
    }
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-wide uppercase mb-6 text-center">
          Appointments for Approval
        </h1>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {[
            "Today",
            "Tomorrow",
            "Overdue",
            "Urgent",
            "Unassigned",
            "By Service",
          ].map((filter) => (
            <Button
              key={filter}
              className={cn(
                buttonVariants({
                  variant:
                    activeQuickFilter === filter ? "default" : "secondary",
                  size: "sm",
                }),
                "hover:bg-primary/90 hover:text-primary-foreground"
              )}
              onClick={() => setActiveQuickFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-end mb-4">
          <div className="inline-flex rounded-md shadow-sm">
            <Button
              className={cn(
                buttonVariants({
                  variant: viewMode === "list" ? "default" : "secondary",
                }),
                "rounded-r-none"
              )}
              onClick={() => setViewMode("list")}
            >
              List View
            </Button>
            <Button
              className={cn(
                buttonVariants({
                  variant: viewMode === "day" ? "default" : "secondary",
                }),
                "rounded-none"
              )}
              onClick={() => setViewMode("day")}
            >
              Day View
            </Button>
            <Button
              className={cn(
                buttonVariants({
                  variant: viewMode === "week" ? "default" : "secondary",
                }),
                "rounded-l-none"
              )}
              onClick={() => setViewMode("week")}
            >
              Week View
            </Button>
          </div>
        </div>

        {viewMode === "list" ? (
          <AppointmentTable
            appointments={appointments}
            onApprove={handleApprove}
            onSelect={(app) => {
              setSelectedApp(app);
              setShowRejectCancelDialog(false);
            }}
            onAssign={handleBulkAssign}
            onReject={(app) => {
              setSelectedApp(app);
              setRejectCancelActionType("reject");
              setShowRejectCancelDialog(true);
            }}
            onCancel={(app) => {
              setSelectedApp(app);
              setRejectCancelActionType("cancel");
              setShowRejectCancelDialog(true);
            }}
            onReschedule={(app) => {
              setSelectedApp(app);
              setShowRescheduleDialog(true);
            }}
            onOpenApproveDialog={(app) => {
              setSelectedApp(app);
              setIsApproveDialogOpen(true);
            }}
            loading={loading}
            error={error}
          />
        ) : (
          <div className="mt-6 p-4 border rounded-lg bg-white text-center text-muted-foreground">
            <p>Calendar view ({viewMode}) not yet fully implemented.</p>
            <p>Displaying appointments in a {viewMode} layout would go here.</p>
          </div>
        )}

        {selectedApp && (
          <ApproveDialog // Use ApproveDialog
            appointment={selectedApp}
            onClose={() => {
              setIsApproveDialogOpen(false);
              setSelectedApp(null);
            }}
            onApprove={handleApprove}
            onAssign={handleAssign}
            open={isApproveDialogOpen}
            onAssignmentSuccess={fetchAppointments} // Pass the refresh function
          />
        )}

        {selectedApp && showRejectCancelDialog && (
          <RejectCancelDialog
            appointment={selectedApp}
            onClose={() => {
              setShowRejectCancelDialog(false);
              setSelectedApp(null);
            }}
            onConfirm={(id, reason, notifyCustomer, reschedule) => {
              if (rejectCancelActionType === "reject") {
                handleReject(id, reason, notifyCustomer);
              } else {
                handleCancel(id, reason, notifyCustomer, reschedule);
              }
            }}
            actionType={rejectCancelActionType}
          />
        )}

        {selectedApp && showRescheduleDialog && (
          <RescheduleDialog
            appointment={selectedApp}
            onClose={() => {
              setShowRescheduleDialog(false);
              setSelectedApp(null);
            }}
            onReschedule={handleReschedule}
          />
        )}

        {/* <ViewDetailsDrawer
          appointment={selectedApp}
          onClose={() => setSelectedApp(null)}
        /> */}
      </div>
    </>
  );
}
