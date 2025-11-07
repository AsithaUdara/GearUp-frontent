/**
 * Bill Service API
 * Handles all customer bill related API calls
 */

import { buildApiUrl } from './config';
import type { CustomerBill, PaymentStatusEnum } from '@/types/payment';

// ============= Helper Functions =============

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// ============= Customer Bill APIs =============

/**
 * Get customer bills by email
 */
export const getCustomerBills = async (email: string): Promise<CustomerBill[]> => {
  const url = buildApiUrl('payment', `/api/payments/customer/bills?email=${encodeURIComponent(email)}`);
  const response = await fetch(url);
  return handleResponse<CustomerBill[]>(response);
};

/**
 * Get customer bills filtered by payment status
 */
export const getCustomerBillsByStatus = async (
  email: string,
  status: PaymentStatusEnum
): Promise<CustomerBill[]> => {
  const url = buildApiUrl(
    'payment',
    `/api/payments/customer/bills?email=${encodeURIComponent(email)}&status=${status}`
  );
  const response = await fetch(url);
  return handleResponse<CustomerBill[]>(response);
};

/**
 * Mark bill as paid
 */
export const markBillAsPaid = async (billId: string): Promise<CustomerBill> => {
  const url = buildApiUrl('payment', `/api/payments/customer/bills/${billId}/mark-paid`);
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<CustomerBill>(response);
};

/**
 * Get bill by ID
 */
export const getBillById = async (billId: string): Promise<CustomerBill> => {
  const url = buildApiUrl('payment', `/api/payments/customer/bills/${billId}`);
  const response = await fetch(url);
  return handleResponse<CustomerBill>(response);
};

// ============= Helper Functions =============

/**
 * Check if bill can be paid
 */
export const canBillBePaid = (bill: CustomerBill): boolean => {
  return bill.paymentStatus === 'UNPAID';
};

/**
 * Check if bill can have a review submitted
 */
export const canSubmitReview = (bill: CustomerBill): boolean => {
  return bill.paymentStatus === 'PAID' && !bill.reviewSubmitted;
};

/**
 * Format bill amount with currency
 */
export const formatBillAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
