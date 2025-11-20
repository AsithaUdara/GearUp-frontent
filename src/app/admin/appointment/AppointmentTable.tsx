"use client";
import React from "react";
import { Appointment } from "./types";

import {
  DotIcon,
  ClockIcon,
  MoreHorizontalIcon,
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
  onAssign: (ids: number[]) => void;
  onReject: (app: Appointment) => void;
  onCancel: (app: Appointment) => void;
  onReschedule: (app: Appointment) => void;
  onOpenApproveDialog: (app: Appointment) => void;
  loading: boolean;
  error: string | null;
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
        app.serviceName,
        app.customerPhone,
        app.customerEmail,
        String(app.id),
        app.notes || "",
      ]
        .join(" ")
        .toLowerCase();
      return searchFields.includes(searchTerm.toLowerCase());
    })
    .filter((app) =>
      filterStatus === "all" ? true : app.status === filterStatus
    );

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    let compare = 0;
    if (sortBy === "date") {
      compare =
        new Date(a.timeSlot.slotDate).getTime() -
        new Date(b.timeSlot.slotDate).getTime();
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
        setLastUpdated(new Date().toLocaleString());
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    setLastUpdated(new Date().toLocaleString());
    toast.info("Refreshing appointments...");
  };

  const getStatusChipColor = (status: Appointment["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
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
    <div className="overflow-visible rounded-lg border border-border shadow-sm bg-white p-4">
      {/* Top filters */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="global-search"
              placeholder="Search all fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[200px]"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] text-gray-900">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="z-[9999] text-gray-900" position="popper">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="z-[9999]" position="popper">
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

      {/* Main table */}
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr className="bg-primary text-white uppercase text-sm tracking-wider">
            <th className="px-4 py-3 font-semibold">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
            </th>
            <th className="px-4 py-3 font-semibold w-[120px]">Booking ID</th>
            <th className="px-4 py-3 font-semibold">Service</th>
            <th className="px-4 py-3 font-semibold">Customer</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Time</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-center">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border text-sm text-foreground font-body">
          {paginatedAppointments.length > 0 ? (
            paginatedAppointments.map((app) => (
              <tr
                key={app.id}
                className="hover:bg-primary/5 transition-colors duration-200"
              >
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedAppointmentIds.includes(app.id)}
                    onCheckedChange={(checked: boolean) =>
                      handleSelectRow(app.id, checked)
                    }
                  />
                </td>
                <td className="px-4 py-3 font-medium w-[120px]">{app.id}</td>
                <td className="px-4 py-3">{app.serviceName}</td>
                <td className="px-4 py-3 font-medium">{app.customerName}</td>
                <td className="px-4 py-3">{app.timeSlot.slotDate}</td>
                <td className="px-4 py-3 flex items-center space-x-2">
                  <ClockIcon size={16} className="text-muted-foreground" />
                  <span>{`${app.timeSlot.startTime} - ${app.timeSlot.endTime}`}</span>
                </td>
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
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="z-[9999]" align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onOpenApproveDialog(app)}
                      >
                        View details
                      </DropdownMenuItem>
                      {app.status === "PENDING" && (
                        <DropdownMenuItem
                          onClick={() => onOpenApproveDialog(app)}
                        >
                          Approve
                        </DropdownMenuItem>
                      )}
                      {app.status === "PENDING" && (
                        <DropdownMenuItem onClick={() => onReject(app)}>
                          Reject
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
                colSpan={8}
                className="px-4 py-6 text-center text-muted-foreground font-medium"
              >
                No appointments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <p>Rows per page:</p>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value: string) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            {/* 👇 add z-index + popper */}
            <SelectContent className="z-[9999]" position="popper">
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
