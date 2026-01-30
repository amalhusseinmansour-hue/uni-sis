import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DynamicForm as DynamicFormType, DynamicFormField, DynamicFormSection, dynamicFormsApi } from '../../api/dynamicForms';

interface DynamicFormProps {
  code: string;
  onSubmit?: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
  initialData?: Record<string, unknown>;
  readOnly?: boolean;
  className?: string;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  code,
  onSubmit,
  onCancel,
  initialData = {},
  readOnly = false,
  className = '',
}) => {
  const { lang } = useLanguage();
  const [form, setForm] = useState<DynamicFormType | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadForm();
  }, [code]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const formConfig = await dynamicFormsApi.getByCode(code);
      setForm(formConfig);

      // Set default values
      const defaults: Record<string, unknown> = {};
      formConfig.fields.forEach(field => {
        if (field.default_value !== undefined && !initialData[field.field_key]) {
          defaults[field.field_key] = field.default_value;
        }
      });
      setFormData(prev => ({ ...defaults, ...prev }));
    } catch (error) {
      console.error('Failed to load form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((fieldKey: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [fieldKey]: value }));
    // Clear error when user changes the field
    if (errors[fieldKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  }, [errors]);

  const evaluateConditionalLogic = (field: DynamicFormField): boolean => {
    if (!field.conditional_logic) return true;

    const { operator, conditions } = field.conditional_logic;
    const results = conditions.map(condition => {
      const fieldValue = formData[condition.field];

      switch (condition.operator) {
        case 'equals':
          return fieldValue == condition.value;
        case 'not_equals':
          return fieldValue != condition.value;
        case 'contains':
          return String(fieldValue || '').includes(String(condition.value));
        case 'is_empty':
          return !fieldValue;
        case 'is_not_empty':
          return !!fieldValue;
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

    return operator === 'and'
      ? results.every(Boolean)
      : results.some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form) return;

    setSubmitting(true);
    try {
      const result = await dynamicFormsApi.submit(code, formData);
      onSubmit?.(result as unknown as Record<string, unknown>);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (apiError.response?.data?.errors) {
        setErrors(apiError.response.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: DynamicFormField) => {
    if (field.is_hidden || !evaluateConditionalLogic(field)) return null;

    const fieldError = errors[field.field_key];
    const commonClasses = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
      ${fieldError ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}
      ${readOnly || field.is_readonly ? 'bg-gray-100 dark:bg-slate-700' : 'bg-white dark:bg-slate-800'}
      dark:text-white`;

    const label = (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {lang === 'ar' ? field.label_ar : field.label_en}
        {field.is_required && <span className="text-red-500 me-1">*</span>}
      </label>
    );

    const helpText = field.help_text && (
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {lang === 'ar' ? field.help_text : field.help_text}
      </p>
    );

    const errorMessage = fieldError && (
      <p className="mt-1 text-sm text-red-500">{fieldError[0]}</p>
    );

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div key={field.field_key} className="mb-4">
            {label}
            <input
              type={field.field_type}
              value={String(formData[field.field_key] || '')}
              onChange={(e) => handleChange(field.field_key, e.target.value)}
              placeholder={field.placeholder}
              disabled={readOnly || field.is_readonly}
              className={commonClasses}
            />
            {helpText}
            {errorMessage}
          </div>
        );

      case 'number':
        return (
          <div key={field.field_key} className="mb-4">
            {label}
            <input
              type="number"
              value={String(formData[field.field_key] || '')}
              onChange={(e) => handleChange(field.field_key, parseFloat(e.target.value))}
              placeholder={field.placeholder}
              disabled={readOnly || field.is_readonly}
              className={commonClasses}
            />
            {helpText}
            {errorMessage}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.field_key} className="mb-4">
            {label}
            <textarea
              value={String(formData[field.field_key] || '')}
              onChange={(e) => handleChange(field.field_key, e.target.value)}
              placeholder={field.placeholder}
              disabled={readOnly || field.is_readonly}
              rows={4}
              className={commonClasses}
            />
            {helpText}
            {errorMessage}
          </div>
        );

      case 'select':
        return (
          <div key={field.field_key} className="mb-4">
            {label}
            <select
              value={String(formData[field.field_key] || '')}
              onChange={(e) => handleChange(field.field_key, e.target.value)}
              disabled={readOnly || field.is_readonly}
              className={commonClasses}
            >
              <option value="">{lang === 'ar' ? 'اختر...' : 'Select...'}</option>
              {field.options?.map(option => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
            {helpText}
            {errorMessage}
          </div>
        );

      case 'multiselect':
        return (
          <div key={field.field_key} className="mb-4">
            {label}
            <select
              multiple
              value={Array.isArray(formData[field.field_key]) ? formData[field.field_key] as string[] : []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                handleChange(field.field_key, values);
              }}
              disabled={readOnly || field.is_readonly}
              className={`${commonClasses} min-h-[120px]`}
            >
              {field.options?.map(option => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
            {helpText}
            {errorMessage}
          </div>
        );

      case 'radio':
        return (
          <div key={field.field_key} className="mb-4">
            {label}
            <div className="space-y-2">
              {field.options?.map(option => (
                <label key={String(option.value)} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={field.field_key}
                    value={String(option.value)}
                    checked={formData[field.field_key] === option.value}
                    onChange={(e) => handleChange(field.field_key, e.target.value)}
                    disabled={readOnly || field.is_readonly}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
            {helpText}
            {errorMessage}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.field_key} className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(formData[field.field_key])}
                onChange={(e) => handleChange(field.field_key, e.target.checked)}
                disabled={readOnly || field.is_readonly}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">
                {lang === 'ar' ? field.label_ar : field.label_en}
              </span>
            </label>
            {helpText}
            {errorMessage}
          </div>
        );

      case 'date':
        return (
          <div key={field.field_key} className="mb-4">
            {label}
            <input
              type="date"
              value={String(formData[field.field_key] || '')}
              onChange={(e) => handleChange(field.field_key, e.target.value)}
              disabled={readOnly || field.is_readonly}
              className={commonClasses}
            />
            {helpText}
            {errorMessage}
          </div>
        );

      case 'datetime':
        return (
          <div key={field.field_key} className="mb-4">
            {label}
            <input
              type="datetime-local"
              value={String(formData[field.field_key] || '')}
              onChange={(e) => handleChange(field.field_key, e.target.value)}
              disabled={readOnly || field.is_readonly}
              className={commonClasses}
            />
            {helpText}
            {errorMessage}
          </div>
        );

      case 'time':
        return (
          <div key={field.field_key} className="mb-4">
            {label}
            <input
              type="time"
              value={String(formData[field.field_key] || '')}
              onChange={(e) => handleChange(field.field_key, e.target.value)}
              disabled={readOnly || field.is_readonly}
              className={commonClasses}
            />
            {helpText}
            {errorMessage}
          </div>
        );

      case 'file':
      case 'image':
        return (
          <div key={field.field_key} className="mb-4">
            {label}
            <input
              type="file"
              accept={field.field_type === 'image' ? 'image/*' : undefined}
              onChange={(e) => handleChange(field.field_key, e.target.files?.[0])}
              disabled={readOnly || field.is_readonly}
              className={commonClasses}
            />
            {helpText}
            {errorMessage}
          </div>
        );

      default:
        return null;
    }
  };

  const renderSection = (section: DynamicFormSection) => {
    const sectionFields = form?.fields.filter(f => f.section === section.section_key) || [];

    if (sectionFields.length === 0) return null;

    return (
      <div key={section.section_key} className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          {section.icon && <span className="text-xl">{section.icon}</span>}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {lang === 'ar' ? section.title_ar : section.title_en}
          </h3>
        </div>
        {section.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {lang === 'ar' ? section.description : section.description}
          </p>
        )}
        <div className={`grid gap-4 grid-cols-${section.grid_columns || 1}`}>
          {sectionFields.map(renderField)}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        {lang === 'ar' ? 'النموذج غير موجود' : 'Form not found'}
      </div>
    );
  }

  const fieldsWithoutSection = form.fields.filter(f => !f.section);

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {form.name}
        </h2>
        {form.description && (
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {form.description}
          </p>
        )}
      </div>

      {/* Render sections */}
      {form.sections?.map(renderSection)}

      {/* Render fields without section */}
      {fieldsWithoutSection.length > 0 && (
        <div className="mb-6">
          {fieldsWithoutSection.map(renderField)}
        </div>
      )}

      {!readOnly && (
        <div className="flex gap-4 justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? (lang === 'ar' ? 'جاري الإرسال...' : 'Submitting...')
              : (lang === 'ar' ? 'إرسال' : 'Submit')}
          </button>
        </div>
      )}
    </form>
  );
};

export default DynamicForm;
