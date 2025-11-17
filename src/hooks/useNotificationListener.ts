// src/hooks/useNotificationListener.ts
"use client";

import { useEffect } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { NotificationType, Notification } from "@/types/notification";

interface UseNotificationListenerOptions {
  types?: NotificationType[];
  onNotification?: (notification: Notification) => void;
  autoMarkAsRead?: boolean;
}

/**
 * Hook to listen for specific types of notifications
 *
 * @example
 * ```tsx
 * useNotificationListener({
 *   types: [NotificationType.TASK_ASSIGNED],
 *   onNotification: (notification) => {
 *     console.log('New task assigned!', notification);
 *     // Refresh task list, show modal, etc.
 *   },
 *   autoMarkAsRead: false
 * });
 * ```
 */
export function useNotificationListener({
  types,
  onNotification,
  autoMarkAsRead = false,
}: UseNotificationListenerOptions) {
  const { notifications, markAsRead } = useNotifications();

  useEffect(() => {
    if (!onNotification) return;

    // Filter notifications by type if specified
    const relevantNotifications = types
      ? notifications.filter((n) => types.includes(n.type))
      : notifications;

    // Process new unread notifications
    relevantNotifications
      .filter((n) => !n.isRead)
      .forEach((notification) => {
        onNotification(notification);

        // Auto mark as read if enabled
        if (autoMarkAsRead) {
          markAsRead(notification.id).catch((error) => {
            console.error("Failed to auto-mark notification as read:", error);
          });
        }
      });
  }, [notifications, types, onNotification, autoMarkAsRead, markAsRead]);
}
