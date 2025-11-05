"use client";
import CustomerHeader from "@/app/components/customer/CustomerHeader";
import Footer from "@/app/components/landing/Footer";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader />
      <main className="flex-1 pt-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}