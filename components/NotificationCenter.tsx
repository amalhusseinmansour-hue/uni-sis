/**
 * NotificationCenter Component - Enhanced Version
 * Real-time notifications with API integration, preferences, and browser notifications
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  X,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Calendar,
  BookOpen,
  CreditCard,
  AlertCircle,
  Info,
  Award,
  MessageSquare,
  Clock,
  ChevronRight,
  MoreHorizontal,
  Volume2,
  VolumeX,
  RefreshCw,
  ExternalLink,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { notificationsAPI } from '../api';
import { preferencesAPI } from '../api/preferences';
import Badge from './ui/Badge';
import {
  requestNotificationPermission,
  showBrowserNotification,
  startReminderChecker,
  stopReminderChecker,
} from '../utils/notifications';

type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'academic' | 'financial' | 'announcement' | 'reminder' | 'grade' | 'request';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  title_ar?: string;
  titleAr?: string;
  message: string;
  message_ar?: string;
  messageAr?: string;
  timestamp?: Date;
  created_at?: string;
  read: boolean;
  actionUrl?: string;
  action_url?: string;
  actionLabel?: string;
  actionLabelAr?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface NotificationCenterProps {
  lang: 'en' | 'ar';
  notifications?: Notification[];
  onClose?: () => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
  onAction?: (notification: Notification) => void;
  standalone?: boolean; // If true, fetches its own data
}

const t = {
  notifications: { en: 'Notifications', ar: 'الإشعارات' },
  markAllRead: { en: 'Mark all as read', ar: 'تحديد الكل كمقروء' },
  clearAll: { en: 'Clear all', ar: 'مسح الكل' },
  noNotifications: { en: 'No notifications', ar: 'لا توجد إشعارات' },
  allCaughtUp: { en: "You're all caught up!", ar: 'أنت على اطلاع!' },
  today: { en: 'Today', ar: 'اليوم' },
  yesterday: { en: 'Yesterday', ar: 'أمس' },
  earlier: { en: 'Earlier', ar: 'سابقاً' },
  all: { en: 'All', ar: 'الكل' },
  unread: { en: 'Unread', ar: 'غير مقروء' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  viewAll: { en: 'View All', ar: 'عرض الكل' },
  delete: { en: 'Delete', ar: 'حذف' },
  markRead: { en: 'Mark as read', ar: 'تحديد كمقروء' },
  new: { en: 'New', ar: 'جديد' },
  refresh: { en: 'Refresh', ar: 'تحديث' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  soundEnabled: { en: 'Sound On', ar: 'الصوت مفعل' },
  soundDisabled: { en: 'Sound Off', ar: 'الصوت معطل' },
  enableBrowser: { en: 'Enable browser notifications', ar: 'تفعيل إشعارات المتصفح' },
  notificationSettings: { en: 'Notification Settings', ar: 'إعدادات الإشعارات' },
  viewDetails: { en: 'View details', ar: 'عرض التفاصيل' },
};

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; bgColor: string }> = {
  info: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  success: { icon: Check, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  warning: { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  error: { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  academic: { icon: GraduationCap, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  financial: { icon: CreditCard, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  announcement: { icon: MessageSquare, color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
  reminder: { icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  grade: { icon: Award, color: 'text-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-900/30' },
  request: { icon: FileText, color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' },
};


const NotificationCenter: React.FC<NotificationCenterProps> = ({
  lang,
  notifications: externalNotifications,
  onClose,
  onMarkAsRead: externalMarkAsRead,
  onMarkAllAsRead: externalMarkAllAsRead,
  onDelete: externalDelete,
  onClearAll: externalClearAll,
  onAction,
  standalone = true,
}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(externalNotifications || []);
  const [loading, setLoading] = useState(standalone);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isRTL = lang === 'ar';

  // Check browser permission
  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
    const savedSound = localStorage.getItem('notification_sound');
    if (savedSound !== null) {
      setSoundEnabled(savedSound === 'true');
    }
  }, []);

  // Fetch notifications if standalone
  const fetchNotifications = useCallback(async () => {
    if (!standalone) return;
    setLoading(true);
    try {
      const data = await notificationsAPI.getAll();
      const notifs = Array.isArray(data) ? data : data?.data || [];
      setNotifications(notifs);
    } catch (error) {
      console.warn('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [standalone]);

  useEffect(() => {
    if (standalone) {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, standalone]);

  // Update from external notifications
  useEffect(() => {
    if (externalNotifications) {
      setNotifications(externalNotifications);
    }
  }, [externalNotifications]);

  // Start reminder checker
  useEffect(() => {
    startReminderChecker((reminder) => {
      const reminderNotif: Notification = {
        id: reminder.id,
        type: 'reminder',
        title: reminder.title,
        message: `${reminder.type === 'exam' ? 'Exam' : 'Event'} at ${reminder.time}`,
        read: false,
        created_at: new Date().toISOString(),
        priority: 'high',
      };
      setNotifications((prev) => [reminderNotif, ...prev]);
      if (soundEnabled && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    });
    return () => stopReminderChecker();
  }, [soundEnabled]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const getTimestamp = (n: Notification): Date => {
    if (n.timestamp) return new Date(n.timestamp);
    if (n.created_at) return new Date(n.created_at);
    return new Date();
  };

  const formatTimestamp = (notification: Notification) => {
    const date = getTimestamp(notification);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return lang === 'en' ? 'Just now' : 'الآن';
    if (diffMins < 60) return lang === 'en' ? `${diffMins}m ago` : `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return lang === 'en' ? `${diffHours}h ago` : `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return t.yesterday[lang];
    if (diffDays < 7) return lang === 'en' ? `${diffDays}d ago` : `منذ ${diffDays} أيام`;
    return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
  };

  const groupNotifications = () => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const earlier: Notification[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 86400000);

    filteredNotifications.forEach((n) => {
      const timestamp = getTimestamp(n);
      if (timestamp >= todayStart) {
        today.push(n);
      } else if (timestamp >= yesterdayStart) {
        yesterday.push(n);
      } else {
        earlier.push(n);
      }
    });

    return { today, yesterday, earlier };
  };

  const groups = groupNotifications();

  // Action handlers
  const handleMarkAsRead = async (id: string) => {
    if (externalMarkAsRead) {
      externalMarkAsRead(id);
    } else {
      try {
        await notificationsAPI.markAsRead(id);
      } catch (e) {}
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (externalMarkAllAsRead) {
      externalMarkAllAsRead();
    } else {
      try {
        await notificationsAPI.markAllAsRead();
      } catch (e) {}
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const handleDelete = async (id: string) => {
    if (externalDelete) {
      externalDelete(id);
    } else {
      try {
        await notificationsAPI.delete(id);
      } catch (e) {}
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
    setShowMenu(null);
  };

  const handleClearAll = async () => {
    if (externalClearAll) {
      externalClearAll();
    } else {
      try {
        await notificationsAPI.deleteAll();
      } catch (e) {}
      setNotifications([]);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    const url = notification.actionUrl || notification.action_url;
    if (url) {
      if (onAction) {
        onAction(notification);
      } else {
        navigate(url);
        if (onClose) onClose();
      }
    }
  };

  const toggleSound = async () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('notification_sound', String(newValue));

    // Save to database
    try {
      await preferencesAPI.updateSingle('notification_sound', newValue);
    } catch (error) {
      console.error('Failed to save notification sound preference:', error);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setBrowserPermission(granted ? 'granted' : 'denied');
  };

  const getTitle = (n: Notification) => lang === 'ar' && (n.title_ar || n.titleAr) ? (n.title_ar || n.titleAr) : n.title;
  const getMessage = (n: Notification) => lang === 'ar' && (n.message_ar || n.messageAr) ? (n.message_ar || n.messageAr) : n.message;

  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    const config = typeConfig[notification.type] || typeConfig.info;
    const Icon = config.icon;
    const actionUrl = notification.actionUrl || notification.action_url;

    return (
      <div
        className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative group ${
          !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
        } ${notification.priority === 'urgent' ? 'border-s-4 border-red-500' : notification.priority === 'high' ? 'border-s-4 border-orange-500' : ''}`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex gap-3">
          <div className={`p-2 rounded-lg ${config.bgColor} flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className={`text-sm font-medium ${!notification.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {getTitle(notification)}
              </h4>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notification.read && <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(showMenu === notification.id ? null : notification.id);
                  }}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {getMessage(notification)}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400 dark:text-slate-500">{formatTimestamp(notification)}</span>
              {actionUrl && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                  {t.viewDetails[lang]}
                  <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Context Menu */}
        {showMenu === notification.id && (
          <div
            className={`absolute ${isRTL ? 'start-4' : 'end-4'} top-12 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20 min-w-[140px]`}
            onClick={(e) => e.stopPropagation()}
          >
            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsRead(notification.id);
                  setShowMenu(null);
                }}
                className="w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {t.markRead[lang]}
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(notification.id);
              }}
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t.delete[lang]}
            </button>
          </div>
        )}
      </div>
    );
  };

  const NotificationGroup: React.FC<{ title: string; notifications: Notification[] }> = ({
    title,
    notifications: groupNotifications,
  }) => {
    if (groupNotifications.length === 0) return null;

    return (
      <div>
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-700">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {groupNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-y-0 ${isRTL ? 'start-0' : 'end-0'} w-full sm:w-96 bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Hidden audio for notification sound - using fallback URL */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />

      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t.notifications[lang]}</h2>
          {unreadCount > 0 && (
            <Badge variant="danger" size="sm">{unreadCount} {t.new[lang]}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSound}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            title={soundEnabled ? t.soundEnabled[lang] : t.soundDisabled[lang]}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-slate-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Settings className="w-4 h-4 text-slate-500" />
          </button>
          {standalone && (
            <button
              onClick={fetchNotifications}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t.notificationSettings[lang]}</h3>
          <div className="space-y-2">
            {browserPermission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
              >
                <span>{t.enableBrowser[lang]}</span>
                <Bell className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={toggleSound}
              className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
            >
              <span>{soundEnabled ? t.soundEnabled[lang] : t.soundDisabled[lang]}</span>
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.all[lang]}
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
              filter === 'unread' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.unread[lang]}
            {unreadCount > 0 && (
              <span className="text-xs bg-red-500 text-white px-1.5 rounded-full">{unreadCount}</span>
            )}
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
            title={t.markAllRead[lang]}
          >
            <CheckCheck className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin me-2" />
            {t.loading[lang]}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 px-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <BellOff className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1">{t.noNotifications[lang]}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.allCaughtUp[lang]}</p>
          </div>
        ) : (
          <>
            <NotificationGroup title={t.today[lang]} notifications={groups.today} />
            <NotificationGroup title={t.yesterday[lang]} notifications={groups.yesterday} />
            <NotificationGroup title={t.earlier[lang]} notifications={groups.earlier} />
          </>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between bg-white dark:bg-slate-900">
          <button
            onClick={handleClearAll}
            className="text-sm text-red-600 font-medium hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            {t.clearAll[lang]}
          </button>
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" />
            {t.markAllRead[lang]}
          </button>
        </div>
      )}
    </div>
  );
};

