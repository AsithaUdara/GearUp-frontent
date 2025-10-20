import AssignedTasksList from "@/app/components/employee/dashboard/AssignedTasksList";
import ScheduleCard from "@/app/components/employee/dashboard/ScheduleCard";
import AppointmentManagementCard from "@/app/components/employee/dashboard/AppointmentManagementCard";
import WorkHoursSummaryCompactCard from "@/app/components/employee/dashboard/WorkHoursSummaryCompactCard";
import TimeLoggingCard from "@/app/components/employee/dashboard/TimeLoggingCard";
import StatsCards from "@/app/components/employee/dashboard/StatsCards";
import QuickActionsBar from "@/app/components/employee/dashboard/QuickActionsBar";

export default function EmployeeOverviewPage() {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <StatsCards />
        <QuickActionsBar />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WorkHoursSummaryCompactCard />
          <TimeLoggingCard />
        </div>
        <AssignedTasksList />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <ScheduleCard />
        <AppointmentManagementCard />
      </div>
    </section>
  );
}
