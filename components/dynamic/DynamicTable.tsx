import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  DynamicTable as DynamicTableType,
  DynamicTableColumn,
  DynamicTableFilter,
  TableDataRow,
  TableDataParams,
  TableView,
  dynamicTablesApi,
} from '../../api/dynamicTables';

interface DynamicTableProps {
  code: string;
  onRowClick?: (row: TableDataRow) => void;
  onAction?: (action: string, row: TableDataRow) => void;
  onBulkAction?: (action: string, selectedIds: (string | number)[]) => void;
  className?: string;
}

export const DynamicTable: React.FC<DynamicTableProps> = ({
  code,
  onRowClick,
  onAction,
  onBulkAction,
  className = '',
}) => {
  const { lang } = useLanguage();
  const [table, setTable] = useState<DynamicTableType | null>(null);
  const [data, setData] = useState<TableDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [views, setViews] = useState<TableView[]>([]);
  const [activeView, setActiveView] = useState<TableView | null>(null);

  useEffect(() => {
    loadTable();
  }, [code]);

  useEffect(() => {
    if (table) {
      loadData();
    }
  }, [table, searchTerm, filters, sortField, sortDirection, page, pageSize]);

  const loadTable = async () => {
    try {
      setLoading(true);
      const tableConfig = await dynamicTablesApi.getByCode(code);
      setTable(tableConfig);
      setPageSize(tableConfig.settings.default_page_size || 10);

      // Load saved views
      const savedViews = await dynamicTablesApi.getViews(code);
      setViews(savedViews);

      // Apply default view if exists
      const defaultView = savedViews.find(v => v.is_default);
      if (defaultView) {
        applyView(defaultView);
      }
    } catch (error) {
      console.error('Failed to load table:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const params: TableDataParams = {
        search: searchTerm || undefined,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        sort: sortField || undefined,
        direction: sortDirection,
        page,
        per_page: pageSize,
      };

      const response = await dynamicTablesApi.getData(code, params);
      setData(response.data);
      setTotal(response.meta.total);
      if (response.meta.last_page) {
        setTotalPages(response.meta.last_page);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (value === '' || value === null || value === undefined) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
    setPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map(row => row.id!)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string | number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const applyView = (view: TableView) => {
    setActiveView(view);
    if (view.filters) {
      setFilters(view.filters);
    }
    if (view.sort) {
      setSortField(view.sort.field);
      setSortDirection(view.sort.direction);
    }
    if (view.page_size) {
      setPageSize(view.page_size);
    }
  };

  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      const result = await dynamicTablesApi.export(code, format, {
        search: searchTerm || undefined,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        sort: sortField || undefined,
        direction: sortDirection,
      });

      // Trigger download
      window.open(result.download_url, '_blank');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const formatCellValue = (column: DynamicTableColumn, cellData: { raw: unknown; formatted: unknown } | undefined) => {
    if (!cellData) return '-';

    const { raw, formatted } = cellData;

    if (column.data_type === 'status' && typeof formatted === 'object' && formatted !== null) {
      const status = formatted as { value: string; color: string };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}>
          {status.value}
        </span>
      );
    }

    if (column.data_type === 'boolean') {
      return raw ? (
        <span className="text-green-600">✓</span>
      ) : (
        <span className="text-red-600">✗</span>
      );
    }

    return String(formatted ?? raw ?? '-');
  };

  const renderFilter = (filter: DynamicTableFilter) => {
    const value = filters[filter.filter_key] ?? filter.default_value ?? '';

    switch (filter.filter_type) {
      case 'text':
        return (
          <input
            type="text"
            value={String(value)}
            onChange={(e) => handleFilterChange(filter.filter_key, e.target.value)}
            placeholder={filter.label}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white"
          />
        );

      case 'select':
        return (
          <select
            value={String(value)}
            onChange={(e) => handleFilterChange(filter.filter_key, e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white"
          >
            <option value="">{filter.label}</option>
            {filter.options?.map(opt => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={String(value)}
            onChange={(e) => handleFilterChange(filter.filter_key, e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white"
          />
        );

      case 'boolean':
        return (
          <select
            value={String(value)}
            onChange={(e) => handleFilterChange(filter.filter_key, e.target.value === 'true' ? true : e.target.value === 'false' ? false : '')}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white"
          >
            <option value="">{filter.label}</option>
            <option value="true">{lang === 'ar' ? 'نعم' : 'Yes'}</option>
            <option value="false">{lang === 'ar' ? 'لا' : 'No'}</option>
          </select>
        );

      default:
        return null;
    }
  };

  if (loading && !table) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        {lang === 'ar' ? 'الجدول غير موجود' : 'Table not found'}
      </div>
    );
  }

  const visibleColumns = table.columns.filter(col => col.is_visible);

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {table.name}
          </h2>

          <div className="flex items-center gap-2">
            {/* Export buttons */}
            {table.settings.is_exportable && table.settings.export_formats?.map(format => (
              <button
                key={format}
                onClick={() => handleExport(format as 'excel' | 'csv' | 'pdf')}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:hover:bg-slate-700 dark:text-white"
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4">
          {table.settings.is_searchable && (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white flex-1 min-w-[200px]"
            />
          )}

          {table.settings.is_filterable && table.filters.map(filter => (
            <div key={filter.filter_key}>
              {renderFilter(filter)}
            </div>
          ))}
        </div>

        {/* Bulk actions */}
        {selectedRows.size > 0 && table.settings.bulk_actions && (
          <div className="mt-4 flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <span className="text-sm text-blue-600 dark:text-blue-400">
              {lang === 'ar'
                ? `تم تحديد ${selectedRows.size} عناصر`
                : `${selectedRows.size} items selected`}
            </span>
            {table.settings.bulk_actions.map(action => (
              <button
                key={action.key}
                onClick={() => onBulkAction?.(action.key, Array.from(selectedRows))}
                className={`px-3 py-1 text-sm rounded ${
                  action.color === 'red'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {lang === 'ar' ? action.label_ar : action.label_en}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              {table.settings.show_selection && (
                <th className="px-4 py-3 text-start">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </th>
              )}
              {table.settings.show_row_numbers && (
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
              )}
              {visibleColumns.map(col => (
                <th
                  key={col.column_key}
                  className={`px-4 py-3 text-${col.align} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    col.is_sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600' : ''
                  }`}
                  style={{ width: col.width, minWidth: col.min_width }}
                  onClick={() => col.is_sortable && handleSort(col.field_name)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.is_sortable && sortField === col.field_name && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
              {table.settings.row_actions && (
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {lang === 'ar' ? 'إجراءات' : 'Actions'}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {lang === 'ar' ? 'لا توجد بيانات' : 'No data available'}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row.id ?? index}
                  className={`hover:bg-gray-50 dark:hover:bg-slate-700 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {table.settings.show_selection && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id!)}
                        onChange={() => handleSelectRow(row.id!)}
                        className="rounded"
                      />
                    </td>
                  )}
                  {table.settings.show_row_numbers && (
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                  )}
                  {visibleColumns.map(col => (
                    <td
                      key={col.column_key}
                      className={`px-4 py-3 text-sm text-${col.align} text-gray-900 dark:text-gray-100`}
                    >
                      {formatCellValue(col, row[col.column_key] as { raw: unknown; formatted: unknown } | undefined)}
                    </td>
                  ))}
                  {table.settings.row_actions && (
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        {table.settings.row_actions.map(action => (
                          <button
                            key={action.key}
                            onClick={() => onAction?.(action.key, row)}
                            className={`p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded ${
                              action.color === 'red' ? 'text-red-600' : 'text-blue-600'
                            }`}
                            title={lang === 'ar' ? action.label_ar : action.label_en}
                          >
                            {action.icon || (lang === 'ar' ? action.label_ar : action.label_en)}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.settings.is_paginated && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {lang === 'ar' ? 'عرض' : 'Show'}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 dark:text-white"
            >
              {table.settings.page_size_options?.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {lang === 'ar'
                ? `من ${total} عناصر`
                : `of ${total} entries`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 dark:text-white"
            >
              «
            </button>
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 dark:text-white"
            >
              ‹
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 dark:text-white"
            >
              ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 dark:text-white"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicTable;
