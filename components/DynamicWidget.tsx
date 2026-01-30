import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  Users, DollarSign, BookOpen, FileText, TrendingUp, TrendingDown,
  Award, Calendar, Bell, GraduationCap, CreditCard, Clock,
  UserCheck, Activity, Target, BarChart2, Loader2,
  type LucideIcon
} from 'lucide-react';
import { Card, CardHeader, CardBody, StatCard } from './ui/Card';
import { DashboardWidget, DashboardLayoutWidget } from '../api/config';
import apiClient from '../api/client';

interface DynamicWidgetProps {
  widget: DashboardLayoutWidget;
  lang: 'en' | 'ar';
  role?: string;
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  'users': Users,
  'dollar-sign': DollarSign,
  'book-open': BookOpen,
  'file-text': FileText,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'award': Award,
  'calendar': Calendar,
  'bell': Bell,
  'graduation-cap': GraduationCap,
  'credit-card': CreditCard,
  'clock': Clock,
  'user-check': UserCheck,
  'activity': Activity,
  'target': Target,
  'bar-chart-2': BarChart2,
};

const getIcon = (iconName: string | null | undefined): LucideIcon => {
  if (!iconName) return Activity;
  const normalized = iconName.toLowerCase().replace(/_/g, '-');
  return iconMap[normalized] || Activity;
};

