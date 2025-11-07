// components/Chatbot.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  RefreshCw,
  Send,
  Smile,
  Paperclip,
  Minimize2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatbot } from "@/context/ChatbotContext";
import { cn } from "@/lib/utils";

export function Chatbot() {
  const {
    messages,
    isOpen,
    isLoading,
    sendMessage,
    toggleChatbot,
    clearHistory,
  } = useChatbot();
  const [inputValue, setInputValue] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    await sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = async (action: string) => {
    await sendMessage(action);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Floating Chatbot Button */}
      <Popover open={isOpen} onOpenChange={toggleChatbot}>
        <PopoverTrigger asChild>
          <button
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center group animate-pulse-red"
            aria-label="Open chatbot"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          side="top"
          className={cn(
            "w-[380px] h-[600px] p-0 shadow-xl border border-border rounded-lg overflow-hidden transition-all",
            isMinimized && "h-[60px]"
          )}
          sideOffset={20}
        >
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-heading font-bold text-sm">
                  GearUp Bot
                </h3>
                <p className="text-white/80 text-xs">We're online...</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearHistory}
                className="h-8 w-8 text-white hover:bg-white/20"
                title="Refresh chat"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 text-white hover:bg-white/20"
                title="Minimize"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleChatbot}
                className="h-8 w-8 text-white hover:bg-white/20"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background h-[440px]">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <MessageCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-heading font-bold text-foreground mb-2">
                      Welcome to GearUp!
                    </h4>
                    <p className="text-sm text-muted-foreground max-w-[280px]">
                      Hi there! 👋 How can I help you with your vehicle service
                      today?
                    </p>
                  </div>
                )}

                {messages.length > 0 && (
                  <div className="text-center mb-4">
                    <span className="text-xs text-muted-foreground bg-border/50 px-3 py-1 rounded-full">
                      {formatDate(messages[0]?.timestamp || Date.now())}
                    </span>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div key={message.id}>
                    <div
                      className={cn(
                        "flex gap-2 mb-2",
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2 break-words",
                          message.sender === "user"
                            ? "bg-primary text-white rounded-br-sm"
                            : "bg-border/50 text-foreground rounded-bl-sm"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>

                    {/* Suggested Actions */}
                    {message.sender === "bot" &&
                      message.suggestedActions &&
                      message.suggestedActions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3 ml-2">
                          {message.suggestedActions.map((action, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickReply(action)}
                              className="text-xs border-primary text-primary hover:bg-primary hover:text-white rounded-full"
                            >
                              {action}
                            </Button>
                          ))}
                        </div>
                      )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="bg-border/50 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <div
                          className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t bg-white p-3">
                <div className="flex items-center gap-2 bg-background rounded-full px-3 py-2 border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Add emoji"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Attach file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter message"
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    size="icon"
                    className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
                    title="Send message"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
}
