'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context;
};

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect if user is logged in
    if (!user || !token) {
      // Disconnect existing socket if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Don't create multiple connections
    if (socketRef.current?.connected) {
      return;
    }

    // Create socket connection
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
      
      // Join user's personal room
      if (user.id || user._id) {
        newSocket.emit('join', user.id || user._id);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.off('connect');
        newSocket.off('disconnect');
        newSocket.off('connect_error');
        newSocket.off('reconnect');
        newSocket.disconnect();
      }
    };
  }, [user, token]);

  // Helper functions for common socket operations
  const emitEvent = (eventName, data) => {
    if (socket?.connected) {
      socket.emit(eventName, data);
    } else {
      console.warn('Socket not connected. Cannot emit:', eventName);
    }
  };

  const onEvent = (eventName, callback) => {
    if (socket) {
      socket.on(eventName, callback);
      return () => socket.off(eventName, callback);
    }
    return () => {};
  };

  const offEvent = (eventName, callback) => {
    if (socket) {
      socket.off(eventName, callback);
    }
  };

  const value = {
    socket,
    isConnected,
    emitEvent,
    onEvent,
    offEvent,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}