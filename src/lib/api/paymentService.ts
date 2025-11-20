/**
 * Payment Service API
 * Handles all payment request related API calls
 */

import { buildApiUrl } from './config';
import type { PaymentRequest, PaymentStatsDTO, PaymentStatus } from '@/types/payment';

// ============= Helper Functions =============

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// ============= Admin Payment APIs =============

/**
 * Get all payment requests (Admin)
 */
export const getAllPaymentRequests = async (): Promise<PaymentRequest[]> => {
  const url = buildApiUrl('payment', '/payments/admin/requests');
  const response = await fetch(url);
  return handleResponse<PaymentRequest[]>(response);
};

/**
 * Filter payment requests by status (Admin)
 */
export const getPaymentRequestsByStatus = async (status: PaymentStatus): Promise<PaymentRequest[]> => {
  const url = buildApiUrl('payment', `/payments/admin/requests?status=${status}`);
  const response = await fetch(url);
  return handleResponse<PaymentRequest[]>(response);
};

/**
 * Get payment request by ID (Admin)
 */
export const getPaymentRequestById = async (id: string): Promise<PaymentRequest> => {
  const url = buildApiUrl('payment', `/payments/admin/requests/${id}`);
  const response = await fetch(url);
  return handleResponse<PaymentRequest>(response);
};

/**
 * Approve payment request (Admin)
 */
export const approvePaymentRequest = async (id: string): Promise<PaymentRequest> => {
  const url = buildApiUrl('payment', `/payments/admin/requests/${id}/approve`);
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<PaymentRequest>(response);
};

/**
 * Reject payment request (Admin)
 */
export const rejectPaymentRequest = async (id: string, reason: string): Promise<PaymentRequest> => {
  const url = buildApiUrl('payment', `/payments/admin/requests/${id}/reject`);
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });
  return handleResponse<PaymentRequest>(response);
};

/**
 * Delete payment request (Admin)
 */
export const deletePaymentRequest = async (id: string): Promise<void> => {
  const url = buildApiUrl('payment', `/payments/admin/requests/${id}`);
  const response = await fetch(url, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete payment request: ${response.status}`);
  }
};

/**
 * Get payment statistics (Admin)
 */
export const getPaymentStats = async (): Promise<PaymentStatsDTO> => {
  const url = buildApiUrl('payment', '/payments/admin/stats');
  const response = await fetch(url);
  return handleResponse<PaymentStatsDTO>(response);
};

// ============= Error Handling Wrapper =============

/**
 * Wrap API calls with toast notifications
 */
export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  errorMessage: string = 'An error occurred'
): Promise<T | null> => {
  try {
    return await apiCall();
  } catch (error) {
    console.error(errorMessage, error);
    // You can integrate toast notifications here
    // toast.error(errorMessage);
    return null;
  }
};
