import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  MoreHorizontal,
  Check,
} from 'lucide-react';

type SortDirection = 'asc' | 'desc' | null;

interface Column<T> {
  key: keyof T | string;
  header: string;
  headerAr?: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  lang?: 'en' | 'ar';
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  getRowId?: (row: T) => string;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  emptyMessageAr?: string;
  loading?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  stickyHeader?: boolean;
  className?: string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  actions?: (row: T) => React.ReactNode;
}

const t = {
  search: { en: 'Search...', ar: 'بحث...' },
  noData: { en: 'No data available', ar: 'لا توجد بيانات' },
  showing: { en: 'Showing', ar: 'عرض' },
  of: { en: 'of', ar: 'من' },
  entries: { en: 'entries', ar: 'سجل' },
  rowsPerPage: { en: 'Rows per page:', ar: 'الصفوف في الصفحة:' },
  page: { en: 'Page', ar: 'صفحة' },
  first: { en: 'First', ar: 'الأول' },
  last: { en: 'Last', ar: 'الأخير' },
  next: { en: 'Next', ar: 'التالي' },
  previous: { en: 'Previous', ar: 'السابق' },
  selectAll: { en: 'Select all', ar: 'تحديد الكل' },
  selected: { en: 'selected', ar: 'محدد' },
};

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  lang = 'en',
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId = (row) => row.id,
  pagination = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  searchable = true,
  searchPlaceholder,
  emptyMessage,
  emptyMessageAr,
  loading = false,
  striped = false,
  hoverable = true,
  compact = false,
  stickyHeader = false,
  className = '',
  onRowClick,
  rowClassName,
  actions,
}: TableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const isRTL = lang === 'ar';

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const value = row[col.key as keyof T];
        return value?.toString().toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn as keyof T];
      const bValue = b[sortColumn as keyof T];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Handle selection
  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    const allIds = paginatedData.map((row) => getRowId(row));
    const allSelected = allIds.every((id) => selectedRows.includes(id));

    if (allSelected) {
      onSelectionChange(selectedRows.filter((id) => !allIds.includes(id)));
    } else {
      onSelectionChange([...new Set([...selectedRows, ...allIds])]);
    }
  };

  const handleSelectRow = (row: T) => {
    if (!onSelectionChange) return;

    const rowId = getRowId(row);
    if (selectedRows.includes(rowId)) {
      onSelectionChange(selectedRows.filter((id) => id !== rowId));
    } else {
      onSelectionChange([...selectedRows, rowId]);
    }
  };

  const isAllSelected = paginatedData.length > 0 && paginatedData.every((row) => selectedRows.includes(getRowId(row)));
  const isSomeSelected = paginatedData.some((row) => selectedRows.includes(getRowId(row)));

  // Render sort icon
  const renderSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-slate-300" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };

  // Get alignment class
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return isRTL ? 'text-start' : 'text-end';
      default:
        return isRTL ? 'text-end' : 'text-start';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Search and Selection Info */}
      {(searchable || selectedRows.length > 0) && (
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          {searchable && (
            <div className="relative w-full sm:w-auto">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRTL ? 'end-3' : 'start-3'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder || t.search[lang]}
                className={`w-full sm:w-64 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'pe-10 ps-3' : 'ps-10 pe-3'}`}
              />
            </div>
          )}
          {selectedRows.length > 0 && (
            <div className="text-sm text-slate-600">
              <span className="font-medium text-blue-600">{selectedRows.length}</span> {t.selected[lang]}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`bg-slate-50 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              {selectable && (
                <th className={`px-4 ${compact ? 'py-2' : 'py-3'} w-12`}>
                  <button
                    onClick={handleSelectAll}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isAllSelected
                        ? 'bg-blue-600 border-blue-600'
                        : isSomeSelected
                        ? 'bg-blue-100 border-blue-600'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {(isAllSelected || isSomeSelected) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </button>
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className={`px-4 ${compact ? 'py-2' : 'py-3'} font-medium text-slate-600 text-sm ${getAlignClass(column.align)}`}
                  style={{ width: column.width }}
                >
                  {column.sortable !== false ? (
                    <button
                      onClick={() => handleSort(column.key as string)}
                      className="flex items-center gap-1 hover:text-slate-800 transition-colors"
                    >
                      <span>{lang === 'ar' && column.headerAr ? column.headerAr : column.header}</span>
                      {renderSortIcon(column.key as string)}
                    </button>
                  ) : (
                    <span>{lang === 'ar' && column.headerAr ? column.headerAr : column.header}</span>
                  )}
                </th>
              ))}
              {actions && (
                <th className={`px-4 ${compact ? 'py-2' : 'py-3'} w-20`}>
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              // Loading skeleton
              Array.from({ length: pageSize }).map((_, index) => (
                <tr key={index}>
                  {selectable && (
                    <td className="px-4 py-3">
                      <div className="w-5 h-5 bg-slate-200 rounded animate-pulse" />
                    </td>
                  )}
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-4 py-3">
                      <div className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 40}%` }} />
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3">
                      <div className="w-8 h-8 bg-slate-200 rounded animate-pulse" />
                    </td>
                  )}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <p className="text-slate-500">
                    {lang === 'ar' && emptyMessageAr ? emptyMessageAr : emptyMessage || t.noData[lang]}
                  </p>
                </td>
              </tr>
            ) : (
              // Data rows
              paginatedData.map((row, rowIndex) => {
                const rowId = getRowId(row);
                const isSelected = selectedRows.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick?.(row)}
                    className={`
                      ${striped && rowIndex % 2 === 1 ? 'bg-slate-50' : ''}
                      ${hoverable ? 'hover:bg-slate-50' : ''}
                      ${isSelected ? 'bg-blue-50' : ''}
                      ${onRowClick ? 'cursor-pointer' : ''}
                      ${rowClassName?.(row) || ''}
                      transition-colors
                    `}
                  >
                    {selectable && (
                      <td className={`px-4 ${compact ? 'py-2' : 'py-3'}`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRow(row);
                          }}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                      </td>
                    )}
                    {columns.map((column) => {
                      const value = row[column.key as keyof T];
                      return (
                        <td
                          key={column.key as string}
                          className={`px-4 ${compact ? 'py-2' : 'py-3'} text-sm text-slate-700 ${getAlignClass(column.align)}`}
                        >
                          {column.render ? column.render(value, row, rowIndex) : value?.toString() || '-'}
                        </td>
                      );
                    })}
                    {actions && (
                      <td className={`px-4 ${compact ? 'py-2' : 'py-3'}`} onClick={(e) => e.stopPropagation()}>
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 0 && (
        <div className="p-3 sm:p-4 border-t border-slate-100 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 order-2 sm:order-1">
            <span className="hidden md:inline">
              {t.showing[lang]} {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, sortedData.length)} {t.of[lang]} {sortedData.length} {t.entries[lang]}
            </span>
            <span className="md:hidden text-xs">
              {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, sortedData.length)} / {sortedData.length}
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="hidden sm:inline">{t.rowsPerPage[lang]}</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-slate-300 rounded-lg px-1.5 sm:px-2 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
              title={t.first[lang]}
            >
              {isRTL ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title={t.previous[lang]}
            >
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm whitespace-nowrap">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title={t.next[lang]}
            >
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
              title={t.last[lang]}
            >
              {isRTL ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DataTable };
export type { Column, TableProps };
export default DataTable;
