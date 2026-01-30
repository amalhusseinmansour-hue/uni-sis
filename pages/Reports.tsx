import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  FileText,
  Users,
  GraduationCap,
  CreditCard,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Printer,
  Mail,
  Share2,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  FileSpreadsheet,
  FileType2,
  Building,
  Loader2,
} from 'lucide-react';
import { UserRole } from '../types';
import { dashboardAPI } from '../api/dashboard';
import { studentsAPI } from '../api/students';
import { admissionsApi } from '../api/admissions';
import { financeAPI } from '../api/finance';
import { enrollmentsAPI } from '../api/enrollments';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { TRANSLATIONS } from '../constants';
import { exportToCSV, exportToPDF, printPage, sendViaEmail, formatTableHTML } from '../utils/exportUtils';

interface ReportsProps {
  lang: 'en' | 'ar';
  role?: UserRole;
}

// Staff-specific translations
const staffT: Record<string, { en: string; ar: string }> = {
  staffPageTitle: { en: 'Student Affairs Reports & Analytics', ar: 'تقارير وتحليلات شؤون الطلاب' },
  staffSubtitle: { en: 'Comprehensive reports for student affairs management', ar: 'تقارير شاملة لإدارة شؤون الطلاب' },
  studentStatistics: { en: 'Student Statistics', ar: 'إحصائيات الطلاب' },
  enrollmentReports: { en: 'Enrollment Reports', ar: 'تقارير التسجيل' },
  academicReports: { en: 'Academic Reports', ar: 'التقارير الأكاديمية' },
  studentRequestsReport: { en: 'Student Requests Report', ar: 'تقرير طلبات الطلاب' },
  admissionStatistics: { en: 'Admission Statistics', ar: 'إحصائيات القبول' },
};

const t = {
  ...TRANSLATIONS,
  reports: { en: 'Reports & Analytics', ar: 'التقارير والتحليلات' },
  overview: { en: 'Overview', ar: 'نظرة عامة' },
  enrollment: { en: 'Enrollment', ar: 'التسجيل' },
  academic: { en: 'Academic', ar: 'الأكاديمية' },
  financial: { en: 'Financial', ar: 'المالية' },
  custom: { en: 'Custom Reports', ar: 'تقارير مخصصة' },
  totalStudents: { en: 'Total Students', ar: 'إجمالي الطلاب' },
  activeEnrollments: { en: 'Active Enrollments', ar: 'التسجيلات النشطة' },
  graduationRate: { en: 'Graduation Rate', ar: 'معدل التخرج' },
  retentionRate: { en: 'Retention Rate', ar: 'معدل الاستمرار' },
  averageGPA: { en: 'Average GPA', ar: 'المعدل التراكمي' },
  totalRevenue: { en: 'Total Revenue', ar: 'إجمالي الإيرادات' },
  pendingPayments: { en: 'Pending Payments', ar: 'المدفوعات المعلقة' },
  scholarships: { en: 'Scholarships', ar: 'المنح الدراسية' },
  enrollmentTrend: { en: 'Enrollment Trend', ar: 'اتجاه التسجيل' },
  gpaDistribution: { en: 'GPA Distribution', ar: 'توزيع المعدل التراكمي' },
  departmentEnrollment: { en: 'Enrollment by Department', ar: 'التسجيل حسب القسم' },
  revenueBreakdown: { en: 'Revenue Breakdown', ar: 'تفصيل الإيرادات' },
  monthlyRevenue: { en: 'Monthly Revenue', ar: 'الإيرادات الشهرية' },
  studentPerformance: { en: 'Student Performance', ar: 'أداء الطلاب' },
  courseCompletion: { en: 'Course Completion', ar: 'إكمال المقررات' },
  attendanceRate: { en: 'Attendance Rate', ar: 'معدل الحضور' },
  export: { en: 'Export', ar: 'تصدير' },
  print: { en: 'Print', ar: 'طباعة' },
  share: { en: 'Share', ar: 'مشاركة' },
  refresh: { en: 'Refresh', ar: 'تحديث' },
  lastUpdated: { en: 'Last updated', ar: 'آخر تحديث' },
  selectPeriod: { en: 'Select Period', ar: 'اختر الفترة' },
  thisMonth: { en: 'This Month', ar: 'هذا الشهر' },
  lastMonth: { en: 'Last Month', ar: 'الشهر الماضي' },
  thisYear: { en: 'This Year', ar: 'هذا العام' },
  lastYear: { en: 'Last Year', ar: 'العام الماضي' },
  customRange: { en: 'Custom Range', ar: 'نطاق مخصص' },
  generateReport: { en: 'Generate Report', ar: 'إنشاء تقرير' },
  reportType: { en: 'Report Type', ar: 'نوع التقرير' },
  selectType: { en: 'Select Type', ar: 'اختر النوع' },
  studentReport: { en: 'Student Report', ar: 'تقرير الطلاب' },
  financialReport: { en: 'Financial Report', ar: 'تقرير مالي' },
  courseReport: { en: 'Course Report', ar: 'تقرير المقررات' },
  attendanceReport: { en: 'Attendance Report', ar: 'تقرير الحضور' },
  performanceMetrics: { en: 'Performance Metrics', ar: 'مقاييس الأداء' },
  vsLastPeriod: { en: 'vs last period', ar: 'مقارنة بالفترة السابقة' },
  topPerformers: { en: 'Top Performers', ar: 'الأفضل أداءً' },
  needsAttention: { en: 'Needs Attention', ar: 'يحتاج اهتماماً' },
};

