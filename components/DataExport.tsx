import React, { useState } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Check,
  X,
  Loader2,
  ChevronDown,
  Calendar,
  Filter,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Table,
  List,
  Grid,
} from 'lucide-react';

type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json';
type ExportStatus = 'idle' | 'preparing' | 'exporting' | 'success' | 'error';

interface Column {
  key: string;
  label: string;
  labelAr?: string;
  selected: boolean;
}

interface DataExportProps {
  lang: 'en' | 'ar';
  isOpen: boolean;
  onClose: () => void;
  dataType: string;
  availableColumns: Column[];
  onExport: (format: ExportFormat, columns: string[], options: ExportOptions) => Promise<void>;
}

interface ExportOptions {
  dateRange?: {
    from: string;
    to: string;
  };
  includeHeaders: boolean;
  includeTimestamp: boolean;
  format: ExportFormat;
}

const t = {
  exportData: { en: 'Export Data', ar: 'تصدير البيانات' },
  selectFormat: { en: 'Select Format', ar: 'اختر الصيغة' },
  selectColumns: { en: 'Select Columns', ar: 'اختر الأعمدة' },
  selectAll: { en: 'Select All', ar: 'تحديد الكل' },
  deselectAll: { en: 'Deselect All', ar: 'إلغاء تحديد الكل' },
  dateRange: { en: 'Date Range', ar: 'نطاق التاريخ' },
  from: { en: 'From', ar: 'من' },
  to: { en: 'To', ar: 'إلى' },
  options: { en: 'Options', ar: 'خيارات' },
  includeHeaders: { en: 'Include column headers', ar: 'تضمين عناوين الأعمدة' },
  includeTimestamp: { en: 'Add export timestamp', ar: 'إضافة وقت التصدير' },
  export: { en: 'Export', ar: 'تصدير' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  preparing: { en: 'Preparing data...', ar: 'جاري تحضير البيانات...' },
  exporting: { en: 'Exporting...', ar: 'جاري التصدير...' },
  success: { en: 'Export completed successfully!', ar: 'تم التصدير بنجاح!' },
  error: { en: 'Export failed. Please try again.', ar: 'فشل التصدير. يرجى المحاولة مرة أخرى.' },
  downloadReady: { en: 'Your download is ready', ar: 'التنزيل جاهز' },
  tryAgain: { en: 'Try Again', ar: 'حاول مرة أخرى' },
  close: { en: 'Close', ar: 'إغلاق' },
  columnsSelected: { en: 'columns selected', ar: 'أعمدة محددة' },
  noColumnsSelected: { en: 'Please select at least one column', ar: 'يرجى تحديد عمود واحد على الأقل' },
  preview: { en: 'Preview', ar: 'معاينة' },
  estimatedSize: { en: 'Estimated file size', ar: 'حجم الملف المقدر' },
};

const formatConfig: Record<ExportFormat, { icon: typeof FileText; label: string; color: string; description: string }> = {
  csv: {
    icon: FileText,
    label: 'CSV',
    color: 'text-green-600 bg-green-100',
    description: 'Comma-separated values',
  },
  xlsx: {
    icon: FileSpreadsheet,
    label: 'Excel',
    color: 'text-emerald-600 bg-emerald-100',
    description: 'Microsoft Excel spreadsheet',
  },
  pdf: {
    icon: File,
    label: 'PDF',
    color: 'text-red-600 bg-red-100',
    description: 'Portable Document Format',
  },
  json: {
    icon: Database,
    label: 'JSON',
    color: 'text-purple-600 bg-purple-100',
    description: 'JavaScript Object Notation',
  },
};

const DataExport: React.FC<DataExportProps> = ({
  lang,
  isOpen,
  onClose,
  dataType,
  availableColumns: initialColumns,
  onExport,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('xlsx');
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [showColumnList, setShowColumnList] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [includeTimestamp, setIncludeTimestamp] = useState(false);

  const isRTL = lang === 'ar';
  const selectedColumnsCount = columns.filter((c) => c.selected).length;

  const toggleColumn = (key: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.key === key ? { ...col, selected: !col.selected } : col))
    );
  };

  const selectAllColumns = () => {
    setColumns((prev) => prev.map((col) => ({ ...col, selected: true })));
  };

  const deselectAllColumns = () => {
    setColumns((prev) => prev.map((col) => ({ ...col, selected: false })));
  };

  const handleExport = async () => {
    if (selectedColumnsCount === 0) return;

    try {
      setStatus('preparing');
      await new Promise((resolve) => setTimeout(resolve, 500));

      setStatus('exporting');
      const selectedColumnKeys = columns.filter((c) => c.selected).map((c) => c.key);

      await onExport(selectedFormat, selectedColumnKeys, {
        dateRange: dateFrom && dateTo ? { from: dateFrom, to: dateTo } : undefined,
        includeHeaders,
        includeTimestamp,
        format: selectedFormat,
      });

      setStatus('success');
    } catch (error) {
      setStatus('error');
    }
  };

  const resetAndClose = () => {
    setStatus('idle');
    setColumns(initialColumns);
    setSelectedFormat('xlsx');
    setDateFrom('');
    setDateTo('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetAndClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{t.exportData[lang]}</h2>
              <p className="text-sm text-slate-500">{dataType}</p>
            </div>
          </div>
          <button onClick={resetAndClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        {status === 'idle' && (
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">{t.selectFormat[lang]}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(Object.keys(formatConfig) as ExportFormat[]).map((format) => {
                  const config = formatConfig[format];
                  const Icon = config.icon;
                  return (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedFormat === format
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-medium text-slate-800">{config.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700">{t.selectColumns[lang]}</label>
                <span className="text-sm text-slate-500">
                  {selectedColumnsCount} {t.columnsSelected[lang]}
                </span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowColumnList(!showColumnList)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      {selectedColumnsCount === columns.length
                        ? lang === 'en'
                          ? 'All columns selected'
                          : 'كل الأعمدة محددة'
                        : `${selectedColumnsCount} / ${columns.length}`}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showColumnList ? 'rotate-180' : ''}`} />
                </button>

                {showColumnList && (
                  <div className="absolute top-full start-0 end-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    <div className="flex gap-2 p-2 border-b border-slate-100">
                      <button
                        onClick={selectAllColumns}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {t.selectAll[lang]}
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={deselectAllColumns}
                        className="text-xs text-slate-500 hover:underline"
                      >
                        {t.deselectAll[lang]}
                      </button>
                    </div>
                    {columns.map((column) => (
                      <label
                        key={column.key}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={column.selected}
                          onChange={() => toggleColumn(column.key)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">
                          {lang === 'ar' && column.labelAr ? column.labelAr : column.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">{t.dateRange[lang]}</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{t.from[lang]}</label>
                  <div className="relative">
                    <Calendar className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRTL ? 'end-3' : 'start-3'}`} />
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className={`w-full py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'pe-10 ps-3' : 'ps-10 pe-3'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{t.to[lang]}</label>
                  <div className="relative">
                    <Calendar className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRTL ? 'end-3' : 'start-3'}`} />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className={`w-full py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'pe-10 ps-3' : 'ps-10 pe-3'}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">{t.options[lang]}</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeHeaders}
                    onChange={(e) => setIncludeHeaders(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">{t.includeHeaders[lang]}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTimestamp}
                    onChange={(e) => setIncludeTimestamp(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">{t.includeTimestamp[lang]}</span>
                </label>
              </div>
            </div>

            {/* Estimated Size */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">{t.estimatedSize[lang]}</span>
              <span className="text-sm font-medium text-slate-800">~{(selectedColumnsCount * 0.5).toFixed(1)} KB</span>
            </div>
          </div>
        )}

        {/* Processing States */}
        {(status === 'preparing' || status === 'exporting') && (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-slate-800">
              {status === 'preparing' ? t.preparing[lang] : t.exporting[lang]}
            </p>
            <div className="w-48 h-2 bg-slate-200 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                style={{ width: status === 'preparing' ? '30%' : '80%' }}
              />
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-medium text-slate-800 mb-2">{t.success[lang]}</p>
            <p className="text-sm text-slate-500">{t.downloadReady[lang]}</p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-lg font-medium text-slate-800 mb-2">{t.error[lang]}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          {status === 'idle' && (
            <>
              <button
                onClick={resetAndClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleExport}
                disabled={selectedColumnsCount === 0}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                  selectedColumnsCount === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Download className="w-4 h-4" />
                {t.export[lang]}
              </button>
            </>
          )}

          {status === 'success' && (
            <button
              onClick={resetAndClose}
              className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t.close[lang]}
            </button>
          )}

          {status === 'error' && (
            <div className="flex gap-3 w-full">
              <button
                onClick={resetAndClose}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={() => {
                  setStatus('idle');
                  handleExport();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t.tryAgain[lang]}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Quick Export Button
export const QuickExportButton: React.FC<{
  lang: 'en' | 'ar';
  onExport: (format: ExportFormat) => void;
  className?: string;
}> = ({ lang, onExport, className = '' }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 ${className}`}
      >
        <Download className="w-4 h-4 text-slate-500" />
        <span className="text-sm text-slate-600">{lang === 'en' ? 'Export' : 'تصدير'}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className={`absolute top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20 min-w-[160px] ${lang === 'ar' ? 'start-0' : 'end-0'}`}>
            {(Object.keys(formatConfig) as ExportFormat[]).map((format) => {
              const config = formatConfig[format];
              const Icon = config.icon;
              return (
                <button
                  key={format}
                  onClick={() => {
                    onExport(format);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-start"
                >
                  <Icon className={`w-4 h-4 ${config.color.split(' ')[0]}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{config.label}</p>
                    <p className="text-xs text-slate-400">{config.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default DataExport;
