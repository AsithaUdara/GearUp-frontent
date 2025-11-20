/**
 * TypeScript interfaces for Payment Service API
 * Matches backend DTOs exactly
 */

// ============= Enums =============

export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum PaymentStatusEnum {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
}

// ============= Service Item =============

export interface ServiceItem {
  id: string;
  serviceName: string;
  description: string;
  price: number;
}

// ============= Payment Request =============

export interface PaymentRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  vehicleInfo: string;
  totalAmount: number;
  status: PaymentStatus;
  submittedBy: string;
  submittedDate: string;
  approvedDate?: string;
  rejectionReason?: string;
  services: ServiceItem[];
}

export interface PaymentStatsDTO {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalRevenue: number;
}

// ============= Customer Bill =============

export interface CustomerBill {
  id: string;
  paymentRequestId: string;
  customerEmail: string;
  customerName: string;
  vehicleInfo: string;
  totalAmount: number;
  taxAmount: number;
  finalAmount: number;
  paymentStatus: PaymentStatusEnum;
  approvedDate: string;
  paidDate?: string;
  reviewSubmitted: boolean;
  services: ServiceItem[];
}

// ============= Review =============

export interface CustomerReview {
  id: string;
  billId: string;
  customerEmail: string;
  customerName: string;
  serviceName: string;
  rating: number;
  reviewText: string;
  status: ReviewStatus;
  submittedDate: string;
  publishedDate?: string;
}

export interface ReviewSubmissionDTO {
  billId: string;
  customerEmail: string;
  customerName: string;
  serviceName: string;
  rating: number;
  reviewText: string;
}

export interface ReviewStatsDTO {
  pendingCount: number;
  publishedCount: number;
  rejectedCount: number;
  averageRating: number;
}

// ============= API Response Wrappers =============

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
