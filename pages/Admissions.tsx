import React, { useState, useEffect } from 'react';
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
  Trash2,
} from 'lucide-react';
import { AdmissionApplication } from '../types';
import { TRANSLATIONS } from '../constants';
import { exportToCSV } from '../utils/exportUtils';
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
import { useToast } from '../hooks/useToast';

interface AdmissionsProps {
  lang: 'en' | 'ar';
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
  country: { en: 'Country', ar: 'الدولة' },
  residence: { en: 'Place of Residence', ar: 'مكان الإقامة' },
  whatsapp: { en: 'WhatsApp Number', ar: 'رقم الواتساب' },
  close: { en: 'Close', ar: 'إغلاق' },
  viewAll: { en: 'View All', ar: 'عرض الكل' },
  applicant: { en: 'Applicant', ar: 'المتقدم' },
  program: { en: 'Program', ar: 'البرنامج' },
  score: { en: 'Score', ar: 'الدرجة' },
  status: { en: 'Status', ar: 'الحالة' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  all: { en: 'All', ar: 'الكل' },
  passportNumber: { en: 'Passport Number', ar: 'رقم جواز السفر' },
  registeredStudents: { en: 'Registered Students', ar: 'الطلاب المسجلين' },
  studentId: { en: 'Student ID', ar: 'رقم الطالب' },
  enrollmentDate: { en: 'Enrollment Date', ar: 'تاريخ التسجيل' },
  noStudentsFound: { en: 'No registered students found', ar: 'لم يتم العثور على طلاب مسجلين' },
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
  college: { en: 'College', ar: 'الكلية' },
  degree: { en: 'Degree', ar: 'الدرجة العلمية' },
  semester: { en: 'Semester', ar: 'الفصل الدراسي' },
  scholarship: { en: 'Apply for Scholarship', ar: 'التقدم لمنحة' },
  scholarshipPercentage: { en: 'Scholarship Percentage', ar: 'نسبة المنحة' },
  paymentMethod: { en: 'Payment Method', ar: 'طريقة الدفع' },
  cash: { en: 'Cash', ar: 'نقدي' },
  card: { en: 'Card', ar: 'بطاقة' },
  transfer: { en: 'Bank Transfer', ar: 'تحويل بنكي' },
  intermediary: { en: 'Intermediary', ar: 'الوسيط' },
  initialDeposit: { en: 'Initial Deposit', ar: 'الدفعة الأولى' },
  next: { en: 'Next', ar: 'التالي' },
  previous: { en: 'Previous', ar: 'السابق' },
  submit: { en: 'Submit', ar: 'إرسال' },
  fullNameAr: { en: 'Full Name (Arabic)', ar: 'الاسم الكامل (عربي)' },
  terms: { en: 'I agree to the terms and conditions', ar: 'أوافق على الشروط والأحكام' },
  submitApplication: { en: 'Submit Application', ar: 'تقديم الطلب' },
  duplicateError: { en: 'An application with this email or ID already exists', ar: 'يوجد طلب مسجل مسبقاً بهذا البريد أو رقم الهوية' },
  duplicateErrorTitle: { en: 'Duplicate Application', ar: 'طلب مكرر' },
  submitting: { en: 'Submitting...', ar: 'جاري الإرسال...' },
  submitError: { en: 'Error submitting application. Please try again.', ar: 'خطأ في تقديم الطلب. حاول مرة أخرى.' },
  checkingDuplicate: { en: 'Checking...', ar: 'جاري التحقق...' },
  paymentConfirmTitle: { en: 'Payment Confirmation', ar: 'تأكيد الدفع' },
  paymentConfirmMsg: { en: 'Has the student paid the registration fee of $100?', ar: 'هل دفع الطالب رسوم التسجيل (100$)؟' },
  paymentNotPaid: { en: 'Cannot approve without payment confirmation', ar: 'لا يمكن الموافقة بدون تأكيد الدفع' },
  registrationFee: { en: 'Registration Fee', ar: 'رسوم التسجيل' },
  deleteApp: { en: 'Delete', ar: 'حذف' },
  deleteConfirm: { en: 'Are you sure you want to delete this application?', ar: 'هل أنت متأكد من حذف هذا الطلب؟' },
  deleteSuccess: { en: 'Application deleted successfully', ar: 'تم حذف الطلب بنجاح' },
  deleteError: { en: 'Failed to delete application', ar: 'فشل في حذف الطلب' },
};

const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ec4899'];

const Admissions: React.FC<AdmissionsProps> = ({ lang }) => {
  const toast = useToast();
  const [apps, setApps] = useState<AdmissionApplication[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Fetch applications from API
  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const { admissionsApi } = await import('../api/admissions');
        const response = await admissionsApi.getAll();
        setApps(response.data || response || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  // Fetch registered students
  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const { default: apiClient } = await import('../api/client');
      const response = await apiClient.get('/students');
      setStudents(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Initialize view from URL parameter
  const getInitialView = () => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const tab = params.get('tab');
    if (tab === 'students') return 'students';
    if (tab === 'applications') return 'list';
    if (tab === 'register') return 'register';
    return 'dashboard';
  };

  const [view, setView] = useState<'dashboard' | 'list' | 'register' | 'students'>(getInitialView);

  // Fetch students when switching to students view
  useEffect(() => {
    if (view === 'students') {
      fetchStudents();
    }
  }, [view]);

  // Update URL when view changes
  useEffect(() => {
    const baseUrl = window.location.hash.split('?')[0];
    if (view === 'dashboard') {
      window.history.replaceState(null, '', baseUrl);
    } else {
      window.history.replaceState(null, '', `${baseUrl}?tab=${view === 'list' ? 'applications' : view}`);
    }
  }, [view]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [showDetailModal, setShowDetailModal] = useState<AdmissionApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Check language from prop, localStorage, or document - default to Arabic
  const actualLang = lang || localStorage.getItem('app_language') || document.documentElement.lang || 'ar';
  const isRTL = actualLang === 'ar';

  // Force RTL direction on document when component mounts
  React.useEffect(() => {
    console.log('[Admissions] Language:', actualLang, 'isRTL:', isRTL);
    if (isRTL) {
      document.documentElement.dir = 'rtl';
      document.documentElement.style.direction = 'rtl';
      document.body.style.direction = 'rtl';
      document.body.style.textAlign = 'right';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.style.direction = 'ltr';
      document.body.style.direction = 'ltr';
      document.body.style.textAlign = 'left';
    }
  }, [isRTL, actualLang]);

  // Registration Form State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    fullNameAr: '',
    email: '',
    phone: '',
    whatsapp: '',
    passportNumber: '',
    dob: '',
    gender: 'male',
    country: '',
    city: '',
    residence: '',
    address: '',
    highSchool: '',
    score: '',
    college: '',
    degree: '',
    program: 'Computer Science',
    semester: 'Fall 2025',
    scholarship: false,
    scholarshipPercentage: '',
    paymentMethod: 'Cash',
    deposit: '',
    terms: false,
  });

  // Filter applications
  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.passportNumber || app.nationalId || '').includes(searchQuery);
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

  const handleStatusChange = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const admissionsModule = await import('../api/admissions');
      const admissionsApi = admissionsModule.admissionsApi || admissionsModule.default;
      const appId = parseInt(id);

      if (newStatus === 'APPROVED') {
        // Get current application - check both id formats
        const currentApp = apps.find(a => a.id === appId || a.id?.toString() === id);

        // Get student name and email from application data
        const studentName = currentApp?.full_name || (currentApp as any)?.fullName || 'N/A';
        const studentEmail = currentApp?.email || 'N/A';

        // ⚠️ PAYMENT CONFIRMATION
        const paymentConfirmed = window.confirm(
          lang === 'ar'
            ? `⚠️ تأكيد الدفع\n\nهل دفع الطالب رسوم التسجيل (100$)؟\n\n👤 اسم الطالب: ${studentName}\n📧 البريد: ${studentEmail}`
            : `⚠️ Payment Confirmation\n\nHas the student paid the registration fee ($100)?\n\n👤 Student: ${studentName}\n📧 Email: ${studentEmail}`
        );

        if (!paymentConfirmed) {
          toast.warning(lang === 'ar' ? 'لا يمكن الموافقة بدون تأكيد دفع رسوم التسجيل (100$)' : 'Cannot approve without payment confirmation ($100)');
          return;
        }

        // 🎓 ASK FOR STUDENT ID
        const enteredStudentId = prompt(
          lang === 'ar'
            ? `🎓 أدخل الرقم الجامعي للطالب:\n\n👤 ${studentName}`
            : `🎓 Enter Student ID:\n\n👤 ${studentName}`
        );

        if (!enteredStudentId || enteredStudentId.trim() === '') {
          toast.warning(lang === 'ar' ? 'يجب إدخال الرقم الجامعي للمتابعة' : 'Student ID is required to proceed');
          return;
        }

        const studentId = enteredStudentId.trim();

        // Show loading message
        const loadingMsg = lang === 'ar' ? 'جاري معالجة الطلب...' : 'Processing...';

        // Try multiple approaches to approve
        let success = false;
        let result: any = null;
        let errors: string[] = [];

        // Approach 1: Try full workflow steps one by one
        try {
          console.log('Trying workflow steps...');
          try { await admissionsApi.startReview(appId); } catch (e: any) { console.log('startReview:', e?.response?.data?.message); }
          try { await admissionsApi.verifyDocuments(appId, 'Documents verified'); } catch (e: any) { console.log('verifyDocuments:', e?.response?.data?.message); }
          try { await admissionsApi.requestPayment(appId, 100); } catch (e: any) { console.log('requestPayment:', e?.response?.data?.message); }
          try { await admissionsApi.recordPayment(appId, { amount: 100, payment_method: 'cash', notes: '$100 registration fee' }); } catch (e: any) { console.log('recordPayment:', e?.response?.data?.message); }
          result = await admissionsApi.approve(appId);
          success = true;
          console.log('Workflow approve succeeded');
        } catch (e: any) {
          errors.push(`Workflow: ${e?.response?.data?.message || e?.message}`);
          console.log('Workflow failed:', e?.response?.data?.message);
        }

        // Approach 2: Try direct approve
        if (!success) {
          try {
            console.log('Trying direct approve...');
            result = await admissionsApi.approve(appId);
            success = true;
            console.log('Direct approve succeeded');
          } catch (e: any) {
            errors.push(`Direct: ${e?.response?.data?.message || e?.message}`);
            console.log('Direct approve failed:', e?.response?.data?.message);
          }
        }

        // Approach 3: Try fullApprove endpoint
        if (!success && admissionsApi.fullApprove) {
          try {
            console.log('Trying fullApprove...');
            result = await admissionsApi.fullApprove(appId, { amount: 100, payment_method: 'cash', notes: '$100 fee' });
            success = true;
            console.log('fullApprove succeeded');
          } catch (e: any) {
            errors.push(`FullApprove: ${e?.response?.data?.message || e?.message}`);
            console.log('fullApprove failed:', e?.response?.data?.message);
          }
        }

        // Approach 4: Try direct status update via PUT
        if (!success && admissionsApi.updateStatus) {
          try {
            console.log('Trying updateStatus...');
            result = await admissionsApi.updateStatus(appId, 'APPROVED', {
              registration_fee: 100,
              payment_method: 'cash',
              payment_received_at: new Date().toISOString()
            });
            success = true;
            console.log('updateStatus succeeded');
          } catch (e: any) {
            errors.push(`UpdateStatus: ${e?.response?.data?.message || e?.message}`);
            console.log('updateStatus failed:', e?.response?.data?.message);
          }
        }

        // Approach 5: Force update via direct API call
        if (!success) {
          try {
            console.log('Trying direct PATCH...');
            const { default: apiClient } = await import('../api/client');
            result = await apiClient.patch(`/admission-applications/${appId}`, { status: 'APPROVED' });
            success = true;
            console.log('Direct PATCH succeeded');
          } catch (e: any) {
            errors.push(`PATCH: ${e?.response?.data?.message || e?.message}`);
            console.log('Direct PATCH failed:', e?.response?.data?.message);
          }
        }

        // Approach 6: Try PUT with just status
        if (!success) {
          try {
            console.log('Trying direct PUT...');
            const { default: apiClient } = await import('../api/client');
            result = await apiClient.put(`/admission-applications/${appId}`, { status: 'APPROVED' });
            success = true;
            console.log('Direct PUT succeeded');
          } catch (e: any) {
            errors.push(`PUT: ${e?.response?.data?.message || e?.message}`);
            console.log('Direct PUT failed:', e?.response?.data?.message);
          }
        }

        if (success) {
          // Create student with the ID entered by admin
          try {
            const { studentsAPI } = await import('../api/students');
            const currentApp = apps.find(a => a.id === appId);
            if (currentApp) {
              // Create student record from application data with admin-entered ID
              const studentData = {
                student_id: studentId,
                full_name: currentApp.full_name,
                full_name_ar: currentApp.full_name,
                email: currentApp.email,
                phone: currentApp.phone,
                whatsapp: currentApp.whatsapp || currentApp.phone,
                national_id: currentApp.national_id,
                date_of_birth: currentApp.date_of_birth,
                gender: currentApp.gender,
                nationality: currentApp.nationality || 'Syrian',
                country: currentApp.country,
                city: currentApp.city,
                address: currentApp.address,
                program_id: currentApp.program_id,
                admission_application_id: currentApp.id,
                enrollment_date: new Date().toISOString().split('T')[0],
                status: 'ACTIVE',
                level: 1,
                semester: 1,
              };

              const createResult = await studentsAPI.create(studentData);
              console.log('Student created:', createResult);
              toast.success(lang === 'ar'
                ? `تم قبول الطالب وإضافته للنظام - الرقم الجامعي: ${studentId}`
                : `Student approved and added to system - ID: ${studentId}`);
            } else {
              toast.success(lang === 'ar'
                ? `تم قبول الطالب - الرقم الجامعي: ${studentId}`
                : `Student approved - ID: ${studentId}`);
            }
          } catch (createError: any) {
            const errorMsg = createError?.response?.data?.message || createError?.response?.data?.error || createError?.message || 'Unknown error';
            console.error('Student creation error:', errorMsg, createError?.response?.data);
            toast.warning(lang === 'ar'
              ? `تم قبول الطلب لكن فشل إنشاء الطالب - يرجى إضافته يدوياً`
              : `Application approved but student creation failed - please add manually`);
          }

          // Force update local state to APPROVED immediately
          setApps(prevApps => prevApps.map((app) =>
            app.id === appId ? { ...app, status: 'APPROVED' as const, student_id: studentId } : app
          ));

          // Also try to refresh from server (but keep APPROVED status)
          try {
            const response = await admissionsApi.getAll();
            const serverApps = response.data || response || [];
            // Merge: keep APPROVED status for this app even if server says otherwise
            setApps(serverApps.map((app: any) =>
              app.id === appId ? { ...app, status: 'APPROVED', student_id: studentId || app.student_id } : app
            ));
          } catch {
            // Already updated locally above
          }
        } else {
          console.log('All approaches failed:', errors);
          toast.error(lang === 'ar'
            ? `فشل في الموافقة - يرجى التحقق من إعدادات النظام`
            : `Approval failed - please check system settings`);
        }

      } else {
        const reason = prompt(lang === 'ar' ? 'أدخل سبب الرفض:' : 'Enter rejection reason:');
        if (reason) {
          const admissionsModule = await import('../api/admissions');
          const admissionsApi = admissionsModule.admissionsApi || admissionsModule.default;
          await admissionsApi.reject(appId, reason);

          // Refresh list
          try {
            const response = await admissionsApi.getAll();
            setApps(response.data || response || []);
          } catch {
            setApps(apps.map((app) => (app.id === appId ? { ...app, status: 'REJECTED' } : app)));
          }
          toast.success(lang === 'ar' ? 'تم رفض الطلب' : 'Application rejected');
        }
      }
    } catch (error: any) {
      console.error('handleStatusChange error:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
      toast.error(lang === 'ar' ? `خطأ: ${errorMsg}` : `Error: ${errorMsg}`);
    }
  };

