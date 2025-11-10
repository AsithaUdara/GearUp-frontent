"use client";
import React from "react";
import { LucideHistory, LucideCheckCircle, LucideCalendar, LucideCreditCard } from "lucide-react";

type PastPayment = {
  id: string;
  billId: string;
  date: string;
  subtotal: number;
  vehicleInfo: string;
};

export default function PastPayments() {
  const [payments, setPayments] = React.useState<PastPayment[]>([]);

  React.useEffect(() => {
    // Load past payments for current customer
    try {
      const raw = localStorage.getItem('customerPastPayments');
      if (raw) {
        const allPayments = JSON.parse(raw);
        // In a real app, filter by current user's email
        setPayments(allPayments);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (payments.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
          <LucideHistory className="size-10 text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Past Payments</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Your payment history will appear here once you complete your first service payment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment, index) => {
        const totalAmount = payment.subtotal * 1.1;
        const tax = payment.subtotal * 0.1;
        
        return (
          <div
            key={payment.id}
            className="group relative border border-gray-200 rounded-xl p-5 hover:border-green-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
          >
            {/* Status indicator line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-xl" />
            
            <div className="flex items-start justify-between gap-4">
              {/* Left content */}
              <div className="flex-1 pl-3">
                {/* Header row with bill ID and date */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                    <LucideCheckCircle className="size-3.5" />
                    PAID
                  </span>
                  <span className="text-xs font-mono text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                    {payment.billId}
                  </span>
                </div>

                {/* Vehicle info */}
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    {payment.vehicleInfo}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <LucideCalendar className="size-3.5" />
                    <span>Payment Date: {new Date(payment.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>

                {/* Payment breakdown */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-medium">${payment.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (10%):</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Right content - Total amount */}
              <div className="flex flex-col items-end justify-between h-full">
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${totalAmount.toFixed(2)}
                  </p>
                </div>
                
                
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
