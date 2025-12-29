// Notification and Reminder Utilities for Universe SIS

/**
 * Check if browser supports notifications
 */
export const supportsNotifications = (): boolean => {
  return 'Notification' in window;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!supportsNotifications()) return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

/**
 * Show browser notification
 */
export const showBrowserNotification = (
  title: string,
  options?: NotificationOptions
): void => {
  if (!supportsNotifications()) return;

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/logo.png',
      badge: '/logo.png',
      ...options,
    });
  }
};

/**
 * Store reminder in localStorage
 */
export interface Reminder {
  id: string;
  type: 'exam' | 'assignment' | 'event';
  title: string;
  date: string;
  time: string;
  notifyBefore: number; // minutes before
  notified: boolean;
  createdAt: string;
}

export const saveReminder = (reminder: Omit<Reminder, 'id' | 'notified' | 'createdAt'>): Reminder => {
  const reminders = getReminders();
  const newReminder: Reminder = {
    ...reminder,
    id: `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    notified: false,
    createdAt: new Date().toISOString(),
  };

  reminders.push(newReminder);
  localStorage.setItem('sis_reminders', JSON.stringify(reminders));

  return newReminder;
};

export const getReminders = (): Reminder[] => {
  const stored = localStorage.getItem('sis_reminders');
  return stored ? JSON.parse(stored) : [];
};

export const deleteReminder = (id: string): void => {
  const reminders = getReminders().filter(r => r.id !== id);
  localStorage.setItem('sis_reminders', JSON.stringify(reminders));
};

export const markReminderAsNotified = (id: string): void => {
  const reminders = getReminders().map(r =>
    r.id === id ? { ...r, notified: true } : r
  );
  localStorage.setItem('sis_reminders', JSON.stringify(reminders));
};

/**
 * Check for due reminders
 */
export const checkDueReminders = (): Reminder[] => {
  const reminders = getReminders();
  const now = new Date();

  return reminders.filter(reminder => {
    if (reminder.notified) return false;

    const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
    const notifyTime = new Date(reminderDateTime.getTime() - reminder.notifyBefore * 60 * 1000);

    return now >= notifyTime && now < reminderDateTime;
  });
};

/**
 * Format remaining time
 */
export const formatTimeRemaining = (targetDate: string, lang: 'en' | 'ar'): string => {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return lang === 'ar' ? 'انتهى الوقت' : 'Time expired';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return lang === 'ar'
      ? `${days} يوم و ${hours} ساعة`
      : `${days} days, ${hours} hours`;
  }

  if (hours > 0) {
    return lang === 'ar'
      ? `${hours} ساعة و ${minutes} دقيقة`
      : `${hours} hours, ${minutes} minutes`;
  }

  return lang === 'ar'
    ? `${minutes} دقيقة`
    : `${minutes} minutes`;
};

/**
 * Schedule exam reminder
 */
export const scheduleExamReminder = (
  examId: string,
  examTitle: string,
  examDate: string,
  examTime: string,
  notifyBefore: number = 60 // default 60 minutes
): Reminder => {
  return saveReminder({
    type: 'exam',
    title: examTitle,
    date: examDate,
    time: examTime,
    notifyBefore,
  });
};

/**
 * Start reminder check interval
 */
let reminderInterval: NodeJS.Timeout | null = null;

export const startReminderChecker = (
  onReminder: (reminder: Reminder) => void,
  intervalMs: number = 60000 // check every minute
): void => {
  if (reminderInterval) {
    clearInterval(reminderInterval);
  }

  reminderInterval = setInterval(() => {
    const dueReminders = checkDueReminders();

    dueReminders.forEach(reminder => {
      onReminder(reminder);
      markReminderAsNotified(reminder.id);

      // Also show browser notification if permitted
      showBrowserNotification(reminder.title, {
        body: `${reminder.type === 'exam' ? '📝 ' : '📅 '}${reminder.date} ${reminder.time}`,
        tag: reminder.id,
      });
    });
  }, intervalMs);
};

export const stopReminderChecker = (): void => {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
};
