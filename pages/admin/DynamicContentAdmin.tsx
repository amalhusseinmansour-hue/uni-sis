import React, { useState, useEffect } from 'react';
import {
  Settings,
  Table,
  FileText,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Search,
  Filter,
  MoreVertical,
  Check,
  X,
  ChevronRight,
  Database,
  Layout,
  Columns,
  List,
  PieChart,
  Save,
  RefreshCw,
  Download,
  Upload,
  Code,
  Palette,
  Globe,
  Lock,
  Users,
  Layers,
} from 'lucide-react';

interface DynamicContentAdminProps {
  lang: 'en' | 'ar';
}

type TabType = 'tables' | 'forms' | 'reports' | 'charts';

interface DynamicItem {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const t = {
  title: { en: 'Dynamic Content Management', ar: 'إدارة المحتوى الديناميكي' },
  subtitle: { en: 'Manage tables, forms, reports and charts from the backend', ar: 'إدارة الجداول والنماذج والتقارير والرسوم البيانية من الباك اند' },
  tables: { en: 'Tables', ar: 'الجداول' },
  forms: { en: 'Forms', ar: 'النماذج' },
  reports: { en: 'Reports', ar: 'التقارير' },
  charts: { en: 'Charts', ar: 'الرسوم البيانية' },
  addNew: { en: 'Add New', ar: 'إضافة جديد' },
  search: { en: 'Search...', ar: 'بحث...' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  duplicate: { en: 'Duplicate', ar: 'نسخ' },
  preview: { en: 'Preview', ar: 'معاينة' },
  active: { en: 'Active', ar: 'نشط' },
  inactive: { en: 'Inactive', ar: 'غير نشط' },
  columns: { en: 'Columns', ar: 'الأعمدة' },
  fields: { en: 'Fields', ar: 'الحقول' },
  filters: { en: 'Filters', ar: 'الفلاتر' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  code: { en: 'Code', ar: 'الكود' },
  nameEn: { en: 'Name (English)', ar: 'الاسم (إنجليزي)' },
  nameAr: { en: 'Name (Arabic)', ar: 'الاسم (عربي)' },
  description: { en: 'Description', ar: 'الوصف' },
  dataSource: { en: 'Data Source', ar: 'مصدر البيانات' },
  model: { en: 'Model', ar: 'الموديل' },
  endpoint: { en: 'API Endpoint', ar: 'نقطة API' },
  permissions: { en: 'Permissions', ar: 'الصلاحيات' },
  noItems: { en: 'No items found', ar: 'لا توجد عناصر' },
  createFirst: { en: 'Create your first', ar: 'أنشئ أول' },
  lastUpdated: { en: 'Last updated', ar: 'آخر تحديث' },
  createdAt: { en: 'Created at', ar: 'تاريخ الإنشاء' },
  confirmDelete: { en: 'Are you sure you want to delete this item?', ar: 'هل أنت متأكد من حذف هذا العنصر؟' },
  exportConfig: { en: 'Export Config', ar: 'تصدير الإعدادات' },
  importConfig: { en: 'Import Config', ar: 'استيراد الإعدادات' },

  // Table specific
  tableSettings: { en: 'Table Settings', ar: 'إعدادات الجدول' },
  columnSettings: { en: 'Column Settings', ar: 'إعدادات الأعمدة' },
  filterSettings: { en: 'Filter Settings', ar: 'إعدادات الفلاتر' },
  pagination: { en: 'Pagination', ar: 'التصفح' },
  sorting: { en: 'Sorting', ar: 'الترتيب' },
  searchable: { en: 'Searchable', ar: 'قابل للبحث' },
  exportable: { en: 'Exportable', ar: 'قابل للتصدير' },

  // Form specific
  formSettings: { en: 'Form Settings', ar: 'إعدادات النموذج' },
  fieldSettings: { en: 'Field Settings', ar: 'إعدادات الحقول' },
  validation: { en: 'Validation', ar: 'التحقق' },
  sections: { en: 'Sections', ar: 'الأقسام' },

  // Report specific
  reportSettings: { en: 'Report Settings', ar: 'إعدادات التقرير' },
  parameters: { en: 'Parameters', ar: 'المعاملات' },
  scheduling: { en: 'Scheduling', ar: 'الجدولة' },

  // Quick stats
  totalTables: { en: 'Total Tables', ar: 'إجمالي الجداول' },
  totalForms: { en: 'Total Forms', ar: 'إجمالي النماذج' },
  totalReports: { en: 'Total Reports', ar: 'إجمالي التقارير' },
  totalCharts: { en: 'Total Charts', ar: 'إجمالي الرسوم' },
};

// Mock data - will be replaced with API calls
const mockTables: DynamicItem[] = [
  { id: 1, code: 'students_list', name_en: 'Students List', name_ar: 'قائمة الطلاب', is_active: true, created_at: '2024-01-15', updated_at: '2024-01-20' },
  { id: 2, code: 'courses_list', name_en: 'Courses List', name_ar: 'قائمة المقررات', is_active: true, created_at: '2024-01-15', updated_at: '2024-01-18' },
  { id: 3, code: 'admissions_list', name_en: 'Admissions', name_ar: 'طلبات القبول', is_active: true, created_at: '2024-01-10', updated_at: '2024-01-20' },
];

const mockForms: DynamicItem[] = [
  { id: 1, code: 'student_registration', name_en: 'Student Registration', name_ar: 'تسجيل طالب', is_active: true, created_at: '2024-01-15', updated_at: '2024-01-20' },
  { id: 2, code: 'course_add', name_en: 'Add Course', name_ar: 'إضافة مقرر', is_active: true, created_at: '2024-01-15', updated_at: '2024-01-18' },
];

const mockReports: DynamicItem[] = [
  { id: 1, code: 'enrollment_report', name_en: 'Enrollment Report', name_ar: 'تقرير التسجيل', is_active: true, created_at: '2024-01-15', updated_at: '2024-01-20' },
  { id: 2, code: 'financial_report', name_en: 'Financial Report', name_ar: 'التقرير المالي', is_active: true, created_at: '2024-01-15', updated_at: '2024-01-18' },
  { id: 3, code: 'gpa_distribution', name_en: 'GPA Distribution', name_ar: 'توزيع المعدلات', is_active: true, created_at: '2024-01-10', updated_at: '2024-01-20' },
];

const DynamicContentAdmin: React.FC<DynamicContentAdminProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<TabType>('tables');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<DynamicItem | null>(null);
  const [items, setItems] = useState<DynamicItem[]>([]);
  const [loading, setLoading] = useState(false);

  const isRTL = lang === 'ar';

  useEffect(() => {
    loadItems();
  }, [activeTab]);

  const loadItems = async () => {
    setLoading(true);
    // TODO: Replace with API calls
    setTimeout(() => {
      switch (activeTab) {
        case 'tables':
          setItems(mockTables);
          break;
        case 'forms':
          setItems(mockForms);
          break;
        case 'reports':
          setItems(mockReports);
          break;
        case 'charts':
          setItems([]);
          break;
      }
      setLoading(false);
    }, 300);
  };

  const filteredItems = items.filter(item =>
    item.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name_ar.includes(searchTerm) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { key: 'tables' as TabType, label: t.tables[lang], icon: Table, count: mockTables.length },
    { key: 'forms' as TabType, label: t.forms[lang], icon: FileText, count: mockForms.length },
    { key: 'reports' as TabType, label: t.reports[lang], icon: BarChart3, count: mockReports.length },
    { key: 'charts' as TabType, label: t.charts[lang], icon: PieChart, count: 0 },
  ];

  const handleEdit = (item: DynamicItem) => {
    setEditingItem(item);
    setShowEditor(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowEditor(true);
  };

  const handleDelete = async (item: DynamicItem) => {
    if (confirm(t.confirmDelete[lang])) {
      // TODO: API call to delete
      setItems(prev => prev.filter(i => i.id !== item.id));
    }
  };

  const handleDuplicate = async (item: DynamicItem) => {
    // TODO: API call to duplicate
    const newItem = {
      ...item,
      id: Date.now(),
      code: `${item.code}_copy`,
      name_en: `${item.name_en} (Copy)`,
      name_ar: `${item.name_ar} (نسخة)`,
    };
    setItems(prev => [...prev, newItem]);
  };

  const getTabIcon = () => {
    switch (activeTab) {
      case 'tables': return Table;
      case 'forms': return FileText;
      case 'reports': return BarChart3;
      case 'charts': return PieChart;
    }
  };

  const getTabLabel = () => {
    switch (activeTab) {
      case 'tables': return t.tables[lang];
      case 'forms': return t.forms[lang];
      case 'reports': return t.reports[lang];
      case 'charts': return t.charts[lang];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Settings className="w-7 h-7 text-blue-600" />
                {t.title[lang]}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t.subtitle[lang]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {t.importConfig[lang]}
              </button>
              <button className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Download className="w-4 h-4" />
                {t.exportConfig[lang]}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[
              { label: t.totalTables[lang], value: mockTables.length, icon: Table, color: 'blue' },
              { label: t.totalForms[lang], value: mockForms.length, icon: FileText, color: 'green' },
              { label: t.totalReports[lang], value: mockReports.length, icon: BarChart3, color: 'purple' },
              { label: t.totalCharts[lang], value: 0, icon: PieChart, color: 'orange' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                      <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.key
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.search[lang]}
                className="ps-10 pe-4 py-2 w-64 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t.addNew[lang]} {getTabLabel()}
          </button>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              {React.createElement(getTabIcon(), { className: 'w-8 h-8 text-gray-400' })}
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t.noItems[lang]}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t.createFirst[lang]} {getTabLabel()}
            </p>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t.addNew[lang]}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const TabIcon = getTabIcon();
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <TabIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {lang === 'ar' ? item.name_ar : item.name_en}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {item.code}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.is_active
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {item.is_active ? t.active[lang] : t.inactive[lang]}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    {t.lastUpdated[lang]}: {new Date(item.updated_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-slate-700">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      {t.edit[lang]}
                    </button>
                    <button
                      onClick={() => handleDuplicate(item)}
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
                      onClick={() => handleDelete(item)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      title={t.delete[lang]}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <ItemEditor
          lang={lang}
          type={activeTab}
          item={editingItem}
          onClose={() => {
            setShowEditor(false);
            setEditingItem(null);
          }}
          onSave={(item) => {
            if (editingItem) {
              setItems(prev => prev.map(i => i.id === item.id ? item : i));
            } else {
              setItems(prev => [...prev, { ...item, id: Date.now() }]);
            }
            setShowEditor(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

// Item Editor Component
interface ItemEditorProps {
  lang: 'en' | 'ar';
  type: TabType;
  item: DynamicItem | null;
  onClose: () => void;
  onSave: (item: DynamicItem) => void;
}

const ItemEditor: React.FC<ItemEditorProps> = ({ lang, type, item, onClose, onSave }) => {
  const [activeSection, setActiveSection] = useState('general');
  const [formData, setFormData] = useState<Partial<DynamicItem>>({
    code: item?.code || '',
    name_en: item?.name_en || '',
    name_ar: item?.name_ar || '',
    description: item?.description || '',
    is_active: item?.is_active ?? true,
  });

  const isRTL = lang === 'ar';

  const sections = type === 'tables'
    ? [
        { key: 'general', label: lang === 'ar' ? 'عام' : 'General', icon: Settings },
        { key: 'columns', label: t.columns[lang], icon: Columns },
        { key: 'filters', label: t.filters[lang], icon: Filter },
        { key: 'settings', label: t.settings[lang], icon: Layout },
      ]
    : type === 'forms'
    ? [
        { key: 'general', label: lang === 'ar' ? 'عام' : 'General', icon: Settings },
        { key: 'fields', label: t.fields[lang], icon: List },
        { key: 'sections', label: t.sections[lang], icon: Layers },
        { key: 'validation', label: t.validation[lang], icon: Check },
      ]
    : [
        { key: 'general', label: lang === 'ar' ? 'عام' : 'General', icon: Settings },
        { key: 'fields', label: t.fields[lang], icon: List },
        { key: 'parameters', label: t.parameters[lang], icon: Code },
        { key: 'charts', label: t.charts[lang], icon: PieChart },
      ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {item ? t.edit[lang] : t.addNew[lang]} {
              type === 'tables' ? t.tables[lang] :
              type === 'forms' ? t.forms[lang] :
              type === 'reports' ? t.reports[lang] : t.charts[lang]
            }
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-gray-200 dark:border-slate-700 p-4">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === section.key
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeSection === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.code[lang]} *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="e.g., students_list"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {lang === 'ar' ? 'معرف فريد للعنصر (بالإنجليزية فقط)' : 'Unique identifier (English only, no spaces)'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.dataSource[lang]}
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                      <option value="model">{t.model[lang]}</option>
                      <option value="endpoint">{t.endpoint[lang]}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.nameEn[lang]} *
                    </label>
                    <input
                      type="text"
                      value={formData.name_en}
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
                      value={formData.name_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.description[lang]}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.model[lang]}
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                    <option value="">-- Select Model --</option>
                    <option value="Student">Student</option>
                    <option value="Course">Course</option>
                    <option value="AdmissionApplication">AdmissionApplication</option>
                    <option value="User">User</option>
                    <option value="Department">Department</option>
                    <option value="Program">Program</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t.active[lang]}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {lang === 'ar' ? 'تفعيل أو تعطيل هذا العنصر' : 'Enable or disable this item'}
                    </p>
                  </div>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.is_active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      formData.is_active ? 'left-7' : 'start-1'
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'columns' && (
              <ColumnsEditor lang={lang} />
            )}

            {activeSection === 'filters' && (
              <FiltersEditor lang={lang} />
            )}

            {activeSection === 'fields' && (
              <FieldsEditor lang={lang} type={type} />
            )}

            {activeSection === 'settings' && (
              <SettingsEditor lang={lang} type={type} />
            )}

            {activeSection === 'sections' && (
              <SectionsEditor lang={lang} />
            )}

            {activeSection === 'validation' && (
              <ValidationEditor lang={lang} />
            )}

            {activeSection === 'parameters' && (
              <ParametersEditor lang={lang} />
            )}

            {activeSection === 'charts' && (
              <ChartsEditor lang={lang} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            {t.cancel[lang]}
          </button>
          <button
            onClick={() => onSave(formData as DynamicItem)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {t.save[lang]}
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-editors for different sections
const ColumnsEditor: React.FC<{ lang: 'en' | 'ar' }> = ({ lang }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-medium text-gray-900 dark:text-white">
        {lang === 'ar' ? 'أعمدة الجدول' : 'Table Columns'}
      </h3>
      <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1">
        <Plus className="w-4 h-4" />
        {lang === 'ar' ? 'إضافة عمود' : 'Add Column'}
      </button>
    </div>
    <div className="border border-gray-200 dark:border-slate-700 rounded-lg divide-y divide-gray-200 dark:divide-slate-700">
      {['ID', 'Name', 'Email', 'Status', 'Created At'].map((col, i) => (
        <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="cursor-move text-gray-400">
              <List className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{col}</p>
              <p className="text-xs text-gray-500">field: {col.toLowerCase().replace(' ', '_')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded">
              <Edit className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FiltersEditor: React.FC<{ lang: 'en' | 'ar' }> = ({ lang }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-medium text-gray-900 dark:text-white">
        {lang === 'ar' ? 'فلاتر الجدول' : 'Table Filters'}
      </h3>
      <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1">
        <Plus className="w-4 h-4" />
        {lang === 'ar' ? 'إضافة فلتر' : 'Add Filter'}
      </button>
    </div>
    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
      {lang === 'ar' ? 'لا توجد فلاتر. أضف فلتر جديد.' : 'No filters. Add a new filter.'}
    </div>
  </div>
);

const FieldsEditor: React.FC<{ lang: 'en' | 'ar'; type: TabType }> = ({ lang, type }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-medium text-gray-900 dark:text-white">
        {type === 'forms'
          ? (lang === 'ar' ? 'حقول النموذج' : 'Form Fields')
          : (lang === 'ar' ? 'حقول التقرير' : 'Report Fields')
        }
      </h3>
      <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1">
        <Plus className="w-4 h-4" />
        {lang === 'ar' ? 'إضافة حقل' : 'Add Field'}
      </button>
    </div>
    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
      {lang === 'ar' ? 'لا توجد حقول. أضف حقل جديد.' : 'No fields. Add a new field.'}
    </div>
  </div>
);

const SettingsEditor: React.FC<{ lang: 'en' | 'ar'; type: TabType }> = ({ lang }) => (
  <div className="space-y-6">
    <h3 className="font-medium text-gray-900 dark:text-white">
      {lang === 'ar' ? 'إعدادات الجدول' : 'Table Settings'}
    </h3>

    {[
      { key: 'pagination', label: lang === 'ar' ? 'تفعيل التصفح' : 'Enable Pagination', checked: true },
      { key: 'search', label: lang === 'ar' ? 'تفعيل البحث' : 'Enable Search', checked: true },
      { key: 'export', label: lang === 'ar' ? 'تفعيل التصدير' : 'Enable Export', checked: true },
      { key: 'sort', label: lang === 'ar' ? 'تفعيل الترتيب' : 'Enable Sorting', checked: true },
      { key: 'selection', label: lang === 'ar' ? 'تفعيل التحديد' : 'Enable Selection', checked: false },
      { key: 'rowNumbers', label: lang === 'ar' ? 'إظهار أرقام الصفوف' : 'Show Row Numbers', checked: false },
    ].map((setting) => (
      <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
        <span className="text-gray-700 dark:text-gray-300">{setting.label}</span>
        <button className={`relative w-12 h-6 rounded-full transition-colors ${
          setting.checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
        }`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            setting.checked ? 'left-7' : 'start-1'
          }`} />
        </button>
      </div>
    ))}
  </div>
);

const SectionsEditor: React.FC<{ lang: 'en' | 'ar' }> = ({ lang }) => (
  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
    {lang === 'ar' ? 'إدارة أقسام النموذج' : 'Manage form sections'}
  </div>
);

const ValidationEditor: React.FC<{ lang: 'en' | 'ar' }> = ({ lang }) => (
  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
    {lang === 'ar' ? 'إعدادات التحقق من الصحة' : 'Validation settings'}
  </div>
);

const ParametersEditor: React.FC<{ lang: 'en' | 'ar' }> = ({ lang }) => (
  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
    {lang === 'ar' ? 'معاملات التقرير' : 'Report parameters'}
  </div>
);

const ChartsEditor: React.FC<{ lang: 'en' | 'ar' }> = ({ lang }) => (
  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
    {lang === 'ar' ? 'إعدادات الرسوم البيانية' : 'Charts settings'}
  </div>
);

export default DynamicContentAdmin;
