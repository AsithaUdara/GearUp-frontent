"use client";
import React from "react";
import AdminLayout from "@/app/components/admin/AdminLayout";
import { LucideCreditCard, LucideCheck, LucideX, LucideDollarSign, LucideFileText, LucideDownload } from "lucide-react";

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
  const [paymentRequests, setPaymentRequests] = React.useState<PaymentRequest[]>(() => {
    // Load from localStorage or use mock data
    try {
      const raw = localStorage.getItem('adminPaymentRequests');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [
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
  });

  React.useEffect(() => {
    localStorage.setItem('adminPaymentRequests', JSON.stringify(paymentRequests));
  }, [paymentRequests]);

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
    const billContent = `
═══════════════════════════════════════
          AUTOCARE SERVICE BILL
═══════════════════════════════════════

Bill ID: ${request.id}
Date: ${new Date().toLocaleDateString()}

CUSTOMER INFORMATION
───────────────────────────────────────
Name: ${request.customerName}
Email: ${request.email}
Vehicle: ${request.vehicleInfo}

SERVICE DETAILS
───────────────────────────────────────
${request.services.map(s => `${s.description.padEnd(30)} $${s.price.toFixed(2)}`).join('\n')}

───────────────────────────────────────
SUBTOTAL:                    $${request.totalAmount.toFixed(2)}
TAX (10%):                   $${(request.totalAmount * 0.1).toFixed(2)}
───────────────────────────────────────
TOTAL AMOUNT:                $${(request.totalAmount * 1.1).toFixed(2)}

═══════════════════════════════════════
Submitted by: ${request.submittedBy}
Approved on: ${request.approvedDate || 'N/A'}

Thank you for choosing AutoCare!
═══════════════════════════════════════
    `.trim();

    const blob = new Blob([billContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bill_${request.id}_${request.customerName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingCount = paymentRequests.filter(r => r.status === 'pending').length;
  const approvedCount = paymentRequests.filter(r => r.status === 'approved').length;
  const totalRevenue = paymentRequests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <AdminLayout activeTab="Payment Approval">
      <div className="flex flex-wrap justify-between gap-3 mb-6">
        <div className="flex min-w-72 flex-col gap-3">
          <p className="text-[#181111] text-4xl font-black leading-tight tracking-[-0.033em]">Payment Approval</p>
          <p className="text-gray-500 text-base font-normal leading-normal">
            Review and approve payment requests from employees. Generate bills for customers.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Requests</p>
              <p className="text-3xl font-bold text-[#181111] mt-1">{pendingCount}</p>
            </div>
            <div className="size-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <LucideFileText className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Approved</p>
              <p className="text-3xl font-bold text-[#181111] mt-1">{approvedCount}</p>
            </div>
            <div className="size-12 rounded-full bg-green-100 flex items-center justify-center">
              <LucideCheck className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-[#181111] mt-1">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center">
              <LucideDollarSign className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Requests */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-[#181111] mb-4">Payment Requests</h2>

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
    </AdminLayout>
  );
}
