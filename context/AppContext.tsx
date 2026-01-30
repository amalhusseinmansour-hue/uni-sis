import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Student, UserRole } from '../types';
import { MOCK_STUDENT, MOCK_COURSES, MOCK_GRADES, MOCK_FINANCIALS, MOCK_ANNOUNCEMENTS } from '../constants';
import { authAPI } from '../api/auth';
import { settingsAPI, SystemSettings, UserSettings } from '../api/settings';
import { studentsAPI } from '../api/students';

// Types
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'ar';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  user: Student | null;
  token: string | null;
  role: UserRole;

  // UI
  theme: Theme;
  language: Language;
  sidebarOpen: boolean;
  isLoading: boolean;

  // Settings
  systemSettings: SystemSettings | null;
  userSettings: UserSettings | null;
  settingsLoading: boolean;

  // Data
  courses: typeof MOCK_COURSES;
  grades: typeof MOCK_GRADES;
  financials: typeof MOCK_FINANCIALS;
  announcements: typeof MOCK_ANNOUNCEMENTS;

  // Notifications
  notifications: Notification[];
  toasts: Toast[];
  unreadCount: number;
}

type AppAction =
  | { type: 'SET_AUTH'; payload: { user: Student; token: string; role: UserRole } }
  | { type: 'LOGOUT' }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SYSTEM_SETTINGS'; payload: SystemSettings }
  | { type: 'SET_USER_SETTINGS'; payload: UserSettings | null }
  | { type: 'SET_SETTINGS_LOADING'; payload: boolean }
  | { type: 'SET_COURSES'; payload: typeof MOCK_COURSES }
  | { type: 'SET_GRADES'; payload: typeof MOCK_GRADES }
  | { type: 'SET_FINANCIALS'; payload: typeof MOCK_FINANCIALS }
  | { type: 'SET_ANNOUNCEMENTS'; payload: typeof MOCK_ANNOUNCEMENTS }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'UPDATE_USER'; payload: Partial<Student> };

const initialState: AppState = {
  isAuthenticated: false,
  user: null,
  token: null,
  role: UserRole.STUDENT,
  theme: 'light',
  language: 'ar', // Default to Arabic for RTL
  sidebarOpen: true,
  isLoading: false,
  systemSettings: null,
  userSettings: null,
  settingsLoading: true,
  courses: MOCK_COURSES,
  grades: MOCK_GRADES,
  financials: MOCK_FINANCIALS,
  announcements: MOCK_ANNOUNCEMENTS,
  notifications: [],
  toasts: [],
  unreadCount: 0,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        role: action.payload.role,
      };

    case 'LOGOUT':
      // SECURITY: Clear both storage types
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...initialState,
        theme: state.theme,
        language: state.language,
      };

    case 'SET_THEME':
      localStorage.setItem('theme', action.payload);
      return { ...state, theme: action.payload };

    case 'SET_LANGUAGE':
      localStorage.setItem('language', action.payload);
      document.documentElement.dir = action.payload === 'ar' ? 'rtl' : 'ltr';
      return { ...state, language: action.payload };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_SYSTEM_SETTINGS':
      return { ...state, systemSettings: action.payload };

    case 'SET_USER_SETTINGS':
      return { ...state, userSettings: action.payload };

    case 'SET_SETTINGS_LOADING':
      return { ...state, settingsLoading: action.payload };

    case 'SET_COURSES':
      return { ...state, courses: action.payload };

    case 'SET_GRADES':
      return { ...state, grades: action.payload };

    case 'SET_FINANCIALS':
      return { ...state, financials: action.payload };

    case 'SET_ANNOUNCEMENTS':
      return { ...state, announcements: action.payload };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50),
        unreadCount: state.unreadCount + 1,
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [], unreadCount: 0 };

    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };

    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  login: (user: Student, token: string, role: UserRole) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
  showToast: (type: Toast['type'], message: string, duration?: number) => void;
  addNotification: (type: Notification['type'], title: string, message: string) => void;
  refreshSettings: () => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedLanguage = localStorage.getItem('language') as Language;
    // SECURITY: Check sessionStorage first (more secure), then localStorage
    const savedToken = sessionStorage.getItem('token') || localStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user') || localStorage.getItem('user');

    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }

    if (savedLanguage) {
      dispatch({ type: 'SET_LANGUAGE', payload: savedLanguage });
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
    }

    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({
          type: 'SET_AUTH',
          payload: { user, token: savedToken, role: user.role },
        });
      } catch (e) {
        // SECURITY: Clear both storage types on error
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      dispatch({ type: 'SET_SETTINGS_LOADING', payload: true });
      try {
        const systemSettings = await settingsAPI.getSystemSettings();
        dispatch({ type: 'SET_SYSTEM_SETTINGS', payload: systemSettings });

        // If authenticated, fetch user settings
        if (state.isAuthenticated) {
          const userSettings = await settingsAPI.getUserSettings();
          dispatch({ type: 'SET_USER_SETTINGS', payload: userSettings });
        }
      } catch {
        // Settings fetch failed - using defaults
      } finally {
        dispatch({ type: 'SET_SETTINGS_LOADING', payload: false });
      }
    };

    fetchSettings();
  }, [state.isAuthenticated]);

  const login = (user: Student, token: string, role: UserRole) => {
    // SECURITY: Store in sessionStorage (cleared on tab close) and localStorage (persistence)
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'SET_AUTH', payload: { user, token, role } });
  };

  const loginWithCredentials = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response;
      // SECURITY: Store in sessionStorage (cleared on tab close) and localStorage (persistence)
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({
        type: 'SET_AUTH',
        payload: { user, token, role: user.role || UserRole.STUDENT },
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    authAPI.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const refreshSettings = async () => {
    dispatch({ type: 'SET_SETTINGS_LOADING', payload: true });
    try {
      const [systemSettings, userSettings] = await Promise.all([
        settingsAPI.getSystemSettings(),
        state.isAuthenticated ? settingsAPI.getUserSettings() : Promise.resolve(null),
      ]);
      dispatch({ type: 'SET_SYSTEM_SETTINGS', payload: systemSettings });
      dispatch({ type: 'SET_USER_SETTINGS', payload: userSettings });
    } catch {
      // Settings refresh failed - using existing values
    } finally {
      dispatch({ type: 'SET_SETTINGS_LOADING', payload: false });
    }
  };

  const updateUserSettings = async (settings: Partial<UserSettings>) => {
    try {
      const updated = await settingsAPI.updateUserSettings(settings);
      dispatch({ type: 'SET_USER_SETTINGS', payload: updated });
    } catch (error) {
      // Re-throw to let caller handle
      throw error;
    }
  };

  const setTheme = (theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setLanguage = (lang: Language) => {
    dispatch({ type: 'SET_LANGUAGE', payload: lang });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const showToast = (type: Toast['type'], message: string, duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    dispatch({ type: 'ADD_TOAST', payload: { id, type, message, duration } });

    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: id });
      }, duration);
    }
  };

  const addNotification = (type: Notification['type'], title: string, message: string) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { id, type, title, message, timestamp: new Date() },
    });
  };

  // Translation helper (uses TRANSLATIONS from constants)
  const t = (key: string): string => {
    const translations = require('../constants').TRANSLATIONS;
    return translations[key]?.[state.language] || key;
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        login,
        loginWithCredentials,
        logout,
        setTheme,
        setLanguage,
        toggleSidebar,
        showToast,
        addNotification,
        refreshSettings,
        updateUserSettings,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { AppContext };
