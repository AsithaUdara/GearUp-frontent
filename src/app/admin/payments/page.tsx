"use client";
import React from "react";
import { motion } from "framer-motion";
import { LucideCreditCard, LucideCheck, LucideX, LucideDollarSign, LucideFileText, LucideDownload } from "lucide-react";
import { generateBillPDF } from "@/lib/pdfGenerator";

type ServiceItem = {
  id: string;
  description: string;
  price: number;
};

type PaymentRequest = {
  id: string;
  customerName: string;
  email: string;
  vehicleInfo: string;
  services: ServiceItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string; // employee name
  submittedDate: string;
  approvedDate?: string;
};

export default function AdminPaymentsPage() {
  const [paymentRequests, setPaymentRequests] = React.useState<PaymentRequest[]>([]);
  const [mounted, setMounted] = React.useState(false);

  // Load data from localStorage only on client side
  React.useEffect(() => {
    setMounted(true);
    
    try {
      const raw = localStorage.getItem('adminPaymentRequests');
      if (raw) {
        setPaymentRequests(JSON.parse(raw));
      } else {
        // Set default mock data if nothing in localStorage
        const defaultData: PaymentRequest[] = [
          {
            id: 'pr1',
            customerName: 'John Doe',
            email: 'john@example.com',
            vehicleInfo: 'Toyota Camry 2020 - ABC123',
            services: [
              { id: 's1', description: 'Oil Change', price: 50 },
              { id: 's2', description: 'Tire Service', price: 40 }
            ],
            totalAmount: 90,
            status: 'pending',
            submittedBy: 'Mike (Technician)',
            submittedDate: '2025-10-25'
          },
          {
            id: 'pr2',
            customerName: 'Jane Smith',
            email: 'jane@example.com',
            vehicleInfo: 'Honda Civic 2019 - XYZ789',
            services: [
              { id: 's3', description: 'Brake Inspection', price: 45 },
              { id: 's4', description: 'Engine Diagnostic', price: 120 }
            ],
            totalAmount: 165,
            status: 'approved',
            submittedBy: 'Sarah (Technician)',
            submittedDate: '2025-10-20',
            approvedDate: '2025-10-21'
          }
        ];
        setPaymentRequests(defaultData);
        localStorage.setItem('adminPaymentRequests', JSON.stringify(defaultData));
      }
    } catch (e) {
      console.error('Error loading payment requests:', e);
    }
  }, []);

  React.useEffect(() => {
    if (mounted && paymentRequests.length > 0) {
      localStorage.setItem('adminPaymentRequests', JSON.stringify(paymentRequests));
    }
  }, [paymentRequests, mounted]);

  const approvePayment = (requestId: string) => {
    const request = paymentRequests.find(r => r.id === requestId);
    if (!request) return;

    // Update payment request status
    const updatedRequests = paymentRequests.map(r =>
      r.id === requestId
        ? { ...r, status: 'approved' as const, approvedDate: new Date().toISOString().split('T')[0] }
        : r
    );
    setPaymentRequests(updatedRequests);

    // Add to customer's approved bills
    try {
      const raw = localStorage.getItem('customerApprovedBills');
      const bills = raw ? JSON.parse(raw) : [];
      bills.push({
        id: requestId,
        customerEmail: request.email,
        customerName: request.customerName,
        vehicleInfo: request.vehicleInfo,
        services: request.services,
        totalAmount: request.totalAmount,
        approvedDate: new Date().toISOString().split('T')[0],
        status: 'unpaid'
      });
      localStorage.setItem('customerApprovedBills', JSON.stringify(bills));
      
      alert('Payment approved and bill generated successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to approve payment');
    }
  };

  const rejectPayment = (requestId: string) => {
    if (confirm('Are you sure you want to reject this payment request?')) {
      setPaymentRequests(prev => prev.map(r =>
        r.id === requestId ? { ...r, status: 'rejected' as const } : r
      ));
    }
  };

  const generateBill = (request: PaymentRequest) => {
    generateBillPDF({
      id: request.id,
      customerName: request.customerName,
      customerEmail: request.email,
      vehicleInfo: request.vehicleInfo,
      services: request.services,
      totalAmount: request.totalAmount,
      approvedDate: request.approvedDate || new Date().toISOString().split('T')[0],
      status: request.status,
      submittedBy: request.submittedBy
    });
  };

  const pendingCount = paymentRequests.filter(r => r.status === 'pending').length;
  const approvedCount = paymentRequests.filter(r => r.status === 'approved').length;
  const totalRevenue = paymentRequests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
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
          <p className="mt-4 text-muted-foreground">Loading payment requests...</p>
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
                  request.status === 'approved'
                    ? 'border-green-300 bg-green-50'
                    : request.status === 'rejected'
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
                          request.status === 'approved'
                            ? 'bg-green-600 text-white'
                            : request.status === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-yellow-500 text-white'
                        }`}
                      >
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Email:</span> {request.email}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Vehicle:</span> {request.vehicleInfo}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Submitted by:</span> {request.submittedBy}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Date:</span> {request.submittedDate}
                      {request.approvedDate && ` | Approved: ${request.approvedDate}`}
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
                              <td className="px-4 py-2 text-sm text-gray-800">{service.description}</td>
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
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => approvePayment(request.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2"
                      >
                        <LucideCheck className="w-4 h-4" />
                        Approve & Generate Bill
                      </button>
                      <button
                        onClick={() => rejectPayment(request.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2"
                      >
                        <LucideX className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  {request.status === 'approved' && (
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
