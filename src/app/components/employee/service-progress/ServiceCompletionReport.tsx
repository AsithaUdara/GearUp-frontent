"use client";

import { FileText, Download, X, User, Car, Wrench, CheckCircle2 } from "lucide-react";
import type { WorkTask } from "@/lib/workScheduleData";

interface ModificationRequest {
  id: string;
  serviceId: string;
  type: 'add_service' | 'remove_service' | 'change_service' | 'urgent_repair';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  requestedBy: string;
  requestedAt: string;
  estimatedCost?: number;
  estimatedDuration?: number;
}

interface ServiceCompletionReportProps {
  vehicle: string;
  customer: string;
  allServices: WorkTask[];
  modificationRequests: ModificationRequest[];
  onClose: () => void;
  onNotifyCustomer?: () => void;
}

export default function ServiceCompletionReport({
  vehicle,
  customer,
  allServices,
  modificationRequests,
  onClose,
  onNotifyCustomer
}: ServiceCompletionReportProps) {
  const completedServices = allServices.filter(s => s.status === 'completed');
  const totalCost = completedServices.reduce((sum, s) => {
    const cost = 'cost' in s && typeof s.cost === 'number' ? s.cost : 0;
    return sum + cost;
  }, 0);
  const totalTime = completedServices.reduce((sum, s) => {
    const duration = 'duration' in s && typeof s.duration === 'number' ? s.duration : 0;
    return sum + duration;
  }, 0);
  
  const completedModifications = modificationRequests.filter(m => m.status === 'completed' || m.status === 'approved');
  const pendingModifications = modificationRequests.filter(m => m.status === 'pending' || m.status === 'in_progress');

  const handleDownload = () => {
    // Generate PDF report (mock implementation)
    const reportContent = `
SERVICE COMPLETION REPORT
Vehicle: ${vehicle}
Customer: ${customer}
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

COMPLETED SERVICES:
${completedServices.map((s, i) => `
${i + 1}. ${s.serviceType}
   Service ID: ${s.serviceId}
   Completed: ${s.time || 'N/A'}
   Notes: ${s.notes || 'N/A'}
`).join('\n')}

MODIFICATION REQUESTS:
${completedModifications.map((m, i) => `
${i + 1}. ${m.title}
   Type: ${m.type}
   Status: ${m.status}
   Requested: ${m.requestedAt}
`).join('\n')}

TOTAL SERVICES: ${completedServices.length}
TOTAL TIME: ${Math.floor(totalTime / 60)}h ${totalTime % 60}m
TOTAL COST: LKR ${totalCost.toLocaleString()}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Service-Report-${vehicle.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Service Completion Report</h2>
              <p className="text-sm text-gray-500">{vehicle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vehicle & Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Car className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-sm text-gray-500">Vehicle</div>
                <div className="font-semibold text-gray-900">{vehicle}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-sm text-gray-500">Customer</div>
                <div className="font-semibold text-gray-900">{customer}</div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Total Services</div>
              <div className="text-2xl font-bold text-gray-900">{completedServices.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-700">{completedServices.length}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Modifications</div>
              <div className="text-2xl font-bold text-red-700">{completedModifications.length}</div>
            </div>
          </div>

          {/* Completed Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-700" />
              Completed Services
            </h3>
            <div className="space-y-3">
              {completedServices.length > 0 ? (
                completedServices.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{service.serviceType}</div>
                        <div className="text-sm text-gray-500 mt-1">Service ID: {service.serviceId}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{service.time || 'N/A'}</div>
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">Completed</span>
                      </div>
                    </div>
                    {service.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {service.notes}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No completed services found</div>
              )}
            </div>
          </div>

          {/* Modification Requests */}
          {modificationRequests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-red-600" />
                Modification Requests
              </h3>
              <div className="space-y-3">
                {completedModifications.map((mod) => (
                  <div key={mod.id} className="border border-gray-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{mod.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{mod.description}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        mod.status === 'completed' ? 'bg-green-50 text-green-700' :
                        mod.status === 'approved' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {mod.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Requested by {mod.requestedBy} on {mod.requestedAt}
                      {mod.estimatedCost && ` • Cost: LKR ${mod.estimatedCost.toLocaleString()}`}
                    </div>
                  </div>
                ))}
                
                {pendingModifications.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Pending Requests:</div>
                    {pendingModifications.map((mod) => (
                      <div key={mod.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50 mb-2">
                        <div className="font-medium text-gray-900">{mod.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Status: <span className="font-medium">{mod.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
            >
              <Download className="h-4 w-4" />
              Download Report
            </button>
            {onNotifyCustomer && (
              <button
                onClick={onNotifyCustomer}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                <CheckCircle2 className="h-4 w-4" />
                Notify Customer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