// Mock data
const enrollmentTrendData = [
  { month: 'Jan', students: 1200, newEnrollments: 150 },
  { month: 'Feb', students: 1280, newEnrollments: 120 },
  { month: 'Mar', students: 1350, newEnrollments: 180 },
  { month: 'Apr', students: 1420, newEnrollments: 140 },
  { month: 'May', students: 1380, newEnrollments: 100 },
  { month: 'Jun', students: 1450, newEnrollments: 160 },
  { month: 'Jul', students: 1520, newEnrollments: 200 },
  { month: 'Aug', students: 1680, newEnrollments: 280 },
  { month: 'Sep', students: 1850, newEnrollments: 350 },
  { month: 'Oct', students: 1920, newEnrollments: 180 },
  { month: 'Nov', students: 1950, newEnrollments: 120 },
  { month: 'Dec', students: 2000, newEnrollments: 100 },
];

const departmentData = [
  { name: 'Computer Science', students: 450, color: '#3B82F6' },
  { name: 'Engineering', students: 380, color: '#10B981' },
  { name: 'Business', students: 320, color: '#F59E0B' },
  { name: 'Medicine', students: 280, color: '#EF4444' },
  { name: 'Arts', students: 220, color: '#8B5CF6' },
  { name: 'Science', students: 350, color: '#06B6D4' },
];

const gpaDistributionData = [
  { range: '3.5-4.0', count: 420, label: 'Excellent' },
  { range: '3.0-3.49', count: 580, label: 'Very Good' },
  { range: '2.5-2.99', count: 450, label: 'Good' },
  { range: '2.0-2.49', count: 320, label: 'Satisfactory' },
  { range: 'Below 2.0', count: 130, label: 'Needs Improvement' },
];

const revenueData = [
  { month: 'Jan', tuition: 450000, fees: 50000, other: 20000 },
  { month: 'Feb', tuition: 420000, fees: 45000, other: 18000 },
  { month: 'Mar', tuition: 480000, fees: 55000, other: 22000 },
  { month: 'Apr', tuition: 460000, fees: 52000, other: 21000 },
  { month: 'May', tuition: 440000, fees: 48000, other: 19000 },
  { month: 'Jun', tuition: 500000, fees: 60000, other: 25000 },
];

