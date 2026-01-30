import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Command,
  Check,
  CheckCheck,
  Trash2,
  BellOff,
  Info,
  AlertCircle,
  CreditCard,
  Clock,
  Award,
  MessageSquare,
  GraduationCap,
  FileText,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react';
import { Avatar, AvatarWithName } from './ui/Avatar';
import GlobalSearch, { SearchTrigger } from './GlobalSearch';
import { UserRole } from '../types';
import { useNotifications, Notification } from '../hooks/useNotifications';

interface HeaderProps {
  lang: 'en' | 'ar';
  role: UserRole;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onMenuClick: () => void;
  onLanguageToggle: () => void;
  onLogout: () => void;
}

// Notification type is now imported from useNotifications hook

const t = {
  search: { en: 'Search...', ar: 'بحث...' },
  notifications: { en: 'Notifications', ar: 'الإشعارات' },
  profile: { en: 'Profile', ar: 'الملف الشخصي' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  help: { en: 'Help & Support', ar: 'المساعدة والدعم' },
  logout: { en: 'Logout', ar: 'تسجيل الخروج' },
  switchLang: { en: 'العربية', ar: 'English' },
  welcome: { en: 'Welcome back', ar: 'مرحباً بعودتك' },
  markAllRead: { en: 'Mark all as read', ar: 'تحديد الكل كمقروء' },
  noNotifications: { en: 'No notifications', ar: 'لا توجد إشعارات' },
  allCaughtUp: { en: "You're all caught up!", ar: 'لا توجد إشعارات جديدة' },
  viewAll: { en: 'View All', ar: 'عرض الكل' },
  delete: { en: 'Delete', ar: 'حذف' },
  markRead: { en: 'Mark as read', ar: 'تحديد كمقروء' },
  justNow: { en: 'Just now', ar: 'الآن' },
  minutesAgo: { en: 'm ago', ar: 'د' },
  hoursAgo: { en: 'h ago', ar: 'س' },
  yesterday: { en: 'Yesterday', ar: 'أمس' },
  daysAgo: { en: 'd ago', ar: 'ي' },
};

type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'academic' | 'financial' | 'announcement' | 'reminder' | 'grade' | 'request';

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; bgColor: string }> = {
  info: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  success: { icon: Check, color: 'text-green-600', bgColor: 'bg-green-100' },
  warning: { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  error: { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  academic: { icon: GraduationCap, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  financial: { icon: CreditCard, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  announcement: { icon: MessageSquare, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  reminder: { icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  grade: { icon: Award, color: 'text-teal-600', bgColor: 'bg-teal-100' },
  request: { icon: FileText, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
};

const pageNames: Record<string, { en: string; ar: string }> = {
  '/': { en: 'Dashboard', ar: 'لوحة التحكم' },
  '/academic': { en: 'Academic', ar: 'الأكاديمية' },
  '/finance': { en: 'Finance', ar: 'المالية' },
  '/profile': { en: 'Profile', ar: 'الملف الشخصي' },
  '/settings': { en: 'Settings', ar: 'الإعدادات' },
  '/admissions': { en: 'Admissions', ar: 'القبول' },
  '/lecturer': { en: 'Lecturer Portal', ar: 'بوابة المحاضر' },
  '/reports': { en: 'Reports', ar: 'التقارير' },
};


const Header: React.FC<HeaderProps> = ({
  lang,
  role,
  user,
  onMenuClick,
  onLanguageToggle,
  onLogout,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  // Use notifications from API hook with fallback to defaults
  const {
    notifications: apiNotifications,
    unreadCount: apiUnreadCount,
    loading: notificationsLoading,
    markAsRead: apiMarkAsRead,
    markAllAsRead: apiMarkAllAsRead,
    deleteNotification: apiDeleteNotification,
    clearAll: apiClearAll,
  } = useNotifications();

  // Use API data only
  const notifications = apiNotifications;
  const unreadCount = apiUnreadCount;

  const isRTL = lang === 'ar';

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsProfileMenuOpen(false);
      setIsNotificationsOpen(false);
    };

    if (isProfileMenuOpen || isNotificationsOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isProfileMenuOpen, isNotificationsOpen]);

  const handleMarkAsRead = (id: string) => {
    apiMarkAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    apiMarkAllAsRead();
  };

  const handleDeleteNotification = (id: string) => {
    apiDeleteNotification(id);
  };

  const handleClearAllNotifications = () => {
    apiClearAll();
  };

  const getCurrentPageName = () => {
    const basePath = '/' + location.pathname.split('/')[1];
    return pageNames[basePath] || pageNames['/'];
  };

  const formatNotificationTime = (notification: Notification) => {
    const date = notification.timestamp ? new Date(notification.timestamp) :
                 notification.created_at ? new Date(notification.created_at) : new Date();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t.justNow[lang];
    if (diffMins < 60) return `${diffMins}${t.minutesAgo[lang]}`;
    if (diffHours < 24) return `${diffHours}${t.hoursAgo[lang]}`;
    if (diffDays === 1) return t.yesterday[lang];
    return `${diffDays}${t.daysAgo[lang]}`;
  };

  const getNotificationTitle = (n: Notification) =>
    lang === 'ar' && (n.title_ar || n.titleAr) ? (n.title_ar || n.titleAr) : n.title;

  const getNotificationMessage = (n: Notification) =>
    lang === 'ar' && (n.message_ar || n.messageAr) ? (n.message_ar || n.messageAr) : n.message;

  return (
    <>
      <header
        className="sticky top-0 z-20 bg-white border-b border-slate-200"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-slate-100 rounded-lg md:hidden"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>

            {/* Page Title */}
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-slate-800">
                {getCurrentPageName()[lang]}
              </h1>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <SearchTrigger
              onClick={() => setIsSearchOpen(true)}
              lang={lang}
              className="w-full justify-start"
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg md:hidden"
            >
              <Search className="w-5 h-5 text-slate-600" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="hidden sm:flex p-2 hover:bg-slate-100 rounded-lg"
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-slate-600" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={onLanguageToggle}
              className="hidden sm:flex items-center gap-1 px-3 py-2 hover:bg-slate-100 rounded-lg text-sm"
            >
              <Globe className="w-4 h-4 text-slate-600" />
              <span className="text-slate-600">{t.switchLang[lang]}</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNotificationsOpen(!isNotificationsOpen);
                }}
                className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label={t.notifications[lang]}
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -end-0.5 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div
                  className={`
                    absolute top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden
                    ${isRTL ? 'start-0' : 'end-0'}
                  `}
                  style={{ maxHeight: '70vh' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-slate-600" />
                      <h3 className="font-semibold text-slate-800">{t.notifications[lang]}</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        {t.markAllRead[lang]}
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 120px)' }}>
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="p-3 bg-slate-100 rounded-full mb-3">
                          <BellOff className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">{t.noNotifications[lang]}</p>
                        <p className="text-xs text-slate-400 mt-1">{t.allCaughtUp[lang]}</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {notifications.slice(0, 10).map((notification) => {
                          const config = typeConfig[(notification.type as NotificationType) || 'info'] || typeConfig.info;
                          const Icon = config.icon;
                          return (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors group ${
                                !notification.read ? 'bg-blue-50/50' : ''
                              }`}
                              onClick={() => {
                                if (!notification.read) {
                                  handleMarkAsRead(notification.id);
                                }
                                const url = notification.actionUrl || notification.action_url;
                                if (url) {
                                  window.location.href = url;
                                }
                                setIsNotificationsOpen(false);
                              }}
                            >
                              <div className="flex gap-3">
                                <div className={`p-2 rounded-lg ${config.bgColor} flex-shrink-0`}>
                                  <Icon className={`w-4 h-4 ${config.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className={`text-sm font-medium truncate ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                      {getNotificationTitle(notification)}
                                    </h4>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      {!notification.read && (
                                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteNotification(notification.id);
                                        }}
                                        className="p-1 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        title={t.delete[lang]}
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                    {getNotificationMessage(notification)}
                                  </p>
                                  <span className="text-[10px] text-slate-400 mt-1 block">
                                    {formatNotificationTime(notification)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                      <button
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          window.location.href = '/notifications';
                        }}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1"
                      >
                        {t.viewAll[lang]}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                }}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg"
              >
                <Avatar
                  src={user?.avatar}
                  name={user?.name || 'User'}
                  size="sm"
                />
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div
                  className={`
                    absolute top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2
                    ${isRTL ? 'start-0' : 'end-0'}
                  `}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <AvatarWithName
                      src={user?.avatar}
                      name={user?.name || 'User'}
                      subtitle={user?.email}
                      size="md"
                    />
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <a
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4" />
                      <span>{t.profile[lang]}</span>
                    </a>
                    <a
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      <Settings className="w-4 h-4" />
                      <span>{t.settings[lang]}</span>
                    </a>
                    <a
                      href="/help"
                      className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>{t.help[lang]}</span>
                    </a>
                  </div>

                  {/* Language Toggle (Mobile) */}
                  <div className="sm:hidden py-1 border-t border-slate-100">
                    <button
                      onClick={onLanguageToggle}
                      className="flex items-center gap-3 w-full px-4 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      <Globe className="w-4 h-4" />
                      <span>{t.switchLang[lang]}</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.logout[lang]}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (Optional - shown when focused) */}
      </header>

      {/* Global Search Modal */}
      <GlobalSearch
        lang={lang}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Header;
