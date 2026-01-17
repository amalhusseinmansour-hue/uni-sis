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
  Search,
  Users,
  GraduationCap,
  Mail,
  Calendar,
} from 'lucide-react';
import { admissionsApi, AdmissionApplication, AdmissionStatistics, statusConfig } from '../api/admissions';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';

interface DynamicAdmissionsPageProps {
  lang: 'en' | 'ar';
}

const t = {
  admissions: { en: 'Admissions Management', ar: 'إدارة القبول' },
  subtitle: { en: 'Manage admission applications and track their status', ar: 'إدارة طلبات القبول وتتبع حالتها' },
  statistics: { en: 'Statistics', ar: 'الإحصائيات' },
  applications: { en: 'Applications', ar: 'الطلبات' },
  students: { en: 'Students', ar: 'الطلاب' },
  pending: { en: 'Pending', ar: 'قيد الانتظار' },
  underReview: { en: 'Under Review', ar: 'قيد المراجعة' },
  approved: { en: 'Approved', ar: 'مقبول' },
  rejected: { en: 'Rejected', ar: 'مرفوض' },
  total: { en: 'Total Applications', ar: 'إجمالي الطلبات' },
  totalStudents: { en: 'Total Students', ar: 'إجمالي الطلاب' },
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
  fullName: { en: 'Full Name', ar: 'الاسم الكامل' },
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  registrationDate: { en: 'Registration Date', ar: 'تاريخ التسجيل' },
  studentId: { en: 'Student ID', ar: 'رقم الطالب' },
  program: { en: 'Program', ar: 'البرنامج' },
  noStudents: { en: 'No students found', ar: 'لا يوجد طلاب' },
};

// Mock data for when API is unavailable
const mockApplications: AdmissionApplication[] = [
  {
    id: 1,
    full_name: 'أحمد محمد علي',
    email: 'ahmed@email.com',
    phone: '+966501234567',
    national_id: '1234567890',
    date_of_birth: '2000-05-15',
    gender: 'male',
    nationality: 'Saudi',
    program_id: 1,
    program: { id: 1, name_en: 'Computer Science', name_ar: 'علوم الحاسب', code: 'CS' },
    status: 'PENDING',
    date: '2024-01-15',
    created_at: '2024-01-15T10:00:00',
    updated_at: '2024-01-15T10:00:00',
  },
  {
    id: 2,
    full_name: 'فاطمة أحمد السعيد',
    email: 'fatima@email.com',
    phone: '+966509876543',
    national_id: '0987654321',
    date_of_birth: '2001-08-20',
    gender: 'female',
    nationality: 'Saudi',
    program_id: 2,
    program: { id: 2, name_en: 'Business Administration', name_ar: 'إدارة الأعمال', code: 'BA' },
    status: 'UNDER_REVIEW',
    date: '2024-01-14',
    created_at: '2024-01-14T09:00:00',
    updated_at: '2024-01-15T11:00:00',
  },
  {
    id: 3,
    full_name: 'خالد عبدالله العمري',
    email: 'khalid@email.com',
    phone: '+966505551234',
    national_id: '1122334455',
    date_of_birth: '1999-12-10',
    gender: 'male',
    nationality: 'Saudi',
    program_id: 1,
    program: { id: 1, name_en: 'Computer Science', name_ar: 'علوم الحاسب', code: 'CS' },
    status: 'APPROVED',
    student_id: 'STU-2024-001',
    date: '2024-01-10',
    created_at: '2024-01-10T08:00:00',
    updated_at: '2024-01-12T14:00:00',
  },
  {
    id: 4,
    full_name: 'نورة سعد المالكي',
    email: 'noura@email.com',
    phone: '+966507778899',
    national_id: '5566778899',
    date_of_birth: '2000-03-25',
    gender: 'female',
    nationality: 'Saudi',
    program_id: 3,
    program: { id: 3, name_en: 'Engineering', name_ar: 'الهندسة', code: 'ENG' },
    status: 'DOCUMENTS_VERIFIED',
    date: '2024-01-13',
    created_at: '2024-01-13T10:00:00',
    updated_at: '2024-01-14T16:00:00',
  },
  {
    id: 5,
    full_name: 'محمد سالم القحطاني',
    email: 'mohammed@email.com',
    phone: '+966502223344',
    national_id: '9988776655',
    date_of_birth: '2001-07-08',
    gender: 'male',
    nationality: 'Saudi',
    program_id: 2,
    program: { id: 2, name_en: 'Business Administration', name_ar: 'إدارة الأعمال', code: 'BA' },
    status: 'REJECTED',
    date: '2024-01-08',
    created_at: '2024-01-08T09:00:00',
    updated_at: '2024-01-11T10:00:00',
  },
];

