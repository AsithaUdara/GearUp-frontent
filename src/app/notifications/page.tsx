// src/app/notifications/page.tsx
import React from "react";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export const metadata = {
  title: "Notifications | GearUp",
  description: "View and manage your notifications",
};

export default function NotificationsPage() {
  return <NotificationCenter />;
}
