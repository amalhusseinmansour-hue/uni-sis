import React, { useState } from 'react';
import {
  UserCheck,
  UserPlus,
  TrendingUp,
  Check,
  X,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  GraduationCap,
  User,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileUp,
  Printer,
  BarChart3,
  PieChart,
  RefreshCw,
  ChevronDown,
  Building,
  Award,
  Users,
} from 'lucide-react';
import { AdmissionApplication } from '../types';
import { TRANSLATIONS } from '../constants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';

interface AdmissionsProps {
  lang: 'en' | 'ar';
  applications: AdmissionApplication[];
}

const t = {
  admissions: { en: 'Admissions', ar: 'القبول والتسجيل' },
  applications: { en: 'Applications', ar: 'الطلبات' },
  registerNewStudent: { en: 'Register New Student', ar: 'تسجيل طالب جديد' },
  totalApps: { en: 'Total Applications', ar: 'إجمالي الطلبات' },
  pendingReview: { en: 'Pending Review', ar: 'قيد المراجعة' },
  accepted: { en: 'Accepted', ar: 'مقبول' },
  statusPending: { en: 'Pending', ar: 'قيد الانتظار' },
  statusApproved: { en: 'Approved', ar: 'مقبول' },
  statusRejected: { en: 'Rejected', ar: 'مرفوض' },
  registrationSuccess: { en: 'Registration Successful', ar: 'تم التسجيل بنجاح' },
  applicantDetails: { en: 'Applicant Details', ar: 'تفاصيل المتقدم' },
  contactInfo: { en: 'Contact Information', ar: 'معلومات الاتصال' },
  academicBackground: { en: 'Academic Background', ar: 'الخلفية الأكاديمية' },
  applicationDate: { en: 'Application Date', ar: 'تاريخ التقديم' },
  filterByStatus: { en: 'Filter by Status', ar: 'تصفية حسب الحالة' },
  filterByProgram: { en: 'Filter by Program', ar: 'تصفية حسب البرنامج' },
  searchApplicants: { en: 'Search applicants...', ar: 'بحث عن متقدمين...' },
  exportList: { en: 'Export List', ar: 'تصدير القائمة' },
  printReport: { en: 'Print Report', ar: 'طباعة التقرير' },
  refresh: { en: 'Refresh', ar: 'تحديث' },
  viewDetails: { en: 'View Details', ar: 'عرض التفاصيل' },
  sendEmail: { en: 'Send Email', ar: 'إرسال بريد' },
  scheduleInterview: { en: 'Schedule Interview', ar: 'جدولة مقابلة' },
  acceptanceRate: { en: 'Acceptance Rate', ar: 'معدل القبول' },
  avgScore: { en: 'Avg. Score', ar: 'متوسط الدرجات' },
  thisWeek: { en: 'This Week', ar: 'هذا الأسبوع' },
  applicationsOverview: { en: 'Applications Overview', ar: 'نظرة عامة على الطلبات' },
  byProgram: { en: 'By Program', ar: 'حسب البرنامج' },
  byMonth: { en: 'By Month', ar: 'حسب الشهر' },
  recentApplications: { en: 'Recent Applications', ar: 'الطلبات الأخيرة' },
  quickActions: { en: 'Quick Actions', ar: 'إجراءات سريعة' },
  bulkApprove: { en: 'Bulk Approve', ar: 'قبول جماعي' },
  bulkReject: { en: 'Bulk Reject', ar: 'رفض جماعي' },
  selectedItems: { en: 'selected', ar: 'محدد' },
  clearSelection: { en: 'Clear Selection', ar: 'إلغاء التحديد' },
  noApplicationsFound: { en: 'No applications found', ar: 'لم يتم العثور على طلبات' },
  documentUpload: { en: 'Document Upload', ar: 'رفع المستندات' },
  uploadDocuments: { en: 'Upload Documents', ar: 'رفع المستندات' },
  documentStatus: { en: 'Document Status', ar: 'حالة المستندات' },
  complete: { en: 'Complete', ar: 'مكتمل' },
  incomplete: { en: 'Incomplete', ar: 'غير مكتمل' },
  male: { en: 'Male', ar: 'ذكر' },
  female: { en: 'Female', ar: 'أنثى' },
  gender: { en: 'Gender', ar: 'الجنس' },
  city: { en: 'City', ar: 'المدينة' },
  close: { en: 'Close', ar: 'إغلاق' },
  viewAll: { en: 'View All', ar: 'عرض الكل' },
  applicant: { en: 'Applicant', ar: 'المتقدم' },
  program: { en: 'Program', ar: 'البرنامج' },
  score: { en: 'Score', ar: 'الدرجة' },
  status: { en: 'Status', ar: 'الحالة' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  all: { en: 'All', ar: 'الكل' },
  nationalId: { en: 'National ID', ar: 'الرقم الوطني' },
  approve: { en: 'Approve', ar: 'قبول' },
  reject: { en: 'Reject', ar: 'رفض' },
  fullName: { en: 'Full Name', ar: 'الاسم الكامل' },
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  backToApps: { en: 'Back to Applications', ar: 'العودة للطلبات' },
  step: { en: 'Step', ar: 'الخطوة' },
  personalInfo: { en: 'Personal Information', ar: 'المعلومات الشخصية' },
  academicDetails: { en: 'Academic Details', ar: 'التفاصيل الأكاديمية' },
  financialPrereq: { en: 'Financial Prerequisites', ar: 'المتطلبات المالية' },
  review: { en: 'Review', ar: 'مراجعة' },
  phone: { en: 'Phone', ar: 'الهاتف' },
  dob: { en: 'Date of Birth', ar: 'تاريخ الميلاد' },
  address: { en: 'Address', ar: 'العنوان' },
  highSchool: { en: 'High School', ar: 'الثانوية' },
  semester: { en: 'Semester', ar: 'الفصل الدراسي' },
  scholarship: { en: 'Apply for Scholarship', ar: 'التقدم لمنحة' },
  paymentMethod: { en: 'Payment Method', ar: 'طريقة الدفع' },
  cash: { en: 'Cash', ar: 'نقدي' },
  card: { en: 'Card', ar: 'بطاقة' },
  transfer: { en: 'Bank Transfer', ar: 'تحويل بنكي' },
  initialDeposit: { en: 'Initial Deposit', ar: 'الدفعة الأولى' },
  next: { en: 'Next', ar: 'التالي' },
  previous: { en: 'Previous', ar: 'السابق' },
  submit: { en: 'Submit', ar: 'إرسال' },
  fullNameAr: { en: 'Full Name (Arabic)', ar: 'الاسم الكامل (عربي)' },
  terms: { en: 'I agree to the terms and conditions', ar: 'أوافق على الشروط والأحكام' },
  submitApplication: { en: 'Submit Application', ar: 'تقديم الطلب' },
};

const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ec4899'];

const Admissions: React.FC<AdmissionsProps> = ({ lang, applications: initialApps }) => {
  const [apps, setApps] = useState(initialApps);
  const [view, setView] = useState<'dashboard' | 'list' | 'register'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [showDetailModal, setShowDetailModal] = useState<AdmissionApplication | null>(null);

  const isRTL = lang === 'ar';

  // Registration Form State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    fullNameAr: '',
    email: '',
    phone: '',
    nationalId: '',
    dob: '',
    gender: 'male',
    city: '',
    address: '',
    highSchool: '',
    score: '',
    program: 'Computer Science',
    semester: 'Fall 2024',
    scholarship: false,
    paymentMethod: 'Cash',
    deposit: '',
    terms: false,
  });

  // Filter applications
  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.nationalId.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesProgram = programFilter === 'all' || app.program === programFilter;
    return matchesSearch && matchesStatus && matchesProgram;
  });

  // Statistics
  const stats = {
    pending: apps.filter((a) => a.status === 'PENDING').length,
    approved: apps.filter((a) => a.status === 'APPROVED').length,
    rejected: apps.filter((a) => a.status === 'REJECTED').length,
    total: apps.length,
    acceptanceRate: apps.length > 0 ? Math.round((apps.filter((a) => a.status === 'APPROVED').length / apps.length) * 100) : 0,
    avgScore: apps.length > 0 ? Math.round(apps.reduce((sum, a) => sum + a.highSchoolScore, 0) / apps.length) : 0,
    thisWeek: apps.filter((a) => {
      const appDate = new Date(a.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return appDate >= weekAgo;
    }).length,
  };

  // Chart data
  const programData = [
    { name: 'Computer Science', value: apps.filter((a) => a.program === 'Computer Science').length, color: '#3b82f6' },
    { name: 'Engineering', value: apps.filter((a) => a.program === 'Engineering').length, color: '#22c55e' },
    { name: 'Medicine', value: apps.filter((a) => a.program === 'Medicine').length, color: '#f97316' },
    { name: 'Business', value: apps.filter((a) => a.program === 'Business').length, color: '#8b5cf6' },
  ];

  const monthlyData = [
    { month: lang === 'ar' ? 'يناير' : 'Jan', applications: 45 },
    { month: lang === 'ar' ? 'فبراير' : 'Feb', applications: 52 },
    { month: lang === 'ar' ? 'مارس' : 'Mar', applications: 78 },
    { month: lang === 'ar' ? 'أبريل' : 'Apr', applications: 65 },
    { month: lang === 'ar' ? 'مايو' : 'May', applications: 90 },
    { month: lang === 'ar' ? 'يونيو' : 'Jun', applications: 85 },
  ];

  const statusData = [
    { name: t.statusPending[lang], value: stats.pending, color: '#eab308' },
    { name: t.statusApproved[lang], value: stats.approved, color: '#22c55e' },
    { name: t.statusRejected[lang], value: stats.rejected, color: '#ef4444' },
  ];

  const handleStatusChange = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setApps(apps.map((app) => (app.id === id ? { ...app, status: newStatus } : app)));
  };

  const handleBulkAction = (action: 'APPROVED' | 'REJECTED') => {
    setApps(apps.map((app) => (selectedApps.includes(app.id) ? { ...app, status: action } : app)));
    setSelectedApps([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    alert(t.registrationSuccess[lang]);
    setFormData({
      fullName: '',
      fullNameAr: '',
      email: '',
      phone: '',
      nationalId: '',
      dob: '',
      gender: 'male',
      city: '',
      address: '',
      highSchool: '',
      score: '',
      program: 'Computer Science',
      semester: 'Fall 2024',
      scholarship: false,
      paymentMethod: 'Cash',
      deposit: '',
      terms: false,
    });
    setStep(1);
    setView('dashboard');
  };

  const toggleSelectApp = (id: string) => {
    setSelectedApps((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedApps.length === filteredApps.length) {
      setSelectedApps([]);
    } else {
      setSelectedApps(filteredApps.map((a) => a.id));
    }
  };

  const programs = ['Computer Science', 'Engineering', 'Medicine', 'Business'];

  // --- Dashboard View ---
  if (view === 'dashboard') {
    return (
      <div className={`space-y-6 animate-in fade-in duration-300 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-800">{t.admissions[lang]}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              {t.applications[lang]}
            </button>
            <button
              onClick={() => setView('register')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              {t.registerNewStudent[lang]}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.totalApps[lang]}</p>
                <p className="text-xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.pendingReview[lang]}</p>
                <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.accepted[lang]}</p>
                <p className="text-xl font-bold text-green-600">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.statusRejected[lang]}</p>
                <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.acceptanceRate[lang]}</p>
                <p className="text-xl font-bold text-purple-600">{stats.acceptanceRate}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.avgScore[lang]}</p>
                <p className="text-xl font-bold text-orange-600">{stats.avgScore}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Calendar className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.thisWeek[lang]}</p>
                <p className="text-xl font-bold text-teal-600">{stats.thisWeek}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Trend */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{t.byMonth[lang]}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="applications"
                  name={t.applications[lang]}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{t.applicationsOverview[lang]}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RechartsPieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Program Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{t.byProgram[lang]}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={programData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name={t.applications[lang]} radius={[8, 8, 0, 0]}>
                {programData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">{t.recentApplications[lang]}</h3>
            <button onClick={() => setView('list')} className="text-sm text-blue-600 font-medium hover:underline">
              {t.viewAll[lang]}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.applicant[lang]}</th>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.program[lang]}</th>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.score[lang]}</th>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.status[lang]}</th>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.actions[lang]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apps.slice(0, 5).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{app.fullName}</p>
                      <p className="text-xs text-slate-500">{app.email}</p>
                    </td>
                    <td className="p-4 text-slate-600">{app.program}</td>
                    <td className="p-4 font-bold text-slate-700">{app.highSchoolScore}%</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          app.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : app.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {app.status === 'APPROVED'
                          ? t.statusApproved[lang]
                          : app.status === 'REJECTED'
                          ? t.statusRejected[lang]
                          : t.statusPending[lang]}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setShowDetailModal(app)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {t.viewDetails[lang]}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- List View ---
  if (view === 'list') {
    return (
      <div className={`space-y-6 animate-in fade-in duration-300 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('dashboard')}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
            <h2 className="text-2xl font-bold text-slate-800">{t.applications[lang]}</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('register')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {t.registerNewStudent[lang]}
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchApplicants[lang]}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">{t.all[lang]} {t.status[lang]}</option>
              <option value="PENDING">{t.statusPending[lang]}</option>
              <option value="APPROVED">{t.statusApproved[lang]}</option>
              <option value="REJECTED">{t.statusRejected[lang]}</option>
            </select>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">{t.all[lang]} {t.program[lang]}</option>
              {programs.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50" title={t.exportList[lang]}>
                <Download className="w-4 h-4 text-slate-600" />
              </button>
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50" title={t.printReport[lang]}>
                <Printer className="w-4 h-4 text-slate-600" />
              </button>
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50" title={t.refresh[lang]}>
                <RefreshCw className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedApps.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <span className="text-blue-700 font-medium">
              {selectedApps.length} {t.selectedItems[lang]}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('APPROVED')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {t.bulkApprove[lang]}
              </button>
              <button
                onClick={() => handleBulkAction('REJECTED')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {t.bulkReject[lang]}
              </button>
              <button
                onClick={() => setSelectedApps([])}
                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                {t.clearSelection[lang]}
              </button>
            </div>
          </div>
        )}

        {/* Applications Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedApps.length === filteredApps.length && filteredApps.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.applicant[lang]}</th>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.nationalId[lang]}</th>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.score[lang]}</th>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.program[lang]}</th>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.applicationDate[lang]}</th>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.status[lang]}</th>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.actions[lang]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      {t.noApplicationsFound[lang]}
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedApps.includes(app.id)}
                          onChange={() => toggleSelectApp(app.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-slate-800">{app.fullName}</p>
                        <p className="text-xs text-slate-500">{app.email}</p>
                      </td>
                      <td className="p-4 text-slate-600 font-mono">{app.nationalId}</td>
                      <td className="p-4">
                        <span
                          className={`font-bold ${
                            app.highSchoolScore >= 90
                              ? 'text-green-600'
                              : app.highSchoolScore >= 75
                              ? 'text-blue-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {app.highSchoolScore}%
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{app.program}</td>
                      <td className="p-4 text-slate-500 text-sm">{app.date}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            app.status === 'APPROVED'
                              ? 'bg-green-100 text-green-700'
                              : app.status === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {app.status === 'APPROVED'
                            ? t.statusApproved[lang]
                            : app.status === 'REJECTED'
                            ? t.statusRejected[lang]
                            : t.statusPending[lang]}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowDetailModal(app)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                            title={t.viewDetails[lang]}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {app.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(app.id, 'APPROVED')}
                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                title={t.approve[lang]}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(app.id, 'REJECTED')}
                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                title={t.reject[lang]}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">{t.applicantDetails[lang]}</h3>
                <button
                  onClick={() => setShowDetailModal(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                      showDetailModal.status === 'APPROVED'
                        ? 'bg-green-100 text-green-700'
                        : showDetailModal.status === 'REJECTED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {showDetailModal.status === 'APPROVED'
                      ? t.statusApproved[lang]
                      : showDetailModal.status === 'REJECTED'
                      ? t.statusRejected[lang]
                      : t.statusPending[lang]}
                  </span>
                  <span className="text-sm text-slate-500">{showDetailModal.date}</span>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase">{t.fullName[lang]}</label>
                    <p className="font-medium text-slate-800">{showDetailModal.fullName}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase">{t.nationalId[lang]}</label>
                    <p className="font-medium text-slate-800 font-mono">{showDetailModal.nationalId}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase">{t.email[lang]}</label>
                    <p className="font-medium text-slate-800">{showDetailModal.email}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase">{t.program[lang]}</label>
                    <p className="font-medium text-slate-800">{showDetailModal.program}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase">{t.score[lang]}</label>
                    <p className="font-bold text-2xl text-blue-600">{showDetailModal.highSchoolScore}%</p>
                  </div>
                </div>

                {/* Actions */}
                {showDetailModal.status === 'PENDING' && (
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        handleStatusChange(showDetailModal.id, 'APPROVED');
                        setShowDetailModal(null);
                      }}
                      className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {t.approve[lang]}
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(showDetailModal.id, 'REJECTED');
                        setShowDetailModal(null);
                      }}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      {t.reject[lang]}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Registration Wizard View ---
  return (
    <div className={`space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setView('dashboard')}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
          title={t.backToApps[lang]}
        >
          <ArrowLeft className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t.registerNewStudent[lang]}</h2>
          <p className="text-slate-500 text-sm">
            {t.step[lang]} {step} / 4
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-500 ease-out"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Steps Indicator */}
        <div className="lg:col-span-1 space-y-4">
          {[
            { num: 1, icon: User, label: t.personalInfo[lang] },
            { num: 2, icon: GraduationCap, label: t.academicDetails[lang] },
            { num: 3, icon: CreditCard, label: t.financialPrereq[lang] },
            { num: 4, icon: FileText, label: t.review[lang] },
          ].map((s) => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div
                key={s.num}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : isCompleted
                    ? 'text-green-600'
                    : 'text-slate-500'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-blue-600 text-white' : isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="font-medium text-sm">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="lg:col-span-3 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">
                {t.personalInfo[lang]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {lang === 'en' ? 'Full Name (English)' : 'الاسم الكامل (إنجليزي)'}
                  </label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {lang === 'en' ? 'Full Name (Arabic)' : 'الاسم الكامل (عربي)'}
                  </label>
                  <input
                    name="fullNameAr"
                    value={formData.fullNameAr}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.email[lang]}</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.nationalId[lang]}</label>
                  <input
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.phone[lang]}</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.dob[lang]}</label>
                  <input
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.gender[lang]}</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="male">{t.male[lang]}</option>
                    <option value="female">{t.female[lang]}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.city[lang]}</label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.address[lang]}</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">
                {t.academicDetails[lang]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.highSchool[lang]}</label>
                  <input
                    name="highSchool"
                    value={formData.highSchool}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.score[lang]} (%)</label>
                  <input
                    name="score"
                    type="number"
                    value={formData.score}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.program[lang]}</label>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    {programs.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.semester[lang]}</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Fall 2024">Fall 2024</option>
                    <option value="Spring 2025">Spring 2025</option>
                  </select>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 mb-4">{t.documentUpload[lang]}</h4>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                  <FileUp className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">{t.uploadDocuments[lang]}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {lang === 'en' ? 'Drag and drop or click to upload' : 'اسحب وأفلت أو انقر للرفع'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">
                {t.financialPrereq[lang]}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    name="scholarship"
                    id="scholarship"
                    checked={formData.scholarship}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="scholarship" className="text-sm font-medium text-slate-700">
                    {t.scholarship[lang]}
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.paymentMethod[lang]}</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="Cash">{t.cash[lang]}</option>
                      <option value="Card">{t.card[lang]}</option>
                      <option value="Bank Transfer">{t.transfer[lang]}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.initialDeposit[lang]}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                      <input
                        name="deposit"
                        type="number"
                        value={formData.deposit}
                        onChange={handleInputChange}
                        className="w-full pl-7 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">
                {t.review[lang]}
              </h3>

              <div className="bg-slate-50 rounded-xl p-6 space-y-4 border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide">{t.fullName[lang]}</p>
                    <p className="font-medium text-slate-800">{formData.fullName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide">{t.email[lang]}</p>
                    <p className="font-medium text-slate-800">{formData.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide">{t.phone[lang]}</p>
                    <p className="font-medium text-slate-800">{formData.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide">{t.nationalId[lang]}</p>
                    <p className="font-medium text-slate-800">{formData.nationalId || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide">{t.program[lang]}</p>
                    <p className="font-medium text-slate-800">{formData.program}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide">{t.semester[lang]}</p>
                    <p className="font-medium text-slate-800">{formData.semester}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide">{t.paymentMethod[lang]}</p>
                    <p className="font-medium text-slate-800">{formData.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide">{t.initialDeposit[lang]}</p>
                    <p className="font-medium text-slate-800">${formData.deposit || '0'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <input
                  type="checkbox"
                  name="terms"
                  id="terms"
                  checked={formData.terms}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer font-medium">
                  {t.terms[lang]}
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="px-6 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t.previous[lang]}
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-md shadow-blue-200"
              >
                {t.next[lang]} <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!formData.terms}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-green-200"
              >
                {t.submitApplication[lang]} <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admissions;
