import apiClient from '../client';

// =========================================================================
// TYPES
// =========================================================================

export interface DynamicReportField {
  id?: number;
  dynamic_report_id?: number;
  field: string;
  label_en: string;
  label_ar: string;
  type: 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'datetime' | 'boolean' | 'badge' | 'custom';
  aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max' | null;
  format?: {
    type: string;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    date_format?: string;
    [key: string]: any;
  };
  sortable: boolean;
  groupable: boolean;
  visible: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  order: number;
}

export interface DynamicReportParameter {
  id?: number;
  dynamic_report_id?: number;
  name: string;
  label_en: string;
  label_ar: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'daterange' | 'boolean';
  default_value?: any;
  options?: Array<{
    value: any;
    label_en: string;
    label_ar: string;
  }>;
  options_source?: {
    type: 'static' | 'api' | 'model';
    endpoint?: string;
    model?: string;
    value_field?: string;
    label_field?: string;
    params?: Record<string, any>;
  };
  is_required: boolean;
  validation?: Record<string, any>;
  order: number;
}

export interface DynamicReportChart {
  id?: number;
  dynamic_report_id?: number;
  code: string;
  title_en: string;
  title_ar: string;
  type: 'bar' | 'line' | 'area' | 'pie' | 'donut' | 'radar' | 'scatter';
  data_config: {
    x_field: string;
    y_fields: string[];
    group_by?: string;
    aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  };
  chart_options: {
    colors?: string[];
    show_legend?: boolean;
    legend_position?: 'top' | 'bottom' | 'left' | 'right';
    show_labels?: boolean;
    stacked?: boolean;
    horizontal?: boolean;
    [key: string]: any;
  };
  size: 'small' | 'medium' | 'large' | 'full';
  order: number;
}

export interface DynamicReportSchedule {
  id?: number;
  dynamic_report_id?: number;
  name: string;
  cron_expression: string;
  timezone: string;
  parameters?: Record<string, any>;
  export_format: 'pdf' | 'excel' | 'csv';
  recipients: string[];
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
}

export interface DynamicReport {
  id?: number;
  code: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  category?: string;
  report_type: 'table' | 'summary' | 'chart' | 'mixed';
  data_source: {
    type: 'model' | 'query' | 'endpoint';
    value: string;
    method?: string;
    params?: Record<string, any>;
  };
  settings: {
    show_filters: boolean;
    show_summary: boolean;
    show_charts: boolean;
    exportable: boolean;
    export_formats: string[];
    printable: boolean;
    auto_refresh: boolean;
    refresh_interval?: number;
    date_range_default?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
    grouping_enabled: boolean;
    sub_totals: boolean;
    grand_total: boolean;
    pagination: boolean;
    per_page: number;
  };
  layout?: {
    header?: {
      show_title: boolean;
      show_description: boolean;
      show_date: boolean;
      show_logo: boolean;
    };
    footer?: {
      show_page_numbers: boolean;
      custom_text?: string;
    };
  };
  roles?: string[];
  is_active: boolean;
  fields?: DynamicReportField[];
  parameters?: DynamicReportParameter[];
  charts?: DynamicReportChart[];
  schedules?: DynamicReportSchedule[];
  fields_count?: number;
  charts_count?: number;
  parameters_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChartType {
  type: string;
  label: string;
  icon: string;
}

// =========================================================================
// API FUNCTIONS
// =========================================================================

export const getReports = async () => {
  const response = await apiClient.get('/admin/config/reports');
  return response.data;
};

export const getReport = async (code: string) => {
  const response = await apiClient.get(`/admin/config/reports/${code}`);
  return response.data;
};

export const saveReport = async (report: Partial<DynamicReport>) => {
  const response = await apiClient.post('/admin/config/reports', report);
  return response.data;
};

export const deleteReport = async (code: string) => {
  const response = await apiClient.delete(`/admin/config/reports/${code}`);
  return response.data;
};

export const duplicateReport = async (code: string) => {
  const response = await apiClient.post(`/admin/config/reports/${code}/duplicate`);
  return response.data;
};

// Fields
export const saveFields = async (reportCode: string, fields: Partial<DynamicReportField>[]) => {
  const response = await apiClient.post(`/admin/config/reports/${reportCode}/fields`, { fields });
  return response.data;
};

// Parameters
export const saveParameters = async (reportCode: string, parameters: Partial<DynamicReportParameter>[]) => {
  const response = await apiClient.post(`/admin/config/reports/${reportCode}/parameters`, { parameters });
  return response.data;
};

// Charts
export const saveCharts = async (reportCode: string, charts: Partial<DynamicReportChart>[]) => {
  const response = await apiClient.post(`/admin/config/reports/${reportCode}/charts`, { charts });
  return response.data;
};

// Schedules
export const getSchedules = async (reportCode: string) => {
  const response = await apiClient.get(`/admin/config/reports/${reportCode}/schedules`);
  return response.data;
};

export const saveSchedule = async (reportCode: string, schedule: Partial<DynamicReportSchedule>) => {
  const response = await apiClient.post(`/admin/config/reports/${reportCode}/schedules`, schedule);
  return response.data;
};

export const deleteSchedule = async (id: number) => {
  const response = await apiClient.delete(`/admin/config/reports/schedules/${id}`);
  return response.data;
};

// Helper APIs
export const getChartTypes = async (): Promise<{ success: boolean; data: ChartType[] }> => {
  const response = await apiClient.get('/admin/config/reports/chart-types');
  return response.data;
};

export const getReportCategories = async (): Promise<{ success: boolean; data: string[] }> => {
  const response = await apiClient.get('/admin/config/reports/categories');
  return response.data;
};

// Default settings for new report
export const getDefaultReportSettings = (): DynamicReport['settings'] => ({
  show_filters: true,
  show_summary: true,
  show_charts: true,
  exportable: true,
  export_formats: ['pdf', 'excel', 'csv'],
  printable: true,
  auto_refresh: false,
  date_range_default: 'month',
  grouping_enabled: true,
  sub_totals: false,
  grand_total: true,
  pagination: true,
  per_page: 25,
});

// Default field
export const getDefaultField = (order: number): Partial<DynamicReportField> => ({
  field: '',
  label_en: '',
  label_ar: '',
  type: 'text',
  sortable: true,
  groupable: false,
  visible: true,
  align: 'left',
  order,
});

// Default parameter
export const getDefaultParameter = (order: number): Partial<DynamicReportParameter> => ({
  name: '',
  label_en: '',
  label_ar: '',
  type: 'text',
  is_required: false,
  order,
});

// Default chart
export const getDefaultChart = (order: number): Partial<DynamicReportChart> => ({
  code: `chart_${order + 1}`,
  title_en: `Chart ${order + 1}`,
  title_ar: `رسم بياني ${order + 1}`,
  type: 'bar',
  data_config: {
    x_field: '',
    y_fields: [],
  },
  chart_options: {
    show_legend: true,
    legend_position: 'bottom',
    show_labels: true,
  },
  size: 'medium',
  order,
});

// Chart type definitions
export const chartTypeDefinitions: ChartType[] = [
  { type: 'bar', label: 'Bar Chart', icon: 'bar-chart-2' },
  { type: 'line', label: 'Line Chart', icon: 'trending-up' },
  { type: 'area', label: 'Area Chart', icon: 'activity' },
  { type: 'pie', label: 'Pie Chart', icon: 'pie-chart' },
  { type: 'donut', label: 'Donut Chart', icon: 'circle' },
  { type: 'radar', label: 'Radar Chart', icon: 'hexagon' },
  { type: 'scatter', label: 'Scatter Plot', icon: 'crosshair' },
];
