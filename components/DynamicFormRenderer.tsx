/**
 * DynamicFormRenderer Component
 * Renders forms dynamically based on form schema created in FormBuilder
 * Used in StudentRequestsPage and other places that need dynamic form rendering
 */

import React, { useState, useEffect } from 'react';
import {
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
  Calendar,
  Clock,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { DynamicForm, DynamicFormField, DynamicFormSection, ConditionalLogic } from '../api/dynamicForms';
import Input, { Select, Textarea, SearchInput } from './ui/Input';
import { Card, CardHeader, CardBody } from './ui/Card';

interface DynamicFormRendererProps {
  form: DynamicForm;
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  lang: 'en' | 'ar';
  errors?: Record<string, string>;
  disabled?: boolean;
  readOnly?: boolean;
}

const t = {
  required: { en: 'Required', ar: 'مطلوب' },
  optional: { en: 'Optional', ar: 'اختياري' },
  selectOption: { en: 'Select an option', ar: 'اختر خياراً' },
  uploadFile: { en: 'Upload file', ar: 'رفع ملف' },
  uploadImage: { en: 'Upload image', ar: 'رفع صورة' },
  dragDrop: { en: 'Drag and drop or click to browse', ar: 'اسحب وأفلت أو انقر للاستعراض' },
  maxSize: { en: 'Max size', ar: 'الحد الأقصى' },
  remove: { en: 'Remove', ar: 'إزالة' },
  noOptions: { en: 'No options available', ar: 'لا توجد خيارات متاحة' },
  yes: { en: 'Yes', ar: 'نعم' },
  no: { en: 'No', ar: 'لا' },
};

// Check if conditional logic is satisfied
const checkConditionalLogic = (
  logic: ConditionalLogic | undefined,
  data: Record<string, any>
): boolean => {
  if (!logic || !logic.conditions || logic.conditions.length === 0) {
    return true; // No conditions, always show
  }

  const results = logic.conditions.map((condition) => {
    const fieldValue = data[condition.field];

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue || '').includes(String(condition.value));
      case 'is_empty':
        return !fieldValue || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0);
      case 'is_not_empty':
        return !!fieldValue && fieldValue !== '' && (!Array.isArray(fieldValue) || fieldValue.length > 0);
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      default:
        return true;
    }
  });

  return logic.operator === 'and'
    ? results.every(Boolean)
    : results.some(Boolean);
};

