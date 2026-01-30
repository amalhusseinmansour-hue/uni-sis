import apiClient from '../client';

// =========================================================================
// TYPES
// =========================================================================

export interface DynamicFormSection {
  id?: number;
  dynamic_form_id?: number;
  code: string;
  title_en: string;
  title_ar: string;
  description_en?: string;
  description_ar?: string;
  icon?: string;
  collapsible: boolean;
  collapsed_by_default: boolean;
  columns: 1 | 2 | 3 | 4;
  condition?: {
    field: string;
    operator: string;
    value: any;
  };
  order: number;
}

export interface DynamicFormField {
  id?: number;
  dynamic_form_id?: number;
  section_id?: number;
  name: string;
  label_en: string;
  label_ar: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'date' | 'datetime' | 'time' | 'file' | 'image' | 'rich_text' | 'color' | 'password' | 'hidden';
  placeholder_en?: string;
  placeholder_ar?: string;
  helper_text_en?: string;
  helper_text_ar?: string;
  default_value?: any;
  options?: Array<{
    value: any;
    label_en: string;
    label_ar: string;
    disabled?: boolean;
  }>;
  options_source?: {
    type: 'static' | 'api' | 'model';
    endpoint?: string;
    model?: string;
    value_field?: string;
    label_field?: string;
    params?: Record<string, any>;
  };
  validation: {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    email?: boolean;
    url?: boolean;
    custom?: string;
  };
  error_messages?: {
    required_en?: string;
    required_ar?: string;
    [key: string]: string | undefined;
  };
  config?: {
    accept?: string; // for file inputs
    multiple?: boolean;
    rows?: number; // for textarea
    step?: number; // for number inputs
    min_date?: string;
    max_date?: string;
    wysiwyg_options?: Record<string, any>;
    [key: string]: any;
  };
  condition?: {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'empty' | 'not_empty';
    value: any;
  };
  col_span: 1 | 2 | 3 | 4;
  is_readonly: boolean;
  is_disabled: boolean;
  order: number;
}