const mockStatistics: AdmissionStatistics = {
  total: 125,
  pending: 45,
  under_review: 28,
  documents_verified: 15,
  pending_payment: 12,
  payment_received: 8,
  approved: 12,
  rejected: 5,
  waitlisted: 0,
  awaiting_action: 85,
};

interface Student {
  id: number;
  student_id: string;
  name_en: string;
  name_ar: string;
  email?: string;
  university_email?: string;
  personal_email?: string;
  phone?: string;
  user?: { id: number; email: string; name: string };
  program?: { id: number; name_en: string; name_ar: string; code: string };
  admission_date?: string;
  created_at: string;
}

const DynamicAdmissionsPage: React.FC<DynamicAdmissionsPageProps> = ({ lang }) => {
  const [statistics, setStatistics] = useState<AdmissionStatistics | null>(mockStatistics);
  const [applications, setApplications] = useState<AdmissionApplication[]>(mockApplications);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'applications' | 'students'>('applications');

  const isRTL = lang === 'ar';

  // Read tab from URL on mount (supports both hash and regular routing)
  useEffect(() => {
    // For hash-based routing like #/admissions?tab=students
    const hash = window.location.hash;
    const hashParams = hash.includes('?') ? new URLSearchParams(hash.split('?')[1]) : null;
    // For regular routing
    const searchParams = new URLSearchParams(window.location.search);

    const tab = hashParams?.get('tab') || searchParams.get('tab');
    if (tab === 'students') {
      setActiveTab('students');
    }
  }, []);

  useEffect(() => {
    loadStatistics();
    loadApplications();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') {
      loadStudents();
    }
  }, [activeTab]);

  const loadStatistics = async () => {
    try {
      setLoadingStats(true);
      const stats = await admissionsApi.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics, using mock data:', error);
      setStatistics(mockStatistics);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await admissionsApi.getAll({ status: statusFilter as any, search: searchTerm });
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to load applications, using mock data:', error);
      setApplications(mockApplications);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      if (data.data) {
        setStudents(data.data);
      } else if (Array.isArray(data)) {
        setStudents(data);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleRowClick = (application: AdmissionApplication) => {
    setSelectedApplication(application);
    setShowDetails(true);
  };

  const handleExport = () => {
    const data = applications.map(app => ({
      [isRTL ? 'الرقم' : 'ID']: app.id,
      [isRTL ? 'الاسم' : 'Name']: app.full_name,
      [isRTL ? 'البريد الإلكتروني' : 'Email']: app.email,
      [isRTL ? 'الهاتف' : 'Phone']: app.phone,
      [isRTL ? 'البرنامج' : 'Program']: lang === 'ar' ? app.program?.name_ar : app.program?.name_en,
      [isRTL ? 'الحالة' : 'Status']: statusConfig[app.status]?.[isRTL ? 'labelAr' : 'labelEn'] || app.status,
      [isRTL ? 'تاريخ التقديم' : 'Application Date']: app.date,
    }));
    exportToCSV(data, `admissions-${new Date().toISOString().split('T')[0]}`);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm ||
      app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredStudents = students.filter(student => {
    if (!studentSearchTerm) return true;
    const search = studentSearchTerm.toLowerCase();
    const email = student.university_email || student.personal_email || student.email || student.user?.email || '';
    return (
      student.name_en?.toLowerCase().includes(search) ||
      student.name_ar?.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search) ||
      student.student_id?.toLowerCase().includes(search)
    );
  });

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
            onClick={() => { loadStatistics(); loadApplications(); if (activeTab === 'students') loadStudents(); }}
            className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loadingStats || loading || loadingStudents ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {lang === 'ar' ? 'تصدير' : 'Export'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'applications'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          {t.applications[lang]}
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'students'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          {t.students[lang]}
          {students.length > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              {students.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'applications' && (
        <>
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

          {/* Applications Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Table Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isRTL ? 'بحث...' : 'Search...'}
                  className="w-full ps-10 pe-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white"
            >
              <option value="">{isRTL ? 'جميع الحالات' : 'All Statuses'}</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {isRTL ? config.labelAr : config.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {isRTL ? 'رقم الطلب' : 'App ID'}
                </th>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {isRTL ? 'الاسم' : 'Name'}
                </th>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {isRTL ? 'البريد الإلكتروني' : 'Email'}
                </th>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {isRTL ? 'البرنامج' : 'Program'}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {isRTL ? 'الحالة' : 'Status'}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {isRTL ? 'التاريخ' : 'Date'}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {isRTL ? 'إجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    {isRTL ? 'لا توجد طلبات' : 'No applications found'}
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
                    onClick={() => handleRowClick(app)}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                      APP-{String(app.id).padStart(4, '0')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {app.full_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {app.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {isRTL ? app.program?.name_ar : app.program?.name_en}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                      {new Date(app.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleRowClick(app)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 text-sm text-gray-500 dark:text-gray-400">
          {isRTL
            ? `عرض ${filteredApplications.length} من ${applications.length} طلب`
            : `Showing ${filteredApplications.length} of ${applications.length} applications`}
        </div>
      </div>
        </>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          {/* Students Header */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t.totalStudents[lang]}</h3>
                  <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                </div>
              </div>
              <div className="flex-1 min-w-[200px] max-w-md">
                <div className="relative">
                  <Search className={`absolute ${isRTL ? 'end-3' : 'start-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                  <input
                    type="text"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    placeholder={isRTL ? 'بحث بالاسم أو البريد أو الرقم...' : 'Search by name, email, or ID...'}
                    className={`w-full ${isRTL ? 'pe-10 ps-4' : 'ps-10 pe-4'} py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className={`px-4 py-3 ${isRTL ? 'text-end' : 'text-start'} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase`}>
                    {t.studentId[lang]}
                  </th>
                  <th className={`px-4 py-3 ${isRTL ? 'text-end' : 'text-start'} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase`}>
                    {t.fullName[lang]}
                  </th>
                  <th className={`px-4 py-3 ${isRTL ? 'text-end' : 'text-start'} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase`}>
                    {t.email[lang]}
                  </th>
                  <th className={`px-4 py-3 ${isRTL ? 'text-end' : 'text-start'} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase`}>
                    {t.program[lang]}
                  </th>
                  <th className={`px-4 py-3 ${isRTL ? 'text-end' : 'text-start'} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase`}>
                    {t.registrationDate[lang]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {loadingStudents ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      {t.noStudents[lang]}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">
                        {student.student_id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                            {(isRTL ? student.name_ar : student.name_en)?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium">{isRTL ? student.name_ar : student.name_en}</p>
                            {isRTL && student.name_en && (
                              <p className="text-xs text-gray-500">{student.name_en}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {student.university_email || student.personal_email || student.email || student.user?.email || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {isRTL ? student.program?.name_ar : student.program?.name_en || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {student.admission_date
                            ? new Date(student.admission_date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')
                            : student.created_at
                            ? new Date(student.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')
                            : '-'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Students Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700 text-sm text-gray-500 dark:text-gray-400">
            {isRTL
              ? `عرض ${filteredStudents.length} من ${students.length} طالب`
              : `Showing ${filteredStudents.length} of ${students.length} students`}
          </div>
        </div>
      )}

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
                          {new Date(log.created_at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
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
