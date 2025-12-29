import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Eye,
  Play,
  MoreVertical,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { DynamicTable } from '../components/dynamic';
import { TableDataRow } from '../api/dynamicTables';
import { admissionsApi, AdmissionApplication, AdmissionStatistics, statusConfig } from '../api/admissions';

interface DynamicAdmissionsPageProps {
  lang: 'en' | 'ar';
}

const t = {
  admissions: { en: 'Admissions Management', ar: 'إدارة القبول' },
  subtitle: { en: 'Manage admission applications and track their status', ar: 'إدارة طلبات القبول وتتبع حالتها' },
  statistics: { en: 'Statistics', ar: 'الإحصائيات' },
  applications: { en: 'Applications', ar: 'الطلبات' },
  pending: { en: 'Pending', ar: 'قيد الانتظار' },
  underReview: { en: 'Under Review', ar: 'قيد المراجعة' },
  approved: { en: 'Approved', ar: 'مقبول' },
  rejected: { en: 'Rejected', ar: 'مرفوض' },
  total: { en: 'Total Applications', ar: 'إجمالي الطلبات' },
  awaitingAction: { en: 'Awaiting Action', ar: 'في انتظار إجراء' },
  viewDetails: { en: 'View Details', ar: 'عرض التفاصيل' },
  processApplication: { en: 'Process Application', ar: 'معالجة الطلب' },
  startReview: { en: 'Start Review', ar: 'بدء المراجعة' },
  verifyDocuments: { en: 'Verify Documents', ar: 'التحقق من المستندات' },
  requestPayment: { en: 'Request Payment', ar: 'طلب الدفع' },
  approveApplication: { en: 'Approve', ar: 'قبول' },
  rejectApplication: { en: 'Reject', ar: 'رفض' },
  close: { en: 'Close', ar: 'إغلاق' },
  workflowHistory: { en: 'Workflow History', ar: 'سجل سير العمل' },
  noWorkflowLogs: { en: 'No workflow history', ar: 'لا يوجد سجل' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
};

const DynamicAdmissionsPage: React.FC<DynamicAdmissionsPageProps> = ({ lang }) => {
  const [statistics, setStatistics] = useState<AdmissionStatistics | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [processing, setProcessing] = useState(false);

  const isRTL = lang === 'ar';

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoadingStats(true);
      const stats = await admissionsApi.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleRowClick = async (row: TableDataRow) => {
    try {
      const application = await admissionsApi.getById(row.id as number);
      setSelectedApplication(application);
      setShowDetails(true);
    } catch (error) {
      console.error('Failed to load application:', error);
    }
  };

  const handleAction = async (action: string, row: TableDataRow) => {
    switch (action) {
      case 'view':
        handleRowClick(row);
        break;
      case 'process':
        handleRowClick(row);
        break;
    }
  };

  const handleWorkflowAction = async (action: string) => {
    if (!selectedApplication) return;

    setProcessing(true);
    try {
      let result;
      switch (action) {
        case 'start_review':
          result = await admissionsApi.startReview(selectedApplication.id);
          break;
        case 'verify_documents':
          result = await admissionsApi.verifyDocuments(selectedApplication.id);
          break;
        case 'request_payment':
          result = await admissionsApi.requestPayment(selectedApplication.id, 500);
          break;
        case 'approve':
          result = await admissionsApi.approve(selectedApplication.id);
          break;
        case 'reject':
          result = await admissionsApi.reject(selectedApplication.id, 'Application rejected');
          break;
      }
      if (result) {
        setSelectedApplication(result.application || result);
        loadStatistics();
      }
    } catch (error) {
      console.error('Workflow action failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
        {lang === 'ar' ? config.labelAr : config.labelEn}
      </span>
    );
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { action: 'start_review', label: t.startReview[lang], icon: Play };
      case 'UNDER_REVIEW':
        return { action: 'verify_documents', label: t.verifyDocuments[lang], icon: FileText };
      case 'DOCUMENTS_VERIFIED':
        return { action: 'request_payment', label: t.requestPayment[lang], icon: DollarSign };
      case 'PAYMENT_RECEIVED':
        return { action: 'approve', label: t.approveApplication[lang], icon: CheckCircle };
      default:
        return null;
    }
  };

  const statCards = [
    { key: 'total', label: t.total[lang], value: statistics?.total || 0, icon: FileText, color: 'blue' },
    { key: 'pending', label: t.pending[lang], value: statistics?.pending || 0, icon: Clock, color: 'yellow' },
    { key: 'under_review', label: t.underReview[lang], value: statistics?.under_review || 0, icon: Eye, color: 'indigo' },
    { key: 'approved', label: t.approved[lang], value: statistics?.approved || 0, icon: CheckCircle, color: 'green' },
    { key: 'rejected', label: t.rejected[lang], value: statistics?.rejected || 0, icon: XCircle, color: 'red' },
    { key: 'awaiting', label: t.awaitingAction[lang], value: statistics?.awaiting_action || 0, icon: AlertCircle, color: 'orange' },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30',
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <UserCheck className="w-7 h-7 text-blue-600" />
            {t.admissions[lang]}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.subtitle[lang]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadStatistics}
            className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loadingStats ? 'animate-spin' : ''}`} />
          </button>
          <button className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Download className="w-4 h-4" />
            {lang === 'ar' ? 'تصدير' : 'Export'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loadingStats ? '-' : stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Table */}
      <DynamicTable
        code="admissions_list"
        onRowClick={handleRowClick}
        onAction={handleAction}
      />

      {/* Application Details Modal */}
      {showDetails && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedApplication.full_name}
                </h2>
                <p className="text-sm text-gray-500">
                  APP-{String(selectedApplication.id).padStart(6, '0')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedApplication.status)}
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Applicant Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {lang === 'ar' ? 'معلومات المتقدم' : 'Applicant Information'}
                  </h3>
                  {[
                    { label: lang === 'ar' ? 'البريد الإلكتروني' : 'Email', value: selectedApplication.email },
                    { label: lang === 'ar' ? 'الهاتف' : 'Phone', value: selectedApplication.phone },
                    { label: lang === 'ar' ? 'رقم الهوية' : 'National ID', value: selectedApplication.national_id },
                    { label: lang === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth', value: selectedApplication.date_of_birth },
                    { label: lang === 'ar' ? 'الجنس' : 'Gender', value: selectedApplication.gender },
                    { label: lang === 'ar' ? 'الجنسية' : 'Nationality', value: selectedApplication.nationality },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                      <span className="text-gray-900 dark:text-white font-medium">{item.value || '-'}</span>
                    </div>
                  ))}
                </div>

                {/* Program & Status */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {lang === 'ar' ? 'البرنامج والحالة' : 'Program & Status'}
                  </h3>
                  {[
                    { label: lang === 'ar' ? 'البرنامج' : 'Program', value: selectedApplication.program?.name_en || '-' },
                    { label: lang === 'ar' ? 'تاريخ التقديم' : 'Application Date', value: selectedApplication.date },
                    { label: lang === 'ar' ? 'رسوم التسجيل' : 'Registration Fee', value: selectedApplication.registration_fee ? `€${selectedApplication.registration_fee}` : '-' },
                    { label: lang === 'ar' ? 'رقم الطالب' : 'Student ID', value: selectedApplication.student_id || '-' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                      <span className="text-gray-900 dark:text-white font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow History */}
              {selectedApplication.workflow_logs && selectedApplication.workflow_logs.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    {t.workflowHistory[lang]}
                  </h3>
                  <div className="space-y-3">
                    {selectedApplication.workflow_logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center gap-3 text-sm p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{log.action}</p>
                          {log.notes && <p className="text-gray-500 dark:text-gray-400">{log.notes}</p>}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(log.created_at).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                {t.close[lang]}
              </button>
              <div className="flex items-center gap-3">
                {selectedApplication.status !== 'APPROVED' && selectedApplication.status !== 'REJECTED' && (
                  <>
                    <button
                      onClick={() => handleWorkflowAction('reject')}
                      disabled={processing}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      {t.rejectApplication[lang]}
                    </button>
                    {(() => {
                      const nextAction = getNextAction(selectedApplication.status);
                      if (!nextAction) return null;
                      const Icon = nextAction.icon;
                      return (
                        <button
                          onClick={() => handleWorkflowAction(nextAction.action)}
                          disabled={processing}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                        >
                          {processing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                          {nextAction.label}
                        </button>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicAdmissionsPage;
