import apiClient from '../client';

// =========================================================================
// SYSTEM SETTINGS
// =========================================================================

export interface SystemSetting {
  id: number;
  group: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'file';
  label_en: string;
  label_ar: string;
  description_en?: string;
  description_ar?: string;
  options?: any;
  is_public: boolean;
  is_encrypted: boolean;
  order: number;
}

export const getSettings = async (group?: string) => {
  const params = group ? { group } : {};
  const response = await apiClient.get('/admin/config/settings', { params });
  return response.data;
};

export const updateSettings = async (settings: Record<string, any>) => {
  const response = await apiClient.put('/admin/config/settings', { settings });
  return response.data;
};

export const createSetting = async (setting: Partial<SystemSetting>) => {
  const response = await apiClient.post('/admin/config/settings', setting);
  return response.data;
};

export const deleteSetting = async (key: string) => {
  const response = await apiClient.delete(`/admin/config/settings/${key}`);
  return response.data;
};

// =========================================================================
// UI THEMES
// =========================================================================

export interface UiTheme {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
  is_dark: boolean;
  is_default: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  typography?: {
    fontFamily: string;
    headingFont?: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
  };
  spacing?: Record<string, string>;
  borderRadius?: Record<string, string>;
}

export const getThemes = async () => {
  const response = await apiClient.get('/admin/config/themes');
  return response.data;
};

export const saveTheme = async (theme: Partial<UiTheme>) => {
  const response = await apiClient.post('/admin/config/themes', theme);
  return response.data;
};

export const deleteTheme = async (code: string) => {
  const response = await apiClient.delete(`/admin/config/themes/${code}`);
  return response.data;
};

// =========================================================================
// MENUS
// =========================================================================

export interface MenuItem {
  id: number;
  menu_id: number;
  parent_id?: number;
  label_en: string;
  label_ar: string;
  icon?: string;
  route?: string;
  url?: string;
  target?: '_self' | '_blank';
  roles?: string[];
  permissions?: string[];
  badge?: {
    text: string;
    color: string;
  };
  is_active: boolean;
  order: number;
  children?: MenuItem[];
}

export interface Menu {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
  location: string;
  roles?: string[];
  is_active: boolean;
  items?: MenuItem[];
}

export const getMenus = async () => {
  const response = await apiClient.get('/admin/config/menus');
  return response.data;
};

export const getMenu = async (code: string) => {
  const response = await apiClient.get(`/admin/config/menus/${code}`);
  return response.data;
};

export const saveMenu = async (menu: Partial<Menu>) => {
  const response = await apiClient.post('/admin/config/menus', menu);
  return response.data;
};

export const saveMenuItems = async (menuCode: string, items: Partial<MenuItem>[]) => {
  const response = await apiClient.post(`/admin/config/menus/${menuCode}/items`, { items });
  return response.data;
};

export const deleteMenu = async (code: string) => {
  const response = await apiClient.delete(`/admin/config/menus/${code}`);
  return response.data;
};

// =========================================================================
// DASHBOARD WIDGETS
// =========================================================================

export interface DashboardWidget {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
  type: 'stat' | 'chart' | 'table' | 'list' | 'calendar' | 'custom';
  data_source: {
    type: 'model' | 'endpoint' | 'static';
    value: string;
    method?: string;
    params?: Record<string, any>;
  };
  config: {
    refreshInterval?: number;
    chartType?: string;
    columns?: any[];
    [key: string]: any;
  };
  default_size: { w: number; h: number };
  min_size?: { w: number; h: number };
  max_size?: { w: number; h: number };
  roles?: string[];
  is_active: boolean;
}

export interface DashboardLayout {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
  role?: string;
  widgets: Array<{
    widget_code: string;
    x: number;
    y: number;
    w: number;
    h: number;
    config?: Record<string, any>;
  }>;
  grid_settings: {
    cols: number;
    rowHeight: number;
    margin: [number, number];
  };
  is_default: boolean;
}

export const getWidgets = async () => {
  const response = await apiClient.get('/admin/config/widgets');
  return response.data;
};

export const saveWidget = async (widget: Partial<DashboardWidget>) => {
  const response = await apiClient.post('/admin/config/widgets', widget);
  return response.data;
};

export const deleteWidget = async (code: string) => {
  const response = await apiClient.delete(`/admin/config/widgets/${code}`);
  return response.data;
};

export const getDashboardLayouts = async () => {
  const response = await apiClient.get('/admin/config/dashboard-layouts');
  return response.data;
};

export const saveDashboardLayout = async (layout: Partial<DashboardLayout>) => {
  const response = await apiClient.post('/admin/config/dashboard-layouts', layout);
  return response.data;
};

export const deleteDashboardLayout = async (code: string) => {
  const response = await apiClient.delete(`/admin/config/dashboard-layouts/${code}`);
  return response.data;
};

// =========================================================================
// PAGE CONFIGURATIONS
// =========================================================================

export interface PageConfiguration {
  id: number;
  page_key: string;
  title_en: string;
  title_ar: string;
  subtitle_en?: string;
  subtitle_ar?: string;
  layout: 'default' | 'full-width' | 'sidebar' | 'centered';
  components: Array<{
    type: string;
    code?: string;
    order: number;
    settings?: Record<string, any>;
  }>;
  meta?: {
    description?: string;
    keywords?: string[];
  };
  breadcrumbs?: Array<{
    label_en: string;
    label_ar: string;
    route?: string;
  }>;
  actions?: Array<{
    label_en: string;
    label_ar: string;
    icon?: string;
    action: string;
    params?: Record<string, any>;
  }>;
  roles?: string[];
  is_active: boolean;
}

export const getPageConfigs = async () => {
  const response = await apiClient.get('/admin/config/pages');
  return response.data;
};

export const getPageConfig = async (key: string) => {
  const response = await apiClient.get(`/admin/config/pages/${key}`);
  return response.data;
};

export const savePageConfig = async (config: Partial<PageConfiguration>) => {
  const response = await apiClient.post('/admin/config/pages', config);
  return response.data;
};

export const deletePageConfig = async (key: string) => {
  const response = await apiClient.delete(`/admin/config/pages/${key}`);
  return response.data;
};

// =========================================================================
// PUBLIC CONFIG (For Frontend)
// =========================================================================

export const getPublicConfig = async () => {
  const response = await apiClient.get('/config/public');
  return response.data;
};

export const getDashboard = async (params?: Record<string, any>) => {
  const response = await apiClient.get('/config/dashboard', { params });
  return response.data;
};
