import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  DynamicReport as DynamicReportType,
  DynamicReportParameter,
  ReportGenerationResult,
  ChartData,
  dynamicReportsApi,
} from '../../api/dynamicReports';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DynamicReportProps {
  code: string;
  autoGenerate?: boolean;
  initialParams?: Record<string, unknown>;
  className?: string;
}

export const DynamicReport: React.FC<DynamicReportProps> = ({
  code,
  autoGenerate = false,
  initialParams = {},
  className = '',
}) => {
  const { lang } = useLanguage();
  const [report, setReport] = useState<DynamicReportType | null>(null);
  const [params, setParams] = useState<Record<string, unknown>>(initialParams);
  const [result, setResult] = useState<ReportGenerationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReport();
  }, [code]);

  useEffect(() => {
    if (report && autoGenerate) {
      handleGenerate();
    }
  }, [report, autoGenerate]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const reportConfig = await dynamicReportsApi.getByCode(code);
      setReport(reportConfig);

      // Set default values
      const defaults: Record<string, unknown> = {};
      reportConfig.parameters.forEach(param => {
        if (param.default_value !== undefined && !initialParams[param.param_key]) {
          defaults[param.param_key] = param.default_value;
        }
      });
      setParams(prev => ({ ...defaults, ...prev }));
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParamChange = (key: string, value: unknown) => {
    setParams(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setErrors({});
    try {
      const data = await dynamicReportsApi.generate(code, params);
      setResult(data);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (apiError.response?.data?.errors) {
        setErrors(apiError.response.data.errors);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setExporting(true);
    try {
      const data = await dynamicReportsApi.export(code, format, params);
      window.open(data.download_url, '_blank');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const renderParameter = (param: DynamicReportParameter) => {
    if (!param.is_visible) return null;

    const value = params[param.param_key] ?? param.default_value ?? '';
    const error = errors[param.param_key];

    const label = (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {param.label}
        {param.is_required && <span className="text-red-500 me-1">*</span>}
      </label>
    );

    const commonClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500
      ${error ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}
      bg-white dark:bg-slate-800 dark:text-white`;

    switch (param.input_type) {
      case 'text':
      case 'number':
        return (
          <div key={param.param_key} className="mb-4">
            {label}
            <input
              type={param.input_type}
              value={String(value)}
              onChange={(e) => handleParamChange(param.param_key,
                param.input_type === 'number' ? parseFloat(e.target.value) : e.target.value
              )}
              className={commonClasses}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error[0]}</p>}
          </div>
        );

      case 'select':
      case 'semester':
      case 'academic_year':
        return (
          <div key={param.param_key} className="mb-4">
            {label}
            <select
              value={String(value)}
              onChange={(e) => handleParamChange(param.param_key, e.target.value)}
              className={commonClasses}
            >
              <option value="">{lang === 'ar' ? 'اختر...' : 'Select...'}</option>
              {param.options?.map(opt => (
                <option key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-500">{error[0]}</p>}
          </div>
        );

      case 'multiselect':
        return (
          <div key={param.param_key} className="mb-4">
            {label}
            <select
              multiple
              value={Array.isArray(value) ? value as string[] : []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                handleParamChange(param.param_key, values);
              }}
              className={`${commonClasses} min-h-[100px]`}
            >
              {param.options?.map(opt => (
                <option key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-500">{error[0]}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={param.param_key} className="mb-4">
            {label}
            <input
              type="date"
              value={String(value)}
              onChange={(e) => handleParamChange(param.param_key, e.target.value)}
              className={commonClasses}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error[0]}</p>}
          </div>
        );

      case 'daterange':
        return (
          <div key={param.param_key} className="mb-4">
            {label}
            <div className="flex gap-2">
              <input
                type="date"
                value={Array.isArray(value) ? String(value[0] || '') : ''}
                onChange={(e) => {
                  const current = Array.isArray(value) ? value : [];
                  handleParamChange(param.param_key, [e.target.value, current[1] || '']);
                }}
                className={commonClasses}
              />
              <input
                type="date"
                value={Array.isArray(value) ? String(value[1] || '') : ''}
                onChange={(e) => {
                  const current = Array.isArray(value) ? value : [];
                  handleParamChange(param.param_key, [current[0] || '', e.target.value]);
                }}
                className={commonClasses}
              />
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error[0]}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  const renderChart = (chart: ChartData) => {
    // Extract labels and values from chart data
    const dataSource = chart.data_source || {};
    const labelField = dataSource.label_field || dataSource.x_field || 'label';
    const valueField = dataSource.value_field || dataSource.y_field || 'value';

    const colors = chart.options?.colors || [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'
    ];

    // Transform data for recharts
    const chartData = chart.data.map((item, index) => ({
      name: String(item[labelField] || ''),
      value: Number(item[valueField] || 0),
      fill: colors[index % colors.length],
    }));

    switch (chart.chart_type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {chart.options?.showLegend && <Legend />}
              <Bar dataKey="value" fill="#3B82F6">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {chart.options?.showLegend && <Legend />}
              <Line type="monotone" dataKey="value" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={chart.chart_type === 'donut' ? 60 : 0}
                outerRadius={80}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              {chart.options?.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const formatValue = (value: unknown, field: DynamicReportType['fields'][0]) => {
    if (value === null || value === undefined) return '-';

    if (field.data_type === 'grade' && typeof value === 'object') {
      const grade = value as { value: string; color: string };
      return (
        <span className={`px-2 py-1 rounded text-xs font-medium bg-${grade.color}-100 text-${grade.color}-800`}>
          {grade.value}
        </span>
      );
    }

    return String(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        {lang === 'ar' ? 'التقرير غير موجود' : 'Report not found'}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow ${className}`} ref={reportRef}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {report.name}
        </h2>
        {report.description && (
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {report.description}
          </p>
        )}
      </div>

      {/* Parameters */}
      {report.parameters.length > 0 && (
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {lang === 'ar' ? 'معايير التقرير' : 'Report Parameters'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.parameters.map(renderParameter)}
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {generating
                ? (lang === 'ar' ? 'جاري التوليد...' : 'Generating...')
                : (lang === 'ar' ? 'توليد التقرير' : 'Generate Report')}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <>
          {/* Export buttons */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {lang === 'ar'
                ? `${result.meta.total_rows} سجل • تم التوليد في ${result.meta.execution_time}ms`
                : `${result.meta.total_rows} records • Generated in ${result.meta.execution_time}ms`}
            </div>
            <div className="flex gap-2">
              {report.export_formats?.map(format => (
                <button
                  key={format}
                  onClick={() => handleExport(format as 'pdf' | 'excel' | 'csv')}
                  disabled={exporting}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:hover:bg-slate-700 dark:text-white disabled:opacity-50"
                >
                  {exporting ? '...' : format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Charts (before table) */}
          {result.charts?.filter(c => c.chart_key).length > 0 && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {result.charts.filter(c => c.chart_key).map(chart => (
                <div key={chart.chart_key} className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">
                    {lang === 'ar' ? chart.title_ar : chart.title_en}
                  </h4>
                  <div style={{ height: '300px' }}>
                    {renderChart(chart)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Data table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  {report.fields.filter(f => f.is_visible).map(field => (
                    <th
                      key={field.field_key}
                      className={`px-4 py-3 text-${field.align} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                      style={{ width: field.width }}
                    >
                      {field.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {result.data.length === 0 ? (
                  <tr>
                    <td colSpan={report.fields.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      {lang === 'ar' ? 'لا توجد بيانات' : 'No data available'}
                    </td>
                  </tr>
                ) : (
                  result.data.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      {report.fields.filter(f => f.is_visible).map(field => (
                        <td
                          key={field.field_key}
                          className={`px-4 py-3 text-sm text-${field.align} text-gray-900 dark:text-gray-100`}
                        >
                          {formatValue(row[field.field_key], field)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
              {/* Summary row */}
              {result.aggregations && Object.keys(result.aggregations).length > 0 && (
                <tfoot className="bg-gray-100 dark:bg-slate-600 font-semibold">
                  <tr>
                    {report.fields.filter(f => f.is_visible).map((field, index) => (
                      <td
                        key={field.field_key}
                        className={`px-4 py-3 text-sm text-${field.align} text-gray-900 dark:text-gray-100`}
                      >
                        {index === 0
                          ? (lang === 'ar' ? 'الإجمالي' : 'Total')
                          : (result.aggregations?.[field.field_key] ?? '')}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Meta info */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700 text-sm text-gray-500 dark:text-gray-400">
            {lang === 'ar'
              ? `تم التوليد في: ${new Date(result.meta.generated_at).toLocaleString('ar-EG')}`
              : `Generated at: ${new Date(result.meta.generated_at).toLocaleString()}`}
          </div>
        </>
      )}
    </div>
  );
};

export default DynamicReport;
