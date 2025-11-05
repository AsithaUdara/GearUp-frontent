/**
 * Utility function to seed past payment data for testing
 * Run this in the browser console or call it from your component
 */

export function seedPastPayments() {
  const samplePastPayments = [
    {
      id: 'receipt-001',
      billId: 'BILL-2024-001',
      date: '2024-03-15',
      subtotal: 500,
      vehicleInfo: 'Toyota Camry 2020 - ABC123'
    },
    {
      id: 'receipt-002',
      billId: 'BILL-2024-045',
      date: '2024-08-22',
      subtotal: 350,
      vehicleInfo: 'Honda Civic 2019 - XYZ789'
    },
    {
      id: 'receipt-003',
      billId: 'BILL-2023-112',
      date: '2023-12-10',
      subtotal: 275,
      vehicleInfo: 'Ford F-150 2021 - LMN456'
    },
    {
      id: 'receipt-004',
      billId: 'BILL-2024-089',
      date: '2024-06-05',
      subtotal: 620,
      vehicleInfo: 'Tesla Model 3 2022 - TES999'
    },
    {
      id: 'receipt-005',
      billId: 'BILL-2023-234',
      date: '2023-09-18',
      subtotal: 180,
      vehicleInfo: 'BMW X5 2021 - BMW777'
    }
  ];

  try {
    localStorage.setItem('customerPastPayments', JSON.stringify(samplePastPayments));
    console.log('✅ Past payments data seeded successfully!');
    console.log('Sample data:', samplePastPayments);
    return true;
  } catch (error) {
    console.error('❌ Failed to seed past payments:', error);
    return false;
  }
}

export function clearPastPayments() {
  try {
    localStorage.removeItem('customerPastPayments');
    console.log('✅ Past payments cleared successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear past payments:', error);
    return false;
  }
}

// Make it available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).seedPastPayments = seedPastPayments;
  (window as any).clearPastPayments = clearPastPayments;
}