// Field Renderer Component
const FieldRenderer: React.FC<{
  field: DynamicFormField;
  value: any;
  onChange: (value: any) => void;
  lang: 'en' | 'ar';
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
}> = ({ field, value, onChange, lang, error, disabled, readOnly }) => {
  const label = lang === 'ar' ? field.label_ar : field.label_en;
  const placeholder = field.placeholder || '';
  const helpText = field.help_text || '';
  const isDisabled = disabled || field.is_disabled || readOnly || field.is_readonly;

  // Common wrapper for all fields
  const FieldWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className={`col-span-${field.grid_column || 1}`}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
        {field.is_required && <span className="text-red-500 ms-1">*</span>}
      </label>
      {children}
      {helpText && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {helpText}
        </p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );

  // Render based on field type
  switch (field.field_type) {
    case 'text':
    case 'email':
    case 'phone':
      return (
        <FieldWrapper>
          <Input
            type={field.field_type === 'phone' ? 'tel' : field.field_type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={isDisabled}
            error={error}
          />
        </FieldWrapper>
      );

    case 'number':
      return (
        <FieldWrapper>
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            placeholder={placeholder}
            disabled={isDisabled}
            error={error}
          />
        </FieldWrapper>
      );

    case 'textarea':
      return (
        <FieldWrapper>
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={4}
          />
        </FieldWrapper>
      );

    case 'date':
      return (
        <FieldWrapper>
          <div className="relative">
            <Input
              type="date"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={isDisabled}
              error={error}
            />
            <Calendar className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </FieldWrapper>
      );

    case 'datetime':
      return (
        <FieldWrapper>
          <Input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={isDisabled}
            error={error}
          />
        </FieldWrapper>
      );

    case 'time':
      return (
        <FieldWrapper>
          <div className="relative">
            <Input
              type="time"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={isDisabled}
              error={error}
            />
            <Clock className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </FieldWrapper>
      );

    case 'select':
      return (
        <FieldWrapper>
          <Select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={isDisabled}
            error={error}
          >
            <option value="">{t.selectOption[lang]}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </FieldWrapper>
      );

    case 'multiselect':
      return (
        <FieldWrapper>
          <div className="space-y-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(opt.value)}
                  onChange={(e) => {
                    const current = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...current, opt.value]);
                    } else {
                      onChange(current.filter((v: any) => v !== opt.value));
                    }
                  }}
                  disabled={isDisabled}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{opt.label}</span>
              </label>
            ))}
            {(!field.options || field.options.length === 0) && (
              <p className="text-sm text-slate-500">{t.noOptions[lang]}</p>
            )}
          </div>
        </FieldWrapper>
      );

    case 'radio':
      return (
        <FieldWrapper>
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.field_key}
                  checked={value === opt.value}
                  onChange={() => onChange(opt.value)}
                  disabled={isDisabled}
                  className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{opt.label}</span>
              </label>
            ))}
          </div>
        </FieldWrapper>
      );

    case 'checkbox':
      // Single checkbox for boolean fields
      if (!field.options || field.options.length === 0) {
        return (
          <FieldWrapper>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
                disabled={isDisabled}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {placeholder || label}
              </span>
            </label>
          </FieldWrapper>
        );
      }
      // Multiple checkboxes (same as multiselect)
      return (
        <FieldWrapper>
          <div className="space-y-2">
            {field.options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(opt.value)}
                  onChange={(e) => {
                    const current = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...current, opt.value]);
                    } else {
                      onChange(current.filter((v: any) => v !== opt.value));
                    }
                  }}
                  disabled={isDisabled}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{opt.label}</span>
              </label>
            ))}
          </div>
        </FieldWrapper>
      );

    case 'file':
    case 'image':
      const isImage = field.field_type === 'image';
      const acceptType = isImage ? 'image/*' : '*/*';
      const Icon = isImage ? ImageIcon : FileText;

      return (
        <FieldWrapper>
          <div
            className={`
              border-2 border-dashed rounded-lg p-4 text-center
              ${isDisabled ? 'bg-slate-100 dark:bg-slate-800' : 'hover:border-blue-400 cursor-pointer'}
              ${error ? 'border-red-300' : 'border-slate-300 dark:border-slate-600'}
            `}
          >
            {value ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {typeof value === 'string' ? value : value.name}
                  </span>
                </div>
                {!isDisabled && (
                  <button
                    type="button"
                    onClick={() => onChange(null)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                )}
              </div>
            ) : (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept={acceptType}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onChange(file);
                  }}
                  disabled={isDisabled}
                  className="hidden"
                />
                <Icon className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isImage ? t.uploadImage[lang] : t.uploadFile[lang]}
                </p>
                <p className="text-xs text-slate-400 mt-1">{t.dragDrop[lang]}</p>
              </label>
            )}
          </div>
        </FieldWrapper>
      );

    case 'hidden':
      return <input type="hidden" value={value || ''} />;

    default:
      return (
        <FieldWrapper>
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={isDisabled}
            error={error}
          />
        </FieldWrapper>
      );
  }
};

