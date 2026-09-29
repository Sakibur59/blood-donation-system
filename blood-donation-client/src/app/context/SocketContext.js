'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, token } = useAuth();
  const socketRef = useRef(null);

  // 🔌 Socket connection
  useEffect(() => {
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    if (socketRef.current?.connected) {
      return;
    }

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
      const userId = user.id || user._id;
      if (userId) newSocket.emit('join', userId.toString());
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

  // 🔔 Global notification listener
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      console.log('🔔 New notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket]);

  // 📥 Load initial notifications when user logs in
  useEffect(() => {
    if (!user || !token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const loadNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/notifications?limit=20`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error('Load notifications error:', error);
      }
    };

    loadNotifications();
  }, [user, token]);

  // Helper functions
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
    if (socket) socket.off(eventName, callback);
  };

  const value = {
    socket,
    isConnected,
    emitEvent,
    onEvent,
    offEvent,
    // 🔔 Notification state (shared globally)
    notifications,
    unreadCount,
    setNotifications,
    setUnreadCount,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}