import apiClient from './client';

// Types
export interface DynamicReportField {
  id: number;
  field_key: string;
  field_name: string;
  header: string;
  header_en: string;
  header_ar: string;
  data_type: 'string' | 'number' | 'decimal' | 'currency' | 'percentage' | 'date' | 'datetime' | 'boolean' | 'grade';
  format_options?: Record<string, unknown>;
  width?: string;
  align: 'left' | 'center' | 'right';
  is_visible: boolean;
  is_summary: boolean;
  summary_function?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  conditional_styling?: ConditionalStyling[];
  sort_order: number;
}

export interface DynamicReportParameter {
  param_key: string;
  field_name?: string;
  label: string;
  label_en: string;
  label_ar: string;
  input_type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'daterange' | 'semester' | 'academic_year';
  data_type: 'string' | 'integer' | 'float' | 'date' | 'datetime' | 'boolean' | 'array';
  options?: { value: string | number; label: string }[];
  default_value?: unknown;
  is_required: boolean;
  is_visible: boolean;
  depends_on?: { field: string; value: unknown }[];
  validation?: Record<string, unknown>;
}

export interface DynamicReportChart {
  key: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'radar';
  dataField: string;
  labelField?: string;
  groupField?: string;
  seriesField?: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  colors?: string[];
  width?: string;
  height?: string;
  position: 'before_table' | 'after_table' | 'left' | 'right';
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
  };
}

export interface DynamicReportSettings {
  show_logo: boolean;
  show_date: boolean;
  show_page_numbers: boolean;
  page_orientation: 'portrait' | 'landscape';
  page_size: 'A4' | 'A3' | 'Letter' | 'Legal';
}

export interface DynamicReport {
  id: number;
  code: string;
  name: string;
  name_en: string;
  name_ar: string;
  description?: string;
  category: string;
  report_type: 'tabular' | 'chart' | 'document' | 'transcript' | 'invoice';
  fields: DynamicReportField[];
  parameters: DynamicReportParameter[];
  charts: DynamicReportChart[];
  layout?: Record<string, unknown>;
  export_formats: string[];
  settings: DynamicReportSettings;
}

export interface ReportData {
  fields: ReportFieldData[];
  charts: ChartData[];
  data: Record<string, unknown>[];
  aggregations?: Record<string, number>;
  meta: {
    total_rows: number;
    execution_time: number;
    generated_at: string;
    parameters: Record<string, unknown>;
  };
}

export interface ReportFieldData {
  field_key: string;
  label: string;
  value: unknown;
  format?: {
    type?: string;
    color?: string;
  };
}

export interface ChartData {
  chart_key: string;
  title_en: string;
  title_ar: string;
  chart_type: 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'radar';
  data_source?: {
    x_field?: string;
    y_field?: string;
    y_fields?: string[];
    label_field?: string;
    value_field?: string;
  };
  options?: {
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    stacked?: boolean;
    donut?: boolean;
    horizontal?: boolean;
  };
  width?: 'half' | 'full';
  data: Record<string, unknown>[];
}

export interface ReportGenerationResult {
  data: Record<string, unknown>[];
  aggregations?: Record<string, number>;
  charts?: ChartData[];
  meta: {
    total_rows: number;
    execution_time: number;
    generated_at: string;
    parameters: Record<string, unknown>;
  };
}

export interface ReportSchedule {
  id: number;
  name: string;
  cron: string;
  timezone?: string;
  parameters?: Record<string, unknown>;
  format: 'pdf' | 'excel' | 'csv';
  recipients: string[];
  is_active: boolean;
  last_run?: string;
  next_run?: string;
  last_status?: 'success' | 'failed';
}

export interface ReportLog {
  id: number;
  user_id: number;
  parameters: Record<string, unknown>;
  row_count: number;
  execution_time: number;
  export_format?: string;
  status: 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ReportStats {
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  avg_execution_time: number;
  avg_row_count: number;
  total_exports: number;
  most_used_format?: string;
}

// API Functions
export const dynamicReportsApi = {
  // Get all reports
  getAll: async (params?: { category?: string; is_active?: boolean }): Promise<DynamicReport[]> => {
    const response = await apiClient.get('/dynamic-reports', { params });
    return response.data.data;
  },

  // Get report categories
  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get('/dynamic-reports/categories');
    return response.data.data;
  },

  // Get report by code
  getByCode: async (code: string): Promise<DynamicReport> => {
    const response = await apiClient.get(`/dynamic-reports/${code}`);
    return response.data.data;
  },

  // Generate report
  generate: async (code: string, params?: Record<string, unknown>): Promise<ReportData> => {
    const response = await apiClient.post(`/dynamic-reports/${code}/generate`, params || {});
    return response.data.data;
  },

  // Export report
  export: async (code: string, format: 'pdf' | 'excel' | 'csv', params?: Record<string, unknown>): Promise<{ download_url: string; filename: string; file_size: number; row_count: number }> => {
    const response = await apiClient.post(`/dynamic-reports/${code}/export`, { format, ...params });
    return response.data.data;
  },

  // Admin: Create new report
  create: async (reportData: Partial<DynamicReport> & { fields: Partial<DynamicReportField>[] }): Promise<DynamicReport> => {
    const response = await apiClient.post('/dynamic-reports', reportData);
    return response.data.data;
  },

  // Admin: Update report
  update: async (code: string, reportData: Partial<DynamicReport>): Promise<DynamicReport> => {
    const response = await apiClient.put(`/dynamic-reports/${code}`, reportData);
    return response.data.data;
  },

  // Admin: Delete report
  delete: async (code: string): Promise<void> => {
    await apiClient.delete(`/dynamic-reports/${code}`);
  },

  // Admin: Get report logs
  getLogs: async (code: string, params?: { page?: number; per_page?: number }): Promise<{
    data: ReportLog[];
    meta: { current_page: number; last_page: number; per_page: number; total: number };
  }> => {
    const response = await apiClient.get(`/dynamic-reports/${code}/logs`, { params });
    return response.data.data;
  },

  // Admin: Get report stats
  getStats: async (code: string): Promise<ReportStats> => {
    const response = await apiClient.get(`/dynamic-reports/${code}/stats`);
    return response.data.data;
  },

  // Admin: Get schedules
  getSchedules: async (code: string): Promise<ReportSchedule[]> => {
    const response = await apiClient.get(`/dynamic-reports/${code}/schedules`);
    return response.data.data;
  },

  // Admin: Save schedule
  saveSchedule: async (code: string, scheduleData: Partial<ReportSchedule>): Promise<ReportSchedule> => {
    const response = await apiClient.post(`/dynamic-reports/${code}/schedules`, scheduleData);
    return response.data.data;
  },

  // Admin: Delete schedule
  deleteSchedule: async (code: string, scheduleId: number): Promise<void> => {
    await apiClient.delete(`/dynamic-reports/${code}/schedules/${scheduleId}`);
  },

  // Admin: Toggle schedule
  toggleSchedule: async (code: string, scheduleId: number): Promise<ReportSchedule> => {
    const response = await apiClient.post(`/dynamic-reports/${code}/schedules/${scheduleId}/toggle`);
    return response.data.data;
  },
};

export default dynamicReportsApi;
