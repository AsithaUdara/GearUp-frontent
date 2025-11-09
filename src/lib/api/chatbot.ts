// lib/api/chatbot.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9090";

export interface ChatMessageRequest {
  content: string;
  sessionId: string;
  userId?: string;
  context?: string;
}

export interface ChatMessageResponse {
  content: string;
  sessionId: string;
  intent?: string;
  suggestedActions?: string[];
  timestamp?: number;
  requiresAction?: boolean;
  actionType?: string;
  actionData?: any;
  sender?: string;
  createdAt?: string;
}

export interface ConversationHistory {
  id: string;
  sessionId: string;
  message: string;
  sender: "user" | "bot";
  timestamp: string;
  intent?: string;
}

export class ChatbotApiService {
  private static async fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add user ID from session/localStorage if available (optional)
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("userId");
      if (userId) {
        headers["X-User-Id"] = userId;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "omit", // Don't send credentials for chatbot
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`API request failed (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  static async sendMessage(
    request: ChatMessageRequest
  ): Promise<ChatMessageResponse> {
    return this.fetchWithAuth(`${API_BASE_URL}/api/chat/send`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  static async getHistory(sessionId: string): Promise<ConversationHistory[]> {
    return this.fetchWithAuth(`${API_BASE_URL}/api/chat/history/${sessionId}`);
  }

  static async getRecentHistory(
    sessionId: string,
    limit: number = 10
  ): Promise<ConversationHistory[]> {
    return this.fetchWithAuth(
      `${API_BASE_URL}/api/chat/history/${sessionId}/recent?limit=${limit}`
    );
  }

  static async closeSession(sessionId: string): Promise<void> {
    await this.fetchWithAuth(
      `${API_BASE_URL}/api/chat/sessions/${sessionId}/close`,
      {
        method: "POST",
      }
    );
  }

  static async checkHealth(): Promise<{ status: string }> {
    return this.fetchWithAuth(`${API_BASE_URL}/api/chat/health`);
  }
}
