"use client";

import Sidebar from "@/app/components/employee/Sidebar";
import Header from "@/app/components/employee/Header";
import { usePathname } from "next/navigation";

export default function EmployeeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isCommunication = pathname.startsWith('/employee/communication');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen">
        {!isCommunication && <Header />}
        <div className={isCommunication ? "h-screen" : "p-8"}>{children}</div>
      </main>
    </div>
  );
}
