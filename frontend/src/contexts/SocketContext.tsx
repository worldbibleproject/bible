'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SocketContextType } from '@/types';

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000', {
        auth: {
          token,
        },
        autoConnect: true,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, token]);

  const joinConversation = (conversationId: string) => {
    if (socket) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socket) {
      socket.emit('leave_conversation', conversationId);
    }
  };

  const sendTyping = (conversationId: string, isTyping: boolean) => {
    if (socket) {
      if (isTyping) {
        socket.emit('typing_start', { conversationId });
      } else {
        socket.emit('typing_stop', { conversationId });
      }
    }
  };

  const onTyping = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('user_typing', callback);
    }
  };

  const offTyping = (callback: (data: any) => void) => {
    if (socket) {
      socket.off('user_typing', callback);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendTyping,
    onTyping,
    offTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}


