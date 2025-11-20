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
/**
 * API Services Index
 * Central export for all API services
 */

// Configuration
export * from './config';

// Payment Service
export * from './paymentService';

// Bill Service
export * from './billService';

// Review Service
export * from './reviewService';
