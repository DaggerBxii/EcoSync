/**
 * WebSocketProvider Component
 * Provides WebSocket connection context to components
 */

"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface WSContextType {
  isConnected: boolean;
  status: 'connected' | 'disconnected' | 'connecting';
  send: (data: Record<string, unknown>) => void;
  lastMessage: unknown | null;
}

const WSContext = createContext<WSContextType | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
  perspective: 'consumer' | 'enterprise' | 'datacenter';
  wsUrl?: string;
}

export function WebSocketProvider({
  children,
  perspective,
  wsUrl = 'ws://localhost:8000/api',
}: WebSocketProviderProps) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [lastMessage, setLastMessage] = useState<unknown | null>(null);

  useEffect(() => {
    setStatus('connecting');
    const websocket = new WebSocket(`${wsUrl}/${perspective}/ws`);

    websocket.onopen = () => {
      setStatus('connected');
    };

    websocket.onclose = () => {
      setStatus('disconnected');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('disconnected');
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (e) {
        console.error('Error parsing message:', e);
      }
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [perspective, wsUrl]);

  const send = useCallback((data: Record<string, unknown>) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }, [ws]);

  const value: WSContextType = {
    isConnected: status === 'connected',
    status,
    send,
    lastMessage,
  };

  return (
    <WSContext.Provider value={value}>
      {children}
    </WSContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WSContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}
