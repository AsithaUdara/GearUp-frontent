"use client";
import React from "react";
import { LucideFileText, LucideDownload, LucideCheck, LucideStar } from "lucide-react";
import { generateBillPDF } from "@/lib/pdfGenerator";

type ServiceItem = {
  id: string;
  description: string;
  price: number;
};

type ApprovedBill = {
  id: string;
  customerEmail: string;
  customerName: string;
  vehicleInfo: string;
  services: ServiceItem[];
  totalAmount: number;
  approvedDate: string;
  status: 'unpaid' | 'paid';
  reviewSubmitted?: boolean;
};

export default function ApprovedBills({ 
  onReviewSubmitAction 
}: { 
  onReviewSubmitAction?: (billId: string) => void 
}) {
  const [bills, setBills] = React.useState<ApprovedBill[]>([]);

  React.useEffect(() => {
    // Load approved bills for current customer
    try {
      const raw = localStorage.getItem('customerApprovedBills');
      if (raw) {
        const allBills = JSON.parse(raw);
        // In a real app, filter by current user's email
        setBills(allBills);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const downloadBill = (bill: ApprovedBill) => {
    generateBillPDF({
      id: bill.id,
      customerName: bill.customerName,
      customerEmail: bill.customerEmail,
      vehicleInfo: bill.vehicleInfo,
      services: bill.services,
      totalAmount: bill.totalAmount,
      approvedDate: bill.approvedDate,
      status: bill.status
    });
  };

  const markAsPaid = (billId: string) => {
    try {
      const raw = localStorage.getItem('customerApprovedBills');
      if (raw) {
        const allBills = JSON.parse(raw);
        const paidBill = allBills.find((b: ApprovedBill) => b.id === billId);
        
        if (paidBill) {
          // Add to past payments
          const pastPaymentsRaw = localStorage.getItem('customerPastPayments');
          const pastPayments = pastPaymentsRaw ? JSON.parse(pastPaymentsRaw) : [];
          pastPayments.push({
            id: `receipt-${Date.now()}`,
            billId: paidBill.id,
            date: new Date().toISOString().split('T')[0],
            subtotal: paidBill.totalAmount,
            vehicleInfo: paidBill.vehicleInfo
          });
          localStorage.setItem('customerPastPayments', JSON.stringify(pastPayments));
        }
        
        const updated = allBills.map((b: ApprovedBill) =>
          b.id === billId ? { ...b, status: 'paid' } : b
        );
        localStorage.setItem('customerApprovedBills', JSON.stringify(updated));
        setBills(updated);
        alert('Payment marked as paid! You can now submit a review.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (bills.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <LucideFileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">No approved bills yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bills.map(bill => (
        <div
          key={bill.id}
          className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
            bill.status === 'paid' ? 'border-green-300' : 'border-yellow-300'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-[#181111]">Bill #{bill.id}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    bill.status === 'paid'
                      ? 'bg-green-600 text-white'
                      : 'bg-yellow-500 text-white'
                  }`}
                >
                  {bill.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600">Vehicle: {bill.vehicleInfo}</p>
              <p className="text-sm text-gray-600">Approved: {bill.approvedDate}</p>
            </div>
          </div>

          {/* Services Table */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-4">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Service</th>
                  <th className="text-right px-4 py-2 text-sm font-medium text-gray-700">Price</th>
                </tr>
              </thead>
              <tbody>
                {bill.services.map(service => (
                  <tr key={service.id} className="border-t border-gray-200">
                    <td className="px-4 py-2 text-sm text-gray-800">{service.description}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 text-right">${service.price.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-2 text-sm text-gray-600">Tax (10%)</td>
                  <td className="px-4 py-2 text-sm text-gray-600 text-right">${(bill.totalAmount * 0.1).toFixed(2)}</td>
                </tr>
                <tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
                  <td className="px-4 py-2 text-sm">TOTAL</td>
                  <td className="px-4 py-2 text-sm text-right">${(bill.totalAmount * 1.1).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => downloadBill(bill)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 flex items-center gap-2"
            >
              <LucideDownload className="w-4 h-4" />
              Download Bill
            </button>
            {bill.status === 'unpaid' && (
              <button
                onClick={() => markAsPaid(bill.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2"
              >
                <LucideCheck className="w-4 h-4" />
                Mark as Paid
              </button>
            )}
            {bill.status === 'paid' && !bill.reviewSubmitted && onReviewSubmitAction && (
              <button
                onClick={() => onReviewSubmitAction(bill.id)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
              >
                <LucideStar className="w-4 h-4" />
                Submit Review
              </button>
            )}
            {bill.reviewSubmitted && (
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
                <LucideCheck className="w-4 h-4" />
                Review Submitted
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
