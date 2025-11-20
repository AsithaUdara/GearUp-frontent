"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { UserIcon, RefreshCwIcon } from "lucide-react";

interface AssignedBooking {
  id: number;
  serviceId: number;
  serviceName: string;
  timeSlotId: number;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  notes: string;
  bookingDate: string;
  assignedEmployeeId?: number;
  timeSlot: {
    id: number;
    serviceId: number;
    serviceName: string;
    slotDate: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  };
}

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function AssignedAppointmentTable() {
  const [appointments, setAppointments] = useState<AssignedBooking[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Fetching assigned appointments...");

      // Parallel fetch for better performance
      const [bookingsResponse, employeesResponse] = await Promise.all([
        fetch("http://localhost:8084/api/v1/bookings/assigned"),
        fetch("http://localhost:8084/api/v1/employees/available"),
      ]);

      if (!bookingsResponse.ok) {
        throw new Error(`Bookings API error: ${bookingsResponse.status}`);
      }
      if (!employeesResponse.ok) {
        throw new Error(`Employees API error: ${employeesResponse.status}`);
      }

      const bookingsData: AssignedBooking[] = await bookingsResponse.json();
      const employeesData: Employee[] = await employeesResponse.json();

      console.log("✅ Loaded", bookingsData.length, "assigned appointments");
      console.log("✅ Loaded", employeesData.length, "employees");

      setAppointments(bookingsData);
      setEmployees(employeesData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("❌ Fetch error:", errorMessage);
      setError(errorMessage);
      toast.error("Failed to load assigned appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for assignment updates
    const handleUpdate = () => {
      console.log("🔄 Refreshing assigned appointments...");
      fetchData();
    };
    window.addEventListener("assignmentUpdated", handleUpdate);

    return () => window.removeEventListener("assignmentUpdated", handleUpdate);
  }, []);

  const getEmployeeName = (employeeId?: number): string => {
    if (!employeeId) return "Unassigned";
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee ? employee.name : `Employee #${employeeId}`;
  };

  const getEmployeeRole = (employeeId?: number): string => {
    if (!employeeId) return "";
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee?.role || "";
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CONFIRMED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Assigned Appointments
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Assigned Appointments
          </h3>
        </div>
        <div className="p-6">
          <div className="text-center text-destructive py-8">
            <p className="font-semibold">Error loading assignments</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button onClick={fetchData} className="mt-4" variant="outline">
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Assigned Appointments
          </h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            <UserIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No assigned appointments yet</p>
            <p className="text-sm mt-1">
              Assign employees to appointments to see them here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm p-4">
      <div className="p-6 border-b flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Assigned Appointments ({appointments.length})
        </h3>
        <Button
          onClick={fetchData}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCwIcon className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <div className="p-6">
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">
                  Customer Details
                </TableHead>
                <TableHead className="font-semibold">Service Type</TableHead>
                <TableHead className="font-semibold">
                  Appointment Schedule
                </TableHead>
                <TableHead className="font-semibold">Assigned To</TableHead>
                <TableHead className="font-semibold">Booking Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    #{appointment.id}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {appointment.customerName}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {appointment.customerEmail}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {appointment.customerPhone}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>{appointment.serviceName}</TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">
                        {format(
                          new Date(appointment.timeSlot.slotDate),
                          "MMM dd, yyyy"
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {appointment.timeSlot.startTime} -{" "}
                        {appointment.timeSlot.endTime}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {getEmployeeName(appointment.assignedEmployeeId)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getEmployeeRole(appointment.assignedEmployeeId)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={cn(
                        "text-xs font-semibold",
                        getStatusColor(appointment.status)
                      )}
                    >
                      {appointment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
