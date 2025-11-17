// src/components/notifications/NotificationCenter.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/context/NotificationContext";
import { NotificationApiService } from "@/lib/api/notifications";
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from "@/types/notification";
import { NotificationItem } from "./NotificationItem";

type FilterType = "all" | "unread" | NotificationType;
type FilterPriority = "all" | NotificationPriority;

export function NotificationCenter() {
  const { markAllAsRead, refreshNotifications } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notifications
  const fetchNotifications = async (
    pageNum: number = 0,
    append: boolean = false
  ) => {
    setLoading(true);
    try {
      const response = await NotificationApiService.getUserNotifications(
        pageNum,
        20
      );

      if (append) {
        setNotifications((prev) => [...prev, ...response.content]);
      } else {
        setNotifications(response.content);
      }

      setHasMore(!response.last);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(0);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchNotifications(0), refreshNotifications()]);
    setRefreshing(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1, true);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    // Filter by type
    if (filterType === "unread" && notification.isRead) return false;
    if (
      filterType !== "all" &&
      filterType !== "unread" &&
      notification.type !== filterType
    ) {
      return false;
    }

    // Filter by priority
    if (filterPriority !== "all" && notification.priority !== filterPriority) {
      return false;
    }

    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="text-sm text-gray-500">
                Stay updated with your latest activities
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value as FilterType)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All notifications</SelectItem>
                <SelectItem value="unread">Unread only</SelectItem>
                <Separator className="my-1" />
                <SelectItem value={NotificationType.GENERAL}>
                  General
                </SelectItem>
                <SelectItem value={NotificationType.TASK_ASSIGNED}>
                  Task Assigned
                </SelectItem>
                <SelectItem value={NotificationType.TASK_COMPLETED}>
                  Task Completed
                </SelectItem>
                <SelectItem value={NotificationType.APPOINTMENT_REMINDER}>
                  Appointments
                </SelectItem>
                <SelectItem value={NotificationType.INVOICE_CREATED}>
                  Invoices
                </SelectItem>
                <SelectItem value={NotificationType.SYSTEM_ALERT}>
                  System Alerts
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterPriority}
              onValueChange={(value) =>
                setFilterPriority(value as FilterPriority)
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value={NotificationPriority.URGENT}>
                  Urgent
                </SelectItem>
                <SelectItem value={NotificationPriority.HIGH}>High</SelectItem>
                <SelectItem value={NotificationPriority.MEDIUM}>
                  Medium
                </SelectItem>
                <SelectItem value={NotificationPriority.LOW}>Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1" />

          {unreadCount > 0 && (
            <>
              <Badge variant="secondary" className="text-sm">
                {unreadCount} unread
              </Badge>
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Bell className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications found
            </h3>
            <p className="text-sm text-gray-500">
              {filterType !== "all" || filterPriority !== "all"
                ? "Try adjusting your filters to see more notifications."
                : "You're all caught up! Check back later for updates."}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  showActions={true}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="p-4 text-center border-t">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
