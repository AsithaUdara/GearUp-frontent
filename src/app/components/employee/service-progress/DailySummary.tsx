"use client";

import { BarChart3, Download, FileText } from "lucide-react";
import type { WorkTask, ModificationRequest, PartsRequest } from "@/lib/workScheduleData";
import { useState } from "react";

interface DailySummaryProps {
  summaryByVehicle: Record<string, WorkTask[]>;
  onViewReport: (task: WorkTask) => void;
  fetchServicesByVehicle: (vehicle: string) => Promise<WorkTask[]>;
  fetchModificationRequestsByVehicle: (vehicle: string) => Promise<ModificationRequest[]>;
  fetchPartsRequestsByVehicle?: (vehicle: string) => Promise<PartsRequest[]>;
}

export default function DailySummary({ 
  summaryByVehicle,
  onViewReport,
  fetchServicesByVehicle,
  fetchModificationRequestsByVehicle,
  fetchPartsRequestsByVehicle
}: DailySummaryProps) {
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);

  const generatePDFReport = async (vehicle: string, tasks: WorkTask[]) => {
    setGeneratingPdf(vehicle);
    try {
      // Dynamic import for jsPDF
      const { default: jsPDF } = await import('jspdf');
      
      // Fetch all services, modifications, and parts requests for this vehicle
      const allServices = await fetchServicesByVehicle(vehicle);
      const modifications = await fetchModificationRequestsByVehicle(vehicle);
      const partsRequests = fetchPartsRequestsByVehicle ? await fetchPartsRequestsByVehicle(vehicle) : [];
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;
      
      // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
      doc.text('Service Completion Report', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      
      // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      // Vehicle and Customer Info
      const firstTask = tasks[0];
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
      doc.text('Vehicle Information', 20, yPos);
      yPos += 8;
      
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
      doc.text(`Vehicle: ${vehicle}`, 20, yPos);
      yPos += 6;
      doc.text(`Customer: ${firstTask?.customer || 'N/A'}`, 20, yPos);
      yPos += 10;
      
      // Completed Services
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
      doc.text('Completed Services', 20, yPos);
      yPos += 8;
      
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
      
      allServices.filter(s => s.status === 'completed').forEach((service, index) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
        
  doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${service.serviceType}`, 25, yPos);
        yPos += 5;
        
  doc.setFont('helvetica', 'normal');
        doc.text(`   Service ID: ${service.serviceId}`, 25, yPos);
        yPos += 5;
        doc.text(`   Completed: ${service.time || 'N/A'}`, 25, yPos);
        yPos += 5;
        
        if (service.notes) {
          const notesLines = doc.splitTextToSize(`   Notes: ${service.notes}`, pageWidth - 50);
          doc.text(notesLines, 25, yPos);
          yPos += notesLines.length * 5;
        }
        yPos += 3;
      });
      
      // Modification Requests
      if (modifications.length > 0) {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }
        
        yPos += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
        doc.text('Modification Requests', 20, yPos);
        yPos += 8;
        
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
        
        modifications.filter(m => m.status === 'completed' || m.status === 'approved').forEach((mod, index) => {
          if (yPos > pageHeight - 30) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. ${mod.title}`, 25, yPos);
          yPos += 5;
          
          doc.setFont('helvetica', 'normal');
          const descLines = doc.splitTextToSize(`   Description: ${mod.description}`, pageWidth - 50);
          doc.text(descLines, 25, yPos);
          yPos += descLines.length * 5;
          doc.text(`   Status: ${mod.status}`, 25, yPos);
          yPos += 5;
          doc.text(`   Requested: ${mod.requestedAt}`, 25, yPos);
          yPos += 5;
          if (mod.estimatedCost) {
            doc.text(`   Cost: LKR ${mod.estimatedCost.toLocaleString()}`, 25, yPos);
            yPos += 5;
          }
          yPos += 3;
        });
      }

      // Parts & Materials Requests
      const approvedParts = partsRequests.filter((p: PartsRequest) => p.status === 'Approved');
      if (approvedParts.length > 0) {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }
        
        yPos += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
        doc.text('Parts & Materials Requests', 20, yPos);
        yPos += 8;
        
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
        
        approvedParts.forEach((part: PartsRequest, index: number) => {
          if (yPos > pageHeight - 30) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. ${part.material}`, 25, yPos);
          yPos += 5;
          
          doc.setFont('helvetica', 'normal');
          doc.text(`   Quantity: ${part.quantity}`, 25, yPos);
          yPos += 5;
          doc.text(`   Status: ${part.status}`, 25, yPos);
          yPos += 5;
          doc.text(`   Date: ${part.date}`, 25, yPos);
          yPos += 5;
          if (part.notes) {
            const notesLines = doc.splitTextToSize(`   Notes: ${part.notes}`, pageWidth - 50);
            doc.text(notesLines, 25, yPos);
            yPos += notesLines.length * 5;
          }
          yPos += 3;
        });
      }
      
      // Summary
      const totalServices = allServices.filter(s => s.status === 'completed').length;
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }
      
      yPos += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
      doc.text('Summary', 20, yPos);
      yPos += 8;
      
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
      doc.text(`Total Services Completed: ${totalServices}`, 20, yPos);
      yPos += 6;
      doc.text(`Modification Requests: ${modifications.filter(m => m.status === 'completed' || m.status === 'approved').length}`, 20, yPos);
      yPos += 6;
      doc.text(`Parts & Materials Requests: ${approvedParts.length}`, 20, yPos);
      
      // Save PDF
      const fileName = `Service-Report-${vehicle.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      setGeneratingPdf(null);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setGeneratingPdf(null);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  const vehicleKeys = Object.keys(summaryByVehicle);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-fit">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-100 rounded-full">
            <BarChart3 className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Daily Summary</h2>
        </div>
      </div>

      {/* Vehicle-wise Summary */}
      <div className="space-y-4">
        {vehicleKeys.length > 0 ? (
          vehicleKeys.map((vehicle) => {
            const tasks = summaryByVehicle[vehicle];
            const customer = tasks[0]?.customer || 'Unknown';
            
            return (
              <div key={vehicle} className="border border-green-200 rounded-lg p-4 bg-green-50 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{vehicle}</h3>
                    <p className="text-xs text-gray-500">{customer}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {tasks.length} {tasks.length === 1 ? 'service' : 'services'} completed
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onViewReport(tasks[0])}
                      className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors"
                      title="View Report"
                    >
                      <FileText className="h-3 w-3" />
                      View Report
                    </button>
                    <button
                      onClick={() => generatePDFReport(vehicle, tasks)}
                      disabled={generatingPdf === vehicle}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Download PDF"
                    >
                      {generatingPdf === vehicle ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-3 w-3" />
                          PDF
                        </>
                      )}
                    </button>
        </div>
      </div>

                {/* Services list for this vehicle */}
                <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between text-xs">
              <div>
                        <span className="font-medium text-gray-900">{task.serviceType}</span>
                        <span className="text-gray-500 ml-2">({task.serviceId})</span>
              </div>
                      <span className="text-gray-500">{task.time || 'N/A'}</span>
          </div>
        ))}
      </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No completed services today
          </div>
        )}
      </div>
    </div>
  );
}