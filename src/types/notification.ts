// src/types/notification.ts

export enum NotificationType {
  INVOICE_CREATED = "INVOICE_CREATED",
  INVOICE_UPDATED = "INVOICE_UPDATED",
  INVOICE_PAID = "INVOICE_PAID",
  PAYMENT_COMPLETED = "PAYMENT_COMPLETED",
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_COMPLETED = "TASK_COMPLETED",
  APPOINTMENT_REMINDER = "APPOINTMENT_REMINDER",
  CUSTOMER_REGISTERED = "CUSTOMER_REGISTERED",
  CUSTOMER_KYC_CHANGED = "CUSTOMER_KYC_CHANGED",
  USER_REGISTERED = "USER_REGISTERED",
  ROLE_ASSIGNED = "ROLE_ASSIGNED",
  VEHICLE_REGISTERED = "VEHICLE_REGISTERED",
  VEHICLE_UPDATED = "VEHICLE_UPDATED",
  SYSTEM_ALERT = "SYSTEM_ALERT",
  GENERAL = "GENERAL",
}

export enum NotificationPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
  actionUrl?: string;
  deliveryChannels?: string;
  metadata?: string;
  sentAt?: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
  actionUrl?: string;
  deliveryChannels?: string;
  metadata?: string;
  sentAt?: string;
  createdAt: string;
  readAt?: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface NotificationPageResponse {
  content: Notification[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
