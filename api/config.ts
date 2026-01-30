import apiClient from './client';

// Types
export interface MenuItem {
  id: number;
  title_en: string;
  title_ar: string;
  icon: string | null;
  route: string | null;
  is_external: boolean;
  permission: string | null;
  roles: string[] | null;
  badge_type: string | null;
  badge_value: string | null;
  order_column: number;
  is_active: boolean;
  children?: MenuItem[];
}

export interface MenuConfig {
  id: number;
  key: string;
  name: string;
  description: string | null;
  role: string | null;
  items: MenuItem[];
}

export interface DashboardWidget {
  id: number;
  key: string;
  name: string;
  type: 'stat_card' | 'chart' | 'table' | 'list' | 'calendar' | 'custom';
  component: string | null;
  data_source: string | null;
  config: Record<string, any>;
  refresh_interval: number | null;
  cache_duration: number | null;
  roles: string[] | null;
  is_active: boolean;
}

export interface DashboardLayoutWidget {
  widget_id: number;
  widget: DashboardWidget;
  order_column: number;
  column_span: number;
  row_span: number;
  config: Record<string, any>;
}

export interface DashboardLayout {
  id: number;
  key: string;
  name: string;
  role: string | null;
  columns: number;
  gap: string;
  widgets: DashboardLayoutWidget[];
  is_default: boolean;
  is_active: boolean;
}

export interface UiTheme {
  id: number;
  key: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: string;
    text_secondary: string;
    border: string;
  };
  typography: {
    font_family: string;
    font_family_ar: string;
    base_size: string;
    heading_weight: string;
    body_weight: string;
  };
  spacing: Record<string, string>;
  borders: Record<string, string>;
  shadows: Record<string, string>;
  is_default: boolean;
  is_active: boolean;
}

export interface PageConfig {
  id: number;
  page_key: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  icon: string | null;
  breadcrumbs: Array<{
    label_en: string;
    label_ar: string;
    route: string | null;
  }>;
  header_actions: Array<{
    label_en: string;
    label_ar: string;
    icon: string | null;
    action: 'link' | 'modal' | 'api';
    route: string | null;
    style: 'primary' | 'secondary' | 'success' | 'danger';
  }>;
  tabs: Array<{
    key: string;
    label_en: string;
    label_ar: string;
    icon: string | null;
    component: string | null;
  }>;
  components: Array<{
    name: string;
    order: number;
    visible: boolean;
    props: Record<string, any>;
  }>;
  roles: string[] | null;
  settings: Record<string, any>;
  is_active: boolean;
}

export interface FrontendConfig {
  menu: MenuConfig | null;
  theme: UiTheme | null;
  dashboard: DashboardLayout | null;
  pages: Record<string, PageConfig>;
}

// Config API is disabled - endpoints don't exist on server
// Return defaults immediately without making HTTP requests
export const configAPI = {
  // Get public config (no auth required)
  getPublicConfig: async (): Promise<{ settings: Record<string, any>; theme: UiTheme | null }> => {
    // API disabled - return defaults
    return { settings: {}, theme: null };
  },

  // Get menu for current user role
  getMenu: async (_role: string): Promise<MenuConfig | null> => {
    // API disabled - return null (use hardcoded menu)
    return null;
  },

  // Get dashboard layout for current user role
  getDashboard: async (_role: string): Promise<DashboardLayout | null> => {
    // API disabled - return null (use hardcoded dashboard)
    return null;
  },

  // Get current theme
  getTheme: async (): Promise<UiTheme | null> => {
    // API disabled - return null (use CSS defaults)
    return null;
  },

  // Get page configuration
  getPageConfig: async (_pageKey: string): Promise<PageConfig | null> => {
    // API disabled - return null
    return null;
  },

  // Get all configuration for a role
  getFullConfig: async (_role: string): Promise<FrontendConfig> => {
    // API disabled - return defaults
    return {
      menu: null,
      theme: null,
      dashboard: null,
      pages: {},
    };
  },

  // Get all widgets
  getWidgets: async (): Promise<DashboardWidget[]> => {
    // API disabled - return empty array
    return [];
  },
};

export default configAPI;
