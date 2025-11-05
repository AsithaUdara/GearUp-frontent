"use client";
import React from "react";
import { Appointment } from "./page";

import {
  DotIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  MoreHorizontalIcon,
  InfoIcon,
  SearchIcon,
  ArrowUpDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  RotateCwIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  appointments: Appointment[];
  onSelect: (a: Appointment) => void;
  onApprove: (
    id: number,
    timeSlot: string,
    advisor?: string,
    notifyCustomer?: boolean
  ) => void;
  onAssign: (ids: number[]) => void; // New prop for bulk assign
  onReject: (app: Appointment) => void; // New prop for rejecting an appointment
  onCancel: (app: Appointment) => void; // New prop for cancelling an appointment
  onReschedule: (app: Appointment) => void; // New prop for rescheduling an appointment
  onOpenApproveDialog: (app: Appointment) => void; // New prop to open approve dialog
  loading: boolean; // Add loading prop
  error: string | null; // Add error prop
}

export default function AppointmentTable({
  appointments,
  onSelect,
  onApprove,
  onAssign,
  onReject,
  onCancel,
  onReschedule,
  onOpenApproveDialog,
  loading,
  error,
}: Props) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [lastUpdated, setLastUpdated] = React.useState<string>(
    new Date().toLocaleString()
  );
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [selectedAppointmentIds, setSelectedAppointmentIds] = React.useState<
    number[]
  >([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAppointmentIds(appointments.map((app) => app.id));
    } else {
      setSelectedAppointmentIds([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedAppointmentIds((prev) => [...prev, id]);
    } else {
      setSelectedAppointmentIds((prev) => prev.filter((appId) => appId !== id));
    }
  };

  const filteredAppointments = appointments
    .filter((app) => {
      const searchFields = [
        app.customerName,
        app.vehicleModel,
        app.appointmentId,
        app.customerContact.phone,
        app.customerContact.email,
        app.serviceType,
      ]
        .join(" ")
        .toLowerCase();
      return searchFields.includes(searchTerm.toLowerCase());
    })
    .filter((app) => {
      if (filterStatus === "all") return true;
      return app.status === filterStatus;
    });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    let compare = 0;
    if (sortBy === "date") {
      compare = new Date(a.date).getTime() - new Date(b.date).getTime();
    }

    return sortOrder === "asc" ? compare : -compare;
  });

  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const paginatedAppointments = sortedAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const allSelected =
    paginatedAppointments.length > 0 &&
    selectedAppointmentIds.length === paginatedAppointments.length;

  React.useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (autoRefresh) {
      interval = setInterval(() => {
        // In a real application, you would re-fetch data here
        // For now, we'll just update the timestamp
        setLastUpdated(new Date().toLocaleString());
        // onRefresh(); // Assuming onRefresh prop exists for data fetching
      }, 30000); // 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    setLastUpdated(new Date().toLocaleString());
    // onRefresh(); // Trigger actual data re-fetch
    toast.info("Refreshing appointments...");
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") {
        event.preventDefault();
        document.getElementById("global-search")?.focus();
      } else if (event.key === "A" && event.shiftKey) {
        event.preventDefault();
        if (selectedAppointmentIds.length > 0) {
          onAssign(selectedAppointmentIds); // Call the new onAssign prop
          setSelectedAppointmentIds([]);
          toast.info(`Assigned ${selectedAppointmentIds.length} appointments.`);
        } else {
          toast.info("No appointments selected for assignment.");
        }
      } else if (event.key === "a" || event.key === "A") {
        event.preventDefault();
        if (selectedAppointmentIds.length > 0) {
          selectedAppointmentIds.forEach((id) =>
            onApprove(id, "", undefined, true)
          );
          setSelectedAppointmentIds([]);
          toast.success(
            `Approved ${selectedAppointmentIds.length} appointments.`
          );
        } else {
          toast.info("No appointments selected for approval.");
        }
      } else if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        handleRefresh();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAppointmentIds, onApprove, onAssign, handleRefresh]); // Dependencies

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
      <div className="rounded-lg border border-border shadow-sm bg-white p-4">
        <Skeleton className="h-10 w-full mb-4" />
        <div className="space-y-2">
          {[...Array(itemsPerPage)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border shadow-sm bg-white p-4 text-center text-red-500">
        <p>Error: {error}</p>
        <Button onClick={handleRefresh} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border shadow-sm bg-white">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="global-search"
              placeholder="Search all fields..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="pl-8 w-[200px]"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="checked-in">Checked-in</SelectItem>
              <SelectItem value="in-service">In-Service</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="no-show">No-Show</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="rescheduled">Rescheduled</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
            onClick={handleRefresh}
            aria-label="Refresh data"
          >
            <RotateCwIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <label
              htmlFor="auto-refresh"
              className="text-sm text-muted-foreground"
            >
              Auto-refresh
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr className="bg-primary text-white uppercase text-sm tracking-wider">
            <th className="px-4 py-3 font-semibold">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
            </th>
            <th className="px-4 py-3 font-semibold w-[120px]">
              Appointment ID
            </th>
            <th className="px-4 py-3 font-semibold">Customer</th>
            <th className="px-4 py-3 font-semibold">Vehicle</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Time Slot</th>
            <th className="px-4 py-3 font-semibold">Service Type</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-center">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border text-sm text-foreground font-body">
          {paginatedAppointments.length > 0 ? (
            paginatedAppointments.map((app) => (
              <tr
                key={app.id}
                className="hover:bg-primary/5 transition-colors duration-200 ease-in-out"
              >
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedAppointmentIds.includes(app.id)}
                    onCheckedChange={(checked: boolean) =>
                      handleSelectRow(app.id, checked)
                    }
                  />
                </td>
                <td className="px-4 py-3 font-medium w-[120px]">
                  {app.appointmentId}
                </td>
                <td className="px-4 py-3 font-medium flex items-center space-x-2">
                  <span>{app.customerName}</span>
                  <a href={`tel:${app.customerContact.phone}`}>
                    <PhoneIcon size={16} className="text-blue-500" />
                  </a>
                  <a href={`mailto:${app.customerContact.email}`}>
                    <MailIcon size={16} className="text-blue-500" />
                  </a>
                </td>
                <td className="px-4 py-3">{app.vehicleModel}</td>
                <td className="px-4 py-3">{app.date}</td>
                <td className="px-4 py-3 flex items-center space-x-2">
                  <ClockIcon size={16} className="text-muted-foreground" />
                  <span>{app.timeSlot}</span>
                </td>
                <td className="px-4 py-3">{app.serviceType}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusChipColor(
                      app.status
                    )}`}
                  >
                    <DotIcon className="h-4 w-4" /> {app.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "h-8 w-8 p-0"
                        )}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onOpenApproveDialog(app)}
                      >
                        View details
                      </DropdownMenuItem>
                      {app.status === "pending" && (
                        <DropdownMenuItem
                          onClick={() => onOpenApproveDialog(app)}
                        >
                          Approve
                        </DropdownMenuItem>
                      )}
                      {app.status !== "cancelled" &&
                        app.status !== "rejected" && (
                          <DropdownMenuItem onClick={() => onReject(app)}>
                            Reject with reason
                          </DropdownMenuItem>
                        )}
                      {app.status !== "completed" && (
                        <DropdownMenuItem onClick={() => onReschedule(app)}>
                          Reschedule
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>Print job card</DropdownMenuItem>
                      {app.status !== "cancelled" && (
                        <DropdownMenuItem onClick={() => onCancel(app)}>
                          Cancel
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={6} // Adjusted colspan for removed columns
                className="px-4 py-6 text-center text-muted-foreground font-medium"
              >
                No appointments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <p>Rows per page:</p>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value: string) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1); // Reset to first page when changing density
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
