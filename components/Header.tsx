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
} from 'lucide-react';
import { Avatar, AvatarWithName } from './ui/Avatar';
import GlobalSearch, { SearchTrigger } from './GlobalSearch';
import NotificationCenter, { NotificationBell } from './NotificationCenter';
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
    };

    if (isProfileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isProfileMenuOpen]);

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
              <NotificationBell
                lang={lang}
                onClick={() => setIsNotificationsOpen(true)}
              />
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
                    ${isRTL ? 'left-0' : 'right-0'}
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

      {/* Notifications Panel */}
      {isNotificationsOpen && (
        <NotificationCenter
          lang={lang}
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDeleteNotification}
          onClearAll={handleClearAllNotifications}
        />
      )}
    </>
  );
};

export default Header;
