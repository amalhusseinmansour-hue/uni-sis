import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Copy,
  Search,
  Save,
  X,
  Settings,
  List,
  Filter,
  PieChart,
  Calendar,
  GripVertical,
  Eye,
  ArrowUp,
  ArrowDown,
  Check,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Activity,
  Circle,
  Hexagon,
  Crosshair,
  Clock,
  Mail,
} from 'lucide-react';
import * as reportBuilderApi from '../../api/admin/reportBuilder';
import type { DynamicReport, DynamicReportField, DynamicReportParameter, DynamicReportChart, DynamicReportSchedule } from '../../api/admin/reportBuilder';

interface ReportBuilderProps {
  lang: 'en' | 'ar';
}

const t = {
  title: { en: 'Report Builder', ar: 'بناء التقارير' },
  subtitle: { en: 'Create and manage dynamic reports', ar: 'إنشاء وإدارة التقارير الديناميكية' },
  reports: { en: 'Reports', ar: 'التقارير' },
  addNew: { en: 'New Report', ar: 'تقرير جديد' },
  search: { en: 'Search reports...', ar: 'البحث في التقارير...' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  duplicate: { en: 'Duplicate', ar: 'نسخ' },
  preview: { en: 'Preview', ar: 'معاينة' },
  active: { en: 'Active', ar: 'نشط' },
  inactive: { en: 'Inactive', ar: 'غير نشط' },
  general: { en: 'General', ar: 'عام' },
  fields: { en: 'Fields', ar: 'الحقول' },
  parameters: { en: 'Parameters', ar: 'المعاملات' },
  charts: { en: 'Charts', ar: 'الرسوم البيانية' },
  schedules: { en: 'Schedules', ar: 'الجدولة' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  code: { en: 'Code', ar: 'الكود' },
  nameEn: { en: 'Name (English)', ar: 'الاسم (إنجليزي)' },
  nameAr: { en: 'Name (Arabic)', ar: 'الاسم (عربي)' },
  descriptionEn: { en: 'Description (English)', ar: 'الوصف (إنجليزي)' },
  descriptionAr: { en: 'Description (Arabic)', ar: 'الوصف (عربي)' },
  noReports: { en: 'No reports found', ar: 'لا توجد تقارير' },
  createFirst: { en: 'Create your first report', ar: 'أنشئ أول تقرير' },
  confirmDelete: { en: 'Are you sure you want to delete this report?', ar: 'هل أنت متأكد من حذف هذا التقرير؟' },
  saving: { en: 'Saving...', ar: 'جاري الحفظ...' },
  saved: { en: 'Saved successfully', ar: 'تم الحفظ بنجاح' },
  error: { en: 'An error occurred', ar: 'حدث خطأ' },

  // Field settings
  field: { en: 'Field', ar: 'الحقل' },
  label: { en: 'Label', ar: 'العنوان' },
  type: { en: 'Type', ar: 'النوع' },
  aggregate: { en: 'Aggregate', ar: 'تجميع' },
  format: { en: 'Format', ar: 'التنسيق' },
  sortable: { en: 'Sortable', ar: 'قابل للترتيب' },
  groupable: { en: 'Groupable', ar: 'قابل للتجميع' },
  visible: { en: 'Visible', ar: 'مرئي' },
  width: { en: 'Width', ar: 'العرض' },
  align: { en: 'Align', ar: 'المحاذاة' },
  addField: { en: 'Add Field', ar: 'إضافة حقل' },
  noFields: { en: 'No fields defined', ar: 'لا توجد حقول' },

  // Parameter settings
  paramName: { en: 'Parameter Name', ar: 'اسم المعامل' },
  defaultValue: { en: 'Default Value', ar: 'القيمة الافتراضية' },
  required: { en: 'Required', ar: 'مطلوب' },
  addParameter: { en: 'Add Parameter', ar: 'إضافة معامل' },
  noParameters: { en: 'No parameters defined', ar: 'لا توجد معاملات' },

  // Chart settings
  chartTitle: { en: 'Chart Title', ar: 'عنوان الرسم' },
  chartType: { en: 'Chart Type', ar: 'نوع الرسم' },
  xField: { en: 'X Axis Field', ar: 'حقل المحور X' },
  yFields: { en: 'Y Axis Fields', ar: 'حقول المحور Y' },
  chartSize: { en: 'Size', ar: 'الحجم' },
  addChart: { en: 'Add Chart', ar: 'إضافة رسم بياني' },
  noCharts: { en: 'No charts defined', ar: 'لا توجد رسوم بيانية' },

  // Schedule settings
  scheduleName: { en: 'Schedule Name', ar: 'اسم الجدولة' },
  cronExpression: { en: 'Cron Expression', ar: 'تعبير Cron' },
  timezone: { en: 'Timezone', ar: 'المنطقة الزمنية' },
  exportFormat: { en: 'Export Format', ar: 'صيغة التصدير' },
  recipients: { en: 'Recipients', ar: 'المستلمون' },
  addSchedule: { en: 'Add Schedule', ar: 'إضافة جدولة' },
  noSchedules: { en: 'No schedules defined', ar: 'لا توجد جداول' },

  // Report settings
  category: { en: 'Category', ar: 'الفئة' },
  reportType: { en: 'Report Type', ar: 'نوع التقرير' },
  dataSource: { en: 'Data Source', ar: 'مصدر البيانات' },
  showFilters: { en: 'Show Filters', ar: 'إظهار الفلاتر' },
  showSummary: { en: 'Show Summary', ar: 'إظهار الملخص' },
  showCharts: { en: 'Show Charts', ar: 'إظهار الرسوم' },
  exportable: { en: 'Exportable', ar: 'قابل للتصدير' },
  printable: { en: 'Printable', ar: 'قابل للطباعة' },
  autoRefresh: { en: 'Auto Refresh', ar: 'تحديث تلقائي' },
  groupingEnabled: { en: 'Enable Grouping', ar: 'تفعيل التجميع' },
  subTotals: { en: 'Sub Totals', ar: 'المجاميع الفرعية' },
  grandTotal: { en: 'Grand Total', ar: 'المجموع الكلي' },
  pagination: { en: 'Pagination', ar: 'التصفح' },
  perPage: { en: 'Per Page', ar: 'لكل صفحة' },
  dateRangeDefault: { en: 'Default Date Range', ar: 'النطاق الزمني الافتراضي' },
  exportFormats: { en: 'Export Formats', ar: 'صيغ التصدير' },

  // Types
  text: { en: 'Text', ar: 'نص' },
  number: { en: 'Number', ar: 'رقم' },
  currency: { en: 'Currency', ar: 'عملة' },
  percentage: { en: 'Percentage', ar: 'نسبة' },
  date: { en: 'Date', ar: 'تاريخ' },
  datetime: { en: 'Date/Time', ar: 'تاريخ/وقت' },
  boolean: { en: 'Boolean', ar: 'منطقي' },
  badge: { en: 'Badge', ar: 'شارة' },
  custom: { en: 'Custom', ar: 'مخصص' },

  // Aggregates
  none: { en: 'None', ar: 'بدون' },
  sum: { en: 'Sum', ar: 'مجموع' },
  avg: { en: 'Average', ar: 'متوسط' },
  count: { en: 'Count', ar: 'عدد' },
  min: { en: 'Min', ar: 'أدنى' },
  max: { en: 'Max', ar: 'أقصى' },

  // Chart types
  bar: { en: 'Bar Chart', ar: 'رسم شريطي' },
  line: { en: 'Line Chart', ar: 'رسم خطي' },
  area: { en: 'Area Chart', ar: 'رسم مساحي' },
  pie: { en: 'Pie Chart', ar: 'رسم دائري' },
  donut: { en: 'Donut Chart', ar: 'رسم حلقي' },
  radar: { en: 'Radar Chart', ar: 'رسم راداري' },
  scatter: { en: 'Scatter Plot', ar: 'رسم نقطي' },

  // Report types
  table: { en: 'Table', ar: 'جدول' },
  summary: { en: 'Summary', ar: 'ملخص' },
  chart: { en: 'Chart Only', ar: 'رسوم فقط' },
  mixed: { en: 'Mixed', ar: 'مختلط' },

  // Date ranges
  today: { en: 'Today', ar: 'اليوم' },
  week: { en: 'This Week', ar: 'هذا الأسبوع' },
  month: { en: 'This Month', ar: 'هذا الشهر' },
  quarter: { en: 'This Quarter', ar: 'هذا الربع' },
  year: { en: 'This Year', ar: 'هذا العام' },

  // Sizes
  small: { en: 'Small', ar: 'صغير' },
  medium: { en: 'Medium', ar: 'متوسط' },
  large: { en: 'Large', ar: 'كبير' },
  full: { en: 'Full Width', ar: 'عرض كامل' },

  // Alignment
  left: { en: 'Left', ar: 'يسار' },
  center: { en: 'Center', ar: 'وسط' },
  right: { en: 'Right', ar: 'يمين' },
};

const chartTypeIcons: Record<string, React.ComponentType<any>> = {
  bar: BarChart3,
  line: TrendingUp,
  area: Activity,
  pie: PieChart,
  donut: Circle,
  radar: Hexagon,
  scatter: Crosshair,
};

const ReportBuilder: React.FC<ReportBuilderProps> = ({ lang }) => {
  const isRTL = lang === 'ar';

  // State
  const [reports, setReports] = useState<DynamicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingReport, setEditingReport] = useState<DynamicReport | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editor state
  const [activeTab, setActiveTab] = useState<'general' | 'fields' | 'parameters' | 'charts' | 'schedules' | 'settings'>('general');
  const [formData, setFormData] = useState<Partial<DynamicReport>>({});
  const [fields, setFields] = useState<Partial<DynamicReportField>[]>([]);
  const [parameters, setParameters] = useState<Partial<DynamicReportParameter>[]>([]);
  const [charts, setCharts] = useState<Partial<DynamicReportChart>[]>([]);
  const [schedules, setSchedules] = useState<Partial<DynamicReportSchedule>[]>([]);

  // Load reports
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await reportBuilderApi.getReports();
      if (response.success) {
        setReports(response.data);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      showMessage('error', t.error[lang]);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const filteredReports = reports.filter(report =>
    report.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.name_ar.includes(searchTerm) ||
    report.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingReport(null);
    setFormData({
      code: '',
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      category: '',
      report_type: 'table',
      data_source: { type: 'model', value: '' },
      settings: reportBuilderApi.getDefaultReportSettings(),
      is_active: true,
    });
    setFields([]);
    setParameters([]);
    setCharts([]);
    setSchedules([]);
    setActiveTab('general');
    setShowEditor(true);
  };

  const handleEdit = async (report: DynamicReport) => {
    try {
      const response = await reportBuilderApi.getReport(report.code);
      if (response.success) {
        const fullReport = response.data;
        setEditingReport(fullReport);
        setFormData({
          code: fullReport.code,
          name_en: fullReport.name_en,
          name_ar: fullReport.name_ar,
          description_en: fullReport.description_en,
          description_ar: fullReport.description_ar,
          category: fullReport.category,
          report_type: fullReport.report_type,
          data_source: fullReport.data_source,
          settings: fullReport.settings || reportBuilderApi.getDefaultReportSettings(),
          roles: fullReport.roles,
          is_active: fullReport.is_active,
        });
        setFields(fullReport.fields || []);
        setParameters(fullReport.parameters || []);
        setCharts(fullReport.charts || []);
        setSchedules(fullReport.schedules || []);
        setActiveTab('general');
        setShowEditor(true);
      }
    } catch (error) {
      console.error('Error loading report:', error);
      showMessage('error', t.error[lang]);
    }
  };

  const handleDelete = async (report: DynamicReport) => {
    if (!confirm(t.confirmDelete[lang])) return;

    try {
      await reportBuilderApi.deleteReport(report.code);
      setReports(prev => prev.filter(r => r.code !== report.code));
      showMessage('success', t.saved[lang]);
    } catch (error) {
      console.error('Error deleting report:', error);
      showMessage('error', t.error[lang]);
    }
  };

  const handleDuplicate = async (report: DynamicReport) => {
    try {
      const response = await reportBuilderApi.duplicateReport(report.code);
      if (response.success) {
        setReports(prev => [...prev, response.data]);
        showMessage('success', t.saved[lang]);
      }
    } catch (error) {
      console.error('Error duplicating report:', error);
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

      // Save report
      const reportResponse = await reportBuilderApi.saveReport(formData);
      if (!reportResponse.success) throw new Error('Failed to save report');

      // Save fields
      if (fields.length > 0) {
        await reportBuilderApi.saveFields(formData.code!, fields);
      }

      // Save parameters
      if (parameters.length > 0) {
        await reportBuilderApi.saveParameters(formData.code!, parameters);
      }

      // Save charts
      if (charts.length > 0) {
        await reportBuilderApi.saveCharts(formData.code!, charts);
      }

      showMessage('success', t.saved[lang]);
      setShowEditor(false);
      loadReports();
    } catch (error) {
      console.error('Error saving report:', error);
      showMessage('error', t.error[lang]);
    } finally {
      setSaving(false);
    }
  };

  // Field management
  const addField = () => {
    setFields(prev => [...prev, reportBuilderApi.getDefaultField(prev.length)]);
  };

  const updateField = (index: number, updates: Partial<DynamicReportField>) => {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const removeField = (index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  // Parameter management
  const addParameter = () => {
    setParameters(prev => [...prev, reportBuilderApi.getDefaultParameter(prev.length)]);
  };

  const updateParameter = (index: number, updates: Partial<DynamicReportParameter>) => {
    setParameters(prev => prev.map((p, i) => i === index ? { ...p, ...updates } : p));
  };

  const removeParameter = (index: number) => {
    setParameters(prev => prev.filter((_, i) => i !== index));
  };

  // Chart management
  const addChart = () => {
    setCharts(prev => [...prev, reportBuilderApi.getDefaultChart(prev.length)]);
  };

  const updateChart = (index: number, updates: Partial<DynamicReportChart>) => {
    setCharts(prev => prev.map((c, i) => i === index ? { ...c, ...updates } : c));
  };

  const removeChart = (index: number) => {
    setCharts(prev => prev.filter((_, i) => i !== index));
  };

  const renderReportList = () => (
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
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t.addNew[lang]}
        </button>
      </div>

      {/* Report List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t.noReports[lang]}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t.createFirst[lang]}</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t.addNew[lang]}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.code}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {lang === 'ar' ? report.name_ar : report.name_en}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">{report.code}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  report.is_active
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {report.is_active ? t.active[lang] : t.inactive[lang]}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <List className="w-4 h-4" />
                  {report.fields_count || 0} {t.fields[lang]}
                </span>
                <span className="flex items-center gap-1">
                  <PieChart className="w-4 h-4" />
                  {report.charts_count || 0} {t.charts[lang]}
                </span>
                {report.category && (
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded text-xs">
                    {report.category}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-slate-700">
                <button
                  onClick={() => handleEdit(report)}
                  className="flex-1 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  {t.edit[lang]}
                </button>
                <button
                  onClick={() => handleDuplicate(report)}
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
                  onClick={() => handleDelete(report)}
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
            <BarChart3 className="w-5 h-5 text-purple-600" />
            {editingReport ? t.edit[lang] : t.addNew[lang]} {t.reports[lang]}
          </h2>
          <button onClick={() => setShowEditor(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 px-6 overflow-x-auto">
          {(['general', 'fields', 'parameters', 'charts', 'schedules', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              {tab === 'general' && <Settings className="w-4 h-4 inline me-2" />}
              {tab === 'fields' && <List className="w-4 h-4 inline me-2" />}
              {tab === 'parameters' && <Filter className="w-4 h-4 inline me-2" />}
              {tab === 'charts' && <PieChart className="w-4 h-4 inline me-2" />}
              {tab === 'schedules' && <Calendar className="w-4 h-4 inline me-2" />}
              {tab === 'settings' && <Settings className="w-4 h-4 inline me-2" />}
              {t[tab][lang]}
              {tab === 'fields' && <span className="ms-2 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs">{fields.length}</span>}
              {tab === 'parameters' && <span className="ms-2 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs">{parameters.length}</span>}
              {tab === 'charts' && <span className="ms-2 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs">{charts.length}</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'fields' && renderFieldsTab()}
          {activeTab === 'parameters' && renderParametersTab()}
          {activeTab === 'charts' && renderChartsTab()}
          {activeTab === 'schedules' && renderSchedulesTab()}
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
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
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
            placeholder="e.g., enrollment_report"
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono"
            disabled={!!editingReport}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.category[lang]}
          </label>
          <input
            type="text"
            value={formData.category || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="e.g., Academic"
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
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
            {t.reportType[lang]}
          </label>
          <select
            value={formData.report_type || 'table'}
            onChange={(e) => setFormData(prev => ({ ...prev, report_type: e.target.value as any }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          >
            <option value="table">{t.table[lang]}</option>
            <option value="summary">{t.summary[lang]}</option>
            <option value="chart">{t.chart[lang]}</option>
            <option value="mixed">{t.mixed[lang]}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.dataSource[lang]}
          </label>
          <input
            type="text"
            value={formData.data_source?.value || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, data_source: { type: 'model', value: e.target.value } }))}
            placeholder="e.g., App\\Models\\Student"
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono"
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

      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{t.active[lang]}</p>
          <p className="text-sm text-gray-500">{lang === 'ar' ? 'تفعيل أو تعطيل هذا التقرير' : 'Enable or disable this report'}</p>
        </div>
        <button
          onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            formData.is_active ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-600'
          }`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            formData.is_active ? (isRTL ? 'start-1' : 'left-7') : (isRTL ? 'left-7' : 'start-1')
          }`} />
        </button>
      </div>
    </div>
  );

  const renderFieldsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">{t.fields[lang]}</h3>
        <button
          onClick={addField}
          className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {t.addField[lang]}
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
          {t.noFields[lang]}
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={index} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />

                <div className="flex-1 grid grid-cols-6 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.field[lang]}</label>
                    <input
                      type="text"
                      value={field.field || ''}
                      onChange={(e) => updateField(index, { field: e.target.value })}
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
                      <option value="text">{t.text[lang]}</option>
                      <option value="number">{t.number[lang]}</option>
                      <option value="currency">{t.currency[lang]}</option>
                      <option value="percentage">{t.percentage[lang]}</option>
                      <option value="date">{t.date[lang]}</option>
                      <option value="boolean">{t.boolean[lang]}</option>
                      <option value="badge">{t.badge[lang]}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.aggregate[lang]}</label>
                    <select
                      value={field.aggregate || ''}
                      onChange={(e) => updateField(index, { aggregate: e.target.value as any || null })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    >
                      <option value="">{t.none[lang]}</option>
                      <option value="sum">{t.sum[lang]}</option>
                      <option value="avg">{t.avg[lang]}</option>
                      <option value="count">{t.count[lang]}</option>
                      <option value="min">{t.min[lang]}</option>
                      <option value="max">{t.max[lang]}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.align[lang]}</label>
                    <select
                      value={field.align || 'left'}
                      onChange={(e) => updateField(index, { align: e.target.value as any })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    >
                      <option value="left">{t.left[lang]}</option>
                      <option value="center">{t.center[lang]}</option>
                      <option value="right">{t.right[lang]}</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={field.sortable ?? true}
                      onChange={(e) => updateField(index, { sortable: e.target.checked })}
                      className="rounded"
                    />
                    {t.sortable[lang]}
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={field.groupable ?? false}
                      onChange={(e) => updateField(index, { groupable: e.target.checked })}
                      className="rounded"
                    />
                    {t.groupable[lang]}
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
          ))}
        </div>
      )}
    </div>
  );

  const renderParametersTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">{t.parameters[lang]}</h3>
        <button
          onClick={addParameter}
          className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {t.addParameter[lang]}
        </button>
      </div>

      {parameters.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
          {t.noParameters[lang]}
        </div>
      ) : (
        <div className="space-y-2">
          {parameters.map((param, index) => (
            <div key={index} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />

                <div className="flex-1 grid grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.paramName[lang]}</label>
                    <input
                      type="text"
                      value={param.name || ''}
                      onChange={(e) => updateParameter(index, { name: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.label[lang]} (EN)</label>
                    <input
                      type="text"
                      value={param.label_en || ''}
                      onChange={(e) => updateParameter(index, { label_en: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.label[lang]} (AR)</label>
                    <input
                      type="text"
                      value={param.label_ar || ''}
                      onChange={(e) => updateParameter(index, { label_ar: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.type[lang]}</label>
                    <select
                      value={param.type || 'text'}
                      onChange={(e) => updateParameter(index, { type: e.target.value as any })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    >
                      <option value="text">{t.text[lang]}</option>
                      <option value="number">{t.number[lang]}</option>
                      <option value="select">{lang === 'ar' ? 'قائمة' : 'Select'}</option>
                      <option value="multiselect">{lang === 'ar' ? 'اختيار متعدد' : 'Multi Select'}</option>
                      <option value="date">{t.date[lang]}</option>
                      <option value="daterange">{lang === 'ar' ? 'نطاق تاريخ' : 'Date Range'}</option>
                      <option value="boolean">{t.boolean[lang]}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.defaultValue[lang]}</label>
                    <input
                      type="text"
                      value={param.default_value || ''}
                      onChange={(e) => updateParameter(index, { default_value: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={param.is_required ?? false}
                    onChange={(e) => updateParameter(index, { is_required: e.target.checked })}
                    className="rounded"
                  />
                  {t.required[lang]}
                </label>

                <button
                  onClick={() => removeParameter(index)}
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

  const renderChartsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">{t.charts[lang]}</h3>
        <button
          onClick={addChart}
          className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {t.addChart[lang]}
        </button>
      </div>

      {charts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
          {t.noCharts[lang]}
        </div>
      ) : (
        <div className="space-y-4">
          {charts.map((chart, index) => {
            const Icon = chartTypeIcons[chart.type || 'bar'] || BarChart3;
            return (
              <div key={index} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Icon className="w-6 h-6 text-purple-600" />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.code[lang]}</label>
                        <input
                          type="text"
                          value={chart.code || ''}
                          onChange={(e) => updateChart(index, { code: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.chartTitle[lang]} (EN)</label>
                        <input
                          type="text"
                          value={chart.title_en || ''}
                          onChange={(e) => updateChart(index, { title_en: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.chartTitle[lang]} (AR)</label>
                        <input
                          type="text"
                          value={chart.title_ar || ''}
                          onChange={(e) => updateChart(index, { title_ar: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.chartType[lang]}</label>
                        <select
                          value={chart.type || 'bar'}
                          onChange={(e) => updateChart(index, { type: e.target.value as any })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                        >
                          {reportBuilderApi.chartTypeDefinitions.map((ct) => (
                            <option key={ct.type} value={ct.type}>{(t as any)[ct.type]?.[lang] || ct.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.xField[lang]}</label>
                        <input
                          type="text"
                          value={chart.data_config?.x_field || ''}
                          onChange={(e) => updateChart(index, { data_config: { ...chart.data_config, x_field: e.target.value, y_fields: chart.data_config?.y_fields || [] } })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.yFields[lang]}</label>
                        <input
                          type="text"
                          value={chart.data_config?.y_fields?.join(', ') || ''}
                          onChange={(e) => updateChart(index, { data_config: { ...chart.data_config, x_field: chart.data_config?.x_field || '', y_fields: e.target.value.split(',').map(s => s.trim()) } })}
                          placeholder="field1, field2"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.chartSize[lang]}</label>
                        <select
                          value={chart.size || 'medium'}
                          onChange={(e) => updateChart(index, { size: e.target.value as any })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                        >
                          <option value="small">{t.small[lang]}</option>
                          <option value="medium">{t.medium[lang]}</option>
                          <option value="large">{t.large[lang]}</option>
                          <option value="full">{t.full[lang]}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeChart(index)}
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
    </div>
  );

  const renderSchedulesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">{t.schedules[lang]}</h3>
        <button
          onClick={() => setSchedules(prev => [...prev, { name: '', cron_expression: '0 8 * * 1', timezone: 'UTC', export_format: 'pdf', recipients: [], is_active: true }])}
          className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {t.addSchedule[lang]}
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
          {t.noSchedules[lang]}
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule, index) => (
            <div key={index} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>

                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.scheduleName[lang]}</label>
                    <input
                      type="text"
                      value={schedule.name || ''}
                      onChange={(e) => {
                        const newSchedules = [...schedules];
                        newSchedules[index] = { ...schedule, name: e.target.value };
                        setSchedules(newSchedules);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.cronExpression[lang]}</label>
                    <input
                      type="text"
                      value={schedule.cron_expression || ''}
                      onChange={(e) => {
                        const newSchedules = [...schedules];
                        newSchedules[index] = { ...schedule, cron_expression: e.target.value };
                        setSchedules(newSchedules);
                      }}
                      placeholder="0 8 * * 1"
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.exportFormat[lang]}</label>
                    <select
                      value={schedule.export_format || 'pdf'}
                      onChange={(e) => {
                        const newSchedules = [...schedules];
                        newSchedules[index] = { ...schedule, export_format: e.target.value as any };
                        setSchedules(newSchedules);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.recipients[lang]}</label>
                    <input
                      type="text"
                      value={schedule.recipients?.join(', ') || ''}
                      onChange={(e) => {
                        const newSchedules = [...schedules];
                        newSchedules[index] = { ...schedule, recipients: e.target.value.split(',').map(s => s.trim()) };
                        setSchedules(newSchedules);
                      }}
                      placeholder="email1@example.com, email2@example.com"
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setSchedules(prev => prev.filter((_, i) => i !== index))}
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
    const settings = formData.settings || reportBuilderApi.getDefaultReportSettings();

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
            { key: 'show_filters', label: t.showFilters },
            { key: 'show_summary', label: t.showSummary },
            { key: 'show_charts', label: t.showCharts },
            { key: 'exportable', label: t.exportable },
            { key: 'printable', label: t.printable },
            { key: 'auto_refresh', label: t.autoRefresh },
            { key: 'grouping_enabled', label: t.groupingEnabled },
            { key: 'sub_totals', label: t.subTotals },
            { key: 'grand_total', label: t.grandTotal },
            { key: 'pagination', label: t.pagination },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">{setting.label[lang]}</span>
              <button
                onClick={() => updateSetting(setting.key, !(settings as any)[setting.key])}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  (settings as any)[setting.key] ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-600'
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
              {t.dateRangeDefault[lang]}
            </label>
            <select
              value={settings.date_range_default}
              onChange={(e) => updateSetting('date_range_default', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            >
              <option value="today">{t.today[lang]}</option>
              <option value="week">{t.week[lang]}</option>
              <option value="month">{t.month[lang]}</option>
              <option value="quarter">{t.quarter[lang]}</option>
              <option value="year">{t.year[lang]}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.exportFormats[lang]}
          </label>
          <div className="flex gap-4">
            {['pdf', 'excel', 'csv'].map((format) => (
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
                <BarChart3 className="w-7 h-7 text-purple-600" />
                {t.title[lang]}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.subtitle[lang]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderReportList()}
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

export default ReportBuilder;