// Notification Bell with Badge - Enhanced
export const NotificationBell: React.FC<{
  lang: 'en' | 'ar';
  onClick: () => void;
  className?: string;
}> = ({ lang, onClick, className = '' }) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await notificationsAPI.getCount();
        setCount(data?.count || data?.unread_count || 0);
      } catch (e) {
        // Use demo count
        setCount(3);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={onClick}
      className={`relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ${className}`}
      aria-label={t.notifications[lang]}
    >
      <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      {count > 0 && (
        <span className="absolute -top-0.5 -end-0.5 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full px-1 animate-pulse">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

// Mini Notification Toast - Enhanced
export const NotificationToast: React.FC<{
  notification: Notification;
  lang: 'en' | 'ar';
  onClose: () => void;
  onAction?: () => void;
  autoHide?: boolean;
  duration?: number;
}> = ({ notification, lang, onClose, onAction, autoHide = true, duration = 5000 }) => {
  const config = typeConfig[notification.type] || typeConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onClose]);

  const getTitle = (n: Notification) => lang === 'ar' && (n.title_ar || n.titleAr) ? (n.title_ar || n.titleAr) : n.title;
  const getMessage = (n: Notification) => lang === 'ar' && (n.message_ar || n.messageAr) ? (n.message_ar || n.messageAr) : n.message;

  return (
    <div
      className={`fixed top-4 ${lang === 'ar' ? 'start-4' : 'end-4'} bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 max-w-sm animate-in slide-in-from-top-4 duration-300 z-50`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex gap-3">
        <div className={`p-2 rounded-lg ${config.bgColor} flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-900 dark:text-white">
            {getTitle(notification)}
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {getMessage(notification)}
          </p>
          {(notification.actionLabel || notification.actionUrl || notification.action_url) && onAction && (
            <button onClick={onAction} className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-2 hover:underline flex items-center gap-1">
              {notification.actionLabel || t.viewDetails[lang]}
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded flex-shrink-0">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      {/* Progress bar for auto-hide */}
      {autoHide && (
        <div className="absolute bottom-0 start-0 end-0 h-1 bg-slate-200 dark:bg-slate-700 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-blue-500 animate-shrink-width"
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
