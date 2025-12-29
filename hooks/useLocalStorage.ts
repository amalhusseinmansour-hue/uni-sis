import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for syncing state with localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get initial value from localStorage or use default
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save to state
        setStoredValue(valueToStore);

        // Save to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [initialValue, key]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing user preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ar';
  sidebarCollapsed: boolean;
  compactMode: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'en',
  sidebarCollapsed: false,
  compactMode: false,
  notificationsEnabled: true,
  soundEnabled: true,
  autoRefresh: false,
  refreshInterval: 60,
};

export function useUserPreferences() {
  const [preferences, setPreferences, removePreferences] = useLocalStorage<UserPreferences>(
    'sis_user_preferences',
    defaultPreferences
  );

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return {
    preferences,
    updatePreference,
    resetPreferences,
    setPreferences,
  };
}

/**
 * Hook for managing recent searches
 */
export function useRecentSearches(maxItems: number = 10) {
  const [searches, setSearches, clearSearches] = useLocalStorage<string[]>(
    'sis_recent_searches',
    []
  );

  const addSearch = (query: string) => {
    if (!query.trim()) return;

    setSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== query.toLowerCase());
      return [query, ...filtered].slice(0, maxItems);
    });
  };

  const removeSearch = (query: string) => {
    setSearches((prev) => prev.filter((s) => s !== query));
  };

  return {
    searches,
    addSearch,
    removeSearch,
    clearSearches,
  };
}

/**
 * Hook for managing favorites/bookmarks
 */
export interface Favorite {
  id: string;
  type: 'course' | 'page' | 'document';
  title: string;
  path: string;
  addedAt: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<Favorite[]>('sis_favorites', []);

  const addFavorite = (favorite: Omit<Favorite, 'addedAt'>) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === favorite.id)) return prev;
      return [{ ...favorite, addedAt: new Date().toISOString() }, ...prev];
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const isFavorite = (id: string) => {
    return favorites.some((f) => f.id === id);
  };

  const toggleFavorite = (favorite: Omit<Favorite, 'addedAt'>) => {
    if (isFavorite(favorite.id)) {
      removeFavorite(favorite.id);
    } else {
      addFavorite(favorite);
    }
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
}

export default useLocalStorage;
