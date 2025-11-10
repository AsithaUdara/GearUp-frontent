"use client";
import React from "react";
import ApprovedBills from "@/app/components/customer/dashboard/ApprovedBills";
import OngoingServiceBills from "@/app/components/customer/dashboard/OngoingServiceBills";
import ReviewSubmissionModal from "@/app/components/customer/dashboard/ReviewSubmissionModal";
import PastPayments from "@/app/components/customer/dashboard/PastPayments";
import { LucideFileText, LucideWrench, LucideHistory } from "lucide-react";
import { submitReview } from "@/lib/api/reviewService";
import { getCustomerBills } from "@/lib/api/billService";
import type { CustomerBill } from "@/types/payment";

export default function PaymentPageClient() {
  const [reviewModalOpen, setReviewModalOpen] = React.useState(false);
  const [selectedBillId, setSelectedBillId] = React.useState("");
  const [selectedService, setSelectedService] = React.useState("");
  const [bills, setBills] = React.useState<CustomerBill[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  // Fetch bills when component mounts or when refresh is triggered
  React.useEffect(() => {
    const fetchBills = async () => {
      try {
        // TODO: Replace with actual user email from Auth Service
        const userEmail = 'john@example.com'; // Temporary hardcoded for development
        const billsData = await getCustomerBills(userEmail);
        setBills(billsData);
      } catch (error) {
        console.error('Error fetching bills:', error);
      }
    };
    fetchBills();
  }, [refreshTrigger]);

  function handleReviewSubmitAction(billId: string) {
    // Get bill info from state
    const bill = bills.find((b) => b.id === billId);
    if (bill) {
      setSelectedBillId(billId);
      setSelectedService(bill.vehicleInfo || 'Vehicle Service');
      setReviewModalOpen(true);
    }
  }

  async function handleReviewSubmitComplete(review: { rating: number; comment: string }) {
    setSubmitting(true);
    try {
      // Get bill details
      const bill = bills.find(b => b.id === selectedBillId);
      if (!bill) {
        throw new Error('Bill not found');
      }
      
      await submitReview({
        billId: selectedBillId,
        customerEmail: bill.customerEmail,
        customerName: bill.customerName,
        serviceName: bill.vehicleInfo || 'Vehicle Service',
        rating: review.rating,
        reviewText: review.comment,
      });

      setReviewModalOpen(false);
      alert('Thank you for your review! It has been submitted successfully and is pending admin approval.');
      
      // Trigger refresh to update bill list
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Ongoing Services Section */}
      {/* <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-full bg-yellow-500 flex items-center justify-center text-white">
            <LucideWrench />
          </div>
          <div>
            <h2 className="text-[#181111] text-lg font-bold">Ongoing Services</h2>
            <p className="text-gray-500 text-sm">Services currently under review by admin</p>
          </div>
        </div>

        <OngoingServiceBills />
      </div> */}

      {/* Approved Bills Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white">
            <LucideFileText />
          </div>
          <div>
            <h2 className="text-[#181111] text-lg font-bold">Approved Bills</h2>
            <p className="text-gray-500 text-sm">Bills approved and ready for payment</p>
          </div>
        </div>

        <ApprovedBills 
          onReviewSubmitAction={handleReviewSubmitAction}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Past Payments Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-full bg-green-500 flex items-center justify-center text-white">
            <LucideHistory />
          </div>
          <div>
            <h2 className="text-[#181111] text-lg font-bold">Past Payments</h2>
            <p className="text-gray-500 text-sm">Your payment history for completed services</p>
          </div>
        </div>

        <PastPayments />
      </div>

      <ReviewSubmissionModal 
        open={reviewModalOpen}  
        billId={selectedBillId}
        vehicleService={selectedService}
        onCloseAction={() => !submitting && setReviewModalOpen(false)}
        onSubmitAction={handleReviewSubmitComplete}
      />
    </div>
  );
}
