import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { settingsAPI, SystemSettings, UserSettings } from '../api/settings';

interface SettingsContextValue {
  systemSettings: SystemSettings | null;
  userSettings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

// Hook to use settings
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Provider component
interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [system, user] = await Promise.all([
        settingsAPI.getSystemSettings(),
        settingsAPI.getUserSettings().catch(() => null),
      ]);

      setSystemSettings(system);
      setUserSettings(user);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserSettings = useCallback(async (settings: Partial<UserSettings>) => {
    try {
      const updated = await settingsAPI.updateUserSettings(settings);
      setUserSettings(updated);
    } catch (err: any) {
      console.error('Error updating settings:', err);
      throw err;
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider
      value={{
        systemSettings,
        userSettings,
        loading,
        error,
        updateUserSettings,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// Simple hook without context (for components that don't need the provider)
export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsAPI.getSystemSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}

// Hook to get current semester
export function useCurrentSemester() {
  const [semester, setSemester] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsAPI.getCurrentSemester()
      .then(setSemester)
      .finally(() => setLoading(false));
  }, []);

  return { semester, loading };
}

export default useSettings;
