import apiClient from './client';

// Types
export interface DynamicFormField {
  id: number;
  field_key: string;
  field_name: string;
  label: string;
  label_en: string;
  label_ar: string;
  placeholder?: string;
  help_text?: string;
  field_type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'datetime' | 'time' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'file' | 'image' | 'repeater' | 'computed' | 'hidden';
  options?: { value: string | number; label: string }[];
  default_value?: string | number | boolean;
  validation?: string[];
  is_required: boolean;
  is_unique: boolean;
  show_in_list: boolean;
  show_in_detail: boolean;
  show_in_form: boolean;
  is_readonly: boolean;
  is_hidden: boolean;
  conditional_logic?: ConditionalLogic;
  grid_column?: number;
  section?: string;
  sort_order: number;
  styling?: Record<string, string>;
}

export interface DynamicFormSection {
  section_key: string;
  title: string;
  title_en: string;
  title_ar: string;
  description?: string;
  icon?: string;
  is_collapsible: boolean;
  is_collapsed_default: boolean;
  conditional_logic?: ConditionalLogic;
  grid_columns: number;
  sort_order: number;
  fields?: DynamicFormField[];
}

export interface ConditionalLogic {
  operator: 'and' | 'or';
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'is_not_empty' | 'greater_than' | 'less_than' | 'in';
    value: unknown;
  }[];
}

export interface DynamicForm {
  id: number;
  code: string;
  name: string;
  name_en: string;
  name_ar: string;
  description?: string;
  category: string;
  fields: DynamicFormField[];
  sections?: DynamicFormSection[];
  settings?: Record<string, unknown>;
  validation_rules?: Record<string, string[]>;
}

export interface DynamicFormSubmission {
  id: number;
  form_id: number;
  user_id: number;
  data: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  workflow_state?: string;
  workflow_history?: WorkflowHistoryEntry[];
  submitted_at: string;
  processed_at?: string;
  processed_by?: number;
  notes?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface WorkflowHistoryEntry {
  action: string;
  user_id: number;
  notes?: string;
  timestamp: string;
}

// API Functions
export const dynamicFormsApi = {
  // Get all forms
  getAll: async (category?: string): Promise<DynamicForm[]> => {
    const params = category ? { category } : {};
    const response = await apiClient.get('/dynamic-forms', { params });
    return response.data.data;
  },

  // Get form by code
  getByCode: async (code: string): Promise<DynamicForm> => {
    const response = await apiClient.get(`/dynamic-forms/${code}`);
    return response.data.data;
  },

  // Submit form data
  submit: async (code: string, data: Record<string, unknown>): Promise<{ submission_id: number; reference_id?: number }> => {
    const response = await apiClient.post(`/dynamic-forms/${code}/submit`, data);
    return response.data.data;
  },

  // Admin: Create new form
  create: async (formData: Partial<DynamicForm> & { fields: Partial<DynamicFormField>[] }): Promise<DynamicForm> => {
    const response = await apiClient.post('/dynamic-forms', formData);
    return response.data.data;
  },

  // Admin: Update form
  update: async (code: string, formData: Partial<DynamicForm>): Promise<DynamicForm> => {
    const response = await apiClient.put(`/dynamic-forms/${code}`, formData);
    return response.data.data;
  },

  // Admin: Delete form
  delete: async (code: string): Promise<void> => {
    await apiClient.delete(`/dynamic-forms/${code}`);
  },

  // Admin: Get form submissions
  getSubmissions: async (code: string, params?: { status?: string; page?: number; per_page?: number }): Promise<{
    data: DynamicFormSubmission[];
    meta: { current_page: number; last_page: number; per_page: number; total: number };
  }> => {
    const response = await apiClient.get(`/dynamic-forms/${code}/submissions`, { params });
    return response.data.data;
  },

  // Admin: Get single submission
  getSubmission: async (code: string, submissionId: number): Promise<DynamicFormSubmission> => {
    const response = await apiClient.get(`/dynamic-forms/${code}/submissions/${submissionId}`);
    return response.data.data;
  },

  // Admin: Approve submission
  approveSubmission: async (code: string, submissionId: number, notes?: string): Promise<void> => {
    await apiClient.post(`/dynamic-forms/${code}/submissions/${submissionId}/approve`, { notes });
  },

  // Admin: Reject submission
  rejectSubmission: async (code: string, submissionId: number, notes?: string): Promise<void> => {
    await apiClient.post(`/dynamic-forms/${code}/submissions/${submissionId}/reject`, { notes });
  },
};

export default dynamicFormsApi;