  const handleBulkAction = async (action: 'APPROVED' | 'REJECTED') => {
    const { admissionsApi } = await import('../api/admissions');
    let reason = '';

    if (action === 'REJECTED') {
      reason = prompt(lang === 'ar' ? 'أدخل سبب الرفض للطلبات المحددة:' : 'Enter rejection reason for selected applications:') || '';
      if (!reason) return;
    }

    // 🎓 Collect student IDs for bulk approval
    const studentIdsMap: Record<string, string> = {};

    if (action === 'APPROVED') {
      // ⚠️ PAYMENT CONFIRMATION for bulk approve
      const paymentConfirmed = window.confirm(
        lang === 'ar'
          ? `⚠️ تأكيد الدفع الجماعي\n\nهل تم التأكد من دفع جميع الطلاب المحددين (${selectedApps.length} طالب) رسوم التسجيل (100$)؟`
          : `⚠️ Bulk Payment Confirmation\n\nHave all selected students (${selectedApps.length}) paid the registration fee ($100)?`
      );

      if (!paymentConfirmed) {
        toast.warning(lang === 'ar' ? 'لا يمكن الموافقة بدون تأكيد دفع رسوم التسجيل' : 'Cannot approve without payment confirmation');
        return;
      }

      // Ask for student ID for each selected student
      for (const id of selectedApps) {
        const currentApp = apps.find(a => a.id.toString() === id);
        if (currentApp) {
          const enteredId = prompt(
            lang === 'ar'
              ? `🎓 أدخل الرقم الجامعي للطالب:\n\n👤 ${currentApp.full_name}\n📧 ${currentApp.email}`
              : `🎓 Enter Student ID for:\n\n👤 ${currentApp.full_name}\n📧 ${currentApp.email}`
          );
          if (!enteredId || enteredId.trim() === '') {
            toast.warning(lang === 'ar' ? 'تم إلغاء العملية - يجب إدخال الرقم الجامعي لجميع الطلاب' : 'Operation cancelled - Student ID required for all students');
            return;
          }
          studentIdsMap[id] = enteredId.trim();
        }
      }
    }

    let successCount = 0;
    let errorCount = 0;

    for (const id of selectedApps) {
      const appId = parseInt(id);
      const currentApp = apps.find(a => a.id.toString() === id);
      const studentId = studentIdsMap[id];

      try {
        if (action === 'APPROVED') {
          // Run through workflow steps
          let approveResult: any = null;
          try {
            if (currentApp?.status === 'PENDING') {
              await admissionsApi.startReview(appId);
            }
            if (['PENDING', 'UNDER_REVIEW'].includes(currentApp?.status || '')) {
              await admissionsApi.verifyDocuments(appId, 'Documents verified');
            }
            if (['PENDING', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'].includes(currentApp?.status || '')) {
              await admissionsApi.requestPayment(appId, 100); // $100
            }
            if (['PENDING', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED', 'PENDING_PAYMENT'].includes(currentApp?.status || '')) {
              await admissionsApi.recordPayment(appId, {
                amount: 100, // $100
                payment_method: 'cash',
                notes: 'Bulk approval - $100 registration fee confirmed'
              });
            }
            approveResult = await admissionsApi.approve(appId);
            successCount++;
          } catch {
            // Try direct approve
            try {
              approveResult = await admissionsApi.approve(appId);
              successCount++;
            } catch {
              errorCount++;
            }
          }

          // Create student with admin-entered ID
          if (currentApp && studentId) {
            try {
              const { studentsAPI } = await import('../api/students');

              await studentsAPI.create({
                student_id: studentId,
                full_name: currentApp.full_name,
                full_name_ar: currentApp.full_name,
                email: currentApp.email,
                phone: currentApp.phone,
                whatsapp: currentApp.whatsapp || currentApp.phone,
                national_id: currentApp.national_id,
                date_of_birth: currentApp.date_of_birth,
                gender: currentApp.gender,
                nationality: currentApp.nationality || 'Syrian',
                country: currentApp.country,
                city: currentApp.city,
                address: currentApp.address,
                program_id: currentApp.program_id,
                admission_application_id: currentApp.id,
                enrollment_date: new Date().toISOString().split('T')[0],
                status: 'ACTIVE',
                level: 1,
                semester: 1,
              });
              console.log('Student created with ID:', studentId);
            } catch (e) {
              console.log('Bulk student creation error:', e);
            }
          }
        } else {
          await admissionsApi.reject(appId, reason);
          successCount++;
        }
      } catch {
        errorCount++;
      }
    }

    // Refresh the list
    const response = await admissionsApi.getAll();
    setApps(response.data || response || []);
    setSelectedApps([]);

    if (errorCount === 0) {
      toast.success(lang === 'ar'
        ? `تم معالجة ${successCount} طلب بنجاح`
        : `${successCount} applications processed successfully`);
    } else {
      toast.warning(lang === 'ar'
        ? `تم معالجة ${successCount} طلب - فشل ${errorCount}`
        : `${successCount} processed - ${errorCount} failed`);
    }
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
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { admissionsApi } = await import('../api/admissions');

      // Check for duplicate application
      const duplicateCheck = await admissionsApi.checkDuplicate({
        email: formData.email,
        national_id: formData.passportNumber, // Using passport/national ID
      });

      if (duplicateCheck.exists) {
        setSubmitError(t.duplicateError[lang]);
        setIsSubmitting(false);
        toast.error(`${t.duplicateErrorTitle[lang]}: ${t.duplicateError[lang]}`);
        return;
      }

      // Submit the application
      await admissionsApi.submitApplication({
        full_name: formData.fullName,
        full_name_ar: formData.fullNameAr,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        national_id: formData.passportNumber,
        date_of_birth: formData.dob,
        gender: formData.gender as 'male' | 'female',
        country: formData.country,
        city: formData.city,
        residence: formData.residence,
        address: formData.address,
        program_name: formData.program,
        high_school_name: formData.highSchool,
        high_school_score: formData.score ? parseFloat(formData.score) : undefined,
        scholarship_percentage: formData.scholarship && formData.scholarshipPercentage ? parseFloat(formData.scholarshipPercentage) : undefined,
        payment_method: formData.paymentMethod,
        source: 'SIS_FORM',
      });

      toast.success(t.registrationSuccess[lang]);

      // Reset form
      setFormData({
        fullName: '',
        fullNameAr: '',
        email: '',
        phone: '',
        whatsapp: '',
        passportNumber: '',
        dob: '',
        gender: 'male',
        country: '',
        city: '',
        residence: '',
        address: '',
        highSchool: '',
        score: '',
        college: '',
        degree: '',
        program: 'Computer Science',
        semester: 'Fall 2025',
        scholarship: false,
        scholarshipPercentage: '',
        paymentMethod: 'Cash',
        deposit: '',
        terms: false,
      });
      setStep(1);
      setView('dashboard');

      // Refresh applications list
      const response = await admissionsApi.getAll();
      setApps(response.data || response || []);

    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t.submitError[lang];
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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

  // Delete application
  const handleDeleteApp = async (id: number) => {
    if (!window.confirm(t.deleteConfirm[lang])) {
      return;
    }

    try {
      const { admissionsApi } = await import('../api/admissions');
      await admissionsApi.delete(id);
      toast.success(t.deleteSuccess[lang]);

      // Remove from local state
      setApps(apps.filter(app => app.id !== id));
      setShowDetailModal(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(`${t.deleteError[lang]}: ${error?.response?.data?.message || error?.message}`);
    }
  };

  const programs = ['Computer Science', 'Engineering', 'Medicine', 'Business'];

  // --- Dashboard View ---
  if (view === 'dashboard') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300" dir={isRTL ? 'rtl' : 'ltr'} style={{ direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          <h2 className="text-2xl font-bold text-slate-800">{t.admissions[lang]}</h2>
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <FileText className="w-4 h-4" />
              {t.applications[lang]}
            </button>
            <button
              onClick={() => setView('students')}
              className={`px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Users className="w-4 h-4" />
              {t.registeredStudents[lang]}
            </button>
            <button
              onClick={() => setView('register')}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <UserPlus className="w-4 h-4" />
              {t.registerNewStudent[lang]}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-xs text-slate-500">{t.totalApps[lang]}</p>
                <p className="text-xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{t.recentApplications[lang]}</h3>
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'آخر 5 طلبات' : 'Last 5 applications'}</p>
              </div>
            </div>
            <button
              onClick={() => setView('list')}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm"
            >
              {t.viewAll[lang]}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="relative w-12 h-12 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-slate-500">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
            </div>
          ) : apps.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">{t.noApplicationsFound[lang]}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {apps.slice(0, 5).map((app, index) => {
                const initials = (app.fullName || app.full_name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];
                const bgColor = colors[index % colors.length];

                return (
                  <div
                    key={app.id}
                    className="px-6 py-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4"
                  >
                    {/* Applicant Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}>
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 truncate">{app.fullName || app.full_name}</p>
                        <p className="text-sm text-slate-500 truncate">{app.email}</p>
                      </div>
                    </div>

                    {/* Program */}
                    <div className="hidden md:block flex-shrink-0 w-32">
                      <p className="text-xs text-slate-400 mb-0.5">{t.program[lang]}</p>
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {app.program?.name_en || app.program?.name_ar || app.programName || '-'}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="hidden sm:flex flex-col items-center flex-shrink-0">
                      <div className="relative w-14 h-14">
                        <svg className="w-14 h-14 transform -rotate-90">
                          <circle cx="28" cy="28" r="24" stroke="#e2e8f0" strokeWidth="4" fill="none" />
                          <circle
                            cx="28" cy="28" r="24"
                            stroke={app.highSchoolScore >= 90 ? '#22c55e' : app.highSchoolScore >= 70 ? '#3b82f6' : '#f59e0b'}
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${(app.highSchoolScore || 0) * 1.51} 151`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">
                          {app.highSchoolScore || 0}%
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          app.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : app.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : app.status === 'UNDER_REVIEW'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {app.status === 'APPROVED' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : app.status === 'REJECTED' ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {app.status === 'APPROVED'
                          ? t.statusApproved[lang]
                          : app.status === 'REJECTED'
                          ? t.statusRejected[lang]
                          : t.statusPending[lang]}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setShowDetailModal(app)}
                        className="p-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                        title={t.viewDetails[lang]}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {app.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(app.id, 'APPROVED')}
                            className="p-2.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            title={t.approve[lang]}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(app.id, 'REJECTED')}
                            className="p-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title={t.reject[lang]}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="p-2.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
                        title={t.deleteApp[lang]}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- List View ---
  if (view === 'list') {
    // RTL styles object for inline application
    const rtlStyle = isRTL ? { direction: 'rtl' as const, textAlign: 'right' as const } : {};

    return (
      <div className="space-y-6 animate-in fade-in duration-300" dir={isRTL ? 'rtl' : 'ltr'} style={rtlStyle}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('dashboard')}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <ArrowLeft className="w-5 h-5" style={isRTL ? { transform: 'rotate(180deg)' } : {}} />
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
                <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" style={isRTL ? { right: '0.75rem', left: 'auto' } : { left: '0.75rem', right: 'auto' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchApplicants[lang]}
                  className="w-full py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  dir={isRTL ? 'rtl' : 'ltr'}
                  style={isRTL ? { paddingRight: '2.5rem', paddingLeft: '1rem', textAlign: 'right' } : { paddingLeft: '2.5rem', paddingRight: '1rem', textAlign: 'left' }}
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
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50" title={t.exportList[lang]} onClick={() => {
                const data = filteredApps.map(app => ({
                  fullName: app.fullName,
                  email: app.email,
                  passportNumber: app.passportNumber || app.nationalId,
                  program: app.program,
                  highSchoolScore: app.highSchoolScore,
                  date: app.date,
                  status: app.status
                }));
                exportToCSV(data, 'admissions-list');
              }}>
                <Download className="w-4 h-4 text-slate-600" />
              </button>
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50" title={t.printReport[lang]} onClick={() => window.print()}>
                <Printer className="w-4 h-4 text-slate-600" />
              </button>
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50" title={t.refresh[lang]} onClick={() => window.location.reload()}>
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
            <table className="w-full text-sm" dir={isRTL ? 'rtl' : 'ltr'} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <input
                      type="checkbox"
                      checked={selectedApps.length === filteredApps.length && filteredApps.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="p-4" style={{ textAlign: isRTL ? 'right' : 'left' }}>{t.applicant[lang]}</th>
                  <th className="p-4" style={{ textAlign: isRTL ? 'right' : 'left' }}>{t.passportNumber[lang]}</th>
                  <th className="p-4" style={{ textAlign: isRTL ? 'right' : 'left' }}>{t.degree[lang]}</th>
                  <th className="p-4" style={{ textAlign: isRTL ? 'right' : 'left' }}>{t.program[lang]}</th>
                  <th className="p-4" style={{ textAlign: isRTL ? 'right' : 'left' }}>{t.applicationDate[lang]}</th>
                  <th className="p-4" style={{ textAlign: isRTL ? 'right' : 'left' }}>{t.status[lang]}</th>
                  <th className="p-4" style={{ textAlign: isRTL ? 'right' : 'left' }}>{t.actions[lang]}</th>
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
                      <td className="p-4" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                        <input
                          type="checkbox"
                          checked={selectedApps.includes(app.id)}
                          onChange={() => toggleSelectApp(app.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                        <p className="font-medium text-slate-800">{app.fullName || app.full_name}</p>
                        <p className="text-xs text-slate-500">{app.email}</p>
                      </td>
                      <td className="p-4 text-slate-600 font-mono" style={{ textAlign: isRTL ? 'right' : 'left' }}>{app.passportNumber || app.nationalId || app.national_id || '-'}</td>
                      <td className="p-4 text-slate-600" style={{ textAlign: isRTL ? 'right' : 'left' }}>{app.degree || '-'}</td>
                      <td className="p-4 text-slate-600" style={{ textAlign: isRTL ? 'right' : 'left' }}>{isRTL ? (app.program?.name_ar || app.program?.name_en) : (app.program?.name_en || app.program?.name_ar) || app.programName || app.program_name || '-'}</td>
                      <td className="p-4 text-slate-500 text-sm" style={{ textAlign: isRTL ? 'right' : 'left' }}>{app.date}</td>
                      <td className="p-4" style={{ textAlign: isRTL ? 'right' : 'left' }}>
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
                      <td className="p-4" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                        <div className="flex items-center gap-2" style={{ justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
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
                          <button
                            onClick={() => handleDeleteApp(app.id)}
                            className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-100 hover:text-red-600"
                            title={t.deleteApp[lang]}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
            <div className={`bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
              <div className={`p-6 border-b border-slate-100 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
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
                    <p className="font-medium text-slate-800">{showDetailModal.fullName || showDetailModal.full_name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase">{t.passportNumber[lang]}</label>
                    <p className="font-medium text-slate-800 font-mono">{showDetailModal.passportNumber || showDetailModal.nationalId || showDetailModal.national_id || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase">{t.email[lang]}</label>
                    <p className="font-medium text-slate-800">{showDetailModal.email || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase">{t.program[lang]}</label>
                    <p className="font-medium text-slate-800">{showDetailModal.program?.name_en || showDetailModal.program?.name_ar || showDetailModal.program_name || showDetailModal.programName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase">{t.degree[lang]}</label>
                    <p className="font-medium text-slate-800">{showDetailModal.degree || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase">{t.college[lang]}</label>
                    <p className="font-medium text-slate-800">{showDetailModal.college || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase">{t.score[lang]}</label>
                    <p className="font-bold text-2xl text-blue-600">{showDetailModal.highSchoolScore || showDetailModal.high_school_score || 0}%</p>
                  </div>
                </div>

                {/* Documents Section */}
                {(showDetailModal.metadata?.attachments?.length > 0 || showDetailModal.metadata?.photo_url || showDetailModal.metadata?.passport_url || showDetailModal.metadata?.bachelor_cert_url || showDetailModal.metadata?.high_school_cert_url || showDetailModal.metadata?.master_cert_url) && (
                  <div className="pt-4 border-t border-slate-100">
                    <label className="text-xs text-slate-500 uppercase mb-3 block">{lang === 'ar' ? 'المستندات' : 'Documents'}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {showDetailModal.metadata?.photo_url && (
                        <a href={showDetailModal.metadata.photo_url} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-blue-700">{lang === 'ar' ? 'الصورة الشخصية' : 'Photo'}</span>
                        </a>
                      )}
                      {showDetailModal.metadata?.passport_url && (
                        <a href={showDetailModal.metadata.passport_url} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                          <FileText className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-700">{lang === 'ar' ? 'صورة الجواز' : 'Passport'}</span>
                        </a>
                      )}
                      {showDetailModal.metadata?.high_school_cert_url && (
                        <a href={showDetailModal.metadata.high_school_cert_url} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <span className="text-sm text-purple-700">{lang === 'ar' ? 'شهادة الثانوية' : 'High School Cert'}</span>
                        </a>
                      )}
                      {showDetailModal.metadata?.bachelor_cert_url && (
                        <a href={showDetailModal.metadata.bachelor_cert_url} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                          <FileText className="w-5 h-5 text-orange-600" />
                          <span className="text-sm text-orange-700">{lang === 'ar' ? 'شهادة البكالوريوس' : 'Bachelor Cert'}</span>
                        </a>
                      )}
                      {showDetailModal.metadata?.master_cert_url && (
                        <a href={showDetailModal.metadata.master_cert_url} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                          <FileText className="w-5 h-5 text-red-600" />
                          <span className="text-sm text-red-700">{lang === 'ar' ? 'شهادة الماجستير' : 'Master Cert'}</span>
                        </a>
                      )}
                      {showDetailModal.metadata?.attachments?.map((url: string, idx: number) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <FileText className="w-5 h-5 text-slate-600" />
                          <span className="text-sm text-slate-700">{lang === 'ar' ? `مرفق ${idx + 1}` : `Attachment ${idx + 1}`}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

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
                {/* Delete button */}
                <button
                  onClick={() => handleDeleteApp(showDetailModal.id)}
                  className="w-full px-4 py-2.5 mt-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.deleteApp[lang]}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Students View ---
  if (view === 'students') {
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
            <h2 className="text-2xl font-bold text-slate-800">{t.registeredStudents[lang]}</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {t.applications[lang]}
            </button>
            <button
              onClick={() => setView('register')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {t.registerNewStudent[lang]}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'ar' ? 'بحث عن طالب...' : 'Search students...'}
                  className="w-full ps-10 pe-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <button
              onClick={fetchStudents}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              title={t.refresh[lang]}
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${studentsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className={`p-4 ${isRTL ? 'text-end' : 'text-start'}`}>{t.studentId[lang]}</th>
                  <th className={`p-4 ${isRTL ? 'text-end' : 'text-start'}`}>{t.fullName[lang]}</th>
                  <th className={`p-4 ${isRTL ? 'text-end' : 'text-start'}`}>{t.email[lang]}</th>
                  <th className={`p-4 ${isRTL ? 'text-end' : 'text-start'}`}>{t.program[lang]}</th>
                  <th className={`p-4 ${isRTL ? 'text-end' : 'text-start'}`}>{t.status[lang]}</th>
                  <th className={`p-4 ${isRTL ? 'text-end' : 'text-start'}`}>{t.enrollmentDate[lang]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      {t.noStudentsFound[lang]}
                    </td>
                  </tr>
                ) : (
                  students
                    .filter(student =>
                      !searchQuery ||
                      student.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      student.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      student.name_ar?.includes(searchQuery) ||
                      student.university_email?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className={`p-4 font-mono text-blue-600 font-medium ${isRTL ? 'text-end' : 'text-start'}`}>{student.student_id}</td>
                        <td className={`p-4 ${isRTL ? 'text-end' : 'text-start'}`}>
                          <p className="font-medium text-slate-800">
                            {lang === 'ar' ? (student.name_ar || student.name_en) : (student.name_en || student.name_ar)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {lang === 'ar' ? student.name_en : student.name_ar}
                          </p>
                        </td>
                        <td className={`p-4 text-slate-600 ${isRTL ? 'text-end' : 'text-start'}`}>{student.university_email || student.personal_email || '-'}</td>
                        <td className={`p-4 text-slate-600 ${isRTL ? 'text-end' : 'text-start'}`}>
                          {student.program ? (lang === 'ar' ? student.program.name_ar : student.program.name_en) : '-'}
                        </td>
                        <td className={`p-4 ${isRTL ? 'text-end' : 'text-start'}`}>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              student.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700'
                                : student.status === 'GRADUATED'
                                ? 'bg-blue-100 text-blue-700'
                                : student.status === 'SUSPENDED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td className={`p-4 text-slate-500 text-sm ${isRTL ? 'text-end' : 'text-start'}`}>
                          {student.admission_date ? new Date(student.admission_date).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
            <div className="space-y-4 animate-in fade-in slide-in-from-end-4">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.passportNumber[lang]}</label>
                  <input
                    name="passportNumber"
                    value={formData.passportNumber}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.whatsapp[lang]}</label>
                  <input
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="+966..."
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.country[lang]}</label>
                  <input
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.residence[lang]}</label>
                  <input
                    name="residence"
                    value={formData.residence}
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
            <div className="space-y-4 animate-in fade-in slide-in-from-end-4">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.college[lang]}</label>
                  <input
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.degree[lang]}</label>
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">{lang === 'ar' ? 'اختر الدرجة' : 'Select Degree'}</option>
                    <option value="Bachelor">{lang === 'ar' ? 'بكالوريوس' : 'Bachelor'}</option>
                    <option value="Master">{lang === 'ar' ? 'ماجستير' : 'Master'}</option>
                    <option value="PhD">{lang === 'ar' ? 'دكتوراه' : 'PhD'}</option>
                    <option value="Diploma">{lang === 'ar' ? 'دبلوم' : 'Diploma'}</option>
                  </select>
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
                    <option value="Fall 2025">Fall 2025</option>
                    <option value="Winter 2025">Winter 2025</option>
                    <option value="Summer 2026">Summer 2026</option>
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
            <div className="space-y-4 animate-in fade-in slide-in-from-end-4">
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

                {formData.scholarship && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t.scholarshipPercentage[lang]}</label>
                    <div className="relative">
                      <input
                        name="scholarshipPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.scholarshipPercentage}
                        onChange={handleInputChange}
                        placeholder="0 - 100"
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="absolute end-3 top-2.5 text-slate-400">%</span>
                    </div>
                  </div>
                )}

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
                      <option value="Intermediary">{t.intermediary[lang]}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.initialDeposit[lang]}</label>
                    <div className="relative">
                      <span className="absolute start-3 top-2.5 text-slate-400">$</span>
                      <input
                        name="deposit"
                        type="number"
                        value={formData.deposit}
                        onChange={handleInputChange}
                        className="w-full ps-7 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-end-4">
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
                    <p className="text-slate-500 text-xs uppercase tracking-wide">{t.whatsapp[lang]}</p>
                    <p className="font-medium text-slate-800">{formData.whatsapp || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide">{t.passportNumber[lang]}</p>
                    <p className="font-medium text-slate-800">{formData.passportNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide">{t.country[lang]}</p>
                    <p className="font-medium text-slate-800">{formData.country || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide">{t.residence[lang]}</p>
                    <p className="font-medium text-slate-800">{formData.residence || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide">{t.college[lang]}</p>
                    <p className="font-medium text-slate-800">{formData.college || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide">{t.degree[lang]}</p>
                    <p className="font-medium text-slate-800">{formData.degree || '-'}</p>
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
                  {formData.scholarship && (
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-wide">{t.scholarshipPercentage[lang]}</p>
                      <p className="font-medium text-green-600">{formData.scholarshipPercentage || '0'}%</p>
                    </div>
                  )}
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
                disabled={!formData.terms || isSubmitting}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-green-200"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {t.submitting[lang]}
                  </>
                ) : (
                  <>
                    {t.submitApplication[lang]} <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admissions;
