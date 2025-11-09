"use client";
import React from "react";
import { LucideFileText, LucideDownload, LucideCheck, LucideStar, LucideAlertCircle } from "lucide-react";
import { generateBillPDF } from "@/lib/pdfGenerator";
import { getCustomerBills, markBillAsPaid, canSubmitReview } from "@/lib/api/billService";
import type { CustomerBill } from "@/types/payment";

export default function ApprovedBills({ 
  onReviewSubmitAction,
  refreshTrigger = 0
}: { 
  onReviewSubmitAction?: (billId: string) => void;
  refreshTrigger?: number;
}) {
  const [bills, setBills] = React.useState<CustomerBill[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [processingBillId, setProcessingBillId] = React.useState<string | null>(null);

  // Fetch bills from backend API
  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with actual user email from Auth Service
      // For now, using a test email - this will be replaced when Auth Service is integrated
      const userEmail = 'john@example.com'; // Temporary hardcoded for development
      
      // Fetch bills from API
      const billsData = await getCustomerBills(userEmail);
      setBills(billsData);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError('Failed to load bills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBills();
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

  const downloadBill = (bill: CustomerBill) => {
    try {
      generateBillPDF({
        id: bill.id,
        customerName: bill.customerName,
        customerEmail: bill.customerEmail,
        vehicleInfo: bill.vehicleInfo,
        services: bill.services.map(s => ({
          id: s.id,
          description: s.description || s.serviceName,
          price: s.price
        })),
        totalAmount: bill.totalAmount,
        approvedDate: bill.approvedDate,
        status: bill.paymentStatus.toLowerCase() as 'paid' | 'unpaid'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleMarkAsPaid = async (billId: string) => {
    if (!confirm('Mark this bill as paid?')) return;

    try {
      setProcessingBillId(billId);
      
      // Call API to mark bill as paid
      await markBillAsPaid(billId);
      
      // Refresh bills to show updated status
      await fetchBills();
      
      alert('Bill marked as paid! You can now submit a review.');
    } catch (err) {
      console.error('Error marking bill as paid:', err);
      alert('Failed to update bill status. Please try again.');
    } finally {
      setProcessingBillId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
        <p className="text-gray-500">Loading your bills...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <LucideAlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
        <p className="text-red-700 font-medium mb-4">{error}</p>
        <button
          onClick={fetchBills}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <LucideFileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">No approved bills yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Bills will appear here after admin approves payment requests
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bills.map(bill => {
        const isPaid = bill.paymentStatus === 'PAID';
        const canReview = canSubmitReview(bill);
        const isProcessing = processingBillId === bill.id;
        
        return (
          <div
            key={bill.id}
            className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
              isPaid ? 'border-green-300' : 'border-yellow-300'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-[#181111]">Bill #{bill.id.substring(0, 8)}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isPaid
                        ? 'bg-green-600 text-white'
                        : 'bg-yellow-500 text-white'
                    }`}
                  >
                    {bill.paymentStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Vehicle: {bill.vehicleInfo}</p>
                <p className="text-sm text-gray-600">
                  Approved: {new Date(bill.approvedDate).toLocaleDateString()}
                </p>
                {bill.paidDate && (
                  <p className="text-sm text-green-600">
                    Paid: {new Date(bill.paidDate).toLocaleDateString()}
                  </p>
                )}
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
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {service.serviceName}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 text-right">
                        ${service.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-2 text-sm text-gray-600">Tax (10%)</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">
                      ${bill.taxAmount.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
                    <td className="px-4 py-2 text-sm">TOTAL</td>
                    <td className="px-4 py-2 text-sm text-right">
                      ${bill.finalAmount.toFixed(2)}
                    </td>
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
              {!isPaid && (
                <button
                  onClick={() => handleMarkAsPaid(bill.id)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <LucideCheck className="w-4 h-4" />
                      Mark as Paid
                    </>
                  )}
                </button>
              )}
              {canReview && onReviewSubmitAction && (
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
        );
      })}
    </div>
  );
}
