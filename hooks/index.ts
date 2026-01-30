// Custom Hooks for Universe SIS

export { useKeyboardShortcuts, useAppShortcuts, getShortcutLabel } from './useKeyboardShortcuts';
export {
  useLocalStorage,
  useUserPreferences,
  useRecentSearches,
  useFavorites,
  type UserPreferences,
  type Favorite,
} from './useLocalStorage';
export { useNotifications, type Notification } from './useNotifications';
export { useSettings, useSystemSettings, useCurrentSemester, SettingsProvider } from './useSettings';
export {
  useToast,
  ToastProvider,
  toast,
  type ToastType,
  type ToastPosition,
  type ToastItem,
  type ToastOptions,
  type ToastContextType,
} from './useToast';

// Context exports
export { useApp, AppProvider, AppContext } from '../context/AppContext';
export type { Theme, Language, Toast, Notification as AppNotification } from '../context/AppContext';
export { ToastContext } from '../context/ToastContext';
