import React from 'react';
import { useConfig } from '../context/ConfigContext';
import DynamicWidget from './DynamicWidget';
import { Loader2 } from 'lucide-react';

interface DynamicDashboardProps {
  lang: 'en' | 'ar';
  role: string;
}

const DynamicDashboard: React.FC<DynamicDashboardProps> = ({ lang, role }) => {
  const { state } = useConfig();
  const { dashboard, isLoading, error } = state;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-500">
            {lang === 'ar' ? 'جاري تحميل لوحة التحكم...' : 'Loading dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium mb-2">
            {lang === 'ar' ? 'خطأ في تحميل لوحة التحكم' : 'Error loading dashboard'}
          </p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // No dashboard configured
  if (!dashboard || !dashboard.widgets || dashboard.widgets.length === 0) {
    return null; // Return null to allow fallback to static dashboard
  }

  // Determine grid columns
  const columns = dashboard.columns || 4;
  const gap = dashboard.gap || '6';

  // Sort widgets by order
  const sortedWidgets = [...dashboard.widgets].sort(
    (a, b) => (a.order_column || 0) - (b.order_column || 0)
  );

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-${gap}`}>
      {sortedWidgets.map((widget, index) => (
        <DynamicWidget
          key={widget.widget_id || index}
          widget={widget}
          lang={lang}
          role={role}
        />
      ))}
    </div>
  );
};

export default DynamicDashboard;
