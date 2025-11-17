// src/hooks/useNotificationToasts.ts
"use client";

import { useEffect, useRef } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { useToast } from "@/hooks/use-toast";
import { Notification, NotificationPriority } from "@/types/notification";

/**
 * Hook to automatically show toast notifications for new notifications
 */
export function useNotificationToasts() {
  const { notifications } = useNotifications();
  const { toast } = useToast();
  const previousNotificationsRef = useRef<Notification[]>([]);

  useEffect(() => {
    const previousNotifications = previousNotificationsRef.current;
    const newNotifications = notifications.filter(
      (notification) =>
        !previousNotifications.some((prev) => prev.id === notification.id)
    );

    // Show toast for new notifications
    newNotifications.forEach((notification) => {
      // Only show toast for high priority or urgent notifications
      if (
        notification.priority === NotificationPriority.HIGH ||
        notification.priority === NotificationPriority.URGENT
      ) {
        const variant =
          notification.priority === NotificationPriority.URGENT
            ? "error"
            : "info";

        toast({
          title: notification.title,
          description: notification.message,
          variant: variant as
            | "default"
            | "success"
            | "info"
            | "warning"
            | "error",
        });
      }
    });

    previousNotificationsRef.current = notifications;
  }, [notifications, toast]);
}
