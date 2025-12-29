import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description?: string;
}

/**
 * Custom hook for handling keyboard shortcuts
 */
export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[], enabled: boolean = true) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

/**
 * Get formatted shortcut label
 */
export const getShortcutLabel = (shortcut: Omit<ShortcutConfig, 'action' | 'description'>): string => {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  parts.push(shortcut.key.toUpperCase());

  return parts.join(' + ');
};

/**
 * Common app shortcuts
 */
export const useAppShortcuts = (
  navigate: (path: string) => void,
  toggleSidebar: () => void,
  openSearch: () => void,
  lang: 'en' | 'ar'
) => {
  const shortcuts: ShortcutConfig[] = [
    {
      key: 'k',
      ctrl: true,
      action: openSearch,
      description: lang === 'ar' ? 'فتح البحث' : 'Open Search',
    },
    {
      key: 'b',
      ctrl: true,
      action: toggleSidebar,
      description: lang === 'ar' ? 'تبديل الشريط الجانبي' : 'Toggle Sidebar',
    },
    {
      key: 'h',
      alt: true,
      action: () => navigate('/'),
      description: lang === 'ar' ? 'الصفحة الرئيسية' : 'Go to Dashboard',
    },
    {
      key: 's',
      alt: true,
      action: () => navigate('/schedule'),
      description: lang === 'ar' ? 'الجدول' : 'Go to Schedule',
    },
    {
      key: 'e',
      alt: true,
      action: () => navigate('/exams'),
      description: lang === 'ar' ? 'الامتحانات' : 'Go to Exams',
    },
    {
      key: 'a',
      alt: true,
      action: () => navigate('/attendance'),
      description: lang === 'ar' ? 'الحضور' : 'Go to Attendance',
    },
    {
      key: 'p',
      alt: true,
      action: () => navigate('/profile'),
      description: lang === 'ar' ? 'الملف الشخصي' : 'Go to Profile',
    },
    {
      key: '?',
      shift: true,
      action: () => {
        // Show shortcuts help modal
        const event = new CustomEvent('show-shortcuts-help');
        window.dispatchEvent(event);
      },
      description: lang === 'ar' ? 'عرض الاختصارات' : 'Show Shortcuts',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
};

export default useKeyboardShortcuts;
