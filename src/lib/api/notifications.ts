// src/lib/api/notifications.ts

import {
  Notification,
  NotificationPageResponse,
  UnreadCountResponse,
} from "@/types/notification";
import { api } from "@/lib/apiClient";

export class NotificationApiService {

  /**
   * Get paginated notifications for the authenticated user
   */
  static async getUserNotifications(
    page: number = 0,
    size: number = 20
  ): Promise<NotificationPageResponse> {
    return api.get<NotificationPageResponse>(
      `/api/v1/notifications?page=${page}&size=${size}`
    );
  }

  /**
   * Get unread notifications for the authenticated user
   */
  static async getUnreadNotifications(): Promise<Notification[]> {
    return api.get<Notification[]>(`/api/v1/notifications/unread`);
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(): Promise<UnreadCountResponse> {
    return api.get<UnreadCountResponse>(`/api/v1/notifications/unread/count`);
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: number): Promise<Notification> {
    return api.patch<Notification>(
      `/api/v1/notifications/${notificationId}/read`
    );
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<void> {
    await api.patch<void>(`/api/v1/notifications/read-all`);
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: number): Promise<void> {
    await api.delete<void>(`/api/v1/notifications/${notificationId}`);
  }

  /**
   * Health check for notification service
   */
  static async checkHealth(): Promise<{ status: string }> {
    return api.get<{ status: string }>(`/api/v1/notifications/health`);
  }
}
