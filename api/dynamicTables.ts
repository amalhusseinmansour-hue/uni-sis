import apiClient from './client';

// Types
export interface DynamicTableColumn {
  id: number;
  column_key: string;
  field_name: string;
  header: string;
  header_en: string;
  header_ar: string;
  data_type: 'string' | 'number' | 'decimal' | 'currency' | 'percentage' | 'date' | 'datetime' | 'time' | 'boolean' | 'status';
  format_options?: Record<string, unknown>;
  status_colors?: Record<string, string>;
  width?: string;
  min_width?: string;
  max_width?: string;
  align: 'left' | 'center' | 'right';
  is_visible: boolean;
  is_sortable: boolean;
  is_searchable: boolean;
  is_filterable: boolean;
  filter_type?: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean';
  filter_options?: { value: string | number; label: string }[];
  is_exportable: boolean;
  is_frozen: boolean;
  is_resizable: boolean;
  conditional_styling?: ConditionalStyling[];
  sort_order: number;
}

export interface DynamicTableFilter {
  filter_key: string;
  field_name: string;
  label: string;
  label_en: string;
  label_ar: string;
  filter_type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean';
  operator: string;
  options?: { value: string | number; label: string }[];
  default_value?: unknown;
  is_required: boolean;
  is_visible: boolean;
  depends_on?: { field: string; value: unknown }[];
}

export interface ConditionalStyling {
  condition: {
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'in';
    value?: unknown;
    min?: number;
    max?: number;
  };
  style: {
    backgroundColor?: string;
    color?: string;
    fontWeight?: string;
    icon?: string;
  };
}

export interface DynamicTableSettings {
  is_paginated: boolean;
  is_searchable: boolean;
  is_filterable: boolean;
  is_sortable: boolean;
  is_exportable: boolean;
  export_formats: string[];
  show_row_numbers: boolean;
  show_selection: boolean;
  default_page_size: number;
  page_size_options: number[];
  bulk_actions?: BulkAction[];
  row_actions?: RowAction[];
}

export interface BulkAction {
  key: string;
  label_en: string;
  label_ar: string;
  icon?: string;
  color?: string;
  confirm?: boolean;
  confirm_message_en?: string;
  confirm_message_ar?: string;
}

export interface RowAction {
  key: string;
  label_en: string;
  label_ar: string;
  icon?: string;
  color?: string;
  condition?: Record<string, unknown>;
}

export interface DynamicTable {
  id: number;
  code: string;
  name: string;
  name_en: string;
  name_ar: string;
  description?: string;
  columns: DynamicTableColumn[];
  filters: DynamicTableFilter[];
  settings: DynamicTableSettings;
}

export interface TableDataRow {
  id?: number;
  [key: string]: {
    raw: unknown;
    formatted: unknown;
  } | number | undefined;
}

export interface TableDataResponse {
  data: TableDataRow[];
  meta: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total: number;
  };
}

export interface TableView {
  id: number;
  name: string;
  is_default: boolean;
  is_shared: boolean;
  visible_columns?: string[];
  column_order?: string[];
  column_widths?: Record<string, string>;
  filters?: Record<string, unknown>;
  sort?: { field: string; direction: 'asc' | 'desc' };
  page_size?: number;
}

export interface TableDataParams {
  search?: string;
  filters?: Record<string, unknown>;
  sort?: string;
  direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// API Functions
export const dynamicTablesApi = {
  // Get all tables
  getAll: async (): Promise<DynamicTable[]> => {
    const response = await apiClient.get('/dynamic-tables');
    return response.data.data;
  },

  // Get table by code
  getByCode: async (code: string): Promise<DynamicTable> => {
    const response = await apiClient.get(`/dynamic-tables/${code}`);
    return response.data.data;
  },

  // Fetch table data
  getData: async (code: string, params?: TableDataParams): Promise<TableDataResponse> => {
    const response = await apiClient.get(`/dynamic-tables/${code}/data`, { params });
    return response.data;
  },

  // Export table data
  export: async (code: string, format: 'excel' | 'csv' | 'pdf', params?: TableDataParams): Promise<{ download_url: string; row_count: number }> => {
    const response = await apiClient.get(`/dynamic-tables/${code}/export`, {
      params: { format, ...params }
    });
    return response.data.data;
  },

  // Get user's saved views
  getViews: async (code: string): Promise<TableView[]> => {
    const response = await apiClient.get(`/dynamic-tables/${code}/views`);
    return response.data.data;
  },

  // Save a view
  saveView: async (code: string, viewData: Partial<TableView>): Promise<TableView> => {
    const response = await apiClient.post(`/dynamic-tables/${code}/views`, viewData);
    return response.data.data;
  },

  // Delete a view
  deleteView: async (code: string, viewId: number): Promise<void> => {
    await apiClient.delete(`/dynamic-tables/${code}/views/${viewId}`);
  },

  // Admin: Create new table
  create: async (tableData: Partial<DynamicTable> & { columns: Partial<DynamicTableColumn>[] }): Promise<DynamicTable> => {
    const response = await apiClient.post('/dynamic-tables', tableData);
    return response.data.data;
  },

  // Admin: Update table
  update: async (code: string, tableData: Partial<DynamicTable>): Promise<DynamicTable> => {
    const response = await apiClient.put(`/dynamic-tables/${code}`, tableData);
    return response.data.data;
  },

  // Admin: Delete table
  delete: async (code: string): Promise<void> => {
    await apiClient.delete(`/dynamic-tables/${code}`);
  },
};

export default dynamicTablesApi;
