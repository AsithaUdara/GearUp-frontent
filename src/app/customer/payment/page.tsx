import React from "react";
import PaymentPageClient from "./PaymentPageClient";

export default function PaymentPage() {
  return (
    <div className="p-8 bg-[#f8f6f6]">
      <div className="flex flex-wrap justify-between gap-3 mb-6">
        <div className="flex min-w-72 flex-col gap-3">
          <p className="text-[#181111] text-4xl font-black leading-tight tracking-[-0.033em]">Payments</p>
          <p className="text-gray-500 text-base font-normal leading-normal">
            Manage your invoices and view the final amount due.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <PaymentPageClient />
      </div>
    </div>
  );
}
