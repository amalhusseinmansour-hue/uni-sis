import React, { useState, useEffect } from 'react';
import {
  Table,
  Plus,
  Edit,
  Trash2,
  Copy,
  Search,
  Save,
  X,
  ChevronRight,
  ChevronLeft,
  Settings,
  Columns,
  Filter,
  MoreVertical,
  GripVertical,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Check,
  AlertCircle,
  RefreshCw,
  Database,
  Link,
  Play,
} from 'lucide-react';
import * as tableBuilderApi from '../../api/admin/tableBuilder';
import type { DynamicTable, DynamicTableColumn, DynamicTableFilter } from '../../api/admin/tableBuilder';

interface TableBuilderProps {
  lang: 'en' | 'ar';
}

const t = {
  title: { en: 'Table Builder', ar: 'بناء الجداول' },
  subtitle: { en: 'Create and manage dynamic data tables', ar: 'إنشاء وإدارة جداول البيانات الديناميكية' },
  tables: { en: 'Tables', ar: 'الجداول' },
  addNew: { en: 'New Table', ar: 'جدول جديد' },
  search: { en: 'Search tables...', ar: 'البحث في الجداول...' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  duplicate: { en: 'Duplicate', ar: 'نسخ' },
  preview: { en: 'Preview', ar: 'معاينة' },
  active: { en: 'Active', ar: 'نشط' },
  inactive: { en: 'Inactive', ar: 'غير نشط' },
  general: { en: 'General', ar: 'عام' },
  columns: { en: 'Columns', ar: 'الأعمدة' },
  filters: { en: 'Filters', ar: 'الفلاتر' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  code: { en: 'Code', ar: 'الكود' },
  nameEn: { en: 'Name (English)', ar: 'الاسم (إنجليزي)' },
  nameAr: { en: 'Name (Arabic)', ar: 'الاسم (عربي)' },
  descriptionEn: { en: 'Description (English)', ar: 'الوصف (إنجليزي)' },
  descriptionAr: { en: 'Description (Arabic)', ar: 'الوصف (عربي)' },
  dataSource: { en: 'Data Source', ar: 'مصدر البيانات' },
  model: { en: 'Model', ar: 'الموديل' },
  apiEndpoint: { en: 'API Endpoint', ar: 'نقطة API' },
  noTables: { en: 'No tables found', ar: 'لا توجد جداول' },
  createFirst: { en: 'Create your first table', ar: 'أنشئ أول جدول' },
  confirmDelete: { en: 'Are you sure you want to delete this table?', ar: 'هل أنت متأكد من حذف هذا الجدول؟' },
  saving: { en: 'Saving...', ar: 'جاري الحفظ...' },
  saved: { en: 'Saved successfully', ar: 'تم الحفظ بنجاح' },
  error: { en: 'An error occurred', ar: 'حدث خطأ' },

  // Column settings
  field: { en: 'Field', ar: 'الحقل' },
  label: { en: 'Label', ar: 'العنوان' },
  type: { en: 'Type', ar: 'النوع' },
  sortable: { en: 'Sortable', ar: 'قابل للترتيب' },
  searchable: { en: 'Searchable', ar: 'قابل للبحث' },
  filterable: { en: 'Filterable', ar: 'قابل للفلترة' },
  visible: { en: 'Visible', ar: 'مرئي' },
  width: { en: 'Width', ar: 'العرض' },
  align: { en: 'Align', ar: 'المحاذاة' },
  addColumn: { en: 'Add Column', ar: 'إضافة عمود' },
  noColumns: { en: 'No columns defined', ar: 'لا توجد أعمدة' },

  // Filter settings
  operator: { en: 'Operator', ar: 'المشغل' },
  defaultValue: { en: 'Default Value', ar: 'القيمة الافتراضية' },
  required: { en: 'Required', ar: 'مطلوب' },
  addFilter: { en: 'Add Filter', ar: 'إضافة فلتر' },
  noFilters: { en: 'No filters defined', ar: 'لا توجد فلاتر' },

  // Table settings
  pagination: { en: 'Enable Pagination', ar: 'تفعيل التصفح' },
  perPage: { en: 'Rows per Page', ar: 'صفوف لكل صفحة' },
  enableSearch: { en: 'Enable Search', ar: 'تفعيل البحث' },
  enableSort: { en: 'Enable Sorting', ar: 'تفعيل الترتيب' },
  enableExport: { en: 'Enable Export', ar: 'تفعيل التصدير' },
  enableSelect: { en: 'Enable Selection', ar: 'تفعيل التحديد' },
  striped: { en: 'Striped Rows', ar: 'صفوف مخططة' },
  hoverable: { en: 'Hoverable Rows', ar: 'تمييز عند التمرير' },
  bordered: { en: 'Bordered', ar: 'حدود' },
  denseMode: { en: 'Dense Mode', ar: 'الوضع المضغوط' },
  cardView: { en: 'Card View (Mobile)', ar: 'عرض البطاقات (الموبايل)' },
  exportFormats: { en: 'Export Formats', ar: 'صيغ التصدير' },
  emptyMessage: { en: 'Empty Message', ar: 'رسالة فارغة' },

  // Types
  text: { en: 'Text', ar: 'نص' },
  number: { en: 'Number', ar: 'رقم' },
  date: { en: 'Date', ar: 'تاريخ' },
  datetime: { en: 'Date/Time', ar: 'تاريخ/وقت' },
  boolean: { en: 'Boolean', ar: 'منطقي' },
  badge: { en: 'Badge', ar: 'شارة' },
  image: { en: 'Image', ar: 'صورة' },
  link: { en: 'Link', ar: 'رابط' },
  actions: { en: 'Actions', ar: 'إجراءات' },
  custom: { en: 'Custom', ar: 'مخصص' },

  // Operators
  equals: { en: 'Equals', ar: 'يساوي' },
  notEquals: { en: 'Not Equals', ar: 'لا يساوي' },
  greaterThan: { en: 'Greater Than', ar: 'أكبر من' },
  lessThan: { en: 'Less Than', ar: 'أصغر من' },
  contains: { en: 'Contains', ar: 'يحتوي' },
  between: { en: 'Between', ar: 'بين' },

  // Alignment
  left: { en: 'Left', ar: 'يسار' },
  center: { en: 'Center', ar: 'وسط' },
  right: { en: 'Right', ar: 'يمين' },

  autoLoadFields: { en: 'Auto-load Fields', ar: 'تحميل الحقول تلقائياً' },
  loadingFields: { en: 'Loading fields...', ar: 'جاري تحميل الحقول...' },
};

const columnTypes = [
  { value: 'text', label: t.text },
  { value: 'number', label: t.number },
  { value: 'date', label: t.date },
  { value: 'datetime', label: t.datetime },
  { value: 'boolean', label: t.boolean },
  { value: 'badge', label: t.badge },
  { value: 'image', label: t.image },
  { value: 'link', label: t.link },
  { value: 'actions', label: t.actions },
  { value: 'custom', label: t.custom },
];

const filterTypes = [
  { value: 'text', label: t.text },
  { value: 'select', label: { en: 'Select', ar: 'قائمة' } },
  { value: 'multiselect', label: { en: 'Multi Select', ar: 'اختيار متعدد' } },
  { value: 'date', label: t.date },
  { value: 'daterange', label: { en: 'Date Range', ar: 'نطاق تاريخ' } },
  { value: 'number', label: t.number },
  { value: 'boolean', label: t.boolean },
];

const operators = [
  { value: 'eq', label: t.equals },
  { value: 'neq', label: t.notEquals },
  { value: 'gt', label: t.greaterThan },
  { value: 'lt', label: t.lessThan },
  { value: 'like', label: t.contains },
  { value: 'between', label: t.between },
];

const TableBuilder: React.FC<TableBuilderProps> = ({ lang }) => {
  const isRTL = lang === 'ar';

  // State
  const [tables, setTables] = useState<DynamicTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTable, setEditingTable] = useState<DynamicTable | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editor state
  const [activeTab, setActiveTab] = useState<'general' | 'columns' | 'filters' | 'settings'>('general');
  const [formData, setFormData] = useState<Partial<DynamicTable>>({});
  const [columns, setColumns] = useState<Partial<DynamicTableColumn>[]>([]);
  const [filters, setFilters] = useState<Partial<DynamicTableFilter>[]>([]);
  const [availableModels, setAvailableModels] = useState<Array<{ class: string; name: string }>>([]);
  const [loadingFields, setLoadingFields] = useState(false);

  // Load tables
  useEffect(() => {
    loadTables();
    loadModels();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const response = await tableBuilderApi.getTables();
      if (response.success) {
        setTables(response.data);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
      showMessage('error', t.error[lang]);
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async () => {
    try {
      const response = await tableBuilderApi.getAvailableModels();
      if (response.success) {
        setAvailableModels(response.data);
      }
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const loadModelFields = async (modelClass: string) => {
    if (!modelClass) return;

    try {
      setLoadingFields(true);
      const response = await tableBuilderApi.getModelFields(modelClass);
      if (response.success && response.data) {
        const newColumns = response.data.map((field: any, index: number) => ({
          ...tableBuilderApi.getDefaultColumn(index),
          field: field.field,
          label_en: field.field.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          label_ar: field.field,
          type: field.type,
        }));
        setColumns(newColumns);
      }
    } catch (error) {
      console.error('Error loading model fields:', error);
    } finally {
      setLoadingFields(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const filteredTables = tables.filter(table =>
    table.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.name_ar.includes(searchTerm) ||
    table.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingTable(null);
    setFormData({
      code: '',
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      model_class: '',
      api_endpoint: '',
      settings: tableBuilderApi.getDefaultTableSettings(),
      is_active: true,
    });
    setColumns([]);
    setFilters([]);
    setActiveTab('general');
    setShowEditor(true);
  };

  const handleEdit = async (table: DynamicTable) => {
    try {
      const response = await tableBuilderApi.getTable(table.code);
      if (response.success) {
        const fullTable = response.data;
        setEditingTable(fullTable);
        setFormData({
          code: fullTable.code,
          name_en: fullTable.name_en,
          name_ar: fullTable.name_ar,
          description_en: fullTable.description_en,
          description_ar: fullTable.description_ar,
          model_class: fullTable.model_class,
          api_endpoint: fullTable.api_endpoint,
          settings: fullTable.settings || tableBuilderApi.getDefaultTableSettings(),
          roles: fullTable.roles,
          is_active: fullTable.is_active,
        });
        setColumns(fullTable.columns || []);
        setFilters(fullTable.filters || []);
        setActiveTab('general');
        setShowEditor(true);
      }
    } catch (error) {
      console.error('Error loading table:', error);
      showMessage('error', t.error[lang]);
    }
  };

  const handleDelete = async (table: DynamicTable) => {
    if (!confirm(t.confirmDelete[lang])) return;

    try {
      await tableBuilderApi.deleteTable(table.code);
      setTables(prev => prev.filter(t => t.code !== table.code));
      showMessage('success', t.saved[lang]);
    } catch (error) {
      console.error('Error deleting table:', error);
      showMessage('error', t.error[lang]);
    }
  };

  const handleDuplicate = async (table: DynamicTable) => {
    try {
      const response = await tableBuilderApi.duplicateTable(table.code);
      if (response.success) {
        setTables(prev => [...prev, response.data]);
        showMessage('success', t.saved[lang]);
      }
    } catch (error) {
      console.error('Error duplicating table:', error);
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

      // Save table
      const tableResponse = await tableBuilderApi.saveTable(formData);
      if (!tableResponse.success) throw new Error('Failed to save table');

      // Save columns
      if (columns.length > 0) {
        await tableBuilderApi.saveColumns(formData.code!, columns);
      }

      // Save filters
      if (filters.length > 0) {
        await tableBuilderApi.saveFilters(formData.code!, filters);
      }

      showMessage('success', t.saved[lang]);
      setShowEditor(false);
      loadTables();
    } catch (error) {
      console.error('Error saving table:', error);
      showMessage('error', t.error[lang]);
    } finally {
      setSaving(false);
    }
  };

  // Column management
  const addColumn = () => {
    setColumns(prev => [...prev, tableBuilderApi.getDefaultColumn(prev.length)]);
  };

  const updateColumn = (index: number, updates: Partial<DynamicTableColumn>) => {
    setColumns(prev => prev.map((col, i) => i === index ? { ...col, ...updates } : col));
  };

  const removeColumn = (index: number) => {
    setColumns(prev => prev.filter((_, i) => i !== index));
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= columns.length) return;

    const newColumns = [...columns];
    [newColumns[index], newColumns[newIndex]] = [newColumns[newIndex], newColumns[index]];
    newColumns.forEach((col, i) => col.order = i);
    setColumns(newColumns);
  };

  // Filter management
  const addFilter = () => {
    setFilters(prev => [...prev, tableBuilderApi.getDefaultFilter(prev.length)]);
  };

  const updateFilter = (index: number, updates: Partial<DynamicTableFilter>) => {
    setFilters(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const renderTableList = () => (
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t.addNew[lang]}
        </button>
      </div>

      {/* Table List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <Table className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t.noTables[lang]}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t.createFirst[lang]}</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t.addNew[lang]}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t.tables[lang]}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t.columns[lang]}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t.filters[lang]}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t.dataSource[lang]}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {lang === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {lang === 'ar' ? 'إجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {filteredTables.map((table) => (
                <tr key={table.code} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Table className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {lang === 'ar' ? table.name_ar : table.name_en}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">{table.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-sm">
                      {table.columns_count || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-sm">
                      {table.filters_count || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {table.model_class ? (
                      <span className="inline-flex items-center gap-1 text-sm text-purple-600">
                        <Database className="w-4 h-4" />
                        {table.model_class.split('\\').pop()}
                      </span>
                    ) : table.api_endpoint ? (
                      <span className="inline-flex items-center gap-1 text-sm text-green-600">
                        <Link className="w-4 h-4" />
                        API
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      table.is_active
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {table.is_active ? t.active[lang] : t.inactive[lang]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(table)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg"
                        title={t.edit[lang]}
                      >
                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(table)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg"
                        title={t.duplicate[lang]}
                      >
                        <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg"
                        title={t.preview[lang]}
                      >
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(table)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title={t.delete[lang]}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <Table className="w-5 h-5 text-blue-600" />
            {editingTable ? t.edit[lang] : t.addNew[lang]} {t.tables[lang]}
          </h2>
          <button onClick={() => setShowEditor(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 px-6">
          {(['general', 'columns', 'filters', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              {tab === 'general' && <Settings className="w-4 h-4 inline me-2" />}
              {tab === 'columns' && <Columns className="w-4 h-4 inline me-2" />}
              {tab === 'filters' && <Filter className="w-4 h-4 inline me-2" />}
              {tab === 'settings' && <Settings className="w-4 h-4 inline me-2" />}
              {t[tab][lang]}
              {tab === 'columns' && <span className="ms-2 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs">{columns.length}</span>}
              {tab === 'filters' && <span className="ms-2 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs">{filters.length}</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'columns' && renderColumnsTab()}
          {activeTab === 'filters' && renderFiltersTab()}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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
            placeholder="e.g., students_list"
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono"
            disabled={!!editingTable}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.model[lang]}
          </label>
          <div className="flex gap-2">
            <select
              value={formData.model_class || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, model_class: e.target.value }))}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">-- Select Model --</option>
              {availableModels.map((model) => (
                <option key={model.class} value={model.class}>{model.name}</option>
              ))}
            </select>
            {formData.model_class && (
              <button
                onClick={() => loadModelFields(formData.model_class!)}
                disabled={loadingFields}
                className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg hover:bg-purple-200 disabled:opacity-50"
                title={t.autoLoadFields[lang]}
              >
                {loadingFields ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              </button>
            )}
          </div>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.apiEndpoint[lang]}
        </label>
        <input
          type="text"
          value={formData.api_endpoint || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, api_endpoint: e.target.value }))}
          placeholder="/api/v1/data"
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono"
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{t.active[lang]}</p>
          <p className="text-sm text-gray-500">{lang === 'ar' ? 'تفعيل أو تعطيل هذا الجدول' : 'Enable or disable this table'}</p>
        </div>
        <button
          onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            formData.is_active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
          }`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            formData.is_active ? (isRTL ? 'start-1' : 'left-7') : (isRTL ? 'left-7' : 'start-1')
          }`} />
        </button>
      </div>
    </div>
  );

  const renderColumnsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">{t.columns[lang]}</h3>
        <button
          onClick={addColumn}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {t.addColumn[lang]}
        </button>
      </div>

      {columns.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
          {t.noColumns[lang]}
        </div>
      ) : (
        <div className="space-y-2">
          {columns.map((column, index) => (
            <div key={index} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1 pt-2">
                  <button
                    onClick={() => moveColumn(index, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveColumn(index, 'down')}
                    disabled={index === columns.length - 1}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-6 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.field[lang]}</label>
                    <input
                      type="text"
                      value={column.field || ''}
                      onChange={(e) => updateColumn(index, { field: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.label[lang]} (EN)</label>
                    <input
                      type="text"
                      value={column.label_en || ''}
                      onChange={(e) => updateColumn(index, { label_en: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.label[lang]} (AR)</label>
                    <input
                      type="text"
                      value={column.label_ar || ''}
                      onChange={(e) => updateColumn(index, { label_ar: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.type[lang]}</label>
                    <select
                      value={column.type || 'text'}
                      onChange={(e) => updateColumn(index, { type: e.target.value as any })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    >
                      {columnTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label[lang]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.width[lang]}</label>
                    <input
                      type="text"
                      value={column.width || ''}
                      onChange={(e) => updateColumn(index, { width: e.target.value })}
                      placeholder="auto"
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.align[lang]}</label>
                    <select
                      value={column.align || 'left'}
                      onChange={(e) => updateColumn(index, { align: e.target.value as any })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    >
                      <option value="left">{t.left[lang]}</option>
                      <option value="center">{t.center[lang]}</option>
                      <option value="right">{t.right[lang]}</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={column.sortable ?? true}
                      onChange={(e) => updateColumn(index, { sortable: e.target.checked })}
                      className="rounded"
                    />
                    {t.sortable[lang]}
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={column.searchable ?? true}
                      onChange={(e) => updateColumn(index, { searchable: e.target.checked })}
                      className="rounded"
                    />
                    {t.searchable[lang]}
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={column.visible ?? true}
                      onChange={(e) => updateColumn(index, { visible: e.target.checked })}
                      className="rounded"
                    />
                    {t.visible[lang]}
                  </label>
                </div>

                <button
                  onClick={() => removeColumn(index)}
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

  const renderFiltersTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">{t.filters[lang]}</h3>
        <button
          onClick={addFilter}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {t.addFilter[lang]}
        </button>
      </div>

      {filters.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
          {t.noFilters[lang]}
        </div>
      ) : (
        <div className="space-y-2">
          {filters.map((filter, index) => (
            <div key={index} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />

                <div className="flex-1 grid grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.field[lang]}</label>
                    <input
                      type="text"
                      value={filter.field || ''}
                      onChange={(e) => updateFilter(index, { field: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.label[lang]} (EN)</label>
                    <input
                      type="text"
                      value={filter.label_en || ''}
                      onChange={(e) => updateFilter(index, { label_en: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.label[lang]} (AR)</label>
                    <input
                      type="text"
                      value={filter.label_ar || ''}
                      onChange={(e) => updateFilter(index, { label_ar: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.type[lang]}</label>
                    <select
                      value={filter.type || 'text'}
                      onChange={(e) => updateFilter(index, { type: e.target.value as any })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    >
                      {filterTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label[lang]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.operator[lang]}</label>
                    <select
                      value={filter.operator || 'like'}
                      onChange={(e) => updateFilter(index, { operator: e.target.value as any })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    >
                      {operators.map((op) => (
                        <option key={op.value} value={op.value}>{op.label[lang]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={filter.is_required ?? false}
                    onChange={(e) => updateFilter(index, { is_required: e.target.checked })}
                    className="rounded"
                  />
                  {t.required[lang]}
                </label>

                <button
                  onClick={() => removeFilter(index)}
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

  const renderSettingsTab = () => {
    const settings = formData.settings || tableBuilderApi.getDefaultTableSettings();

    const updateSetting = (key: string, value: any) => {
      setFormData(prev => ({
        ...prev,
        settings: { ...prev.settings, [key]: value } as any
      }));
    };

    return (
      <div className="space-y-6 max-w-3xl">
        <h3 className="font-medium text-gray-900 dark:text-white">{t.settings[lang]}</h3>

        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'pagination', label: t.pagination },
            { key: 'searchable', label: t.enableSearch },
            { key: 'sortable', label: t.enableSort },
            { key: 'exportable', label: t.enableExport },
            { key: 'selectable', label: t.enableSelect },
            { key: 'striped', label: t.striped },
            { key: 'hoverable', label: t.hoverable },
            { key: 'bordered', label: t.bordered },
            { key: 'dense_mode', label: t.denseMode },
            { key: 'card_view_enabled', label: t.cardView },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">{setting.label[lang]}</span>
              <button
                onClick={() => updateSetting(setting.key, !(settings as any)[setting.key])}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  (settings as any)[setting.key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
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
              {t.perPage[lang]}
            </label>
            <select
              value={settings.per_page}
              onChange={(e) => updateSetting('per_page', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.exportFormats[lang]}
            </label>
            <div className="flex gap-4">
              {['excel', 'pdf', 'csv'].map((format) => (
                <label key={format} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.export_formats?.includes(format)}
                    onChange={(e) => {
                      const formats = e.target.checked
                        ? [...(settings.export_formats || []), format]
                        : (settings.export_formats || []).filter((f: string) => f !== format);
                      updateSetting('export_formats', formats);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm uppercase">{format}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.emptyMessage[lang]} (EN)
            </label>
            <input
              type="text"
              value={settings.empty_message_en}
              onChange={(e) => updateSetting('empty_message_en', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.emptyMessage[lang]} (AR)
            </label>
            <input
              type="text"
              value={settings.empty_message_ar}
              onChange={(e) => updateSetting('empty_message_ar', e.target.value)}
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
                <Table className="w-7 h-7 text-blue-600" />
                {t.title[lang]}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.subtitle[lang]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderTableList()}
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

export default TableBuilder;
