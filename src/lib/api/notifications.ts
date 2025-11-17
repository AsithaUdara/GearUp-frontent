// src/lib/api/notifications.ts

import {
  Notification,
  NotificationPageResponse,
  UnreadCountResponse,
} from "@/types/notification";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9090";

export class NotificationApiService {
  /**
   * Get Firebase ID token from local storage or auth context
   */
  private static getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("firebaseToken") || null;
  }

  /**
   * Fetch with authentication headers
   */
  private static async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(
        `Notification API request failed (${response.status}): ${errorText}`
      );
    }

    return response.json();
  }

  /**
   * Get paginated notifications for the authenticated user
   */
  static async getUserNotifications(
    page: number = 0,
    size: number = 20
  ): Promise<NotificationPageResponse> {
    return this.fetchWithAuth(
      `${API_BASE_URL}/api/v1/notifications?page=${page}&size=${size}`
    );
  }

  /**
   * Get unread notifications for the authenticated user
   */
  static async getUnreadNotifications(): Promise<Notification[]> {
    return this.fetchWithAuth(`${API_BASE_URL}/api/v1/notifications/unread`);
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(): Promise<UnreadCountResponse> {
    return this.fetchWithAuth(
      `${API_BASE_URL}/api/v1/notifications/unread/count`
    );
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: number): Promise<Notification> {
    return this.fetchWithAuth(
      `${API_BASE_URL}/api/v1/notifications/${notificationId}/read`,
      {
        method: "PATCH",
      }
    );
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/api/v1/notifications/read-all`, {
      method: "PATCH",
    });
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: number): Promise<void> {
    await this.fetchWithAuth(
      `${API_BASE_URL}/api/v1/notifications/${notificationId}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * Health check for notification service
   */
  static async checkHealth(): Promise<{ status: string }> {
    return fetch(`${API_BASE_URL}/api/v1/notifications/health`).then((res) =>
      res.json()
    );
  }
}
