import { jsPDF } from 'jspdf';

export type BillData = {
  id: string;
  customerName: string;
  customerEmail: string;
  vehicleInfo: string;
  services: Array<{
    id: string;
    description: string;
    price: number;
  }>;
  totalAmount: number;
  approvedDate: string;
  status?: string;
  submittedBy?: string;
};

export function generateBillPDF(billData: BillData): void {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor: [number, number, number] = [231, 29, 54]; // #E71D36 - GearUp red
  const darkGray: [number, number, number] = [24, 17, 17]; // #181111
  const lightGray: [number, number, number] = [107, 114, 128]; // Gray-500
  const borderGray: [number, number, number] = [229, 231, 235]; // Gray-200
  
  let yPosition = 20;
  
  // Header with logo area and company name
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('GEARUP', 20, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Automobile Service', 20, 28);
  
  // Bill title on the right
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICE BILL', 150, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bill ID: ${billData.id}`, 150, 27);
  doc.text(`Date: ${new Date(billData.approvedDate).toLocaleDateString()}`, 150, 33);
  
  yPosition = 50;
  
  // Customer Information Section
  doc.setTextColor(...darkGray);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTOMER INFORMATION', 20, yPosition);
  
  yPosition += 2;
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);
  
  doc.text('Customer Name:', 20, yPosition);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'bold');
  doc.text(billData.customerName, 60, yPosition);
  
  yPosition += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);
  doc.text('Email:', 20, yPosition);
  doc.setTextColor(...darkGray);
  doc.text(billData.customerEmail, 60, yPosition);
  
  yPosition += 7;
  doc.setTextColor(...lightGray);
  doc.text('Vehicle:', 20, yPosition);
  doc.setTextColor(...darkGray);
  doc.text(billData.vehicleInfo, 60, yPosition);
  
  if (billData.submittedBy) {
    yPosition += 7;
    doc.setTextColor(...lightGray);
    doc.text('Technician:', 20, yPosition);
    doc.setTextColor(...darkGray);
    doc.text(billData.submittedBy, 60, yPosition);
  }
  
  yPosition += 15;
  
  // Services Section
  doc.setTextColor(...darkGray);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICE DETAILS', 20, yPosition);
  
  yPosition += 2;
  doc.line(20, yPosition, 190, yPosition);
  
  yPosition += 8;
  
  // Table Header
  doc.setFillColor(249, 250, 251); // Gray-50
  doc.rect(20, yPosition - 5, 170, 8, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('Service Description', 25, yPosition);
  doc.text('Price', 175, yPosition, { align: 'right' });
  
  yPosition += 8;
  
  // Service Items
  doc.setFont('helvetica', 'normal');
  billData.services.forEach((service, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(20, yPosition - 5, 170, 7, 'F');
    }
    
    doc.setTextColor(...darkGray);
    doc.text(service.description, 25, yPosition);
    doc.text(`$${service.price.toFixed(2)}`, 185, yPosition, { align: 'right' });
    yPosition += 7;
  });
  
  yPosition += 5;
  
  // Subtotal, Tax, and Total
  doc.setDrawColor(...borderGray);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 8;
  
  const subtotal = billData.totalAmount;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);
  doc.text('Subtotal:', 120, yPosition);
  doc.setTextColor(...darkGray);
  doc.text(`$${subtotal.toFixed(2)}`, 185, yPosition, { align: 'right' });
  
  yPosition += 7;
  doc.setTextColor(...lightGray);
  doc.text('Tax (10%):', 120, yPosition);
  doc.setTextColor(...darkGray);
  doc.text(`$${tax.toFixed(2)}`, 185, yPosition, { align: 'right' });
  
  yPosition += 2;
  doc.setLineWidth(1);
  doc.setDrawColor(...darkGray);
  doc.line(115, yPosition, 190, yPosition);
  
  yPosition += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('TOTAL AMOUNT:', 120, yPosition);
  doc.setTextColor(...primaryColor);
  doc.text(`$${total.toFixed(2)}`, 185, yPosition, { align: 'right' });
  
  // Status Badge (if provided)
  if (billData.status) {
    yPosition += 10;
    const statusText = billData.status.toUpperCase();
    const statusWidth = doc.getTextWidth(statusText) + 10;
    
    if (billData.status === 'paid') {
      doc.setFillColor(34, 197, 94); // Green-500
    } else if (billData.status === 'unpaid') {
      doc.setFillColor(234, 179, 8); // Yellow-500
    } else {
      doc.setFillColor(...lightGray);
    }
    
    doc.roundedRect(120, yPosition - 4, statusWidth, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(statusText, 125, yPosition + 1);
  }
  
  // Footer
  const footerY = 280;
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.5);
  doc.line(20, footerY, 190, footerY);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...lightGray);
  doc.text('Thank you for choosing GearUp Automobile Service!', 105, footerY + 5, { align: 'center' });
  doc.text('For inquiries, contact us at support@gearup.com | (555) 123-4567', 105, footerY + 10, { align: 'center' });
  
  // Save the PDF
  const fileName = `GearUp_Bill_${billData.id}_${billData.customerName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}
