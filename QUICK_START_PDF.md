# Quick Start: PDF Bill Generation

## For Developers

### Installation
No installation needed! The `jspdf` package is already in your dependencies.

### Using the PDF Generator

Import the function:
```typescript
import { generateBillPDF } from '@/lib/pdfGenerator';
```

Generate a PDF:
```typescript
generateBillPDF({
  id: "BILL-123",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  vehicleInfo: "Toyota Camry 2020 - ABC123",
  services: [
    { id: "s1", description: "Oil Change", price: 50.00 },
    { id: "s2", description: "Tire Service", price: 40.00 }
  ],
  totalAmount: 90.00,
  approvedDate: "2025-11-05",
  status: "paid",              // Optional
  submittedBy: "Mike Johnson"  // Optional
});
```

That's it! The PDF will automatically download.

## For Users

### Customer - Download Your Bill

1. **Login** to your customer account
2. Go to **Dashboard** → **Payment** section
3. Find your approved bill in the "Approved Bills" section
4. Click the **"Download Bill"** button (gray button with download icon)
5. Your bill will download as a PDF file: `GearUp_Bill_[ID]_[YourName].pdf`
6. Open and view your professional bill!

### Admin - Generate Bill for Customer

1. **Login** to admin panel
2. Go to **Payment Approval** section
3. Review pending payment requests
4. Click **"Approve & Generate Bill"** to approve (green button)
5. After approval, click **"Download Bill"** (red button)
6. Professional PDF bill downloads automatically
7. You can send this PDF to the customer via email

## PDF Contains

✅ GearUp branding and logo  
✅ Bill ID and date  
✅ Customer information  
✅ Vehicle details  
✅ Complete service list with prices  
✅ Subtotal, tax, and total calculations  
✅ Payment status (Paid/Unpaid)  
✅ Technician name (for admin bills)  
✅ Contact information  

## File Examples

**Admin Generated:**
```
GearUp_Bill_pr1_John_Doe.pdf
```

**Customer Downloaded:**
```
GearUp_Bill_pr2_Jane_Smith.pdf
```

## Tips

### For Customers:
- Download your bills for record-keeping
- Print PDFs for your personal files
- Keep digital copies for warranty claims
- Check all services are listed correctly

### For Admins:
- Review bills before sending to customers
- Keep copies for accounting records
- Verify all service charges are accurate
- Ensure customer information is correct

## Troubleshooting

### PDF Not Downloading?
1. Check your browser's popup blocker
2. Allow downloads from localhost
3. Check your Downloads folder
4. Try a different browser

### PDF Looks Wrong?
1. Open with Adobe Reader or browser PDF viewer
2. Check if all data was entered correctly
3. Clear browser cache and try again

### Can't Find Download Button?
- **Customer:** Bill must be "Approved" status
- **Admin:** Request must be "Approved" status first

## Printing

To print your PDF bill:
1. Open the downloaded PDF
2. Press `Ctrl+P` (Windows) or `Cmd+P` (Mac)
3. Select your printer
4. Choose print settings (color/black & white)
5. Click Print

**Recommended settings:**
- Paper size: A4 or Letter
- Orientation: Portrait
- Color: Color (for best appearance)
- Scale: 100%

## Mobile Users

On mobile devices:
1. Download the PDF to your device
2. Open with your PDF reader app
3. View, share, or print as needed
4. PDFs work on iOS and Android

## Browser Support

✅ Chrome / Edge  
✅ Firefox  
✅ Safari  
✅ Opera  
✅ Brave  

## Security Note

All PDF generation happens in your browser. No bill data is sent to external servers during PDF creation.

## Need Help?

- Check `PDF_BILL_FEATURE.md` for detailed documentation
- Check `PDF_TEMPLATE_STRUCTURE.md` for layout information
- Contact support: support@gearup.com

---

**Enjoy your professional PDF bills! 🎉**
