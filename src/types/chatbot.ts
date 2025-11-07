// types/chatbot.ts
export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: number;
  suggestedActions?: string[];
  intent?: string;
}

export interface ChatSession {
  id: string;
  userId?: string;
  startedAt: number;
  lastMessageAt: number;
  isActive: boolean;
}

export type ChatStatus = "idle" | "loading" | "error" | "success";