export interface DynamicForm {
  id?: number;
  code: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  model_class?: string;
  submit_endpoint?: string;
  success_message_en?: string;
  success_message_ar?: string;
  redirect_after?: string;
  settings: {
    layout: 'vertical' | 'horizontal' | 'inline';
    label_position: 'top' | 'left' | 'floating';
    show_required_indicator: boolean;
    show_validation_summary: boolean;
    auto_save: boolean;
    auto_save_interval?: number;
    confirm_before_leave: boolean;
    submit_button_text_en: string;
    submit_button_text_ar: string;
    cancel_button_text_en: string;
    cancel_button_text_ar: string;
    show_cancel_button: boolean;
    reset_on_submit: boolean;
    scroll_to_error: boolean;
  };
  roles?: string[];
  is_active: boolean;
  sections?: DynamicFormSection[];
  fields?: DynamicFormField[];
  sections_count?: number;
  fields_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FieldType {
  type: string;
  label: string;
  icon: string;
  category: 'basic' | 'choice' | 'datetime' | 'media' | 'advanced';
}

// =========================================================================
// API FUNCTIONS
// =========================================================================

export const getForms = async () => {
  const response = await apiClient.get('/admin/config/forms');
  return response.data;
};

export const getForm = async (code: string) => {
  const response = await apiClient.get(`/admin/config/forms/${code}`);
  return response.data;
};

export const saveForm = async (form: Partial<DynamicForm>) => {
  const response = await apiClient.post('/admin/config/forms', form);
  return response.data;
};

export const deleteForm = async (code: string) => {
  const response = await apiClient.delete(`/admin/config/forms/${code}`);
  return response.data;
};

export const duplicateForm = async (code: string) => {
  const response = await apiClient.post(`/admin/config/forms/${code}/duplicate`);
  return response.data;
};

// Sections
export const getSections = async (formCode: string) => {
  const response = await apiClient.get(`/admin/config/forms/${formCode}/sections`);
  return response.data;
};

export const saveSections = async (formCode: string, sections: Partial<DynamicFormSection>[]) => {
  const response = await apiClient.post(`/admin/config/forms/${formCode}/sections`, { sections });
  return response.data;
};

// Fields
export const getFields = async (formCode: string) => {
  const response = await apiClient.get(`/admin/config/forms/${formCode}/fields`);
  return response.data;
};

export const saveFields = async (formCode: string, fields: Partial<DynamicFormField>[]) => {
  const response = await apiClient.post(`/admin/config/forms/${formCode}/fields`, { fields });
  return response.data;
};

export const deleteField = async (id: number) => {
  const response = await apiClient.delete(`/admin/config/forms/fields/${id}`);
  return response.data;
};

// Field Types
export const getFieldTypes = async (): Promise<{ success: boolean; data: FieldType[] }> => {
  const response = await apiClient.get('/admin/config/forms/field-types');
  return response.data;
};

// Default settings for new form
export const getDefaultFormSettings = (): DynamicForm['settings'] => ({
  layout: 'vertical',
  label_position: 'top',
  show_required_indicator: true,
  show_validation_summary: true,
  auto_save: false,
  confirm_before_leave: true,
  submit_button_text_en: 'Submit',
  submit_button_text_ar: 'إرسال',
  cancel_button_text_en: 'Cancel',
  cancel_button_text_ar: 'إلغاء',
  show_cancel_button: true,
  reset_on_submit: false,
  scroll_to_error: true,
});

// Default section
export const getDefaultSection = (order: number): Partial<DynamicFormSection> => ({
  code: `section_${order + 1}`,
  title_en: `Section ${order + 1}`,
  title_ar: `القسم ${order + 1}`,
  collapsible: false,
  collapsed_by_default: false,
  columns: 2,
  order,
});

// Default field
export const getDefaultField = (order: number): Partial<DynamicFormField> => ({
  name: '',
  label_en: '',
  label_ar: '',
  type: 'text',
  validation: {
    required: false,
  },
  col_span: 1,
  is_readonly: false,
  is_disabled: false,
  order,
});

// Field type definitions (for UI)
export const fieldTypeDefinitions: FieldType[] = [
  { type: 'text', label: 'Text Input', icon: 'type', category: 'basic' },
  { type: 'number', label: 'Number', icon: 'hash', category: 'basic' },
  { type: 'email', label: 'Email', icon: 'mail', category: 'basic' },
  { type: 'tel', label: 'Phone', icon: 'phone', category: 'basic' },
  { type: 'textarea', label: 'Text Area', icon: 'align-left', category: 'basic' },
  { type: 'password', label: 'Password', icon: 'lock', category: 'basic' },
  { type: 'select', label: 'Dropdown', icon: 'chevron-down', category: 'choice' },
  { type: 'multiselect', label: 'Multi Select', icon: 'check-square', category: 'choice' },
  { type: 'radio', label: 'Radio Buttons', icon: 'circle', category: 'choice' },
  { type: 'checkbox', label: 'Checkbox', icon: 'check-square', category: 'choice' },
  { type: 'date', label: 'Date', icon: 'calendar', category: 'datetime' },
  { type: 'datetime', label: 'Date & Time', icon: 'clock', category: 'datetime' },
  { type: 'time', label: 'Time', icon: 'clock', category: 'datetime' },
  { type: 'file', label: 'File Upload', icon: 'upload', category: 'media' },
  { type: 'image', label: 'Image Upload', icon: 'image', category: 'media' },
  { type: 'rich_text', label: 'Rich Text Editor', icon: 'bold', category: 'advanced' },
  { type: 'color', label: 'Color Picker', icon: 'palette', category: 'advanced' },
  { type: 'hidden', label: 'Hidden Field', icon: 'eye-off', category: 'advanced' },
];
