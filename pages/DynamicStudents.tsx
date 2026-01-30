import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Download,
  Upload,
  Filter,
  Search,
  Settings,
  Eye,
  Edit,
  Trash2,
  Mail,
  MoreVertical,
} from 'lucide-react';
import { DynamicTable } from '../components/dynamic';
import { TableDataRow, dynamicTablesAPI } from '../api/dynamicTables';
import { exportToCSV } from '../utils/exportUtils';

interface DynamicStudentsPageProps {
  lang: 'en' | 'ar';
}

const t = {
  students: { en: 'Students Management', ar: 'إدارة الطلاب' },
  subtitle: { en: 'View and manage all registered students', ar: 'عرض وإدارة جميع الطلاب المسجلين' },
  addStudent: { en: 'Add Student', ar: 'إضافة طالب' },
  importStudents: { en: 'Import', ar: 'استيراد' },
  exportStudents: { en: 'Export', ar: 'تصدير' },
  viewProfile: { en: 'View Profile', ar: 'عرض الملف' },
  editStudent: { en: 'Edit Student', ar: 'تعديل الطالب' },
  sendEmail: { en: 'Send Email', ar: 'إرسال بريد' },
  deleteStudent: { en: 'Delete Student', ar: 'حذف الطالب' },
  confirmDelete: { en: 'Are you sure you want to delete this student?', ar: 'هل أنت متأكد من حذف هذا الطالب؟' },
  studentDetails: { en: 'Student Details', ar: 'تفاصيل الطالب' },
  close: { en: 'Close', ar: 'إغلاق' },
  noTableConfig: { en: 'Table configuration not found. Please configure in Admin Panel.', ar: 'لم يتم العثور على إعدادات الجدول. يرجى الإعداد من لوحة الإدارة.' },
};

const DynamicStudentsPage: React.FC<DynamicStudentsPageProps> = ({ lang }) => {
  const [selectedStudent, setSelectedStudent] = useState<TableDataRow | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const isRTL = lang === 'ar';

  const handleRowClick = (row: TableDataRow) => {
    setSelectedStudent(row);
    setShowDetails(true);
  };

  const handleAction = (action: string, row: TableDataRow) => {
    switch (action) {
      case 'view':
        setSelectedStudent(row);
        setShowDetails(true);
        break;
      case 'edit':
        // Navigate to edit page or open edit modal
        console.log('Edit student:', row);
        break;
      case 'delete':
        if (confirm(t.confirmDelete[lang])) {
          // Delete student
          console.log('Delete student:', row);
        }
        break;
    }
  };

  const handleBulkAction = (action: string, selectedIds: (string | number)[]) => {
    switch (action) {
      case 'export':
        console.log('Export selected:', selectedIds);
        break;
      case 'delete':
        if (confirm(`${t.confirmDelete[lang]} (${selectedIds.length} students)`)) {
          console.log('Delete selected:', selectedIds);
        }
        break;
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-600" />
            {t.students[lang]}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.subtitle[lang]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {t.importStudents[lang]}
          </button>
          <button className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 flex items-center gap-2" onClick={async () => {
            try {
              const response = await dynamicTablesAPI.getTableData('students_list');
              if (response && response.data) {
                exportToCSV(response.data, 'students-export');
              }
            } catch (error) {
              console.error('Failed to export students:', error);
            }
          }}>
            <Download className="w-4 h-4" />
            {t.exportStudents[lang]}
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            {t.addStudent[lang]}
          </button>
        </div>
      </div>

      {/* Dynamic Table */}
      <DynamicTable
        code="students_list"
        onRowClick={handleRowClick}
        onAction={handleAction}
        onBulkAction={handleBulkAction}
      />

      {/* Student Details Modal */}
      {showDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t.studentDetails[lang]}
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <span className="sr-only">{t.close[lang]}</span>
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                {Object.entries(selectedStudent).map(([key, value]) => {
                  if (key === 'id') return null;
                  const cellData = value as { raw: unknown; formatted: unknown } | undefined;
                  return (
                    <div key={key} className="flex border-b border-gray-100 dark:border-slate-700 pb-3">
                      <span className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="w-2/3 text-sm text-gray-900 dark:text-white">
                        {typeof cellData === 'object' && cellData !== null
                          ? String(cellData.formatted || cellData.raw || '-')
                          : String(value || '-')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                {t.close[lang]}
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Edit className="w-4 h-4" />
                {t.editStudent[lang]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicStudentsPage;
