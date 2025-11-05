import React from "react";
import CustomerLayout from "@/app/components/customer/CustomerLayout";
import CustomerSidebar from "@/app/components/customer/CustomerSidebar";

export default function CustomerSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerLayout>
      <div className="min-h-screen font-display flex">
        <CustomerSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </CustomerLayout>
  );
}
