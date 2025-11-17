// lib/api/index.ts
export { ChatbotApiService } from "./chatbot";
export type {
  ChatMessageRequest,
  ChatMessageResponse,
  ConversationHistory,
} from "./chatbot";

export { NotificationApiService } from "./notifications";
export type {
  Notification,
  NotificationResponse,
  NotificationPageResponse,
  UnreadCountResponse,
} from "@/types/notification";
