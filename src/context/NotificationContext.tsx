// src/context/NotificationContext.tsx
/**
 * Notification Context Provider
 *
 * Manages global notification state for the application.
 * Automatically polls for new notifications every 30 seconds.
 *
 * @example Basic Usage
 * ```tsx
 * import { useNotifications } from '@/context/NotificationContext';
 *
 * function MyComponent() {
 *   const { notifications, unreadCount, markAsRead } = useNotifications();
 *
 *   return (
 *     <div>
 *       <p>Unread: {unreadCount}</p>
 *       {notifications.map(n => (
 *         <div key={n.id} onClick={() => markAsRead(n.id)}>
 *           {n.title}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With Toast Notifications
 * ```tsx
 * import { useNotifications } from '@/context/NotificationContext';
 * import { useToast } from '@/hooks/use-toast';
 *
 * function MyComponent() {
 *   const { showToast } = useNotifications();
 *   const { toast } = useToast();
 *
 *   // High/Urgent notifications automatically show as toasts
 *   // Manual toast:
 *   toast({
 *     title: 'Success',
 *     description: 'Action completed',
 *     variant: 'success'
 *   });
 * }
 * ```
 */
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { NotificationApiService } from "@/lib/api/notifications";
import { Notification } from "@/types/notification";
import { useAuth } from "./AuthContext";
import { useNotificationWebSocket } from "@/hooks/useNotificationWebSocket";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  wsConnected: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  showToast: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: true,
  wsConnected: false,
  refreshNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  showToast: () => {},
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  /**
   * Show toast notification (placeholder for toast integration)
   */
  const showToast = useCallback((notification: Notification) => {
    // This will be implemented with a toast library
    console.log("Toast notification:", notification);
  }, []);

  /**
   * Handle new notification from WebSocket
   */
  const handleWebSocketNotification = useCallback((notification: Notification) => {
    console.log('New notification received via WebSocket:', notification);

    // Add to notifications list if not already present
    setNotifications((prev) => {
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;
      return [notification, ...prev];
    });

    // Increment unread count if notification is unread
    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }

    // Show toast for the notification
    showToast(notification);
  }, [showToast]);

  /**
   * Handle unread count update from WebSocket
   */
  const handleUnreadCountUpdate = useCallback((count: number) => {
    console.log('Unread count updated via WebSocket:', count);
    setUnreadCount(count);
  }, []);

  /**
   * WebSocket connection for real-time notifications
   */
  const { connected: wsConnected } = useNotificationWebSocket({
    onNotification: handleWebSocketNotification,
    onUnreadCountUpdate: handleUnreadCountUpdate,
    onConnect: () => {
      console.log('WebSocket connected - real-time notifications enabled');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected - falling back to polling');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
  });

  /**
   * Fetch unread notifications and count
   */
  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const [unreadNotifications, countResponse] = await Promise.all([
        NotificationApiService.getUnreadNotifications(),
        NotificationApiService.getUnreadCount(),
      ]);

      setNotifications(unreadNotifications);
      setUnreadCount(countResponse.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await NotificationApiService.markAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationApiService.markAllAsRead();

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      throw error;
    }
  }, []);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(
    async (notificationId: number) => {
      try {
        await NotificationApiService.deleteNotification(notificationId);

        // Update local state
        const notificationToDelete = notifications.find(
          (n) => n.id === notificationId
        );

        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        if (notificationToDelete && !notificationToDelete.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("Failed to delete notification:", error);
        throw error;
      }
    },
    [notifications]
  );

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Poll for new notifications every 60 seconds as fallback when WebSocket is not connected
  // If WebSocket is connected, we don't need frequent polling
  useEffect(() => {
    if (!user) return;

    // Use longer interval if WebSocket is connected (fallback only)
    const interval = setInterval(() => {
      if (!wsConnected) {
        console.log('Polling for notifications (WebSocket not connected)');
      }
      refreshNotifications();
    }, wsConnected ? 60000 : 30000); // 60s when WS connected, 30s otherwise

    return () => clearInterval(interval);
  }, [user, wsConnected, refreshNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        wsConnected,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        showToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
