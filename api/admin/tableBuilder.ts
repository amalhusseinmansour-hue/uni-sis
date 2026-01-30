import apiClient from '../client';

// =========================================================================
// TYPES
// =========================================================================

export interface DynamicTableColumn {
  id?: number;
  dynamic_table_id?: number;
  field: string;
  label_en: string;
  label_ar: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'badge' | 'image' | 'link' | 'actions' | 'custom';
  sortable: boolean;
  searchable: boolean;
  filterable: boolean;
  visible: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: {
    type: string;
    options?: Record<string, any>;
  };
  render_options?: Record<string, any>;
  order: number;
}

export interface DynamicTableFilter {
  id?: number;
  dynamic_table_id?: number;
  field: string;
  label_en: string;
  label_ar: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean';
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between';
  options?: Array<{ value: any; label_en: string; label_ar: string }>;
  default_value?: any;
  is_required: boolean;
  order: number;
}

export interface DynamicTableAction {
  id?: number;
  dynamic_table_id?: number;
  code: string;
  label_en: string;
  label_ar: string;
  icon?: string;
  type: 'link' | 'modal' | 'api' | 'custom';
  action_config: {
    route?: string;
    endpoint?: string;
    method?: string;
    confirmation?: {
      title_en: string;
      title_ar: string;
      message_en: string;
      message_ar: string;
    };
    [key: string]: any;
  };
  position: 'row' | 'bulk' | 'header';
  roles?: string[];
  is_active: boolean;
  order: number;
}

export interface DynamicTable {
  id?: number;
  code: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  model_class?: string;
  api_endpoint?: string;
  settings: {
    pagination: boolean;
    per_page: number;
    per_page_options: number[];
    searchable: boolean;
    sortable: boolean;
    exportable: boolean;
    export_formats: string[];
    selectable: boolean;
    row_click_action?: string;
    refresh_interval?: number;
    empty_message_en: string;
    empty_message_ar: string;
    card_view_enabled: boolean;
    dense_mode: boolean;
    striped: boolean;
    hoverable: boolean;
    bordered: boolean;
  };
  roles?: string[];
  is_active: boolean;
  columns?: DynamicTableColumn[];
  filters?: DynamicTableFilter[];
  actions?: DynamicTableAction[];
  columns_count?: number;
  filters_count?: number;
  created_at?: string;
  updated_at?: string;
}

// =========================================================================
// API FUNCTIONS
// =========================================================================

export const getTables = async () => {
  const response = await apiClient.get('/admin/config/tables');
  return response.data;
};

export const getTable = async (code: string) => {
  const response = await apiClient.get(`/admin/config/tables/${code}`);
  return response.data;
};

export const saveTable = async (table: Partial<DynamicTable>) => {
  const response = await apiClient.post('/admin/config/tables', table);
  return response.data;
};

export const deleteTable = async (code: string) => {
  const response = await apiClient.delete(`/admin/config/tables/${code}`);
  return response.data;
};

export const duplicateTable = async (code: string) => {
  const response = await apiClient.post(`/admin/config/tables/${code}/duplicate`);
  return response.data;
};

// Columns
export const getColumns = async (tableCode: string) => {
  const response = await apiClient.get(`/admin/config/tables/${tableCode}/columns`);
  return response.data;
};

export const saveColumns = async (tableCode: string, columns: Partial<DynamicTableColumn>[]) => {
  const response = await apiClient.post(`/admin/config/tables/${tableCode}/columns`, { columns });
  return response.data;
};

export const deleteColumn = async (id: number) => {
  const response = await apiClient.delete(`/admin/config/tables/columns/${id}`);
  return response.data;
};

// Filters
export const getFilters = async (tableCode: string) => {
  const response = await apiClient.get(`/admin/config/tables/${tableCode}/filters`);
  return response.data;
};

export const saveFilters = async (tableCode: string, filters: Partial<DynamicTableFilter>[]) => {
  const response = await apiClient.post(`/admin/config/tables/${tableCode}/filters`, { filters });
  return response.data;
};

export const deleteFilter = async (id: number) => {
  const response = await apiClient.delete(`/admin/config/tables/filters/${id}`);
  return response.data;
};

// Helpers
export const getAvailableModels = async () => {
  const response = await apiClient.get('/admin/config/tables/models');
  return response.data;
};

export const getModelFields = async (modelClass: string) => {
  const response = await apiClient.get('/admin/config/tables/model-fields', {
    params: { model: modelClass }
  });
  return response.data;
};

// Default settings for new table
export const getDefaultTableSettings = (): DynamicTable['settings'] => ({
  pagination: true,
  per_page: 10,
  per_page_options: [10, 25, 50, 100],
  searchable: true,
  sortable: true,
  exportable: true,
  export_formats: ['excel', 'pdf', 'csv'],
  selectable: false,
  empty_message_en: 'No data available',
  empty_message_ar: 'لا توجد بيانات',
  card_view_enabled: false,
  dense_mode: false,
  striped: true,
  hoverable: true,
  bordered: false,
});

// Default column
export const getDefaultColumn = (order: number): Partial<DynamicTableColumn> => ({
  field: '',
  label_en: '',
  label_ar: '',
  type: 'text',
  sortable: true,
  searchable: true,
  filterable: false,
  visible: true,
  align: 'left',
  order,
});

// Default filter
export const getDefaultFilter = (order: number): Partial<DynamicTableFilter> => ({
  field: '',
  label_en: '',
  label_ar: '',
  type: 'text',
  operator: 'like',
  is_required: false,
  order,
});
