"use client";
import React from "react";
import { motion } from "framer-motion";
import { LucideCreditCard, LucideCheck, LucideX, LucideDollarSign, LucideFileText, LucideDownload } from "lucide-react";
import { generateBillPDF } from "@/lib/pdfGenerator";
import { 
  getAllPaymentRequests, 
  approvePaymentRequest, 
  rejectPaymentRequest,
  getPaymentStats 
} from "@/lib/api/paymentService";
import type { PaymentRequest, PaymentStatsDTO } from "@/types/payment";

export default function AdminPaymentsPage() {
  const [paymentRequests, setPaymentRequests] = React.useState<PaymentRequest[]>([]);
  const [stats, setStats] = React.useState<PaymentStatsDTO | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch data from backend API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [requestsData, statsData] = await Promise.all([
        getAllPaymentRequests(),
        getPaymentStats()
      ]);
      
      setPaymentRequests(requestsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching payment data:', err);
      setError('Failed to load payment requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const approvePayment = async (requestId: string) => {
    try {
      setLoading(true);
      await approvePaymentRequest(requestId);
      
      // Refresh data to show updated status
      await fetchData();
      
      alert('Payment approved successfully! Bill has been generated for the customer.');
    } catch (err) {
      console.error('Error approving payment:', err);
      alert('Failed to approve payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const rejectPayment = async (requestId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setLoading(true);
      await rejectPaymentRequest(requestId, reason);
      
      // Refresh data to show updated status
      await fetchData();
      
      alert('Payment request rejected successfully.');
    } catch (err) {
      console.error('Error rejecting payment:', err);
      alert('Failed to reject payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateBill = (request: PaymentRequest) => {
    try {
      generateBillPDF({
        id: request.id,
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        vehicleInfo: request.vehicleInfo,
        services: request.services.map(s => ({
          id: s.id,
          description: s.description || s.serviceName, // Use description, fallback to serviceName
          price: s.price
        })),
        totalAmount: request.totalAmount,
        approvedDate: request.approvedDate || new Date().toISOString().split('T')[0],
        status: request.status.toLowerCase() as 'pending' | 'approved' | 'rejected',
        submittedBy: request.submittedBy
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Use stats from API or calculate from local data as fallback
  const pendingCount = stats?.pendingCount ?? paymentRequests.filter(r => r.status === 'PENDING').length;
  const approvedCount = stats?.approvedCount ?? paymentRequests.filter(r => r.status === 'APPROVED').length;
  const totalRevenue = stats?.totalRevenue ?? paymentRequests
    .filter(r => r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-3xl font-bold text-foreground">Payment Approval</h1>
        <p className="mt-1 text-muted-foreground">
          Review and approve payment requests from employees. Generate bills for customers.
        </p>
        <div className="mt-8 text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading payment requests from backend...</p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-3xl font-bold text-foreground">Payment Approval</h1>
        <p className="mt-1 text-muted-foreground">
          Review and approve payment requests from employees. Generate bills for customers.
        </p>
        <div className="mt-8 text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <LucideX className="w-12 h-12 mx-auto mb-3 text-red-500" />
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="font-heading text-3xl font-bold text-foreground">Payment Approval</h1>
      <p className="mt-1 text-muted-foreground">
        Review and approve payment requests from employees. Generate bills for customers.
      </p>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm font-medium text-muted-foreground">Pending Requests</p>
            <LucideFileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-2 font-heading text-4xl font-bold text-foreground">{pendingCount}</p>
        </div>

        <div className="rounded-lg border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm font-medium text-muted-foreground">Approved</p>
            <LucideCheck className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-2 font-heading text-4xl font-bold text-foreground">{approvedCount}</p>
        </div>

        <div className="rounded-lg border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm font-medium text-muted-foreground">Total Revenue</p>
            <LucideDollarSign className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-2 font-heading text-4xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Payment Requests */}
      <div className="mt-6 rounded-lg border border-border bg-white p-6 shadow-sm">
        <h2 className="font-heading text-xl font-bold text-foreground mb-4">Payment Requests</h2>

        {paymentRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <LucideCreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No payment requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentRequests.map(request => (
              <div
                key={request.id}
                className={`border rounded-lg p-4 ${
                  request.status === 'APPROVED'
                    ? 'border-green-300 bg-green-50'
                    : request.status === 'REJECTED'
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-[#181111] text-lg">{request.customerName}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'APPROVED'
                            ? 'bg-green-600 text-white'
                            : request.status === 'REJECTED'
                            ? 'bg-red-600 text-white'
                            : 'bg-yellow-500 text-white'
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Email:</span> {request.customerEmail}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Vehicle:</span> {request.vehicleInfo}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Submitted by:</span> {request.submittedBy}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Date:</span> {new Date(request.submittedDate).toLocaleDateString()}
                      {request.approvedDate && ` | Approved: ${new Date(request.approvedDate).toLocaleDateString()}`}
                    </p>

                    {/* Services Table */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-3">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Service</th>
                            <th className="text-right px-4 py-2 text-sm font-medium text-gray-700">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {request.services.map(service => (
                            <tr key={service.id} className="border-t border-gray-100">
                              <td className="px-4 py-2 text-sm text-gray-800">{service.serviceName}</td>
                              <td className="px-4 py-2 text-sm text-gray-800 text-right">${service.price.toFixed(2)}</td>
                            </tr>
                          ))}
                          <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                            <td className="px-4 py-2 text-sm">TOTAL</td>
                            <td className="px-4 py-2 text-sm text-right">${request.totalAmount.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end border-t pt-3 mt-3">
                  {request.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => approvePayment(request.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <LucideCheck className="w-4 h-4" />
                        Approve & Generate Bill
                      </button>
                      <button
                        onClick={() => rejectPayment(request.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <LucideX className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  {request.status === 'APPROVED' && (
                    <button
                      onClick={() => generateBill(request)}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
                    >
                      <LucideDownload className="w-4 h-4" />
                      Download Bill
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
