// src/components/notifications/NotificationExamples.tsx
/**
 * This file demonstrates various ways to use the notification system
 * This is for reference only - not meant to be used directly in production
 */

"use client";

import { useNotifications } from "@/context/NotificationContext";
import { useToast } from "@/hooks/use-toast";
import { useNotificationListener } from "@/hooks/useNotificationListener";
import { NotificationType } from "@/types/notification";
import { Button } from "@/components/ui/button";

export function NotificationExamples() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const { toast } = useToast();

  // Example 1: Listen for specific notification types
  useNotificationListener({
    types: [NotificationType.TASK_ASSIGNED, NotificationType.TASK_COMPLETED],
    onNotification: (notification) => {
      console.log("Task notification received:", notification);
      // Could trigger a task list refresh here
    },
    autoMarkAsRead: false,
  });

  // Example 2: Listen for appointment notifications
  useNotificationListener({
    types: [NotificationType.APPOINTMENT_REMINDER],
    onNotification: (notification) => {
      // Show a custom modal or alert for appointments
      toast({
        title: "📅 Appointment Reminder",
        description: notification.message,
        variant: "info",
      });
    },
  });

  // Example 3: Manual toast trigger
  const showCustomToast = () => {
    toast({
      title: "Custom Notification",
      description: "This is a manually triggered toast notification",
      variant: "success",
    });
  };

  // Example 4: Mark specific notification as read
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
      toast({
        title: "Marked as read",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "error",
      });
    }
  };

  // Example 5: Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast({
        title: "All notifications marked as read",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "error",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Notification System Examples</h2>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Current State</h3>
          <p>Unread Count: {unreadCount}</p>
          <p>Total Notifications: {notifications.length}</p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Actions</h3>
          <div className="space-x-2">
            <Button onClick={showCustomToast}>Show Custom Toast</Button>
            <Button onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
              Mark All as Read
            </Button>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Recent Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications</p>
          ) : (
            <ul className="space-y-2">
              {notifications.slice(0, 5).map((notification) => (
                <li key={notification.id} className="border-b pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-gray-600">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {notification.type} - {notification.priority}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-blue-50">
        <h3 className="font-semibold mb-2">Integration Points</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>NotificationBell component in header shows badge</li>
          <li>Context polls every 30 seconds for new notifications</li>
          <li>High/Urgent notifications auto-show as toasts</li>
          <li>Full notification center at /notifications route</li>
          <li>Use useNotificationListener for custom handling</li>
        </ul>
      </div>
    </div>
  );
}