// Colors for charts
const CHART_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const DynamicWidget: React.FC<DynamicWidgetProps> = ({ widget, lang, role }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const widgetConfig = widget.widget;
  const layoutConfig = widget.config || {};

  // Fetch data from API if data_source is specified
  useEffect(() => {
    const fetchData = async () => {
      if (!widgetConfig.data_source) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get(widgetConfig.data_source);
        setData(response.data.data || response.data);
      } catch (err) {
        console.error('Error fetching widget data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up refresh interval if specified
    if (widgetConfig.refresh_interval && widgetConfig.refresh_interval > 0) {
      const interval = setInterval(fetchData, widgetConfig.refresh_interval * 1000);
      return () => clearInterval(interval);
    }
  }, [widgetConfig.data_source, widgetConfig.refresh_interval]);

  // Loading state
  if (loading) {
    return (
      <Card className={`col-span-${widget.column_span || 1} row-span-${widget.row_span || 1}`}>
        <CardBody className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </CardBody>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={`col-span-${widget.column_span || 1} row-span-${widget.row_span || 1}`}>
        <CardBody className="flex items-center justify-center h-40 text-red-500">
          {error}
        </CardBody>
      </Card>
    );
  }

  // Render based on widget type
  const renderWidget = () => {
    switch (widgetConfig.type) {
      case 'stat_card':
        return renderStatCard();
      case 'chart':
        return renderChart();
      case 'table':
        return renderTable();
      case 'list':
        return renderList();
      case 'calendar':
        return renderCalendar();
      case 'custom':
        return renderCustom();
      default:
        return <div>Unknown widget type: {widgetConfig.type}</div>;
    }
  };

  // Stat Card Widget
  const renderStatCard = () => {
    const config = widgetConfig.config || {};
    const Icon = getIcon(config.icon);
    const value = data?.value || config.value || '0';
    const trend = data?.trend || config.trend;

    return (
      <StatCard
        title={widgetConfig.name}
        value={value}
        subtitle={config.subtitle || ''}
        icon={Icon}
        iconColor={config.iconColor || 'text-blue-600 bg-blue-50'}
        trend={trend ? { value: trend.value, isPositive: trend.isPositive } : undefined}
      />
    );
  };

  // Chart Widget
  const renderChart = () => {
    const config = widgetConfig.config || {};
    const chartType = config.chartType || 'bar';
    const chartData = data || config.data || [];
    const Icon = getIcon(config.icon);

    return (
      <Card>
        <CardHeader
          title={widgetConfig.name}
          icon={Icon}
          iconColor={config.iconColor || 'text-blue-600 bg-blue-50'}
        />
        <CardBody>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
              {chartType === 'bar' && (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey={config.xAxisKey || 'name'} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  {(config.dataKeys || ['value']).map((key: string, index: number) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              )}
              {chartType === 'line' && (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey={config.xAxisKey || 'name'} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  {(config.dataKeys || ['value']).map((key: string, index: number) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={CHART_COLORS[index % CHART_COLORS.length]}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              )}
              {chartType === 'area' && (
                <AreaChart data={chartData}>
                  <defs>
                    {(config.dataKeys || ['value']).map((key: string, index: number) => (
                      <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey={config.xAxisKey || 'name'} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  {(config.dataKeys || ['value']).map((key: string, index: number) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={CHART_COLORS[index % CHART_COLORS.length]}
                      strokeWidth={2}
                      fill={`url(#gradient-${key})`}
                    />
                  ))}
                </AreaChart>
              )}
              {chartType === 'pie' && (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={config.innerRadius || 50}
                    outerRadius={config.outerRadius || 70}
                    paddingAngle={3}
                    dataKey={config.valueKey || 'value'}
                  >
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
          {chartType === 'pie' && config.showLegend && (
            <div className="flex justify-center gap-4 mt-2">
              {chartData.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length] }}
                  ></div>
                  <span className="text-xs text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  // Table Widget
  const renderTable = () => {
    const config = widgetConfig.config || {};
    const tableData = data || config.data || [];
    const columns = config.columns || [];
    const Icon = getIcon(config.icon);

    return (
      <Card>
        <CardHeader
          title={widgetConfig.name}
          icon={Icon}
          iconColor={config.iconColor || 'text-blue-600 bg-blue-50'}
        />
        <CardBody noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {columns.map((col: any, index: number) => (
                    <th key={index} className="px-4 py-3 text-start text-sm font-medium text-slate-600">
                      {lang === 'ar' ? col.label_ar : col.label_en}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableData.map((row: any, rowIndex: number) => (
                  <tr key={rowIndex} className="hover:bg-slate-50">
                    {columns.map((col: any, colIndex: number) => (
                      <td key={colIndex} className="px-4 py-3 text-sm text-slate-700">
                        {row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    );
  };

  // List Widget
  const renderList = () => {
    const config = widgetConfig.config || {};
    const listData = data || config.data || [];
    const Icon = getIcon(config.icon);

    return (
      <Card>
        <CardHeader
          title={widgetConfig.name}
          icon={Icon}
          iconColor={config.iconColor || 'text-blue-600 bg-blue-50'}
        />
        <CardBody noPadding>
          <div className="divide-y divide-slate-100">
            {listData.map((item: any, index: number) => (
              <div key={index} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                {item.dot && (
                  <div className={`w-2 h-2 rounded-full ${item.dotColor || 'bg-blue-500'}`}></div>
                )}
                {item.icon && (
                  <div className={`p-2 rounded-lg ${item.iconBg || 'bg-blue-50'}`}>
                    {React.createElement(getIcon(item.icon), { className: `w-4 h-4 ${item.iconColor || 'text-blue-600'}` })}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {lang === 'ar' ? (item.title_ar || item.title) : (item.title_en || item.title)}
                  </p>
                  {item.subtitle && (
                    <p className="text-xs text-slate-500">{item.subtitle}</p>
                  )}
                </div>
                {item.badge && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.badgeColor || 'bg-blue-100 text-blue-700'}`}>
                    {item.badge}
                  </span>
                )}
                {item.value && (
                  <span className="text-sm font-medium text-slate-700">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  };

  // Calendar Widget (placeholder)
  const renderCalendar = () => {
    const config = widgetConfig.config || {};
    const Icon = getIcon(config.icon || 'calendar');

    return (
      <Card>
        <CardHeader
          title={widgetConfig.name}
          icon={Icon}
          iconColor={config.iconColor || 'text-orange-600 bg-orange-50'}
        />
        <CardBody>
          <div className="text-center text-slate-500 py-8">
            {lang === 'ar' ? 'التقويم قادم قريباً' : 'Calendar coming soon'}
          </div>
        </CardBody>
      </Card>
    );
  };

  // Custom Widget (placeholder for custom components)
  const renderCustom = () => {
    const config = widgetConfig.config || {};
    const componentName = widgetConfig.component;

    // In a real implementation, you would dynamically load the component
    // For now, we'll just show a placeholder
    return (
      <Card>
        <CardBody>
          <div className="text-center text-slate-500 py-8">
            {lang === 'ar' ? `مكون مخصص: ${componentName}` : `Custom Component: ${componentName}`}
          </div>
        </CardBody>
      </Card>
    );
  };

  const colSpanClass = `col-span-${widget.column_span || 1}`;
  const rowSpanClass = widget.row_span > 1 ? `row-span-${widget.row_span}` : '';

  return (
    <div className={`${colSpanClass} ${rowSpanClass}`}>
      {renderWidget()}
    </div>
  );
};

export default DynamicWidget;
