"use client";

import React, { useEffect, useState } from "react";
import { Appointment } from "@/app/admin/appointment/page"; // Re-use the Appointment interface
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Assuming you have a table UI component
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AssignedAppointmentTableProps {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  refreshAppointments: () => void; // Add this line
}

interface Employee {
  id: number; // Assuming ID is a number based on /api/employees/available/route.ts
  name: string;
}

export default function AssignedAppointmentTable({
  appointments,
  loading,
  error,
  refreshAppointments, // Destructure the new prop
}: AssignedAppointmentTableProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees/available");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: Employee[] = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        toast.error("Failed to load employee list.");
      }
    };
    fetchEmployees();
  }, []);

  const getEmployeeName = (employeeId: string | undefined) => {
    if (!employeeId) return "N/A";
    const employee = employees.find((emp) => emp.id.toString() === employeeId);
    return employee ? employee.name : `Employee ${employeeId}`;
  };

  const getStatusChipColor = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "assigned":
        return "bg-blue-100 text-blue-700";
      case "checked-in":
        return "bg-indigo-100 text-indigo-700";
      case "in-service":
        return "bg-purple-100 text-purple-700";
      case "completed":
        return "bg-lime-100 text-lime-700";
      case "no-show":
        return "bg-red-100 text-red-700";
      case "cancelled":
        return "bg-pink-100 text-pink-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "rescheduled":
        return "bg-orange-100 text-orange-700";
      case "locked":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
        <Skeleton className="h-10 w-full mb-4" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 text-center text-destructive">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Appointment ID</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Vehicle Model</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time Slot</TableHead>
            <TableHead>Service Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned Employee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="font-medium">
                  {appointment.appointmentId}
                </TableCell>
                <TableCell>{appointment.customerName}</TableCell>
                <TableCell>{appointment.vehicleModel}</TableCell>
                <TableCell>{appointment.date}</TableCell>
                <TableCell>{appointment.timeSlot}</TableCell>
                <TableCell>{appointment.serviceType}</TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "text-xs font-semibold",
                      getStatusChipColor(appointment.status)
                    )}
                  >
                    {appointment.status.charAt(0).toUpperCase() +
                      appointment.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getEmployeeName(appointment.requestedBay)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No assigned appointments found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
