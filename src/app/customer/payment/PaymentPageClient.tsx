"use client";
import React from "react";
import ApprovedBills from "@/app/components/customer/dashboard/ApprovedBills";
import OngoingServiceBills from "@/app/components/customer/dashboard/OngoingServiceBills";
import ReviewSubmissionModal from "@/app/components/customer/dashboard/ReviewSubmissionModal";
import { LucideFileText, LucideWrench } from "lucide-react";

export default function PaymentPageClient() {
  const [reviewModalOpen, setReviewModalOpen] = React.useState(false);
  const [selectedBillId, setSelectedBillId] = React.useState("");
  const [selectedService, setSelectedService] = React.useState("");

  function handleReviewSubmitAction(billId: string) {
    // Get bill info to show in modal
    try {
      const raw = localStorage.getItem('customerApprovedBills');
      if (raw) {
        const bills = JSON.parse(raw);
        const bill = bills.find((b: any) => b.id === billId);
        if (bill) {
          setSelectedBillId(billId);
          setSelectedService(bill.services.map((s: any) => s.description).join(', '));
          setReviewModalOpen(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  function handleReviewSubmitComplete(review: { rating: number; comment: string }) {
    // Save review to localStorage
    try {
      const raw = localStorage.getItem('customerReviews');
      const reviews = raw ? JSON.parse(raw) : [];
      reviews.push({
        id: 'r' + Date.now(),
        customerName: 'John Doe', // In real app, get from auth
        email: 'john.doe@email.com', // In real app, get from auth
        vehicleService: selectedService,
        rating: review.rating,
        comment: review.comment,
        date: new Date().toISOString().split('T')[0],
        publishedToLanding: false
      });
      localStorage.setItem('customerReviews', JSON.stringify(reviews));

      // Mark bill as reviewed
      const billsRaw = localStorage.getItem('customerApprovedBills');
      if (billsRaw) {
        const bills = JSON.parse(billsRaw);
        const updated = bills.map((b: any) =>
          b.id === selectedBillId ? { ...b, reviewSubmitted: true } : b
        );
        localStorage.setItem('customerApprovedBills', JSON.stringify(updated));
      }

      setReviewModalOpen(false);
      alert('Thank you for your review! It has been submitted successfully.');
      window.location.reload(); // Refresh to show updated state
    } catch (e) {
      console.error(e);
      alert('Failed to submit review');
    }
  }

  return (
    <div className="space-y-6">
      {/* Ongoing Services Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
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
      </div>

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

        <ApprovedBills onReviewSubmitAction={handleReviewSubmitAction} />
      </div>

      <ReviewSubmissionModal 
        open={reviewModalOpen}
        billId={selectedBillId}
        vehicleService={selectedService}
        onCloseAction={() => setReviewModalOpen(false)}
        onSubmitAction={handleReviewSubmitComplete}
      />
    </div>
  );
}
