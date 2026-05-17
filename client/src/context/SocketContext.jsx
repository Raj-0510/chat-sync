import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../api/axiosInstance';

import Toast from '../components/Toast';

const SocketContext = createContext(null);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocketContext must be used within SocketProvider');
  return context;
};

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const initialFetchDone = useRef(false);
  const [activeToasts, setActiveToasts] = useState([]);

  // ─── Notification Fetching ───
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.get('/api/notifications');
      setNotifications(res.data.data.notifications);
      setUnreadCount(res.data.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ─── Socket Connection ───
  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ Global Socket Connected');
      setIsConnected(true);
      // Re-fetch on reconnect to ensure consistency
      fetchNotifications();
    });

    newSocket.on('disconnect', () => setIsConnected(false));

    // Listen for events
    newSocket.on('new-notification', (n) => {
      setNotifications((prev) => [n, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show toast
      setActiveToasts((prev) => [...prev, n]);
    });

    newSocket.on('new-message', (m) => {
      const msgNotification = {
        _id: m._id || m.id || Math.random().toString(),
        type: 'message',
        message: `New message from ${m.senderName || 'someone'}: ${m.content}`,
        content: m.content,
        senderId: m.senderId,
        isRead: m.isRead || false,
        createdAt: m.createdAt || new Date().toISOString(),
      };
      
      setNotifications((prev) => [msgNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast for incoming chat message
      setActiveToasts((prev) => [...prev, msgNotification]);
    });


    newSocket.on('notification-read', ({ notificationId }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId || n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });

    newSocket.on('all-notifications-read', () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, fetchNotifications]);

  // Initial fetch on mount if token exists
  useEffect(() => {
    if (token && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchNotifications();
    }
  }, [token, fetchNotifications]);

  const markAsRead = async (id, type) => {
    try {
      if (type === 'message') {
        const msg = notifications.find((n) => n._id === id || n.id === id);
        if (msg && msg.senderId) {
          await api.patch(`/api/chat/read/${msg.senderId}`);
        }
      } else {
        await api.patch(`/api/notifications/${id}/read`);
      }
      // Optimistic update
      setNotifications(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };


  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const removeToast = (id) => {
    setActiveToasts((prev) => prev.filter(t => (t._id || t.id) !== id));
  };

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      notifications, 
      unreadCount, 
      loading,
      markAsRead,
      markAllAsRead,
      refetchNotifications: fetchNotifications
    }}>
      {children}
      {/* Toast Overlay */}
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 9999,
        pointerEvents: 'none',
      }}>
        {activeToasts.map((toast) => (
          <Toast 
            key={toast._id || toast.id || Math.random()} 
            notification={toast} 
            onClose={removeToast} 
          />
        ))}
      </div>
    </SocketContext.Provider>
  );
};
