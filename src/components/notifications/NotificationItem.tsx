// src/components/notifications/NotificationItem.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  DollarSign,
  Wrench,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/context/NotificationContext";
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
  showActions?: boolean;
}

// Helper function to get icon based on notification type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.INVOICE_CREATED:
    case NotificationType.INVOICE_UPDATED:
    case NotificationType.INVOICE_PAID:
      return <DollarSign className="h-4 w-4" />;
    case NotificationType.TASK_ASSIGNED:
    case NotificationType.TASK_COMPLETED:
      return <Wrench className="h-4 w-4" />;
    case NotificationType.APPOINTMENT_REMINDER:
      return <Calendar className="h-4 w-4" />;
    case NotificationType.SYSTEM_ALERT:
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

// Helper function to get color based on priority
const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case NotificationPriority.URGENT:
      return "bg-red-100 text-red-700 border-red-200";
    case NotificationPriority.HIGH:
      return "bg-orange-100 text-orange-700 border-orange-200";
    case NotificationPriority.MEDIUM:
      return "bg-blue-100 text-blue-700 border-blue-200";
    case NotificationPriority.LOW:
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export function NotificationItem({
  notification,
  onClose,
  showActions = true,
}: NotificationItemProps) {
  const router = useRouter();
  const { markAsRead, deleteNotification } = useNotifications();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleClick = async () => {
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onClose?.();
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await deleteNotification(notification.id);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      setIsDeleting(false);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      className={cn(
        "group relative p-4 transition-colors cursor-pointer hover:bg-gray-50",
        !notification.isRead && "bg-blue-50/50 hover:bg-blue-50"
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border",
            getPriorityColor(notification.priority)
          )}
        >
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={cn(
                "text-sm font-medium line-clamp-1",
                !notification.isRead && "font-semibold"
              )}
            >
              {notification.title}
            </h4>
            {!notification.isRead && (
              <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full" />
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {notification.message}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">{timeAgo}</span>
            {notification.priority !== NotificationPriority.LOW && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  getPriorityColor(notification.priority)
                )}
              >
                {notification.priority}
              </Badge>
            )}
            {notification.relatedEntityType && (
              <Badge variant="outline" className="text-xs">
                {notification.relatedEntityType}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Delete notification"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
