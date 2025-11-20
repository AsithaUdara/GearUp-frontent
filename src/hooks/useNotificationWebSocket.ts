/**
 * WebSocket Hook for Real-time Notifications
 *
 * Connects to the backend notification service WebSocket endpoint
 * and receives real-time notifications for the authenticated user.
 *
 * @example
 * ```tsx
 * import { useNotificationWebSocket } from '@/hooks/useNotificationWebSocket';
 *
 * function MyComponent() {
 *   const { connected, error } = useNotificationWebSocket({
 *     onNotification: (notification) => {
 *       console.log('New notification:', notification);
 *     },
 *     onUnreadCountUpdate: (count) => {
 *       console.log('Unread count:', count);
 *     }
 *   });
 *
 *   return <div>WebSocket: {connected ? 'Connected' : 'Disconnected'}</div>;
 * }
 * ```
 */

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Notification } from "@/types/notification";
import { auth } from "@/lib/firebase";

// Use API Gateway URL (default: http://localhost:9090)
// The Gateway will route /api/v1/ws to notification-service
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9090";
const WS_ENDPOINT = `${API_BASE_URL}/api/v1/ws`;

interface UseNotificationWebSocketOptions {
  onNotification?: (notification: Notification) => void;
  onUnreadCountUpdate?: (count: number) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface WebSocketState {
  connected: boolean;
  error: Error | null;
}

export function useNotificationWebSocket(
  options: UseNotificationWebSocketOptions = {}
) {
  const {
    onNotification,
    onUnreadCountUpdate,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const clientRef = useRef<Client | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    error: null,
  });

  const connect = useCallback(async () => {
    try {
      // Check if max reconnect attempts reached
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.warn(
          `WebSocket: Max reconnection attempts (${maxReconnectAttempts}) reached. Stopping reconnection.`
        );
        setState({
          connected: false,
          error: new Error("Max reconnection attempts reached"),
        });
        return;
      }

      // Get Firebase token
      const user = auth.currentUser;
      if (!user) {
        console.log("No user authenticated, skipping WebSocket connection");
        reconnectAttemptsRef.current = 0; // Reset on no user
        return;
      }

      const token = await user.getIdToken();
      reconnectAttemptsRef.current += 1;
      console.log(
        `WebSocket connection attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`
      );

      // Create SockJS instance
      const socket = new SockJS(WS_ENDPOINT);

      // Create STOMP client
      const client = new Client({
        webSocketFactory: () => socket as any,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          if (process.env.NEXT_PUBLIC_LOG_LEVEL === "debug") {
            console.log("[WebSocket Debug]", str);
          }
        },
        reconnectDelay: reconnectAttemptsRef.current * 5000, // Exponential backoff
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          console.log("WebSocket connected successfully");
          reconnectAttemptsRef.current = 0; // Reset on successful connection
          setState({ connected: true, error: null });

          // Subscribe to user-specific notification queue
          client.subscribe("/user/queue/notifications", (message: IMessage) => {
            try {
              const notification: Notification = JSON.parse(message.body);
              console.log("Received notification via WebSocket:", notification);
              onNotification?.(notification);
            } catch (error) {
              console.error("Error parsing notification message:", error);
            }
          });

          // Subscribe to unread count updates
          client.subscribe("/user/queue/unread-count", (message: IMessage) => {
            try {
              const data = JSON.parse(message.body);
              console.log("Received unread count update:", data);
              onUnreadCountUpdate?.(data.unreadCount || data);
            } catch (error) {
              console.error("Error parsing unread count message:", error);
            }
          });

          onConnect?.();
        },
        onDisconnect: () => {
          console.log("WebSocket disconnected");
          setState((prev) => ({ ...prev, connected: false }));
          onDisconnect?.();
        },
        onStompError: (frame) => {
          const error = new Error(
            `STOMP error: ${frame.headers["message"] || "Unknown error"}`
          );
          console.error("STOMP error:", frame);
          setState({ connected: false, error });
          onError?.(error);
        },
        onWebSocketError: (event) => {
          const error = new Error(
            reconnectAttemptsRef.current >= maxReconnectAttempts
              ? "WebSocket: Max reconnection attempts reached"
              : "WebSocket connection error"
          );
          console.error(
            `WebSocket error (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}):`,
            event
          );
          setState({ connected: false, error });
          onError?.(error);

          // Stop client if max attempts reached
          if (
            reconnectAttemptsRef.current >= maxReconnectAttempts &&
            clientRef.current
          ) {
            console.warn("Stopping WebSocket client due to max attempts");
            clientRef.current.deactivate();
          }
        },
      });

      // Activate the client
      client.activate();
      clientRef.current = client;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error("Unknown WebSocket error");
      console.error("Failed to connect WebSocket:", err);
      setState({ connected: false, error: err });
      onError?.(err);
    }
  }, [onNotification, onUnreadCountUpdate, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      console.log("Disconnecting WebSocket...");
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    reconnectAttemptsRef.current = 0; // Reset attempts on manual disconnect
  }, []);

  // Manual reconnect that resets the attempt counter
  const manualReconnect = useCallback(() => {
    console.log("Manual reconnection triggered - resetting attempt counter");
    disconnect();
    reconnectAttemptsRef.current = 0;
    setTimeout(() => connect(), 500); // Small delay before reconnecting
  }, [connect, disconnect]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    // Only connect if user is authenticated
    const user = auth.currentUser;
    if (user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Reconnect when auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && !clientRef.current?.connected) {
        // User logged in, connect WebSocket
        connect();
      } else if (!user && clientRef.current) {
        // User logged out, disconnect WebSocket
        disconnect();
      }
    });

    return () => unsubscribe();
  }, [connect, disconnect]);

  return {
    connected: state.connected,
    error: state.error,
    disconnect,
    reconnect: manualReconnect, // Use manual reconnect that resets counter
    remainingAttempts: Math.max(
      0,
      maxReconnectAttempts - reconnectAttemptsRef.current
    ),
  };
}
