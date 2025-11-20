/**
 * Review Service API
 * Handles all customer review related API calls
 */

import { buildApiUrl } from './config';
import type { CustomerReview, ReviewSubmissionDTO, ReviewStatsDTO, ReviewStatus } from '@/types/payment';

// ============= Helper Functions =============

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// ============= Customer Review APIs =============

/**
 * Submit a new review (Customer)
 */
export const submitReview = async (reviewData: ReviewSubmissionDTO): Promise<CustomerReview> => {
  const url = buildApiUrl('payment', '/reviews/customer');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData),
  });
  return handleResponse<CustomerReview>(response);
};

/**
 * Get customer's reviews by email
 */
export const getMyReviews = async (email: string): Promise<CustomerReview[]> => {
  const url = buildApiUrl('payment', `/reviews/customer?email=${encodeURIComponent(email)}`);
  const response = await fetch(url);
  return handleResponse<CustomerReview[]>(response);
};

// ============= Admin Review APIs =============

/**
 * Get all reviews (Admin)
 */
export const getAllReviews = async (): Promise<CustomerReview[]> => {
  const url = buildApiUrl('payment', '/reviews/admin');
  const response = await fetch(url);
  return handleResponse<CustomerReview[]>(response);
};

/**
 * Filter reviews by status (Admin)
 */
export const getReviewsByStatus = async (status: ReviewStatus): Promise<CustomerReview[]> => {
  const url = buildApiUrl('payment', `/reviews/admin?status=${status}`);
  const response = await fetch(url);
  return handleResponse<CustomerReview[]>(response);
};

/**
 * Publish a review (Admin)
 */
export const publishReview = async (reviewId: string): Promise<CustomerReview> => {
  const url = buildApiUrl('payment', `/reviews/admin/${reviewId}/publish`);
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<CustomerReview>(response);
};

/**
 * Unpublish a review (Admin)
 */
export const unpublishReview = async (reviewId: string): Promise<CustomerReview> => {
  const url = buildApiUrl('payment', `/reviews/admin/${reviewId}/unpublish`);
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<CustomerReview>(response);
};

/**
 * Delete a review (Admin)
 */
export const deleteReview = async (reviewId: string): Promise<void> => {
  const url = buildApiUrl('payment', `/reviews/admin/${reviewId}`);
  const response = await fetch(url, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete review: ${response.status}`);
  }
};

/**
 * Get review statistics (Admin)
 */
export const getReviewStats = async (): Promise<ReviewStatsDTO> => {
  const url = buildApiUrl('payment', '/reviews/admin/stats');
  const response = await fetch(url);
  return handleResponse<ReviewStatsDTO>(response);
};

// ============= Public Review APIs =============

/**
 * Get published reviews for landing page (Public)
 */
export const getPublishedReviews = async (): Promise<CustomerReview[]> => {
  const url = buildApiUrl('payment', '/reviews/public');
  const response = await fetch(url);
  return handleResponse<CustomerReview[]>(response);
};

// ============= Helper Functions =============

/**
 * Render star rating as string
 */
export const renderStars = (rating: number): string => {
  return '⭐'.repeat(rating);
};

/**
 * Validate review text length
 */
export const isValidReviewText = (text: string): boolean => {
  return text.length >= 10 && text.length <= 1000;
};

/**
 * Validate rating value
 */
export const isValidRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5;
};

/**
 * Format review date
 */
export const formatReviewDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