const performanceData = [
  { subject: 'Assignments', A: 85, B: 75 },
  { subject: 'Exams', A: 78, B: 70 },
  { subject: 'Projects', A: 90, B: 82 },
  { subject: 'Attendance', A: 92, B: 88 },
  { subject: 'Participation', A: 88, B: 80 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const Reports: React.FC<ReportsProps> = ({ lang, role }) => {
  const toast = useToast();
  const isStaff = role === UserRole.STUDENT_AFFAIRS || role === UserRole.ADMIN;
  const [activeTab, setActiveTab] = useState<'overview' | 'enrollment' | 'academic' | 'financial' | 'custom'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('thisYear');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Real data state
  const [realStats, setRealStats] = useState({
    // Students
    totalStudents: 0,
    activeStudents: 0,
    suspendedStudents: 0,
    graduatedStudents: 0,
    // Admissions
    totalApplications: 0,
    pendingApplications: 0,
    underReviewApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    todayApplications: 0,
    weekApplications: 0,
    // Enrollments
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    droppedEnrollments: 0,
    // Financial
    totalRevenue: 0,
    pendingPayments: 0,
    paidPayments: 0,
    overduePayments: 0,
    // Service Requests
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
  });
  const [admissionStats, setAdmissionStats] = useState<any>(null);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [programStats, setProgramStats] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  const isRTL = lang === 'ar';

  // Theme colors based on staff role
  const themeColors = {
    primary: isStaff ? 'emerald' : 'blue',
    primaryBg: isStaff ? 'bg-emerald-600' : 'bg-blue-600',
    primaryHover: isStaff ? 'hover:bg-emerald-700' : 'hover:bg-blue-700',
    primaryText: isStaff ? 'text-emerald-600' : 'text-blue-600',
    primaryBgLight: isStaff ? 'bg-emerald-50' : 'bg-blue-50',
    primaryBorder: isStaff ? 'border-emerald-600' : 'border-blue-600',
  };

  // Fetch real data from APIs
  const fetchReportData = async () => {
    try {
      // Fetch dashboard stats, admissions stats, students, and financial stats in parallel
      const [dashStats, admStats, studentsRes, finStats] = await Promise.all([
        dashboardAPI.getStats().catch(() => ({})),
        admissionsApi.getStatistics().catch(() => null),
        studentsAPI.getAll({ per_page: 1000 }).catch(() => ({ data: [], meta: { total: 0 } })),
        financeAPI.getStatistics().catch(() => null),
      ]);

      console.log('Dashboard Stats:', dashStats);
      console.log('Admission Stats:', admStats);
      console.log('Students:', studentsRes);
      console.log('Finance Stats:', finStats);

      // Process dashboard stats (handle nested structure from STUDENT_AFFAIRS role)
      const studentsData = dashStats?.students || {};
      const admissionsData = dashStats?.admissions || {};
      const enrollmentsData = dashStats?.enrollments || {};
      const financialData = dashStats?.financial || {};
      const serviceRequestsData = dashStats?.service_requests || {};

      // Store recent applications if available
      if (dashStats?.recent_applications) {
        setRecentApplications(dashStats.recent_applications);
      }

      // Initialize with dashboard data - comprehensive mapping
      setRealStats(prev => ({
        ...prev,
        // Students
        totalStudents: studentsData?.total || 0,
        activeStudents: studentsData?.active || 0,
        suspendedStudents: studentsData?.suspended || 0,
        graduatedStudents: studentsData?.graduated || 0,
        // Admissions
        totalApplications: admissionsData?.total || 0,
        pendingApplications: admissionsData?.pending || 0,
        underReviewApplications: admissionsData?.under_review || 0,
        approvedApplications: admissionsData?.approved || 0,
        rejectedApplications: admissionsData?.rejected || 0,
        todayApplications: admissionsData?.today || 0,
        weekApplications: admissionsData?.this_week || 0,
        // Enrollments
        totalEnrollments: enrollmentsData?.total || 0,
        activeEnrollments: enrollmentsData?.enrolled || 0,
        completedEnrollments: enrollmentsData?.completed || 0,
        droppedEnrollments: enrollmentsData?.dropped || 0,
        // Financial
        totalRevenue: financialData?.total_credit || financialData?.total_received || financialData?.total_receivable || 0,
        pendingPayments: financialData?.pending_amount || financialData?.pending || 0,
        paidPayments: financialData?.paid_amount || 0,
        overduePayments: financialData?.overdue_amount || financialData?.overdue || 0,
        // Service Requests
        totalRequests: serviceRequestsData?.total || 0,
        pendingRequests: serviceRequestsData?.pending || 0,
        completedRequests: serviceRequestsData?.completed || 0,
      }));

      // Process admission stats (from dedicated endpoint)
      if (admStats) {
        setAdmissionStats(admStats);
        setRealStats(prev => ({
          ...prev,
          pendingApplications: (admStats.pending || 0) + (admStats.under_review || 0) + (admStats.documents_verified || 0) + (admStats.pending_payment || 0),
          approvedApplications: admStats.approved || prev.approvedApplications,
          rejectedApplications: admStats.rejected || prev.rejectedApplications,
        }));
      }

      // Process students list
      const students = studentsRes?.data || [];
      setStudentsList(students);

      // Update total students from students list if dashboard didn't have it
      if (students.length > 0) {
        setRealStats(prev => ({
          ...prev,
          totalStudents: prev.totalStudents || students.length,
          activeEnrollments: prev.activeEnrollments || students.filter((s: any) => s.status === 'ACTIVE' || s.status === 'active').length,
        }));
      }

      // Process program statistics
      const programCounts: Record<string, { name: string; nameAr: string; count: number }> = {};
      students.forEach((student: any) => {
        const programName = student.program?.name_en || student.program?.name || student.program_name || 'Unknown';
        const programNameAr = student.program?.name_ar || programName;
        if (!programCounts[programName]) {
          programCounts[programName] = { name: programName, nameAr: programNameAr, count: 0 };
        }
        programCounts[programName].count++;
      });
      setProgramStats(Object.values(programCounts));

      // Process financial stats (from dedicated endpoint)
      if (finStats) {
        setRealStats(prev => ({
          ...prev,
          totalRevenue: finStats.total_credits || finStats.total_credit || finStats.total_revenue || prev.totalRevenue,
          pendingPayments: finStats.pending_amount || finStats.total_pending || prev.pendingPayments,
          paidPayments: finStats.paid_amount || finStats.total_paid || prev.paidPayments,
        }));
      }

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchReportData();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchReportData();
  };

  // Export handlers
  const handleExportPDF = () => {
    setShowExportMenu(false);

    // Generate report content based on active tab
    let reportContent = '';
    const tabTitles: Record<string, { en: string; ar: string }> = {
      overview: { en: 'Overview Report', ar: 'تقرير نظرة عامة' },
      enrollment: { en: 'Enrollment Report', ar: 'تقرير التسجيل' },
      academic: { en: 'Academic Report', ar: 'تقرير الأكاديمي' },
      financial: { en: 'Financial Report', ar: 'تقرير مالي' },
      custom: { en: 'Custom Report', ar: 'تقرير مخصص' },
    };

    const title = tabTitles[activeTab][lang];

    // Build content based on active tab
    if (activeTab === 'overview') {
      reportContent = `
        <div class="content-section">
          <h3 class="section-title">${isRTL ? 'ملخص الإحصائيات' : 'Statistics Summary'}</h3>
          <div class="info-grid three-cols">
            ${statCards.map(stat => `
              <div class="info-item">
                <label>${stat.title}</label>
                <span>${stat.value} <small style="color: ${stat.trend === 'up' ? '#059669' : '#dc2626'}">(${stat.change})</small></span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="content-section">
          <h3 class="section-title">${t.enrollmentTrend[lang]}</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>${isRTL ? 'الشهر' : 'Month'}</th>
                <th>${isRTL ? 'إجمالي الطلاب' : 'Total Students'}</th>
                <th>${isRTL ? 'التسجيلات الجديدة' : 'New Enrollments'}</th>
              </tr>
            </thead>
            <tbody>
              ${enrollmentTrendData.map(row => `
                <tr>
                  <td>${row.month}</td>
                  <td class="center">${row.students.toLocaleString()}</td>
                  <td class="center">${row.newEnrollments.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="content-section">
          <h3 class="section-title">${t.departmentEnrollment[lang]}</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>${isRTL ? 'القسم' : 'Department'}</th>
                <th>${isRTL ? 'عدد الطلاب' : 'Students'}</th>
              </tr>
            </thead>
            <tbody>
              ${departmentData.map(row => `
                <tr>
                  <td>${row.name}</td>
                  <td class="center">${row.students.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (activeTab === 'enrollment') {
      reportContent = `
        <div class="content-section">
          <h3 class="section-title">${t.enrollmentTrend[lang]}</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>${isRTL ? 'الشهر' : 'Month'}</th>
                <th>${isRTL ? 'إجمالي الطلاب' : 'Total Students'}</th>
                <th>${isRTL ? 'التسجيلات الجديدة' : 'New Enrollments'}</th>
              </tr>
            </thead>
            <tbody>
              ${enrollmentTrendData.map(row => `
                <tr>
                  <td>${row.month}</td>
                  <td class="center">${row.students.toLocaleString()}</td>
                  <td class="center">${row.newEnrollments.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (activeTab === 'academic') {
      reportContent = `
        <div class="content-section">
          <h3 class="section-title">${t.gpaDistribution[lang]}</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>${isRTL ? 'النطاق' : 'Range'}</th>
                <th>${isRTL ? 'التصنيف' : 'Classification'}</th>
                <th>${isRTL ? 'العدد' : 'Count'}</th>
              </tr>
            </thead>
            <tbody>
              ${gpaDistributionData.map(row => `
                <tr>
                  <td>${row.range}</td>
                  <td>${row.label}</td>
                  <td class="center">${row.count.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (activeTab === 'financial') {
      reportContent = `
        <div class="content-section">
          <h3 class="section-title">${t.monthlyRevenue[lang]}</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>${isRTL ? 'الشهر' : 'Month'}</th>
                <th>${isRTL ? 'الرسوم الدراسية' : 'Tuition'}</th>
                <th>${isRTL ? 'الرسوم' : 'Fees'}</th>
                <th>${isRTL ? 'أخرى' : 'Other'}</th>
                <th>${isRTL ? 'الإجمالي' : 'Total'}</th>
              </tr>
            </thead>
            <tbody>
              ${revenueData.map(row => `
                <tr>
                  <td>${row.month}</td>
                  <td class="center">${row.tuition.toLocaleString()}</td>
                  <td class="center">${row.fees.toLocaleString()}</td>
                  <td class="center">${row.other.toLocaleString()}</td>
                  <td class="center"><strong>${(row.tuition + row.fees + row.other).toLocaleString()}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      reportContent = `
        <div class="content-section">
          <p style="text-align: center; padding: 40px; color: #64748b;">
            ${isRTL ? 'يرجى إنشاء تقرير مخصص أولاً' : 'Please generate a custom report first'}
          </p>
        </div>
      `;
    }

    exportToPDF(
      tabTitles[activeTab].en,
      reportContent,
      `report-${activeTab}-${new Date().toISOString().split('T')[0]}`,
      lang,
      tabTitles[activeTab].ar
    );
  };

  const handleExportExcel = () => {
    setShowExportMenu(false);

    let data: any[] = [];
    let filename = 'report';
    let headers: string[] = [];

    if (activeTab === 'overview' || activeTab === 'enrollment') {
      data = enrollmentTrendData.map(row => ({
        [isRTL ? 'الشهر' : 'Month']: row.month,
        [isRTL ? 'إجمالي الطلاب' : 'Total Students']: row.students,
        [isRTL ? 'التسجيلات الجديدة' : 'New Enrollments']: row.newEnrollments,
      }));
      filename = `enrollment-trend-${new Date().toISOString().split('T')[0]}`;
    } else if (activeTab === 'academic') {
      data = gpaDistributionData.map(row => ({
        [isRTL ? 'النطاق' : 'Range']: row.range,
        [isRTL ? 'التصنيف' : 'Classification']: row.label,
        [isRTL ? 'العدد' : 'Count']: row.count,
      }));
      filename = `gpa-distribution-${new Date().toISOString().split('T')[0]}`;
    } else if (activeTab === 'financial') {
      data = revenueData.map(row => ({
        [isRTL ? 'الشهر' : 'Month']: row.month,
        [isRTL ? 'الرسوم الدراسية' : 'Tuition']: row.tuition,
        [isRTL ? 'الرسوم' : 'Fees']: row.fees,
        [isRTL ? 'أخرى' : 'Other']: row.other,
        [isRTL ? 'الإجمالي' : 'Total']: row.tuition + row.fees + row.other,
      }));
      filename = `financial-report-${new Date().toISOString().split('T')[0]}`;
    } else {
      data = departmentData.map(row => ({
        [isRTL ? 'القسم' : 'Department']: row.name,
        [isRTL ? 'عدد الطلاب' : 'Students']: row.students,
      }));
      filename = `department-enrollment-${new Date().toISOString().split('T')[0]}`;
    }

    if (data.length > 0) {
      exportToCSV(data, filename);
    }
  };

  const handlePrint = () => {
    setShowExportMenu(false);
    window.print();
  };

  const handleSendEmail = () => {
    setShowExportMenu(false);
    const subject = isRTL ? `تقرير ${t[activeTab as keyof typeof t]?.[lang] || activeTab}` : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report`;
    const body = isRTL
      ? `مرفق تقرير ${activeTab} من نظام معلومات الطلاب - جامعة فيرتكس`
      : `Please find attached the ${activeTab} report from Vertex University SIS.`;
    sendViaEmail(subject, body);
  };

  const tabs = [
    { key: 'overview', label: t.overview[lang], icon: BarChart3 },
    { key: 'enrollment', label: t.enrollment[lang], icon: Users },
    { key: 'academic', label: t.academic[lang], icon: GraduationCap },
    { key: 'financial', label: t.financial[lang], icon: CreditCard },
    { key: 'custom', label: t.custom[lang], icon: FileText },
  ];

  const periods = [
    { key: 'thisMonth', label: t.thisMonth[lang] },
    { key: 'lastMonth', label: t.lastMonth[lang] },
    { key: 'thisYear', label: t.thisYear[lang] },
    { key: 'lastYear', label: t.lastYear[lang] },
    { key: 'custom', label: t.customRange[lang] },
  ];

  const statCards = [
    {
      title: t.totalStudents[lang],
      value: realStats.totalStudents.toLocaleString(),
      change: lang === 'ar' ? `${realStats.activeStudents} نشط` : `${realStats.activeStudents} active`,
      trend: 'up',
      icon: Users,
      color: 'blue',
    },
    {
      title: lang === 'ar' ? 'إجمالي طلبات القبول' : 'Total Applications',
      value: realStats.totalApplications.toLocaleString(),
      change: lang === 'ar' ? `${realStats.weekApplications} هذا الأسبوع` : `${realStats.weekApplications} this week`,
      trend: realStats.weekApplications > 0 ? 'up' : 'down',
      icon: FileText,
      color: 'purple',
    },
    {
      title: lang === 'ar' ? 'طلبات القبول المعلقة' : 'Pending Applications',
      value: realStats.pendingApplications.toLocaleString(),
      change: lang === 'ar' ? `${realStats.underReviewApplications} قيد المراجعة` : `${realStats.underReviewApplications} under review`,
      trend: realStats.pendingApplications > 0 ? 'up' : 'down',
      icon: AlertCircle,
      color: 'orange',
    },
    {
      title: lang === 'ar' ? 'الطلبات المقبولة' : 'Approved Applications',
      value: realStats.approvedApplications.toLocaleString(),
      change: lang === 'ar' ? `${realStats.rejectedApplications} مرفوض` : `${realStats.rejectedApplications} rejected`,
      trend: 'up',
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: lang === 'ar' ? 'التسجيلات النشطة' : 'Active Enrollments',
      value: realStats.activeEnrollments.toLocaleString(),
      change: lang === 'ar' ? `${realStats.completedEnrollments} مكتمل` : `${realStats.completedEnrollments} completed`,
      trend: 'up',
      icon: GraduationCap,
      color: 'emerald',
    },
    {
      title: lang === 'ar' ? 'طلبات الخدمة' : 'Service Requests',
      value: realStats.totalRequests.toLocaleString(),
      change: lang === 'ar' ? `${realStats.pendingRequests} معلق` : `${realStats.pendingRequests} pending`,
      trend: realStats.pendingRequests > 0 ? 'up' : 'down',
      icon: Clock,
      color: 'cyan',
    },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    cyan: 'bg-cyan-100 text-cyan-600',
  };

  // Generate real program data for charts
  const realProgramChartData = programStats.length > 0 ? programStats.map((p, i) => ({
    name: lang === 'ar' ? p.nameAr : p.name,
    students: p.count,
    color: COLORS[i % COLORS.length],
  })) : departmentData;

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
            <p className="text-slate-500">{lang === 'ar' ? 'جاري تحميل البيانات...' : 'Loading data...'}</p>
          </div>
        </div>
      )}

      {!loading && (
        <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`flex items-center text-xs font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.title}</p>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{t.enrollmentTrend[lang]}</h3>
              <button className="p-2 hover:bg-slate-100 rounded-lg">
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={enrollmentTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="newEnrollments"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Department Enrollment */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{lang === 'ar' ? 'التسجيل حسب البرنامج' : 'Enrollment by Program'}</h3>
              <button className="p-2 hover:bg-slate-100 rounded-lg">
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={realProgramChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="students"
                >
                  {realProgramChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {realProgramChartData.map((dept, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                  <span className="text-xs text-slate-600">{dept.name}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{t.gpaDistribution[lang]}</h3>
              <button className="p-2 hover:bg-slate-100 rounded-lg">
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gpaDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="range" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{t.revenueBreakdown[lang]}</h3>
              <button className="p-2 hover:bg-slate-100 rounded-lg">
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                />
                <Legend />
                <Bar dataKey="tuition" name="Tuition" fill="#3B82F6" stackId="a" />
                <Bar dataKey="fees" name="Fees" fill="#10B981" stackId="a" />
                <Bar dataKey="other" name="Other" fill="#F59E0B" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Performance Radar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">{t.performanceMetrics[lang]}</h3>
            <button className="p-2 hover:bg-slate-100 rounded-lg">
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={performanceData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <Radar name="This Year" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Radar name="Last Year" dataKey="B" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.2} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full lg:w-1/2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">{t.topPerformers[lang]}</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">324</p>
                  <p className="text-xs text-green-600">{lang === 'en' ? 'GPA above 3.5' : 'معدل أعلى من 3.5'}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">{t.needsAttention[lang]}</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-700">87</p>
                  <p className="text-xs text-amber-600">{lang === 'en' ? 'GPA below 2.0' : 'معدل أقل من 2.0'}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-600 mb-2">{t.courseCompletion[lang]}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: '87%' }} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">87%</span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
        </>
      )}
    </div>
  );

  // Enrollment Tab - Detailed enrollment analytics
  const renderEnrollmentTab = () => (
    <div className="space-y-6">
      {/* Enrollment Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: lang === 'en' ? 'New Enrollments' : 'التسجيلات الجديدة', value: '350', change: '+15%', color: 'blue' },
          { label: lang === 'en' ? 'Withdrawals' : 'الانسحابات', value: '23', change: '-5%', color: 'red' },
          { label: lang === 'en' ? 'Transfers In' : 'المنقولون إلينا', value: '45', change: '+8%', color: 'green' },
          { label: lang === 'en' ? 'Transfers Out' : 'المنقولون منا', value: '12', change: '-2%', color: 'orange' },
        ].map((stat, i) => (
          <Card key={i} className="p-4">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
            <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{stat.change} {t.vsLastPeriod[lang]}</p>
          </Card>
        ))}
      </div>

      {/* Enrollment by Level */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-bold text-slate-800">{lang === 'en' ? 'Enrollment by Academic Level' : 'التسجيل حسب المستوى الأكاديمي'}</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { level: lang === 'en' ? 'Freshman' : 'مستجد', count: 520 },
                { level: lang === 'en' ? 'Sophomore' : 'سنة ثانية', count: 480 },
                { level: lang === 'en' ? 'Junior' : 'سنة ثالثة', count: 420 },
                { level: lang === 'en' ? 'Senior' : 'سنة رابعة', count: 380 },
                { level: lang === 'en' ? 'Graduate' : 'دراسات عليا', count: 200 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="level" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-bold text-slate-800">{lang === 'en' ? 'Gender Distribution' : 'توزيع الجنس'}</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: lang === 'en' ? 'Male' : 'ذكور', value: 1150, color: '#3B82F6' },
                    { name: lang === 'en' ? 'Female' : 'إناث', value: 850, color: '#EC4899' },
                  ]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#EC4899" />
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Monthly Enrollment Trend */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-800">{t.enrollmentTrend[lang]}</h3>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={enrollmentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="students" name={lang === 'en' ? 'Total Students' : 'إجمالي الطلاب'} stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
              <Line type="monotone" dataKey="newEnrollments" name={lang === 'en' ? 'New Enrollments' : 'التسجيلات الجديدة'} stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  );

  // Academic Tab - Academic performance analytics
  const renderAcademicTab = () => (
    <div className="space-y-6">
      {/* Academic Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: t.averageGPA[lang], value: '3.24', icon: TrendingUp, color: 'blue' },
          { label: lang === 'en' ? 'Honor Roll' : 'قائمة الشرف', value: '324', icon: GraduationCap, color: 'green' },
          { label: lang === 'en' ? 'Academic Warning' : 'إنذار أكاديمي', value: '87', icon: AlertCircle, color: 'orange' },
          { label: lang === 'en' ? 'Pass Rate' : 'نسبة النجاح', value: '94.2%', icon: CheckCircle, color: 'purple' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* GPA Distribution & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-bold text-slate-800">{t.gpaDistribution[lang]}</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gpaDistributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" stroke="#94A3B8" fontSize={12} />
                <YAxis dataKey="range" type="category" stroke="#94A3B8" fontSize={12} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-bold text-slate-800">{lang === 'en' ? 'Course Pass Rates' : 'نسب النجاح في المقررات'}</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {[
                { course: lang === 'en' ? 'Mathematics' : 'الرياضيات', rate: 92 },
                { course: lang === 'en' ? 'Physics' : 'الفيزياء', rate: 88 },
                { course: lang === 'en' ? 'Computer Science' : 'علوم الحاسب', rate: 95 },
                { course: lang === 'en' ? 'English' : 'اللغة الإنجليزية', rate: 91 },
                { course: lang === 'en' ? 'Chemistry' : 'الكيمياء', rate: 85 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{item.course}</span>
                    <span className="font-bold text-slate-800">{item.rate}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full">
                    <div
                      className={`h-2 rounded-full ${item.rate >= 90 ? 'bg-green-500' : item.rate >= 80 ? 'bg-blue-500' : 'bg-orange-500'}`}
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Performance Radar */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-800">{t.studentPerformance[lang]}</h3>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={performanceData}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <Radar name={lang === 'en' ? 'This Semester' : 'هذا الفصل'} dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Radar name={lang === 'en' ? 'Last Semester' : 'الفصل السابق'} dataKey="B" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.2} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  );

  // Financial Tab - Financial analytics
  const renderFinancialTab = () => (
    <div className="space-y-6">
      {/* Financial Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: t.totalRevenue[lang], value: 'USD 2.8M', change: '+15.3%', color: 'green' },
          { label: t.pendingPayments[lang], value: 'USD 450K', change: '-8.2%', color: 'orange' },
          { label: t.scholarships[lang], value: 'USD 620K', change: '+12%', color: 'purple' },
          { label: lang === 'en' ? 'Collection Rate' : 'نسبة التحصيل', value: '87.5%', change: '+3.1%', color: 'blue' },
        ].map((stat, i) => (
          <Card key={i} className="p-4">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
            <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{stat.change} {t.vsLastPeriod[lang]}</p>
          </Card>
        ))}
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-bold text-slate-800">{t.monthlyRevenue[lang]}</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => `${v/1000}K`} />
                <Tooltip formatter={(value: number) => [`USD ${value.toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="tuition" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name={lang === 'en' ? 'Tuition' : 'الرسوم الدراسية'} />
                <Area type="monotone" dataKey="fees" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name={lang === 'en' ? 'Fees' : 'الرسوم'} />
                <Area type="monotone" dataKey="other" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name={lang === 'en' ? 'Other' : 'أخرى'} />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-bold text-slate-800">{t.revenueBreakdown[lang]}</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: lang === 'en' ? 'Tuition' : 'الرسوم الدراسية', value: 2200000, color: '#3B82F6' },
                    { name: lang === 'en' ? 'Registration Fees' : 'رسوم التسجيل', value: 350000, color: '#10B981' },
                    { name: lang === 'en' ? 'Lab Fees' : 'رسوم المعامل', value: 150000, color: '#F59E0B' },
                    { name: lang === 'en' ? 'Other' : 'أخرى', value: 100000, color: '#8B5CF6' },
                  ]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#10B981" />
                  <Cell fill="#F59E0B" />
                  <Cell fill="#8B5CF6" />
                </Pie>
                <Tooltip formatter={(value: number) => [`USD ${value.toLocaleString()}`, '']} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Payment Status */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-800">{lang === 'en' ? 'Payment Status Overview' : 'نظرة عامة على حالة الدفع'}</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">1,520</p>
              <p className="text-sm text-green-600">{lang === 'en' ? 'Fully Paid' : 'مدفوع بالكامل'}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl text-center">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-700">280</p>
              <p className="text-sm text-yellow-600">{lang === 'en' ? 'Partial Payment' : 'دفع جزئي'}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-700">200</p>
              <p className="text-sm text-red-600">{lang === 'en' ? 'Overdue' : 'متأخر'}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderCustomReportsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold text-slate-800">{t.generateReport[lang]}</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.reportType[lang]}</label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">{t.selectType[lang]}</option>
                <option value="student">{t.studentReport[lang]}</option>
                <option value="financial">{t.financialReport[lang]}</option>
                <option value="course">{t.courseReport[lang]}</option>
                <option value="attendance">{t.attendanceReport[lang]}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{lang === 'en' ? 'Department' : 'القسم'}</label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">{lang === 'en' ? 'All Departments' : 'كل الأقسام'}</option>
                <option value="cs">Computer Science</option>
                <option value="eng">Engineering</option>
                <option value="bus">Business</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{lang === 'en' ? 'From Date' : 'من تاريخ'}</label>
              <input type="date" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{lang === 'en' ? 'To Date' : 'إلى تاريخ'}</label>
              <input type="date" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {t.generateReport[lang]}
            </button>
            <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {lang === 'en' ? 'Preview' : 'معاينة'}
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Saved Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">{lang === 'en' ? 'Saved Reports' : 'التقارير المحفوظة'}</h3>
            <button className="text-sm text-blue-600 hover:underline">
              {lang === 'en' ? 'View All' : 'عرض الكل'}
            </button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-slate-100">
            {[
              { name: 'Monthly Enrollment Report', date: '2024-01-15', type: 'enrollment' },
              { name: 'Q4 Financial Summary', date: '2024-01-10', type: 'financial' },
              { name: 'Student Performance Analysis', date: '2024-01-08', type: 'academic' },
              { name: 'Attendance Trend Report', date: '2024-01-05', type: 'attendance' },
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <FileText className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{report.name}</p>
                    <p className="text-sm text-slate-500">{report.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 hover:bg-slate-100 rounded-lg"
                    title={isRTL ? 'عرض' : 'View'}
                    onClick={() => toast.info(isRTL ? `عرض: ${report.name}` : `Viewing: ${report.name}`)}
                  >
                    <Eye className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    className="p-2 hover:bg-slate-100 rounded-lg"
                    title={isRTL ? 'تحميل PDF' : 'Download PDF'}
                    onClick={() => {
                      const content = `<div class="content-section"><h3 class="section-title">${report.name}</h3><p>${isRTL ? 'تاريخ التقرير' : 'Report Date'}: ${report.date}</p><p>${isRTL ? 'نوع التقرير' : 'Report Type'}: ${report.type}</p></div>`;
                      exportToPDF(report.name, content, `${report.type}-report-${report.date}`, lang, report.name);
                    }}
                  >
                    <FileType2 className="w-4 h-4 text-red-500" />
                  </button>
                  <button
                    className="p-2 hover:bg-slate-100 rounded-lg"
                    title={isRTL ? 'تحميل Excel' : 'Download Excel'}
                    onClick={() => {
                      const data = [{
                        [isRTL ? 'اسم التقرير' : 'Report Name']: report.name,
                        [isRTL ? 'التاريخ' : 'Date']: report.date,
                        [isRTL ? 'النوع' : 'Type']: report.type,
                      }];
                      exportToCSV(data, `${report.type}-report-${report.date}`);
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Staff Header Banner */}
      {isStaff && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Building className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{staffT.staffPageTitle[lang]}</h1>
              <p className="text-emerald-100 mt-1">{staffT.staffSubtitle[lang]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {!isStaff && <h1 className="text-2xl font-bold text-slate-800">{t.reports[lang]}</h1>}
          <p className="text-sm text-slate-500 mt-1">
            {t.lastUpdated[lang]}: {new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Period Selector */}
          <div className="relative">
            <button
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm">{periods.find((p) => p.key === selectedPeriod)?.label}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showPeriodDropdown && (
              <div className="absolute top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                {periods.map((period) => (
                  <button
                    key={period.key}
                    onClick={() => {
                      setSelectedPeriod(period.key);
                      setShowPeriodDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-sm text-start hover:bg-slate-50 ${
                      selectedPeriod === period.key ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg ${themeColors.primaryBg} ${themeColors.primaryHover}`}
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">{t.export[lang]}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showExportMenu && (
              <div className={`absolute top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 ${isRTL ? 'start-0' : 'end-0'}`}>
                <button
                  onClick={handleExportPDF}
                  className="w-full px-4 py-2 text-sm text-start hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileType2 className="w-4 h-4 text-red-500" />
                  {isRTL ? 'تصدير PDF' : 'Export as PDF'}
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full px-4 py-2 text-sm text-start hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  {isRTL ? 'تصدير Excel' : 'Export as Excel'}
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full px-4 py-2 text-sm text-start hover:bg-slate-50 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  {t.print[lang]}
                </button>
                <button
                  onClick={handleSendEmail}
                  className="w-full px-4 py-2 text-sm text-start hover:bg-slate-50 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-blue-600" />
                  {isRTL ? 'إرسال بالبريد' : 'Send via Email'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? `${themeColors.primaryBorder} ${themeColors.primaryText}`
                    : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'enrollment' && renderEnrollmentTab()}
      {activeTab === 'academic' && renderAcademicTab()}
      {activeTab === 'financial' && renderFinancialTab()}
      {activeTab === 'custom' && renderCustomReportsTab()}
    </div>
  );
};

export default Reports;