// Section Renderer Component
const SectionRenderer: React.FC<{
  section: DynamicFormSection;
  fields: DynamicFormField[];
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  lang: 'en' | 'ar';
  errors?: Record<string, string>;
  disabled?: boolean;
  readOnly?: boolean;
}> = ({ section, fields, data, onChange, lang, errors, disabled, readOnly }) => {
  const [isCollapsed, setIsCollapsed] = useState(section.is_collapsed_default);

  // Check if section should be visible based on conditional logic
  if (!checkConditionalLogic(section.conditional_logic, data)) {
    return null;
  }

  const title = lang === 'ar' ? section.title_ar : section.title_en;
  const sectionFields = fields.filter((f) => f.section === section.section_key);

  if (sectionFields.length === 0) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 dark:text-white">{title}</h3>
          {section.is_collapsible && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            >
              {isCollapsed ? (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              )}
            </button>
          )}
        </div>
        {section.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {section.description}
          </p>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardBody>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${section.grid_columns || 1}, 1fr)` }}
          >
            {sectionFields
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((field) => {
                // Check field conditional logic
                if (!checkConditionalLogic(field.conditional_logic, data)) {
                  return null;
                }

                return (
                  <FieldRenderer
                    key={field.field_key}
                    field={field}
                    value={data[field.field_key]}
                    onChange={(val) => onChange(field.field_key, val)}
                    lang={lang}
                    error={errors?.[field.field_key]}
                    disabled={disabled}
                    readOnly={readOnly}
                  />
                );
              })}
          </div>
        </CardBody>
      )}
    </Card>
  );
};

// Main DynamicFormRenderer Component
const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  form,
  data,
  onChange,
  lang,
  errors,
  disabled,
  readOnly,
}) => {
  // Handle field value change
  const handleFieldChange = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  // Get fields without sections
  const fieldsWithoutSection = form.fields.filter(
    (f) => !f.section || !form.sections?.find((s) => s.section_key === f.section)
  );

  // Sort sections and fields
  const sortedSections = [...(form.sections || [])].sort((a, b) => a.sort_order - b.sort_order);
  const sortedFieldsWithoutSection = [...fieldsWithoutSection].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-4">
      {/* Render sections */}
      {sortedSections.map((section) => (
        <SectionRenderer
          key={section.section_key}
          section={section}
          fields={form.fields}
          data={data}
          onChange={handleFieldChange}
          lang={lang}
          errors={errors}
          disabled={disabled}
          readOnly={readOnly}
        />
      ))}

      {/* Render fields without sections */}
      {sortedFieldsWithoutSection.length > 0 && (
        <Card>
          <CardBody>
            <div className="grid gap-4 md:grid-cols-2">
              {sortedFieldsWithoutSection.map((field) => {
                // Check field conditional logic
                if (!checkConditionalLogic(field.conditional_logic, data)) {
                  return null;
                }

                return (
                  <FieldRenderer
                    key={field.field_key}
                    field={field}
                    value={data[field.field_key]}
                    onChange={(val) => handleFieldChange(field.field_key, val)}
                    lang={lang}
                    error={errors?.[field.field_key]}
                    disabled={disabled}
                    readOnly={readOnly}
                  />
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

// Validation helper
export const validateDynamicForm = (
  form: DynamicForm,
  data: Record<string, any>,
  lang: 'en' | 'ar'
): Record<string, string> => {
  const errors: Record<string, string> = {};

  form.fields.forEach((field) => {
    // Skip hidden fields and fields with failed conditional logic
    if (field.is_hidden || !checkConditionalLogic(field.conditional_logic, data)) {
      return;
    }

    const value = data[field.field_key];

    // Required validation
    if (field.is_required) {
      const isEmpty =
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        const label = lang === 'ar' ? field.label_ar : field.label_en;
        errors[field.field_key] = lang === 'ar'
          ? `${label} مطلوب`
          : `${label} is required`;
      }
    }

    // Email validation
    if (field.field_type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[field.field_key] = lang === 'ar'
          ? 'البريد الإلكتروني غير صحيح'
          : 'Invalid email address';
      }
    }

    // Phone validation
    if (field.field_type === 'phone' && value) {
      const phoneRegex = /^[\d\s\-+()]+$/;
      if (!phoneRegex.test(value)) {
        errors[field.field_key] = lang === 'ar'
          ? 'رقم الهاتف غير صحيح'
          : 'Invalid phone number';
      }
    }
  });

  return errors;
};

export default DynamicFormRenderer;
