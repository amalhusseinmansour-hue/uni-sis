import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  FileText,
  Users,
  GraduationCap,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Printer,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  FileSpreadsheet,
  FileType2,
  Settings,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { dynamicReportsApi, DynamicReport, ReportData, ChartData } from '../api/dynamicReports';

interface DynamicReportsPageProps {
  lang: 'en' | 'ar';
}

const t = {
  reports: { en: 'Reports & Analytics', ar: 'التقارير والتحليلات' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  noReports: { en: 'No reports available', ar: 'لا توجد تقارير متاحة' },
  refresh: { en: 'Refresh', ar: 'تحديث' },
  export: { en: 'Export', ar: 'تصدير' },
  print: { en: 'Print', ar: 'طباعة' },
  lastUpdated: { en: 'Last updated', ar: 'آخر تحديث' },
  selectPeriod: { en: 'Select Period', ar: 'اختر الفترة' },
  thisMonth: { en: 'This Month', ar: 'هذا الشهر' },
  lastMonth: { en: 'Last Month', ar: 'الشهر الماضي' },
  thisYear: { en: 'This Year', ar: 'هذا العام' },
  lastYear: { en: 'Last Year', ar: 'العام الماضي' },
  customRange: { en: 'Custom Range', ar: 'نطاق مخصص' },
  generateReport: { en: 'Generate Report', ar: 'إنشاء تقرير' },
  vsLastPeriod: { en: 'vs last period', ar: 'مقارنة بالفترة السابقة' },
  configureInAdmin: { en: 'Configure reports in Admin Panel', ar: 'إعداد التقارير من لوحة الإدارة' },
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];

const DynamicReportsPage: React.FC<DynamicReportsPageProps> = ({ lang }) => {
  const [reports, setReports] = useState<DynamicReport[]>([]);
  const [activeReport, setActiveReport] = useState<DynamicReport | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('thisYear');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [parameters, setParameters] = useState<Record<string, unknown>>({});

  const isRTL = lang === 'ar';

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (activeReport) {
      loadReportData(activeReport.code);
    }
  }, [activeReport, parameters]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await dynamicReportsApi.getAll({ is_active: true });
      setReports(data);
      if (data.length > 0) {
        setActiveReport(data[0]);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReportData = async (code: string) => {
    try {
      setLoadingData(true);
      const data = await dynamicReportsApi.generate(code, parameters);
      setReportData(data);
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!activeReport) return;
    try {
      const result = await dynamicReportsApi.export(activeReport.code, format, parameters);
      window.open(result.download_url, '_blank');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const periods = [
    { key: 'thisMonth', label: t.thisMonth[lang] },
    { key: 'lastMonth', label: t.lastMonth[lang] },
    { key: 'thisYear', label: t.thisYear[lang] },
    { key: 'lastYear', label: t.lastYear[lang] },
    { key: 'custom', label: t.customRange[lang] },
  ];

  const renderChart = (chart: ChartData) => {
    const chartData = chart.data || [];

    switch (chart.chart_type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={chart.data_source?.x_field || 'name'} stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Legend />
              {chart.data_source?.y_fields?.map((field: string, i: number) => (
                <Line
                  key={field}
                  type="monotone"
                  dataKey={field}
                  stroke={chart.options?.colors?.[i] || COLORS[i]}
                  strokeWidth={2}
                  dot={{ fill: chart.options?.colors?.[i] || COLORS[i] }}
                />
              )) || (
                <Line
                  type="monotone"
                  dataKey={chart.data_source?.y_field || 'value'}
                  stroke={chart.options?.colors?.[0] || COLORS[0]}
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout={chart.options?.horizontal ? 'vertical' : 'horizontal'}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              {chart.options?.horizontal ? (
                <>
                  <XAxis type="number" stroke="#94A3B8" fontSize={12} />
                  <YAxis dataKey={chart.data_source?.x_field || 'name'} type="category" stroke="#94A3B8" fontSize={12} width={80} />
                </>
              ) : (
                <>
                  <XAxis dataKey={chart.data_source?.x_field || 'name'} stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                </>
              )}
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              {chart.options?.showLegend && <Legend />}
              <Bar
                dataKey={chart.data_source?.y_field || 'value'}
                fill={chart.options?.colors?.[0] || COLORS[0]}
                radius={chart.options?.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={chart.data_source?.x_field || 'name'} stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              {chart.options?.showLegend && <Legend />}
              {chart.data_source?.y_fields?.map((field: string, i: number) => (
                <Area
                  key={field}
                  type="monotone"
                  dataKey={field}
                  stackId={chart.options?.stacked ? '1' : undefined}
                  stroke={chart.options?.colors?.[i] || COLORS[i]}
                  fill={chart.options?.colors?.[i] || COLORS[i]}
                  fillOpacity={0.6}
                />
              )) || (
                <Area
                  type="monotone"
                  dataKey={chart.data_source?.y_field || 'value'}
                  stroke={chart.options?.colors?.[0] || COLORS[0]}
                  fill={chart.options?.colors?.[0] || COLORS[0]}
                  fillOpacity={0.3}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={chart.chart_type === 'donut' || chart.options?.donut ? 60 : 0}
                outerRadius={100}
                paddingAngle={5}
                dataKey={chart.data_source?.value_field || 'value'}
                nameKey={chart.data_source?.label_field || 'name'}
              >
                {chartData.map((entry: unknown, index: number) => (
                  <Cell key={`cell-${index}`} fill={chart.options?.colors?.[index] || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              {chart.options?.showLegend && <Legend />}
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={chartData}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <Radar
                name={lang === 'ar' ? 'هذا الفصل' : 'This Period'}
                dataKey="A"
                stroke={chart.options?.colors?.[0] || COLORS[0]}
                fill={chart.options?.colors?.[0] || COLORS[0]}
                fillOpacity={0.3}
              />
              <Radar
                name={lang === 'ar' ? 'الفصل السابق' : 'Last Period'}
                dataKey="B"
                stroke={chart.options?.colors?.[1] || '#94A3B8'}
                fill={chart.options?.colors?.[1] || '#94A3B8'}
                fillOpacity={0.2}
              />
              {chart.options?.showLegend && <Legend />}
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-center py-8 text-gray-500">Unknown chart type: {chart.chart_type}</div>;
    }
  };

  const renderStatCard = (field: { field_key: string; label: string; value: unknown; format?: { color?: string } }) => {
    const colorClasses: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600',
    };

    const bgColor = colorClasses[field.format?.color || 'blue'] || colorClasses.blue;

    return (
      <Card key={field.field_key} className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-800">{String(field.value)}</p>
        <p className="text-xs text-slate-500 mt-1">{field.label}</p>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t.noReports[lang]}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {t.configureInAdmin[lang]}
        </p>
        <a
          href="/admin/dynamic-content"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          {lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t.reports[lang]}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {t.lastUpdated[lang]}: {new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Period Selector */}
          <div className="relative">
            <button
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm">{periods.find((p) => p.key === selectedPeriod)?.label}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showPeriodDropdown && (
              <div className="absolute top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                {periods.map((period) => (
                  <button
                    key={period.key}
                    onClick={() => {
                      setSelectedPeriod(period.key);
                      setShowPeriodDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-sm text-start hover:bg-slate-50 ${
                      selectedPeriod === period.key ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={() => activeReport && loadReportData(activeReport.code)}
            className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loadingData ? 'animate-spin' : ''}`} />
          </button>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">{t.export[lang]}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showExportMenu && (
              <div className={`absolute top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 ${isRTL ? 'start-0' : 'end-0'}`}>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-sm text-start hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileType2 className="w-4 h-4 text-red-500" />
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-2 text-sm text-start hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Export as Excel
                </button>
                <button className="w-full px-4 py-2 text-sm text-start hover:bg-slate-50 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-slate-600" />
                  {t.print[lang]}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1 overflow-x-auto">
          {reports.map((report) => (
            <button
              key={report.code}
              onClick={() => setActiveReport(report)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeReport?.code === report.code
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {lang === 'ar' ? report.name_ar : report.name_en}
            </button>
          ))}
        </nav>
      </div>

      {/* Report Content */}
      {loadingData ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Stat Cards */}
          {reportData.fields && reportData.fields.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {reportData.fields.map((field) => renderStatCard(field))}
            </div>
          )}

          {/* Charts */}
          {reportData.charts && reportData.charts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reportData.charts.map((chart) => (
                <Card
                  key={chart.chart_key}
                  className={chart.width === 'full' ? 'lg:col-span-2' : ''}
                >
                  <CardHeader>
                    <h3 className="text-lg font-bold text-slate-800">
                      {lang === 'ar' ? chart.title_ar : chart.title_en}
                    </h3>
                  </CardHeader>
                  <CardBody>{renderChart(chart)}</CardBody>
                </Card>
              ))}
            </div>
          )}

          {/* Data Table if available */}
          {reportData.data && reportData.data.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold text-slate-800">
                  {lang === 'ar' ? 'البيانات' : 'Data'}
                </h3>
              </CardHeader>
              <CardBody className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      {Object.keys(reportData.data[0] || {}).map((key) => (
                        <th
                          key={key}
                          className="px-4 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.data.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {Object.values(row).map((value, j) => (
                          <td key={j} className="px-4 py-3 text-sm text-slate-700">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          {lang === 'ar' ? 'لا توجد بيانات متاحة' : 'No data available'}
        </div>
      )}
    </div>
  );
};

export default DynamicReportsPage;
