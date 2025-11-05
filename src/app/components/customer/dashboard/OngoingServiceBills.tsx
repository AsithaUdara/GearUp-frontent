"use client";
import React from "react";
import { LucideFileText, LucideClock, LucideWrench } from "lucide-react";

type ServiceItem = {
  id: string;
  description: string;
  price: number;
};

type OngoingBill = {
  id: string;
  customerEmail: string;
  customerName: string;
  vehicleInfo: string;
  services: ServiceItem[];
  totalAmount: number;
  submittedDate: string;
  status: 'pending';
  submittedBy: string;
};

export default function OngoingServiceBills() {
  const [ongoingBills, setOngoingBills] = React.useState<OngoingBill[]>([]);

  React.useEffect(() => {
    // Load pending/unapproved bills for current customer
    try {
      const raw = localStorage.getItem('adminPaymentRequests');
      if (raw) {
        const allRequests = JSON.parse(raw);
        // Filter only pending requests (unapproved bills)
        const pending = allRequests.filter((req: any) => req.status === 'pending');
        setOngoingBills(pending);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (ongoingBills.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center border-2 border-dashed border-gray-200">
        <LucideWrench className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">No ongoing services at the moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ongoingBills.map(bill => (
        <div
          key={bill.id}
          className="bg-white rounded-lg shadow-sm p-6 border-2 border-yellow-300"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-[#181111]">Bill #{bill.id}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white flex items-center gap-1">
                  <LucideClock className="w-3 h-3" />
                  PENDING APPROVAL
                </span>
              </div>
              <p className="text-sm text-gray-600">Vehicle: {bill.vehicleInfo}</p>
              <p className="text-sm text-gray-600">Submitted: {bill.submittedDate}</p>
              <p className="text-sm text-gray-600">Technician: {bill.submittedBy}</p>
            </div>
          </div>

          {/* Services Table */}
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 overflow-hidden mb-4">
            <table className="w-full">
              <thead className="bg-yellow-100">
                <tr>
                  <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Service</th>
                  <th className="text-right px-4 py-2 text-sm font-medium text-gray-700">Price</th>
                </tr>
              </thead>
              <tbody>
                {bill.services.map(service => (
                  <tr key={service.id} className="border-t border-yellow-200">
                    <td className="px-4 py-2 text-sm text-gray-800">{service.description}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 text-right">${service.price.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="border-t border-yellow-200">
                  <td className="px-4 py-2 text-sm text-gray-600">Tax (10%)</td>
                  <td className="px-4 py-2 text-sm text-gray-600 text-right">${(bill.totalAmount * 0.1).toFixed(2)}</td>
                </tr>
                <tr className="border-t-2 border-yellow-300 bg-yellow-100 font-bold">
                  <td className="px-4 py-2 text-sm">ESTIMATED TOTAL</td>
                  <td className="px-4 py-2 text-sm text-right">${(bill.totalAmount * 1.1).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <LucideClock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Awaiting Admin Approval</p>
                <p className="text-xs text-yellow-700 mt-1">
                  This bill is currently under review by our admin team. You will be able to download and pay once it's approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
