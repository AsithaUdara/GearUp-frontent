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
import { Textarea } from "@/components/ui/textarea";
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
import { buttonVariants } from "@/components/ui/button";

interface RejectCancelDialogProps {
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: (
    id: number,
    reason: string,
    notifyCustomer: boolean,
    reschedule?: boolean
  ) => void;
  actionType: "reject" | "cancel";
}

export default function RejectCancelDialog({
  appointment,
  onClose,
  onConfirm,
  actionType,
}: RejectCancelDialogProps) {
  const [reason, setReason] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [reschedule, setReschedule] = useState(false);

  React.useEffect(() => {
    if (appointment) {
      setReason("");
      setNotifyCustomer(true);
      setReschedule(false);
    }
  }, [appointment]);

  const cannedReasons =
    actionType === "reject"
      ? [
          "Capacity conflict",
          "Invalid service request",
          "Customer no-show in past",
        ]
      : [
          "Customer requested cancellation",
          "Service unavailability",
          "Rescheduled by staff",
        ];

  const handleConfirm = () => {
    if (appointment && reason.trim() !== "") {
      onConfirm(appointment.id, reason, notifyCustomer, reschedule);
      onClose();
    } else {
      toast.error("Please provide a reason.");
    }
  };

  return (
    <AlertDialog open={!!appointment} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {actionType === "reject"
              ? "Reject Appointment"
              : "Cancel Appointment"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to{" "}
            {actionType === "reject" ? "reject" : "cancel"} the appointment for{" "}
            <strong>{appointment?.customerName}</strong> (
            {appointment?.vehicleModel})?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
              className="col-span-3"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="canned-reason" className="text-right">
              Canned Reasons
            </Label>
            <Select onValueChange={setReason}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a canned reason (optional)" />
              </SelectTrigger>
              <SelectContent>
                {cannedReasons.map((r, index) => (
                  <SelectItem key={index} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="notify-customer"
              checked={notifyCustomer}
              onCheckedChange={(checked: boolean) => setNotifyCustomer(checked)}
            />
            <Label
              htmlFor="notify-customer"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Notify customer (SMS/Email template preview)
            </Label>
          </div>
          {actionType === "cancel" && (
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="reschedule"
                checked={reschedule}
                onCheckedChange={(checked: boolean) => setReschedule(checked)}
              />
              <Label
                htmlFor="reschedule"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Offer to reschedule
              </Label>
            </div>
          )}
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
              onClick={handleConfirm}
            >
              {actionType === "reject" ? "Reject" : "Confirm Cancellation"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
