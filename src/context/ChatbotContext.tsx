// context/ChatbotContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  ChatbotApiService,
  ChatMessageRequest,
  ChatMessageResponse,
  ConversationHistory,
} from "@/lib/api/chatbot";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: number;
  suggestedActions?: string[];
}

interface ChatbotContextType {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
  sessionId: string;
  sendMessage: (content: string) => Promise<void>;
  toggleChatbot: () => void;
  clearHistory: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  // Initialize session on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem("chatSessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
      loadHistory(storedSessionId);
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      setSessionId(newSessionId);
      localStorage.setItem("chatSessionId", newSessionId);
    }
  }, []);

  const loadHistory = async (sessionId: string) => {
    try {
      const history = await ChatbotApiService.getRecentHistory(sessionId, 20);
      const mappedMessages: Message[] = history.map(
        (h: ConversationHistory) => ({
          id: h.id,
          content: h.message,
          sender: h.sender,
          timestamp: new Date(h.timestamp).getTime(),
        })
      );
      setMessages(mappedMessages);
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !sessionId) return;

      const userMessage: Message = {
        id: `user_${Date.now()}`,
        content,
        sender: "user",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Get userId from localStorage if available (optional)
        const userId =
          typeof window !== "undefined"
            ? localStorage.getItem("userId") || undefined
            : undefined;

        const request: ChatMessageRequest = {
          content,
          sessionId,
          userId, // Optional - can be undefined
        };

        const response: ChatMessageResponse =
          await ChatbotApiService.sendMessage(request);

        const botMessage: Message = {
          id: `bot_${Date.now()}`,
          content: response.content,
          sender: "bot",
          timestamp: response.timestamp || Date.now(),
          suggestedActions: response.suggestedActions,
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error("Failed to send message:", error);

        const errorMessage: Message = {
          id: `error_${Date.now()}`,
          content:
            "Sorry, I encountered an error. Please try again or check if the chatbot service is running.",
          sender: "bot",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  const toggleChatbot = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    const newSessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setSessionId(newSessionId);
    localStorage.setItem("chatSessionId", newSessionId);
  }, []);

  return (
    <ChatbotContext.Provider
      value={{
        messages,
        isOpen,
        isLoading,
        sessionId,
        sendMessage,
        toggleChatbot,
        clearHistory,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  return context;
}
