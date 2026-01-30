import { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../api/index';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'academic' | 'financial' | 'announcement' | 'reminder';
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  actionLabelAr?: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

// Transform backend notification to frontend format
const transformNotification = (data: any): Notification => {
  const typeMap: Record<string, Notification['type']> = {
    ACADEMIC: 'academic',
    FINANCIAL: 'financial',
    GENERAL: 'info',
    URGENT: 'warning',
    ANNOUNCEMENT: 'announcement',
    REMINDER: 'reminder',
    SUCCESS: 'success',
    ERROR: 'error',
  };

  return {
    id: data.id?.toString() || String(Math.random()),
    type: typeMap[data.type?.toUpperCase()] || 'info',
    title: data.title || data.subject || 'Notification',
    titleAr: data.title_ar || data.subject_ar,
    message: data.message || data.content || data.body || '',
    messageAr: data.message_ar || data.content_ar || data.body_ar,
    timestamp: new Date(data.created_at || data.timestamp || Date.now()),
    read: data.read_at !== null || data.is_read || false,
    actionUrl: data.action_url || data.link,
    actionLabel: data.action_label || (data.action_url ? 'View' : undefined),
    actionLabelAr: data.action_label_ar || (data.action_url ? 'عرض' : undefined),
  };
};

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await notificationsAPI.getAll();
      const data = response.data || response || [];

      const transformed = data.map(transformNotification);
      setNotifications(transformed);
      setUnreadCount(transformed.filter(n => !n.read).length);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      // Still update locally even if API fails
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllAsRead();

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      // Still update locally even if API fails
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Recalculate unread count
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== id);
      setUnreadCount(filtered.filter(n => !n.read).length);
      return filtered;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling for new notifications every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}

export default useNotifications;
