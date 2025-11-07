"use client";
import React, { useEffect, useState, useCallback } from "react";
import AppointmentTable from "./AppointmentTable";
import ApproveDialog from "./ApproveDialog";
import RejectCancelDialog from "./RejectCancelDialog";
import RescheduleDialog from "./RescheduleDialog";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

import { Appointment } from "./types";

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

  const router = useRouter();

  // 🔹 Fetch appointments
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/appointments");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      let data: Appointment[] = await res.json();

      // apply quick filters
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split("T")[0];

      if (activeQuickFilter === "Today") {
        data = data.filter((a) => a.timeSlot.slotDate === today);
      } else if (activeQuickFilter === "Tomorrow") {
        data = data.filter((a) => a.timeSlot.slotDate === tomorrowString);
      } else if (activeQuickFilter === "Overdue") {
        data = data.filter(
          (a) =>
            new Date(a.timeSlot.slotDate) < new Date(today) &&
            a.status === "CONFIRMED"
        );
      }

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

  // 🔹 Approve (confirm)
  async function handleApprove(id: number) {
    try {
      const res = await fetch(
        `http://localhost:8084/api/bookings/${id}/approve`,
        { method: "PUT", headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Failed to approve booking");
      await fetchAppointments();
      toast.success("Appointment confirmed successfully!");
    } catch (err) {
      toast.error("Failed to confirm appointment.");
      console.error(err);
    }
  }

  // 🔹 Assign  (still marks confirmed)
  async function handleAssign(
    id: number,
    timeSlot: string,
    employeeId?: string,
    onAssignmentSuccess?: () => void
  ) {
    try {
      const target = appointments.find((a) => a.id === id);
      if (!target) throw new Error("Appointment not found");

      // send to your API as needed…
      const payload = { ...target, timeSlot, employeeId, status: "CONFIRMED" };
      await fetch("/api/assigned-appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "CONFIRMED" } : a))
      );
      toast.success("Appointment assigned successfully!");
      onAssignmentSuccess?.();
      router.push("/admin/assign");
    } catch (err) {
      toast.error("Failed to assign appointment.");
      console.error(err);
    }
  }

  // 🔹 Reject or Cancel
  async function handleRejectOrCancel(
    id: number,
    reason: string,
    action: "reject" | "cancel"
  ) {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "CANCELLED", notes: reason } : a
      )
    );
    toast.success(
      action === "reject"
        ? "Appointment rejected successfully!"
        : "Appointment cancelled successfully!"
    );
  }

  // 🔹 Reschedule – still CONFIRMED
  async function handleReschedule(
    id: number,
    newDate: Date,
    newTimeSlot: string
  ) {
    const [startTime, endTime] = newTimeSlot.split(" - ");
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "CONFIRMED",
              timeSlot: {
                ...a.timeSlot,
                slotDate: newDate.toISOString().split("T")[0],
                startTime,
                endTime,
              },
            }
          : a
      )
    );
    toast.success("Appointment rescheduled successfully!");
  }

  // 🔹 Render
  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6 text-center">
        Appointments for Approval
      </h1>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {["Today", "Tomorrow", "Overdue"].map((filter) => (
          <Button
            key={filter}
            className={cn(
              buttonVariants({
                variant: activeQuickFilter === filter ? "default" : "secondary",
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

      {/* View toggle */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          {(["list", "day", "week"] as const).map((mode) => (
            <Button
              key={mode}
              className={cn(
                buttonVariants({
                  variant: viewMode === mode ? "default" : "secondary",
                })
              )}
              onClick={() => setViewMode(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)} View
            </Button>
          ))}
        </div>
      </div>

      {viewMode === "list" ? (
        <AppointmentTable
          appointments={appointments}
          onApprove={(id) => handleApprove(id)}
          onSelect={(a) => {
            setSelectedApp(a);
            setShowRejectCancelDialog(false);
          }}
          onAssign={(ids) => ids.forEach((id) => handleAssign(id, ""))}
          onReject={(a) => {
            setSelectedApp(a);
            setRejectCancelActionType("reject");
            setShowRejectCancelDialog(true);
          }}
          onCancel={(a) => {
            setSelectedApp(a);
            setRejectCancelActionType("cancel");
            setShowRejectCancelDialog(true);
          }}
          onReschedule={(a) => {
            setSelectedApp(a);
            setShowRescheduleDialog(true);
          }}
          onOpenApproveDialog={(a) => {
            setSelectedApp(a);
            setIsApproveDialogOpen(true);
          }}
          loading={loading}
          error={error}
        />
      ) : (
        <div className="mt-6 p-4 border rounded-lg bg-white text-center text-muted-foreground">
          <p>Calendar {viewMode} view not yet implemented.</p>
        </div>
      )}

      {/* Dialogs */}
      {selectedApp && (
        <ApproveDialog
          appointment={selectedApp}
          onClose={() => {
            setIsApproveDialogOpen(false);
            setSelectedApp(null);
          }}
          onApprove={(id) => handleApprove(id)}
          onAssign={handleAssign}
          open={isApproveDialogOpen}
          onAssignmentSuccess={fetchAppointments}
        />
      )}

      {selectedApp && showRejectCancelDialog && (
        <RejectCancelDialog
          appointment={selectedApp}
          onClose={() => {
            setShowRejectCancelDialog(false);
            setSelectedApp(null);
          }}
          onConfirm={(id, reason) =>
            handleRejectOrCancel(id, reason, rejectCancelActionType)
          }
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
    </div>
  );
}
