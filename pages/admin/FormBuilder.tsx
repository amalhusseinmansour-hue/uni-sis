import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Search,
  Save,
  X,
  Settings,
  List,
  Layers,
  GripVertical,
  Eye,
  ArrowUp,
  ArrowDown,
  Check,
  AlertCircle,
  RefreshCw,
  Type,
  Hash,
  Mail,
  Phone,
  AlignLeft,
  ChevronDown,
  CheckSquare,
  Circle,
  Calendar,
  Clock,
  Upload,
  Image,
  Bold,
  Palette,
  Lock,
  EyeOff,
} from 'lucide-react';
import * as formBuilderApi from '../../api/admin/formBuilder';
import type { DynamicForm, DynamicFormSection, DynamicFormField, FieldType } from '../../api/admin/formBuilder';

interface FormBuilderProps {
  lang: 'en' | 'ar';
}

const t = {
  title: { en: 'Form Builder', ar: 'بناء النماذج' },
  subtitle: { en: 'Create and manage dynamic forms', ar: 'إنشاء وإدارة النماذج الديناميكية' },
  forms: { en: 'Forms', ar: 'النماذج' },
  addNew: { en: 'New Form', ar: 'نموذج جديد' },
  search: { en: 'Search forms...', ar: 'البحث في النماذج...' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  duplicate: { en: 'Duplicate', ar: 'نسخ' },
  preview: { en: 'Preview', ar: 'معاينة' },
  active: { en: 'Active', ar: 'نشط' },
  inactive: { en: 'Inactive', ar: 'غير نشط' },
  general: { en: 'General', ar: 'عام' },
  sections: { en: 'Sections', ar: 'الأقسام' },
  fields: { en: 'Fields', ar: 'الحقول' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  code: { en: 'Code', ar: 'الكود' },
  nameEn: { en: 'Name (English)', ar: 'الاسم (إنجليزي)' },
  nameAr: { en: 'Name (Arabic)', ar: 'الاسم (عربي)' },
  descriptionEn: { en: 'Description (English)', ar: 'الوصف (إنجليزي)' },
  descriptionAr: { en: 'Description (Arabic)', ar: 'الوصف (عربي)' },
  noForms: { en: 'No forms found', ar: 'لا توجد نماذج' },
  createFirst: { en: 'Create your first form', ar: 'أنشئ أول نموذج' },
  confirmDelete: { en: 'Are you sure you want to delete this form?', ar: 'هل أنت متأكد من حذف هذا النموذج؟' },
  saving: { en: 'Saving...', ar: 'جاري الحفظ...' },
  saved: { en: 'Saved successfully', ar: 'تم الحفظ بنجاح' },
  error: { en: 'An error occurred', ar: 'حدث خطأ' },

  // Field settings
  fieldName: { en: 'Field Name', ar: 'اسم الحقل' },
  label: { en: 'Label', ar: 'العنوان' },
  type: { en: 'Type', ar: 'النوع' },
  placeholder: { en: 'Placeholder', ar: 'نص مساعد' },
  helperText: { en: 'Helper Text', ar: 'نص توضيحي' },
  defaultValue: { en: 'Default Value', ar: 'القيمة الافتراضية' },
  required: { en: 'Required', ar: 'مطلوب' },
  readonly: { en: 'Read Only', ar: 'للقراءة فقط' },
  disabled: { en: 'Disabled', ar: 'معطل' },
  colSpan: { en: 'Column Span', ar: 'عرض العمود' },
  addField: { en: 'Add Field', ar: 'إضافة حقل' },
  noFields: { en: 'No fields defined', ar: 'لا توجد حقول' },
  selectSection: { en: 'Select a section', ar: 'اختر قسم' },
  noSection: { en: 'No Section', ar: 'بدون قسم' },

  // Section settings
  sectionTitle: { en: 'Section Title', ar: 'عنوان القسم' },
  collapsible: { en: 'Collapsible', ar: 'قابل للطي' },
  collapsedDefault: { en: 'Collapsed by Default', ar: 'مطوي افتراضياً' },
  columns: { en: 'Columns', ar: 'الأعمدة' },
  addSection: { en: 'Add Section', ar: 'إضافة قسم' },
  noSections: { en: 'No sections defined', ar: 'لا توجد أقسام' },

  // Form settings
  layout: { en: 'Layout', ar: 'التخطيط' },
  labelPosition: { en: 'Label Position', ar: 'موضع العنوان' },
  showRequired: { en: 'Show Required Indicator', ar: 'إظهار علامة المطلوب' },
  showValidation: { en: 'Show Validation Summary', ar: 'إظهار ملخص التحقق' },
  autoSave: { en: 'Auto Save', ar: 'حفظ تلقائي' },
  confirmLeave: { en: 'Confirm Before Leave', ar: 'تأكيد قبل المغادرة' },
  resetOnSubmit: { en: 'Reset on Submit', ar: 'إعادة تعيين عند الإرسال' },
  scrollToError: { en: 'Scroll to Error', ar: 'تمرير للخطأ' },
  submitButton: { en: 'Submit Button Text', ar: 'نص زر الإرسال' },
  cancelButton: { en: 'Cancel Button Text', ar: 'نص زر الإلغاء' },
  showCancelButton: { en: 'Show Cancel Button', ar: 'إظهار زر الإلغاء' },
  submitEndpoint: { en: 'Submit Endpoint', ar: 'نقطة الإرسال' },
  successMessage: { en: 'Success Message', ar: 'رسالة النجاح' },
  redirectAfter: { en: 'Redirect After Submit', ar: 'إعادة التوجيه بعد الإرسال' },

  // Field types
  text: { en: 'Text', ar: 'نص' },
  number: { en: 'Number', ar: 'رقم' },
  email: { en: 'Email', ar: 'بريد إلكتروني' },
  phone: { en: 'Phone', ar: 'هاتف' },
  textarea: { en: 'Text Area', ar: 'منطقة نص' },
  select: { en: 'Dropdown', ar: 'قائمة منسدلة' },
  multiselect: { en: 'Multi Select', ar: 'اختيار متعدد' },
  radio: { en: 'Radio', ar: 'اختيار واحد' },
  checkbox: { en: 'Checkbox', ar: 'مربع اختيار' },
  date: { en: 'Date', ar: 'تاريخ' },
  datetime: { en: 'Date & Time', ar: 'تاريخ ووقت' },
  time: { en: 'Time', ar: 'وقت' },
  file: { en: 'File Upload', ar: 'رفع ملف' },
  image: { en: 'Image Upload', ar: 'رفع صورة' },
  richText: { en: 'Rich Text', ar: 'نص منسق' },
  color: { en: 'Color', ar: 'لون' },
  password: { en: 'Password', ar: 'كلمة مرور' },
  hidden: { en: 'Hidden', ar: 'مخفي' },

  // Validation
  validation: { en: 'Validation', ar: 'التحقق' },
  minLength: { en: 'Min Length', ar: 'الحد الأدنى للطول' },
  maxLength: { en: 'Max Length', ar: 'الحد الأقصى للطول' },
  min: { en: 'Min Value', ar: 'الحد الأدنى' },
  max: { en: 'Max Value', ar: 'الحد الأقصى' },
  pattern: { en: 'Pattern (Regex)', ar: 'النمط (Regex)' },

  // Layout options
  vertical: { en: 'Vertical', ar: 'عمودي' },
  horizontal: { en: 'Horizontal', ar: 'أفقي' },
  inline: { en: 'Inline', ar: 'سطري' },
  top: { en: 'Top', ar: 'أعلى' },
  left: { en: 'Left', ar: 'يسار' },
  floating: { en: 'Floating', ar: 'عائم' },

  // Categories
  basicFields: { en: 'Basic', ar: 'أساسي' },
  choiceFields: { en: 'Choice', ar: 'اختيار' },
  dateTimeFields: { en: 'Date/Time', ar: 'تاريخ/وقت' },
  mediaFields: { en: 'Media', ar: 'وسائط' },
  advancedFields: { en: 'Advanced', ar: 'متقدم' },
};

const fieldTypeIcons: Record<string, React.ComponentType<any>> = {
  text: Type,
  number: Hash,
  email: Mail,
  tel: Phone,
  textarea: AlignLeft,
  select: ChevronDown,
  multiselect: CheckSquare,
  radio: Circle,
  checkbox: CheckSquare,
  date: Calendar,
  datetime: Clock,
  time: Clock,
  file: Upload,
  image: Image,
  rich_text: Bold,
  color: Palette,
  password: Lock,
  hidden: EyeOff,
};

const FormBuilder: React.FC<FormBuilderProps> = ({ lang }) => {
  const isRTL = lang === 'ar';

  // State
  const [forms, setForms] = useState<DynamicForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingForm, setEditingForm] = useState<DynamicForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editor state
  const [activeTab, setActiveTab] = useState<'general' | 'sections' | 'fields' | 'settings'>('general');
  const [formData, setFormData] = useState<Partial<DynamicForm>>({});
  const [sections, setSections] = useState<Partial<DynamicFormSection>[]>([]);
  const [fields, setFields] = useState<Partial<DynamicFormField>[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [showFieldPanel, setShowFieldPanel] = useState(false);

  // Load forms
  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const response = await formBuilderApi.getForms();
      if (response.success) {
        setForms(response.data);
      }
    } catch (error) {
      console.error('Error loading forms:', error);
      showMessage('error', t.error[lang]);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const filteredForms = forms.filter(form =>
    form.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.name_ar.includes(searchTerm) ||
    form.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingForm(null);
    setFormData({
      code: '',
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      submit_endpoint: '',
      success_message_en: 'Form submitted successfully',
      success_message_ar: 'تم إرسال النموذج بنجاح',
      redirect_after: '',
      settings: formBuilderApi.getDefaultFormSettings(),
      is_active: true,
    });
    setSections([]);
    setFields([]);
    setActiveTab('general');
    setShowEditor(true);
  };

  const handleEdit = async (form: DynamicForm) => {
    try {
      const response = await formBuilderApi.getForm(form.code);
      if (response.success) {
        const fullForm = response.data;
        setEditingForm(fullForm);
        setFormData({
          code: fullForm.code,
          name_en: fullForm.name_en,
          name_ar: fullForm.name_ar,
          description_en: fullForm.description_en,
          description_ar: fullForm.description_ar,
          model_class: fullForm.model_class,
          submit_endpoint: fullForm.submit_endpoint,
          success_message_en: fullForm.success_message_en,
          success_message_ar: fullForm.success_message_ar,
          redirect_after: fullForm.redirect_after,
          settings: fullForm.settings || formBuilderApi.getDefaultFormSettings(),
          roles: fullForm.roles,
          is_active: fullForm.is_active,
        });
        setSections(fullForm.sections || []);
        setFields(fullForm.fields || []);
        setActiveTab('general');
        setShowEditor(true);
      }
    } catch (error) {
      console.error('Error loading form:', error);
      showMessage('error', t.error[lang]);
    }
  };

  const handleDelete = async (form: DynamicForm) => {
    if (!confirm(t.confirmDelete[lang])) return;

    try {
      await formBuilderApi.deleteForm(form.code);
      setForms(prev => prev.filter(f => f.code !== form.code));
      showMessage('success', t.saved[lang]);
    } catch (error) {
      console.error('Error deleting form:', error);
      showMessage('error', t.error[lang]);
    }
  };

  const handleDuplicate = async (form: DynamicForm) => {
    try {
      const response = await formBuilderApi.duplicateForm(form.code);
      if (response.success) {
        setForms(prev => [...prev, response.data]);
        showMessage('success', t.saved[lang]);
      }
    } catch (error) {
      console.error('Error duplicating form:', error);
      showMessage('error', t.error[lang]);
    }
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name_en || !formData.name_ar) {
      showMessage('error', 'Please fill in required fields');
      return;
    }

    try {
      setSaving(true);

      // Save form
      const formResponse = await formBuilderApi.saveForm(formData);
      if (!formResponse.success) throw new Error('Failed to save form');

      // Save sections
      if (sections.length > 0) {
        await formBuilderApi.saveSections(formData.code!, sections);
      }

      // Save fields
      if (fields.length > 0) {
        await formBuilderApi.saveFields(formData.code!, fields);
      }

      showMessage('success', t.saved[lang]);
      setShowEditor(false);
      loadForms();
    } catch (error) {
      console.error('Error saving form:', error);
      showMessage('error', t.error[lang]);
    } finally {
      setSaving(false);
    }
  };

  // Section management
  const addSection = () => {
    setSections(prev => [...prev, formBuilderApi.getDefaultSection(prev.length)]);
  };

  const updateSection = (index: number, updates: Partial<DynamicFormSection>) => {
    setSections(prev => prev.map((sec, i) => i === index ? { ...sec, ...updates } : sec));
  };

  const removeSection = (index: number) => {
    const sectionId = sections[index].id;
    setSections(prev => prev.filter((_, i) => i !== index));
    // Remove fields from this section
    if (sectionId) {
      setFields(prev => prev.map(f => f.section_id === sectionId ? { ...f, section_id: undefined } : f));
    }
  };

  // Field management
  const addField = (type: string) => {
    const newField: Partial<DynamicFormField> = {
      ...formBuilderApi.getDefaultField(fields.length),
      type: type as any,
      section_id: selectedSection || undefined,
    };
    setFields(prev => [...prev, newField]);
    setShowFieldPanel(false);
  };

  const updateField = (index: number, updates: Partial<DynamicFormField>) => {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const removeField = (index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    newFields.forEach((f, i) => f.order = i);
    setFields(newFields);
  };

  const renderFormList = () => (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.search[lang]}
            className="ps-10 pe-4 py-2 w-80 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t.addNew[lang]}
        </button>
      </div>

      {/* Form List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t.noForms[lang]}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t.createFirst[lang]}</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t.addNew[lang]}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForms.map((form) => (
            <div
              key={form.code}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {lang === 'ar' ? form.name_ar : form.name_en}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">{form.code}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  form.is_active
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {form.is_active ? t.active[lang] : t.inactive[lang]}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Layers className="w-4 h-4" />
                  {form.sections_count || 0} {t.sections[lang]}
                </span>
                <span className="flex items-center gap-1">
                  <List className="w-4 h-4" />
                  {form.fields_count || 0} {t.fields[lang]}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-slate-700">
                <button
                  onClick={() => handleEdit(form)}
                  className="flex-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  {t.edit[lang]}
                </button>
                <button
                  onClick={() => handleDuplicate(form)}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                  title={t.duplicate[lang]}
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                  title={t.preview[lang]}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(form)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  title={t.delete[lang]}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEditor = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            {editingForm ? t.edit[lang] : t.addNew[lang]} {t.forms[lang]}
          </h2>
          <button onClick={() => setShowEditor(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 px-6">
          {(['general', 'sections', 'fields', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              {tab === 'general' && <Settings className="w-4 h-4 inline me-2" />}
              {tab === 'sections' && <Layers className="w-4 h-4 inline me-2" />}
              {tab === 'fields' && <List className="w-4 h-4 inline me-2" />}
              {tab === 'settings' && <Settings className="w-4 h-4 inline me-2" />}
              {t[tab][lang]}
              {tab === 'sections' && <span className="ms-2 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs">{sections.length}</span>}
              {tab === 'fields' && <span className="ms-2 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs">{fields.length}</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'sections' && renderSectionsTab()}
          {activeTab === 'fields' && renderFieldsTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setShowEditor(false)}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            {t.cancel[lang]}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? t.saving[lang] : t.save[lang]}
          </button>
        </div>
      </div>
    </div>
  );

  const renderGeneralTab = () => (
    <div className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.code[lang]} *
          </label>
          <input
            type="text"
            value={formData.code || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
            placeholder="e.g., student_registration"
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono"
            disabled={!!editingForm}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.submitEndpoint[lang]}
          </label>
          <input
            type="text"
            value={formData.submit_endpoint || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, submit_endpoint: e.target.value }))}
            placeholder="/api/submit"
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.nameEn[lang]} *
          </label>
          <input
            type="text"
            value={formData.name_en || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.nameAr[lang]} *
          </label>
          <input
            type="text"
            value={formData.name_ar || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            dir="rtl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.descriptionEn[lang]}
          </label>
          <textarea
            value={formData.description_en || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.descriptionAr[lang]}
          </label>
          <textarea
            value={formData.description_ar || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            dir="rtl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.successMessage[lang]} (EN)
          </label>
          <input
            type="text"
            value={formData.success_message_en || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, success_message_en: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.successMessage[lang]} (AR)
          </label>
          <input
            type="text"
            value={formData.success_message_ar || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, success_message_ar: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            dir="rtl"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.redirectAfter[lang]}
        </label>
        <input
          type="text"
          value={formData.redirect_after || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, redirect_after: e.target.value }))}
          placeholder="/thank-you"
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{t.active[lang]}</p>
          <p className="text-sm text-gray-500">{lang === 'ar' ? 'تفعيل أو تعطيل هذا النموذج' : 'Enable or disable this form'}</p>
        </div>
        <button
          onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            formData.is_active ? 'bg-green-600' : 'bg-gray-300 dark:bg-slate-600'
          }`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            formData.is_active ? (isRTL ? 'start-1' : 'left-7') : (isRTL ? 'left-7' : 'start-1')
          }`} />
        </button>
      </div>
    </div>
  );

  const renderSectionsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">{t.sections[lang]}</h3>
        <button
          onClick={addSection}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {t.addSection[lang]}
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
          {t.noSections[lang]}
        </div>
      ) : (
        <div className="space-y-2">
          {sections.map((section, index) => (
            <div key={index} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move mt-2" />

                <div className="flex-1 grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.code[lang]}</label>
                    <input
                      type="text"
                      value={section.code || ''}
                      onChange={(e) => updateSection(index, { code: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.sectionTitle[lang]} (EN)</label>
                    <input
                      type="text"
                      value={section.title_en || ''}
                      onChange={(e) => updateSection(index, { title_en: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.sectionTitle[lang]} (AR)</label>
                    <input
                      type="text"
                      value={section.title_ar || ''}
                      onChange={(e) => updateSection(index, { title_ar: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.columns[lang]}</label>
                    <select
                      value={section.columns || 2}
                      onChange={(e) => updateSection(index, { columns: Number(e.target.value) as any })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={section.collapsible ?? false}
                      onChange={(e) => updateSection(index, { collapsible: e.target.checked })}
                      className="rounded"
                    />
                    {t.collapsible[lang]}
                  </label>
                </div>

                <button
                  onClick={() => removeSection(index)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFieldsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">{t.fields[lang]}</h3>
        <div className="flex items-center gap-2">
          {sections.length > 0 && (
            <select
              value={selectedSection || ''}
              onChange={(e) => setSelectedSection(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            >
              <option value="">{t.noSection[lang]}</option>
              {sections.map((sec, i) => (
                <option key={i} value={sec.id || i}>{sec.title_en || sec.code}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowFieldPanel(true)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            {t.addField[lang]}
          </button>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
          {t.noFields[lang]}
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => {
            const Icon = fieldTypeIcons[field.type || 'text'] || Type;
            return (
              <div key={index} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 pt-2">
                    <button
                      onClick={() => moveField(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded disabled:opacity-30"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveField(index, 'down')}
                      disabled={index === fields.length - 1}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded disabled:opacity-30"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded">
                    <Icon className="w-4 h-4 text-green-600" />
                  </div>

                  <div className="flex-1 grid grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t.fieldName[lang]}</label>
                      <input
                        type="text"
                        value={field.name || ''}
                        onChange={(e) => updateField(index, { name: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t.label[lang]} (EN)</label>
                      <input
                        type="text"
                        value={field.label_en || ''}
                        onChange={(e) => updateField(index, { label_en: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t.label[lang]} (AR)</label>
                      <input
                        type="text"
                        value={field.label_ar || ''}
                        onChange={(e) => updateField(index, { label_ar: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t.type[lang]}</label>
                      <select
                        value={field.type || 'text'}
                        onChange={(e) => updateField(index, { type: e.target.value as any })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                      >
                        {formBuilderApi.fieldTypeDefinitions.map((ft) => (
                          <option key={ft.type} value={ft.type}>{ft.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t.colSpan[lang]}</label>
                      <select
                        value={field.col_span || 1}
                        onChange={(e) => updateField(index, { col_span: Number(e.target.value) as any })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-6">
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={field.validation?.required ?? false}
                        onChange={(e) => updateField(index, { validation: { ...field.validation, required: e.target.checked } })}
                        className="rounded"
                      />
                      {t.required[lang]}
                    </label>
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={field.is_readonly ?? false}
                        onChange={(e) => updateField(index, { is_readonly: e.target.checked })}
                        className="rounded"
                      />
                      {t.readonly[lang]}
                    </label>
                  </div>

                  <button
                    onClick={() => removeField(index)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Field Type Panel */}
      {showFieldPanel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">{t.addField[lang]}</h3>
              <button onClick={() => setShowFieldPanel(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {formBuilderApi.fieldTypeDefinitions.map((ft) => {
                const Icon = fieldTypeIcons[ft.type] || Type;
                return (
                  <button
                    key={ft.type}
                    onClick={() => addField(ft.type)}
                    className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-500 text-center transition-colors"
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{ft.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => {
    const settings = formData.settings || formBuilderApi.getDefaultFormSettings();

    const updateSetting = (key: string, value: any) => {
      setFormData(prev => ({
        ...prev,
        settings: { ...prev.settings, [key]: value } as any
      }));
    };

    return (
      <div className="space-y-6 max-w-3xl">
        <h3 className="font-medium text-gray-900 dark:text-white">{t.settings[lang]}</h3>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.layout[lang]}
            </label>
            <select
              value={settings.layout}
              onChange={(e) => updateSetting('layout', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            >
              <option value="vertical">{t.vertical[lang]}</option>
              <option value="horizontal">{t.horizontal[lang]}</option>
              <option value="inline">{t.inline[lang]}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.labelPosition[lang]}
            </label>
            <select
              value={settings.label_position}
              onChange={(e) => updateSetting('label_position', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            >
              <option value="top">{t.top[lang]}</option>
              <option value="left">{t.left[lang]}</option>
              <option value="floating">{t.floating[lang]}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'show_required_indicator', label: t.showRequired },
            { key: 'show_validation_summary', label: t.showValidation },
            { key: 'auto_save', label: t.autoSave },
            { key: 'confirm_before_leave', label: t.confirmLeave },
            { key: 'reset_on_submit', label: t.resetOnSubmit },
            { key: 'scroll_to_error', label: t.scrollToError },
            { key: 'show_cancel_button', label: t.showCancelButton },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">{setting.label[lang]}</span>
              <button
                onClick={() => updateSetting(setting.key, !(settings as any)[setting.key])}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  (settings as any)[setting.key] ? 'bg-green-600' : 'bg-gray-300 dark:bg-slate-600'
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  (settings as any)[setting.key] ? (isRTL ? 'start-0.5' : 'left-5') : (isRTL ? 'left-5' : 'start-0.5')
                }`} />
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.submitButton[lang]} (EN)
            </label>
            <input
              type="text"
              value={settings.submit_button_text_en}
              onChange={(e) => updateSetting('submit_button_text_en', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.submitButton[lang]} (AR)
            </label>
            <input
              type="text"
              value={settings.submit_button_text_ar}
              onChange={(e) => updateSetting('submit_button_text_ar', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.cancelButton[lang]} (EN)
            </label>
            <input
              type="text"
              value={settings.cancel_button_text_en}
              onChange={(e) => updateSetting('cancel_button_text_en', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.cancelButton[lang]} (AR)
            </label>
            <input
              type="text"
              value={settings.cancel_button_text_ar}
              onChange={(e) => updateSetting('cancel_button_text_ar', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              dir="rtl"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FileText className="w-7 h-7 text-green-600" />
                {t.title[lang]}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.subtitle[lang]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderFormList()}
      </div>

      {/* Editor Modal */}
      {showEditor && renderEditor()}

      {/* Message Toast */}
      {message && (
        <div className={`fixed bottom-4 end-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
