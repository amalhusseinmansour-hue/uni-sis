import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { configAPI, MenuConfig, DashboardLayout, UiTheme, PageConfig } from '../api/config';
import { UserRole } from '../types';

// State type
interface ConfigState {
  menu: MenuConfig | null;
  dashboard: DashboardLayout | null;
  theme: UiTheme | null;
  pages: Record<string, PageConfig>;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

// Action types
type ConfigAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MENU'; payload: MenuConfig | null }
  | { type: 'SET_DASHBOARD'; payload: DashboardLayout | null }
  | { type: 'SET_THEME'; payload: UiTheme | null }
  | { type: 'SET_PAGE_CONFIG'; payload: { key: string; config: PageConfig } }
  | { type: 'SET_FULL_CONFIG'; payload: { menu: MenuConfig | null; dashboard: DashboardLayout | null; theme: UiTheme | null } }
  | { type: 'CLEAR_CONFIG' };

// Initial state
const initialState: ConfigState = {
  menu: null,
  dashboard: null,
  theme: null,
  pages: {},
  isLoading: false,
  error: null,
  lastFetched: null,
};

// Reducer
function configReducer(state: ConfigState, action: ConfigAction): ConfigState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_MENU':
      return { ...state, menu: action.payload };
    case 'SET_DASHBOARD':
      return { ...state, dashboard: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_PAGE_CONFIG':
      return {
        ...state,
        pages: { ...state.pages, [action.payload.key]: action.payload.config },
      };
    case 'SET_FULL_CONFIG':
      return {
        ...state,
        menu: action.payload.menu,
        dashboard: action.payload.dashboard,
        theme: action.payload.theme,
        isLoading: false,
        lastFetched: new Date(),
      };
    case 'CLEAR_CONFIG':
      return initialState;
    default:
      return state;
  }
}

// Context type
interface ConfigContextType {
  state: ConfigState;
  dispatch: React.Dispatch<ConfigAction>;
  // Helper functions
  loadConfig: (role: UserRole) => Promise<void>;
  loadPageConfig: (pageKey: string) => Promise<PageConfig | null>;
  refreshConfig: () => Promise<void>;
  clearConfig: () => void;
  // Getters
  getMenuItems: () => MenuConfig['items'];
  getDashboardWidgets: () => DashboardLayout['widgets'];
  getThemeColors: () => UiTheme['colors'] | null;
  getPageTitle: (pageKey: string, lang: 'en' | 'ar') => string | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Provider props
interface ConfigProviderProps {
  children: ReactNode;
  role?: UserRole;
}

export function ConfigProvider({ children, role }: ConfigProviderProps) {
  const [state, dispatch] = useReducer(configReducer, initialState);

  // Load config when role changes
  useEffect(() => {
    if (role) {
      loadConfig(role);
    }
  }, [role]);

  // Apply theme when it changes
  useEffect(() => {
    if (state.theme) {
      applyTheme(state.theme);
    }
  }, [state.theme]);

  const applyTheme = (theme: UiTheme) => {
    const root = document.documentElement;

    // Apply colors as CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace('_', '-')}`, value);
    });

    // Apply typography
    if (theme.typography) {
      root.style.setProperty('--font-family', theme.typography.font_family);
      root.style.setProperty('--font-family-ar', theme.typography.font_family_ar);
      root.style.setProperty('--font-size-base', theme.typography.base_size);
    }

    // Apply spacing
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, value);
      });
    }

    // Apply borders
    if (theme.borders) {
      Object.entries(theme.borders).forEach(([key, value]) => {
        root.style.setProperty(`--border-${key}`, value);
      });
    }

    // Apply shadows
    if (theme.shadows) {
      Object.entries(theme.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value);
      });
    }
  };

  const loadConfig = async (userRole: UserRole) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const roleString = userRole.toLowerCase();
      const [menu, dashboard, theme] = await Promise.all([
        configAPI.getMenu(roleString).catch(() => null),
        configAPI.getDashboard(roleString).catch(() => null),
        configAPI.getTheme().catch(() => null),
      ]);

      dispatch({
        type: 'SET_FULL_CONFIG',
        payload: { menu, dashboard, theme },
      });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load configuration' });
    }
  };

  const loadPageConfig = async (pageKey: string): Promise<PageConfig | null> => {
    // Check if already loaded
    if (state.pages[pageKey]) {
      return state.pages[pageKey];
    }

    try {
      const config = await configAPI.getPageConfig(pageKey);
      if (config) {
        dispatch({ type: 'SET_PAGE_CONFIG', payload: { key: pageKey, config } });
      }
      return config;
    } catch {
      return null;
    }
  };

  const refreshConfig = async () => {
    if (role) {
      await loadConfig(role);
    }
  };

  const clearConfig = () => {
    dispatch({ type: 'CLEAR_CONFIG' });
  };

  const getMenuItems = () => {
    return state.menu?.items || [];
  };

  const getDashboardWidgets = () => {
    return state.dashboard?.widgets || [];
  };

  const getThemeColors = () => {
    return state.theme?.colors || null;
  };

  const getPageTitle = (pageKey: string, lang: 'en' | 'ar') => {
    const page = state.pages[pageKey];
    if (!page) return null;
    return lang === 'ar' ? page.title_ar : page.title_en;
  };

  return (
    <ConfigContext.Provider
      value={{
        state,
        dispatch,
        loadConfig,
        loadPageConfig,
        refreshConfig,
        clearConfig,
        getMenuItems,
        getDashboardWidgets,
        getThemeColors,
        getPageTitle,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

export { ConfigContext };
