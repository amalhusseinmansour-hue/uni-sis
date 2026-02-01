
import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  Download, CreditCard, Plus, FileBarChart, Check, AlertCircle,
  TrendingUp, TrendingDown, DollarSign, Wallet, Receipt, Calendar,
  Clock, CheckCircle, XCircle, ArrowUpRight, ArrowDownRight,
  Filter, Search, MoreVertical, Eye, Printer, FileText, Users,
  Building, Mail, Phone, Hash, User, Send, Edit, Trash2,
  ChevronRight, BarChart3, PieChart as PieChartIcon, FileSpreadsheet,
  AlertTriangle, Ban, RefreshCw, Copy, ExternalLink, Award,
  GraduationCap, Percent, FileCheck, Layers, Target
} from 'lucide-react';
import { FinancialRecord, Student, UserRole } from '../types';
import { TRANSLATIONS } from '../constants';
import { studentsAPI } from '../api/students';
import { financeAPI } from '../api/finance';
import { paymentPlansAPI, PaymentPlan, Installment, Scholarship, StudentScholarship } from '../api/paymentPlans';
import { useToast } from '../hooks/useToast';
import { Card, CardHeader, CardBody, StatCard, GradientCard } from '../components/ui/Card';
import Button, { IconButton } from '../components/ui/Button';
import Badge, { StatusBadge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input, { Select, SearchInput, Textarea } from '../components/ui/Input';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import { useBranding } from '../context/BrandingContext';

interface FinanceProps {
  lang: 'en' | 'ar';
  role: UserRole;
  student?: Student;
}

type AdminTab = 'dashboard' | 'reports' | 'invoices' | 'debtors' | 'payments' | 'plans' | 'scholarships';
type StudentTab = 'overview' | 'payments' | 'scholarships';

const Finance: React.FC<FinanceProps> = ({ lang, role, student: initialStudent }) => {
  const t = TRANSLATIONS;
  const toast = useToast();
  const isStudent = role === UserRole.STUDENT;
  const { branding } = useBranding();

  // Currency formatting helper
  const formatCurrency = (amount: number, withSign = false) => {
    const symbol = branding?.currencySymbol || '$';
    const position = branding?.currencyPosition || 'before';
    const absAmount = Math.abs(amount);
    const formattedAmount = absAmount.toLocaleString();
    const sign = withSign && amount > 0 ? '+' : '';
    return position === 'before'
      ? `${sign}${symbol}${formattedAmount}`
      : `${sign}${formattedAmount} ${symbol}`;
  };

  const [student, setStudent] = useState<any>(initialStudent);
  const [financials, setFinancials] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [studentTab, setStudentTab] = useState<StudentTab>('overview');

  // Payment Plans State
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);

  // Scholarships State
  const [myScholarships, setMyScholarships] = useState<StudentScholarship[]>([]);
  const [availableScholarships, setAvailableScholarships] = useState<Scholarship[]>([]);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [scholarshipReason, setScholarshipReason] = useState('');

  // Admin Payment Plans & Scholarships State
  const [adminPaymentPlans, setAdminPaymentPlans] = useState<PaymentPlan[]>([]);
  const [adminScholarships, setAdminScholarships] = useState<Scholarship[]>([]);
  const [allStudentScholarships, setAllStudentScholarships] = useState<StudentScholarship[]>([]);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showCreateScholarshipModal, setShowCreateScholarshipModal] = useState(false);
  const [showViewPlanModal, setShowViewPlanModal] = useState(false);
  const [viewingPlan, setViewingPlan] = useState<PaymentPlan | null>(null);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [planFormLoading, setPlanFormLoading] = useState(false);

  // Payment Plan form state
  const [planForm, setPlanForm] = useState({
    student_id: '',
    total_amount: '',
    down_payment: '',
    number_of_installments: '3',
    frequency: 'MONTHLY',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Invoice form state
  const [invoiceForm, setInvoiceForm] = useState({
    studentId: '',
    studentName: '',
    description: '',
    amount: '',
    dueDate: '',
    type: 'TUITION',
    notes: ''
  });

  // Report form state
  const [reportForm, setReportForm] = useState({
    type: 'receivables',
    startDate: '',
    endDate: '',
    status: 'all',
    program: 'all'
  });

  // Admin data - should be fetched from API
  const [debtorsData, setDebtorsData] = useState<any[]>([]);
  const [invoicesData, setInvoicesData] = useState<any[]>([]);
  const [receivablesAgingData, setReceivablesAgingData] = useState<any[]>([]);
  const [collectionPerformanceData, setCollectionPerformanceData] = useState<any[]>([]);
  const [programReceivablesData, setProgramReceivablesData] = useState<any[]>([]);

  // Fetch financial data
  useEffect(() => {
    const fetchData = async () => {
      if (!isStudent) {
        setLoading(false);
        setStudent(initialStudent);
        setFinancials([]);
        setBalance(initialStudent?.currentBalance || initialStudent?.balance || 0);
        // Fetch admin data for payment plans and scholarships
        try {
          const [plans, schols, studentSchols, allRecords, students] = await Promise.all([
            paymentPlansAPI.getAllPaymentPlans(),
            paymentPlansAPI.getAllScholarships(),
            paymentPlansAPI.getAllStudentScholarships(),
            financeAPI.getAllRecords({ per_page: 100 }),
            studentsAPI.getAll({ per_page: 500 }),
          ]);
          setAdminPaymentPlans(plans);
          setAdminScholarships(schols);
          setAllStudentScholarships(studentSchols);
          setFinancials(allRecords?.data || allRecords || []);
          setAllStudents(students?.data || students || []);
        } catch {
          // Admin data fetch failed - non-critical, silently continue
        }
        return;
      }

      try {
        setLoading(true);
        // Use new student-specific endpoints
        const [profile, financialData, balanceData, plans, mySchols, availSchols] = await Promise.all([
          studentsAPI.getMyProfile(),
          financeAPI.getMyFinancials(),
          financeAPI.getMyBalance(),
          paymentPlansAPI.getMyPaymentPlans(),
          paymentPlansAPI.getMyScholarships(),
          paymentPlansAPI.getAvailableScholarships(),
        ]);

        setStudent(profile);
        setFinancials(financialData.records || []);
        setBalance(balanceData.balance || financialData.balance || 0);
        setPaymentPlans(plans);
        setMyScholarships(mySchols);
        setAvailableScholarships(availSchols);
      } catch (err: any) {
        console.warn('[Finance] Data fetch error:', err?.message);
        setStudent(initialStudent);
        setFinancials([]);
        setBalance(initialStudent?.currentBalance || initialStudent?.balance || 0);
        setPaymentPlans([]);
        setMyScholarships([]);
        setAvailableScholarships([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isStudent, initialStudent]);

  // Chart Data - Computed from actual financials
  const paymentHistoryData = React.useMemo(() => {
    const monthMap = new Map<string, { paid: number; due: number }>();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    financials.forEach(record => {
      const date = new Date(record.date || record.created_at);
      const month = months[date.getMonth()];
      if (!monthMap.has(month)) {
        monthMap.set(month, { paid: 0, due: 0 });
      }
      const data = monthMap.get(month)!;
      if (record.status === 'PAID' || record.type === 'PAYMENT') {
        data.paid += Math.abs(record.amount);
      } else if (record.status === 'PENDING' || record.status === 'OVERDUE') {
        data.due += Math.abs(record.amount);
      }
    });

    // Return last 6 months of data
    const result: { month: string; paid: number; due: number }[] = [];
    const currentMonth = new Date().getMonth();
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const month = months[monthIndex];
      result.push({ month, paid: monthMap.get(month)?.paid || 0, due: monthMap.get(month)?.due || 0 });
    }
    return result;
  }, [financials]);

  const expenseBreakdown = React.useMemo(() => {
    const typeMap = new Map<string, number>();
    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#6b7280', '#22c55e', '#ef4444'];
    const typeLabels: Record<string, { en: string; ar: string }> = {
      TUITION: { en: 'Tuition', ar: 'الرسوم الدراسية' },
      ACTIVITY: { en: 'Activity Fees', ar: 'رسوم النشاط' },
      LIBRARY: { en: 'Library Fees', ar: 'رسوم المكتبة' },
      LAB: { en: 'Lab Fees', ar: 'رسوم المختبر' },
      OTHER: { en: 'Other', ar: 'أخرى' },
    };

    financials.forEach(record => {
      if (record.type !== 'PAYMENT') {
        const type = record.type || 'OTHER';
        typeMap.set(type, (typeMap.get(type) || 0) + Math.abs(record.amount));
      }
    });

    return Array.from(typeMap.entries()).map(([type, value], index) => ({
      name: typeLabels[type]?.[lang] || type,
      value,
      color: colors[index % colors.length],
    }));
  }, [financials, lang]);

  const revenueData = React.useMemo(() => {
    const monthMap = new Map<string, number>();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    financials.forEach(record => {
      if (record.type === 'PAYMENT' || record.status === 'PAID') {
        const date = new Date(record.date || record.created_at);
        const month = months[date.getMonth()];
        monthMap.set(month, (monthMap.get(month) || 0) + Math.abs(record.amount));
      }
    });

    const result: { month: string; revenue: number }[] = [];
    const currentMonth = new Date().getMonth();
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const month = months[monthIndex];
      result.push({ month, revenue: monthMap.get(month) || 0 });
    }
    return result;
  }, [financials]);

  const paymentMethodsData = React.useMemo(() => {
    const methodMap = new Map<string, number>();

    financials.forEach(record => {
      if (record.payment_method) {
        methodMap.set(record.payment_method, (methodMap.get(record.payment_method) || 0) + 1);
      }
    });

    const methodLabels: Record<string, { en: string; ar: string }> = {
      credit_card: { en: 'Credit Card', ar: 'بطاقة ائتمان' },
      bank_transfer: { en: 'Bank Transfer', ar: 'تحويل بنكي' },
      cash: { en: 'Cash', ar: 'نقدي' },
    };
    const colors = ['#3b82f6', '#22c55e', '#f59e0b'];

    return Array.from(methodMap.entries()).map(([method, count], index) => ({
      method: methodLabels[method]?.[lang] || method,
      count,
      color: colors[index % colors.length],
    }));
  }, [financials, lang]);

  // Handle payment
  const handlePayment = async () => {
    if (!student) return;
    try {
      setPaymentProcessing(true);
      const paymentData = await financeAPI.createPaymentIntent({ amount: Math.abs(balance), description: 'Tuition Payment' });
      if (!paymentData.paymentIntentId) {
        throw new Error('Payment intent ID not received');
      }
      await financeAPI.confirmPayment({ payment_intent_id: paymentData.paymentIntentId });
      const financialData = await financeAPI.getStudentFinancials(student.id);
      setFinancials(financialData.records || []);
      setBalance(financialData.balance || 0);
      setShowPaymentModal(false);
    } catch (err: any) {
      alert(lang === 'ar' ? 'فشل في معالجة الدفع. يرجى المحاولة لاحقاً.' : 'Payment failed. Please try again later.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Handle invoice creation
  const handleCreateInvoice = async () => {
    // TODO: Implement API call when backend endpoint is ready
    // For now, show feedback and close modal
    alert(lang === 'ar' ? 'سيتم إنشاء الفاتورة قريباً' : 'Invoice creation coming soon');
    setShowInvoiceModal(false);
    setInvoiceForm({
      studentId: '',
      studentName: '',
      description: '',
      amount: '',
      dueDate: '',
      type: 'TUITION',
      notes: ''
    });
  };

  // Handle report generation
  const handleGenerateReport = async () => {
    // TODO: Implement API call when backend endpoint is ready
    alert(lang === 'ar' ? 'سيتم إنشاء التقرير قريباً' : 'Report generation coming soon');
    setShowReportModal(false);
  };

  // Filter transactions
  const filteredFinancials = financials.filter(record => {
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesSearch = record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (record.studentName && record.studentName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 font-medium">{lang === 'en' ? 'Loading financial data...' : 'جاري تحميل البيانات المالية...'}</p>
        </div>
      </div>
    );
  }

  // Helper: Pay installment
  const handlePayInstallment = async () => {
    if (!selectedInstallment) return;
    try {
      setPaymentProcessing(true);
      await paymentPlansAPI.payInstallment(selectedInstallment.id, {
        amount: selectedInstallment.amount - selectedInstallment.paid_amount,
        payment_method: 'credit_card'
      });
      // Refresh payment plans
      const plans = await paymentPlansAPI.getMyPaymentPlans();
      setPaymentPlans(plans);
      setShowInstallmentModal(false);
      setSelectedInstallment(null);
    } catch {
      alert(lang === 'ar' ? 'فشل في دفع القسط. يرجى المحاولة لاحقاً.' : 'Failed to pay installment. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Helper: Apply for scholarship
  const handleApplyScholarship = async () => {
    if (!selectedScholarship) return;
    try {
      setPaymentProcessing(true);
      await paymentPlansAPI.applyForScholarship({
        scholarship_id: selectedScholarship.id,
        reason: scholarshipReason,
      });
      // Refresh scholarships
      const mySchols = await paymentPlansAPI.getMyScholarships();
      setMyScholarships(mySchols);
      setShowScholarshipModal(false);
      setSelectedScholarship(null);
      setScholarshipReason('');
    } catch {
      alert(lang === 'ar' ? 'فشل في تقديم طلب المنحة. يرجى المحاولة لاحقاً.' : 'Failed to apply for scholarship. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Helper: Create payment plan (admin)
  const handleCreatePaymentPlan = async () => {
    if (!planForm.student_id || !planForm.total_amount || !planForm.start_date) {
      toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    try {
      setPlanFormLoading(true);
      await paymentPlansAPI.createPaymentPlan({
        student_id: planForm.student_id,
        name: 'Semester Payment Plan',
        name_ar: 'خطة دفع الفصل الدراسي',
        total_amount: parseFloat(planForm.total_amount),
        down_payment: parseFloat(planForm.down_payment) || 0,
        installments_count: parseInt(planForm.number_of_installments),
        start_date: planForm.start_date,
        notes: planForm.notes,
      });

      // Refresh payment plans
      const plans = await paymentPlansAPI.getAllPaymentPlans();
      setAdminPaymentPlans(plans);

      // Reset form and close modal
      setPlanForm({
        student_id: '',
        total_amount: '',
        down_payment: '',
        number_of_installments: '3',
        frequency: 'MONTHLY',
        start_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setShowCreatePlanModal(false);
      toast.success(lang === 'ar' ? 'تم إنشاء خطة الدفع بنجاح' : 'Payment plan created successfully');
    } catch (err: any) {
      toast.error(lang === 'ar' ? 'فشل في إنشاء خطة الدفع' : 'Failed to create payment plan');
    } finally {
      setPlanFormLoading(false);
    }
  };

  // Helper: View payment plan details
  const handleViewPlan = (plan: PaymentPlan) => {
    setViewingPlan(plan);
    setShowViewPlanModal(true);
  };

  // Helper: Get installment status badge
  const getInstallmentBadge = (status: Installment['status']) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success">{lang === 'ar' ? 'مدفوع' : 'Paid'}</Badge>;
      case 'PENDING':
        return <Badge variant="warning">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</Badge>;
      case 'OVERDUE':
        return <Badge variant="danger">{lang === 'ar' ? 'متأخر' : 'Overdue'}</Badge>;
      case 'PARTIAL':
        return <Badge variant="info">{lang === 'ar' ? 'جزئي' : 'Partial'}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Helper: Get scholarship type label
  const getScholarshipTypeLabel = (type: Scholarship['type']) => {
    const labels = {
      FULL: { en: 'Full', ar: 'كاملة' },
      PARTIAL: { en: 'Partial', ar: 'جزئية' },
      TUITION: { en: 'Tuition', ar: 'رسوم دراسية' },
      MERIT: { en: 'Merit-Based', ar: 'تفوق أكاديمي' },
      NEED_BASED: { en: 'Need-Based', ar: 'حاجة مالية' },
      ATHLETIC: { en: 'Athletic', ar: 'رياضية' },
      EXTERNAL: { en: 'External', ar: 'خارجية' },
    };
    return labels[type]?.[lang] || type;
  };

  // Student View
  if (isStudent && student) {
    const totalDue = Math.abs(student.currentBalance || balance || 0);
    const totalPaid = student.paidAmount || student.total_paid || 0;
    const totalFees = student.totalFees || student.total_fees || 0;
    const scholarshipsTotal = myScholarships.reduce((sum, s) => sum + (s.total_awarded || 0), 0) || student.scholarships || 0;

    // Student tabs configuration
    const studentTabs = [
      { id: 'overview' as StudentTab, label: lang === 'ar' ? 'نظرة عامة' : 'Overview', icon: BarChart3 },
      { id: 'payments' as StudentTab, label: lang === 'ar' ? 'خطط الدفع' : 'Payment Plans', icon: Layers },
      { id: 'scholarships' as StudentTab, label: lang === 'ar' ? 'المنح الدراسية' : 'Scholarships', icon: Award },
    ];

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t.finance[lang]}</h1>
            <p className="text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'إدارة مدفوعاتك ورسومك الدراسية' : 'Manage your payments and tuition fees'}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" icon={Download} onClick={() => {
              const data = financials.map(f => ({
                [lang === 'ar' ? 'التاريخ' : 'Date']: f.date || f.created_at,
                [lang === 'ar' ? 'الوصف' : 'Description']: f.description,
                [lang === 'ar' ? 'النوع' : 'Type']: f.type,
                [lang === 'ar' ? 'المبلغ' : 'Amount']: f.amount,
                [lang === 'ar' ? 'الحالة' : 'Status']: f.status,
              }));
              exportToCSV(data, `financial-statement-${new Date().toISOString().split('T')[0]}`);
            }}>
              {lang === 'ar' ? 'تحميل كشف الحساب' : 'Download Statement'}
            </Button>
            <Button variant="primary" icon={CreditCard} onClick={() => setShowPaymentModal(true)}>
              {t.payNow[lang]}
            </Button>
          </div>
        </div>

        {/* Student Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="flex gap-1 overflow-x-auto">
            {studentTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStudentTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  studentTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {studentTab === 'overview' && (
          <>

        {/* Balance Card */}
        <GradientCard gradient="from-slate-800 via-slate-900 to-slate-800" className="relative overflow-hidden">
          <div className="absolute top-0 end-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <p className="text-slate-400 text-sm mb-2">{t.totalOutBalance[lang]}</p>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-4xl md:text-5xl font-bold">{formatCurrency(totalDue)}</h2>
                  {totalDue > 0 && (
                    <Badge variant="danger" size="lg">
                      {lang === 'ar' ? 'مستحق' : 'Due'}
                    </Badge>
                  )}
                </div>
                <p className="text-slate-400 text-sm mt-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t.dueDate[lang]}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-400 text-xs mb-1">{lang === 'ar' ? 'إجمالي الرسوم' : 'Total Fees'}</p>
                    <p className="text-lg font-bold">{formatCurrency(totalFees)}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-400 text-xs mb-1">{lang === 'ar' ? 'المدفوع' : 'Paid'}</p>
                    <p className="text-lg font-bold text-green-400">{formatCurrency(totalPaid)}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-400 text-xs mb-1">{lang === 'ar' ? 'المنح' : 'Scholarships'}</p>
                    <p className="text-lg font-bold text-purple-400">{formatCurrency(scholarshipsTotal)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Progress */}
              <div className="flex flex-col justify-center">
                <div className="bg-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-300">{lang === 'ar' ? 'نسبة السداد' : 'Payment Progress'}</span>
                    <span className="text-lg font-bold">{Math.round((totalPaid / totalFees) * 100)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(totalPaid / totalFees) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>{formatCurrency(0)}</span>
                    <span>{formatCurrency(totalFees)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GradientCard>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Payment History */}
          <Card>
            <CardHeader
              title={lang === 'ar' ? 'سجل المدفوعات' : 'Payment History'}
              icon={TrendingUp}
              iconColor="text-blue-600 bg-blue-50"
            />
            <CardBody>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                  <BarChart data={paymentHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="paid" fill="#22c55e" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'مدفوع' : 'Paid'} />
                    <Bar dataKey="due" fill="#ef4444" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'مستحق' : 'Due'} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader
              title={lang === 'ar' ? 'توزيع المصروفات' : 'Expense Breakdown'}
              icon={Wallet}
              iconColor="text-purple-600 bg-purple-50"
            />
            <CardBody>
              <div className="flex items-center gap-6">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {expenseBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-800">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader
            title={t.transHistory[lang]}
            icon={Receipt}
            iconColor="text-green-600 bg-green-50"
            action={
              <div className="flex items-center gap-3">
                <Select
                  options={[
                    { value: 'all', label: lang === 'ar' ? 'الكل' : 'All' },
                    { value: 'PAID', label: lang === 'ar' ? 'مدفوع' : 'Paid' },
                    { value: 'PENDING', label: lang === 'ar' ? 'معلق' : 'Pending' },
                    { value: 'OVERDUE', label: lang === 'ar' ? 'متأخر' : 'Overdue' },
                  ]}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  fullWidth={false}
                  className="w-32"
                />
                <Button variant="outline" size="sm" icon={Download} onClick={() => {
                  const content = `<div class="content-section"><h3>${lang === 'ar' ? 'سجل المعاملات المالية' : 'Financial Transactions'}</h3><table class="data-table"><thead><tr><th>${lang === 'ar' ? 'التاريخ' : 'Date'}</th><th>${lang === 'ar' ? 'الوصف' : 'Description'}</th><th>${lang === 'ar' ? 'المبلغ' : 'Amount'}</th><th>${lang === 'ar' ? 'الحالة' : 'Status'}</th></tr></thead><tbody>${financials.map(f => `<tr><td>${f.date || f.created_at || ''}</td><td>${f.description || ''}</td><td>${f.amount || 0}</td><td>${f.status || ''}</td></tr>`).join('')}</tbody></table></div>`;
                  exportToPDF('Financial Statement', content, `financial-statement-${new Date().toISOString().split('T')[0]}`, lang, 'كشف الحساب المالي');
                }}>
                  {t.downloadPdf[lang]}
                </Button>
              </div>
            }
          />
          <CardBody noPadding>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>{t.date[lang]}</th>
                    <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>{t.description[lang]}</th>
                    <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>{t.type[lang]}</th>
                    <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>{t.amount[lang]}</th>
                    <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>{t.status[lang]}</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">{t.actions[lang]}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFinancials.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{record.date}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-slate-800">{record.description}</p>
                      </td>
                      <td className="p-4">
                        <Badge variant={record.type === 'DEBIT' ? 'warning' : 'success'}>
                          {record.type === 'DEBIT' ? (
                            <span className="flex items-center gap-1">
                              <ArrowUpRight className="w-3 h-3" />
                              {lang === 'ar' ? 'مدين' : 'Debit'}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <ArrowDownRight className="w-3 h-3" />
                              {lang === 'ar' ? 'دائن' : 'Credit'}
                            </span>
                          )}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className={`font-bold ${record.type === 'CREDIT' ? 'text-green-600' : 'text-slate-800'}`}>
                          {record.type === 'CREDIT' ? '+' : ''}{formatCurrency(record.amount)}
                        </span>
                      </td>
                      <td className="p-4">
                        <StatusBadge
                          status={record.status === 'PAID' ? 'paid' : record.status === 'PENDING' ? 'pending' : 'overdue'}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <IconButton icon={Eye} size="sm" tooltip={lang === 'ar' ? 'عرض' : 'View'} />
                          <IconButton icon={Printer} size="sm" tooltip={lang === 'ar' ? 'طباعة' : 'Print'} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
        </>
        )}

        {/* Payment Plans Tab */}
        {studentTab === 'payments' && (
          <div className="space-y-6">
            {/* Payment Plans Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <StatCard
                title={lang === 'ar' ? 'خطط الدفع النشطة' : 'Active Plans'}
                value={paymentPlans.filter(p => p.status === 'ACTIVE').length.toString()}
                subtitle={lang === 'ar' ? 'خطة' : 'plans'}
                icon={Layers}
                iconColor="text-blue-600 bg-blue-50 dark:bg-blue-900/30"
              />
              <StatCard
                title={lang === 'ar' ? 'الأقساط المتبقية' : 'Remaining Installments'}
                value={paymentPlans.reduce((sum, p) => sum + p.installments.filter(i => i.status !== 'PAID').length, 0).toString()}
                subtitle={lang === 'ar' ? 'قسط' : 'installments'}
                icon={Calendar}
                iconColor="text-amber-600 bg-amber-50 dark:bg-amber-900/30"
              />
              <StatCard
                title={lang === 'ar' ? 'المبلغ المتبقي' : 'Amount Remaining'}
                value={formatCurrency(paymentPlans.reduce((sum, p) => sum + p.installments.filter(i => i.status !== 'PAID').reduce((s, i) => s + (i.amount - i.paid_amount), 0), 0))}
                icon={DollarSign}
                iconColor="text-red-600 bg-red-50 dark:bg-red-900/30"
              />
            </div>

            {/* Payment Plans List */}
            {paymentPlans.length > 0 ? (
              paymentPlans.map((plan) => (
                <Card key={plan.id} className="overflow-hidden">
                  <CardHeader
                    title={lang === 'ar' ? plan.name_ar : plan.name}
                    icon={Layers}
                    iconColor="text-blue-600 bg-blue-50"
                    action={
                      <Badge variant={plan.status === 'ACTIVE' ? 'success' : plan.status === 'COMPLETED' ? 'info' : 'danger'}>
                        {plan.status === 'ACTIVE' ? (lang === 'ar' ? 'نشطة' : 'Active') :
                         plan.status === 'COMPLETED' ? (lang === 'ar' ? 'مكتملة' : 'Completed') :
                         (lang === 'ar' ? 'ملغاة' : 'Cancelled')}
                      </Badge>
                    }
                  />
                  <CardBody>
                    {/* Plan Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'إجمالي المبلغ' : 'Total Amount'}</p>
                        <p className="text-lg font-bold text-slate-800 dark:text-white">{formatCurrency(plan.total_amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'الدفعة المقدمة' : 'Down Payment'}</p>
                        <p className="text-lg font-bold text-slate-800 dark:text-white">{formatCurrency(plan.down_payment)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'عدد الأقساط' : 'Installments'}</p>
                        <p className="text-lg font-bold text-slate-800 dark:text-white">{plan.installments_count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'التقدم' : 'Progress'}</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {Math.round((plan.installments.filter(i => i.status === 'PAID').length / plan.installments.length) * 100)}%
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-400">{lang === 'ar' ? 'تقدم السداد' : 'Payment Progress'}</span>
                        <span className="font-medium text-slate-800 dark:text-white">
                          {plan.installments.filter(i => i.status === 'PAID').length} / {plan.installments.length}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(plan.installments.filter(i => i.status === 'PAID').length / plan.installments.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Installments Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className={`p-3 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                              {lang === 'ar' ? 'رقم القسط' : 'Installment #'}
                            </th>
                            <th className={`p-3 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                              {lang === 'ar' ? 'المبلغ' : 'Amount'}
                            </th>
                            <th className={`p-3 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                              {lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
                            </th>
                            <th className={`p-3 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                              {lang === 'ar' ? 'الحالة' : 'Status'}
                            </th>
                            <th className="p-3 text-xs font-semibold text-slate-500 uppercase text-center">
                              {t.actions[lang]}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {plan.installments.map((installment) => (
                            <tr key={installment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                              <td className="p-3">
                                <span className="font-medium text-slate-800 dark:text-white">
                                  {lang === 'ar' ? `القسط ${installment.number}` : `#${installment.number}`}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(installment.amount)}</span>
                                {installment.paid_amount > 0 && installment.paid_amount < installment.amount && (
                                  <span className="text-xs text-green-600 dark:text-green-400 block">
                                    ({lang === 'ar' ? 'مدفوع' : 'Paid'}: {installment.paid_amount.toLocaleString()})
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-600 dark:text-slate-300">{installment.due_date}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                {getInstallmentBadge(installment.status)}
                              </td>
                              <td className="p-3 text-center">
                                {installment.status !== 'PAID' && (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    icon={CreditCard}
                                    onClick={() => {
                                      setSelectedInstallment(installment);
                                      setSelectedPlan(plan);
                                      setShowInstallmentModal(true);
                                    }}
                                  >
                                    {lang === 'ar' ? 'دفع' : 'Pay'}
                                  </Button>
                                )}
                                {installment.status === 'PAID' && (
                                  <span className="text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    {installment.paid_date}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              <Card>
                <CardBody>
                  <div className="text-center py-12">
                    <Layers className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                      {lang === 'ar' ? 'لا توجد خطط دفع' : 'No Payment Plans'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      {lang === 'ar' ? 'ليس لديك خطط دفع نشطة حالياً. تواصل مع الشؤون المالية لإنشاء خطة دفع.' : 'You don\'t have any active payment plans. Contact the finance department to create a payment plan.'}
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* Scholarships Tab */}
        {studentTab === 'scholarships' && (
          <div className="space-y-6">
            {/* Scholarships Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <StatCard
                title={lang === 'ar' ? 'المنح الحالية' : 'Current Scholarships'}
                value={myScholarships.filter(s => s.status === 'ACTIVE').length.toString()}
                subtitle={lang === 'ar' ? 'منحة' : 'scholarships'}
                icon={Award}
                iconColor="text-purple-600 bg-purple-50 dark:bg-purple-900/30"
              />
              <StatCard
                title={lang === 'ar' ? 'إجمالي المستلم' : 'Total Received'}
                value={formatCurrency(myScholarships.reduce((sum, s) => sum + s.total_disbursed, 0))}
                icon={DollarSign}
                iconColor="text-green-600 bg-green-50 dark:bg-green-900/30"
              />
              <StatCard
                title={lang === 'ar' ? 'المنح المتاحة' : 'Available Scholarships'}
                value={availableScholarships.filter(s => !myScholarships.some(ms => ms.scholarship_id === s.id)).length.toString()}
                subtitle={lang === 'ar' ? 'للتقديم' : 'to apply'}
                icon={GraduationCap}
                iconColor="text-blue-600 bg-blue-50 dark:bg-blue-900/30"
              />
            </div>

            {/* My Scholarships */}
            {myScholarships.length > 0 && (
              <Card>
                <CardHeader
                  title={lang === 'ar' ? 'منحي الدراسية' : 'My Scholarships'}
                  icon={Award}
                  iconColor="text-purple-600 bg-purple-50"
                />
                <CardBody noPadding>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {myScholarships.map((ss) => (
                      <div key={ss.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                                <Award className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800 dark:text-white">
                                  {lang === 'ar' ? ss.scholarship.name_ar : ss.scholarship.name}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {getScholarshipTypeLabel(ss.scholarship.type)} • {ss.scholarship.coverage_percentage}% {lang === 'ar' ? 'تغطية' : 'coverage'}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                              <div>
                                <p className="text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'إجمالي المنحة' : 'Total Awarded'}</p>
                                <p className="font-semibold text-slate-800 dark:text-white">{formatCurrency(ss.total_awarded)}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'المصروف' : 'Disbursed'}</p>
                                <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(ss.total_disbursed)}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'فصل البداية' : 'Start Semester'}</p>
                                <p className="font-semibold text-slate-800 dark:text-white">{ss.start_semester}</p>
                              </div>
                              {ss.gpa_requirement && (
                                <div>
                                  <p className="text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'الحد الأدنى للمعدل' : 'Min GPA'}</p>
                                  <p className="font-semibold text-slate-800 dark:text-white">{ss.gpa_requirement}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge variant={ss.status === 'ACTIVE' ? 'success' : ss.status === 'PENDING' ? 'warning' : 'secondary'}>
                            {ss.status === 'ACTIVE' ? (lang === 'ar' ? 'نشطة' : 'Active') :
                             ss.status === 'PENDING' ? (lang === 'ar' ? 'قيد المراجعة' : 'Pending') :
                             ss.status === 'APPROVED' ? (lang === 'ar' ? 'موافق عليها' : 'Approved') :
                             ss.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Available Scholarships */}
            <Card>
              <CardHeader
                title={lang === 'ar' ? 'المنح المتاحة للتقديم' : 'Available Scholarships'}
                icon={GraduationCap}
                iconColor="text-blue-600 bg-blue-50"
              />
              <CardBody>
                {availableScholarships.filter(s => !myScholarships.some(ms => ms.scholarship_id === s.id)).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableScholarships
                      .filter(s => !myScholarships.some(ms => ms.scholarship_id === s.id))
                      .map((scholarship) => (
                        <div key={scholarship.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                                <GraduationCap className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800 dark:text-white">
                                  {lang === 'ar' ? scholarship.name_ar : scholarship.name}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {getScholarshipTypeLabel(scholarship.type)}
                                </p>
                              </div>
                            </div>
                            <Badge variant="info" size="lg">
                              <Percent className="w-3 h-3 me-1" />
                              {scholarship.coverage_percentage}%
                            </Badge>
                          </div>

                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                            {lang === 'ar' ? scholarship.description_ar : scholarship.description}
                          </p>

                          <div className="flex items-center justify-between text-sm mb-4">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <Calendar className="w-4 h-4" />
                              <span>{lang === 'ar' ? 'آخر موعد:' : 'Deadline:'} {scholarship.application_deadline}</span>
                            </div>
                            {scholarship.max_semesters && (
                              <span className="text-slate-500 dark:text-slate-400">
                                {scholarship.max_semesters} {lang === 'ar' ? 'فصول' : 'semesters'}
                              </span>
                            )}
                          </div>

                          {scholarship.requirements && (
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-4 text-sm">
                              <p className="text-slate-500 dark:text-slate-400 mb-1">{lang === 'ar' ? 'المتطلبات:' : 'Requirements:'}</p>
                              <p className="text-slate-700 dark:text-slate-300">
                                {lang === 'ar' ? scholarship.requirements_ar : scholarship.requirements}
                              </p>
                            </div>
                          )}

                          <Button
                            variant="primary"
                            fullWidth
                            icon={FileCheck}
                            onClick={() => {
                              setSelectedScholarship(scholarship);
                              setShowScholarshipModal(true);
                            }}
                          >
                            {lang === 'ar' ? 'تقديم طلب' : 'Apply Now'}
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">
                      {lang === 'ar' ? 'لا توجد منح متاحة للتقديم حالياً' : 'No scholarships available for application at this time'}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* Payment Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title={t.payNow[lang]}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-600 mb-1">{t.amountToPay[lang]}</p>
              <p className="text-3xl font-bold text-blue-700">{formatCurrency(totalDue)}</p>
            </div>

            <Input label={t.cardNumber[lang]} placeholder="0000 0000 0000 0000" icon={CreditCard} />

            <div className="grid grid-cols-2 gap-4">
              <Input label={t.expiry[lang]} placeholder="MM/YY" />
              <Input label={t.cvc[lang]} placeholder="123" />
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={() => setShowPaymentModal(false)}>
                {t.cancel[lang]}
              </Button>
              <Button
                variant="success"
                fullWidth
                loading={paymentProcessing}
                onClick={handlePayment}
                icon={CheckCircle}
              >
                {t.confirmPayment[lang]}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Pay Installment Modal */}
        <Modal
          isOpen={showInstallmentModal}
          onClose={() => {
            setShowInstallmentModal(false);
            setSelectedInstallment(null);
            setSelectedPlan(null);
          }}
          title={lang === 'ar' ? 'دفع قسط' : 'Pay Installment'}
          size="md"
        >
          {selectedInstallment && selectedPlan && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-blue-600 dark:text-blue-400">{lang === 'ar' ? 'خطة الدفع' : 'Payment Plan'}</span>
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    {lang === 'ar' ? selectedPlan.name_ar : selectedPlan.name}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-blue-600 dark:text-blue-400">{lang === 'ar' ? 'رقم القسط' : 'Installment'}</span>
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    #{selectedInstallment.number}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600 dark:text-blue-400">{lang === 'ar' ? 'المبلغ المستحق' : 'Amount Due'}</span>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(selectedInstallment.amount - selectedInstallment.paid_amount)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-amber-700 dark:text-amber-300">
                  {lang === 'ar' ? 'تاريخ الاستحقاق:' : 'Due Date:'} {selectedInstallment.due_date}
                </span>
              </div>

              <Input label={t.cardNumber[lang]} placeholder="0000 0000 0000 0000" icon={CreditCard} />

              <div className="grid grid-cols-2 gap-4">
                <Input label={t.expiry[lang]} placeholder="MM/YY" />
                <Input label={t.cvc[lang]} placeholder="123" />
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" fullWidth onClick={() => {
                  setShowInstallmentModal(false);
                  setSelectedInstallment(null);
                  setSelectedPlan(null);
                }}>
                  {t.cancel[lang]}
                </Button>
                <Button
                  variant="success"
                  fullWidth
                  loading={paymentProcessing}
                  onClick={handlePayInstallment}
                  icon={CheckCircle}
                >
                  {lang === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment'}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Apply for Scholarship Modal */}
        <Modal
          isOpen={showScholarshipModal}
          onClose={() => {
            setShowScholarshipModal(false);
            setSelectedScholarship(null);
            setScholarshipReason('');
          }}
          title={lang === 'ar' ? 'التقديم على منحة' : 'Apply for Scholarship'}
          size="lg"
        >
          {selectedScholarship && (
            <div className="space-y-4">
              {/* Scholarship Info */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200">
                      {lang === 'ar' ? selectedScholarship.name_ar : selectedScholarship.name}
                    </h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      {getScholarshipTypeLabel(selectedScholarship.type)} • {selectedScholarship.coverage_percentage}% {lang === 'ar' ? 'تغطية' : 'coverage'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {lang === 'ar' ? selectedScholarship.description_ar : selectedScholarship.description}
                </p>
              </div>

              {/* Requirements */}
              {selectedScholarship.requirements && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {lang === 'ar' ? 'متطلبات المنحة:' : 'Scholarship Requirements:'}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {lang === 'ar' ? selectedScholarship.requirements_ar : selectedScholarship.requirements}
                  </p>
                </div>
              )}

              {/* Deadline Warning */}
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-amber-700 dark:text-amber-300">
                  {lang === 'ar' ? 'آخر موعد للتقديم:' : 'Application Deadline:'} {selectedScholarship.application_deadline}
                </span>
              </div>

              {/* Application Form */}
              <Textarea
                label={lang === 'ar' ? 'سبب التقديم (اختياري)' : 'Reason for Application (Optional)'}
                placeholder={lang === 'ar' ? 'اشرح لماذا تستحق هذه المنحة...' : 'Explain why you deserve this scholarship...'}
                value={scholarshipReason}
                onChange={(e) => setScholarshipReason(e.target.value)}
                rows={4}
              />

              {/* File Upload Hint */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  {lang === 'ar'
                    ? 'قد يُطلب منك تقديم مستندات داعمة بعد تقديم الطلب'
                    : 'You may be asked to submit supporting documents after applying'}
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" fullWidth onClick={() => {
                  setShowScholarshipModal(false);
                  setSelectedScholarship(null);
                  setScholarshipReason('');
                }}>
                  {t.cancel[lang]}
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  loading={paymentProcessing}
                  onClick={handleApplyScholarship}
                  icon={FileCheck}
                >
                  {lang === 'ar' ? 'تقديم الطلب' : 'Submit Application'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // Admin Tabs Component
  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: lang === 'ar' ? 'لوحة التحكم' : 'Dashboard', icon: BarChart3 },
    { id: 'reports', label: lang === 'ar' ? 'التقارير المالية' : 'Financial Reports', icon: FileBarChart },
    { id: 'invoices', label: lang === 'ar' ? 'الفواتير' : 'Invoices', icon: FileText },
    { id: 'debtors', label: lang === 'ar' ? 'الذمم المالية' : 'Receivables', icon: Users },
    { id: 'payments', label: lang === 'ar' ? 'المدفوعات' : 'Payments', icon: CreditCard },
    { id: 'plans', label: lang === 'ar' ? 'خطط الدفع' : 'Payment Plans', icon: Layers },
    { id: 'scholarships', label: lang === 'ar' ? 'المنح الدراسية' : 'Scholarships', icon: Award },
  ];

  // Render Dashboard Tab
  const renderDashboardTab = () => (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          title={t.totalRevenue[lang]}
          value="2.45M USD"
          subtitle={lang === 'ar' ? 'منذ بداية العام' : 'Year to date'}
          icon={DollarSign}
          iconColor="text-green-600 bg-green-50"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title={t.outstandingDebts[lang]}
          value="340.5K USD"
          subtitle={lang === 'ar' ? 'مستحقات معلقة' : 'Pending collections'}
          icon={AlertCircle}
          iconColor="text-red-600 bg-red-50"
          trend={{ value: -5, isPositive: true }}
        />
        <StatCard
          title={t.recentPayments[lang]}
          value="124"
          subtitle={lang === 'ar' ? 'اليوم' : 'Today'}
          icon={CheckCircle}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          title={lang === 'ar' ? 'متوسط الدفعة' : 'Avg. Payment'}
          value="1,250 USD"
          subtitle={lang === 'ar' ? 'هذا الشهر' : 'This month'}
          icon={TrendingUp}
          iconColor="text-purple-600 bg-purple-50"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title={lang === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
            icon={TrendingUp}
            iconColor="text-green-600 bg-green-50"
            action={
              <Select
                options={[
                  { value: 'month', label: lang === 'ar' ? 'شهري' : 'Monthly' },
                  { value: 'quarter', label: lang === 'ar' ? 'ربع سنوي' : 'Quarterly' },
                  { value: 'year', label: lang === 'ar' ? 'سنوي' : 'Yearly' },
                ]}
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                fullWidth={false}
                className="w-32"
              />
            }
          />
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    formatter={(value: number) => [formatCurrency(value), lang === 'ar' ? 'الإيرادات' : 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader
            title={lang === 'ar' ? 'طرق الدفع' : 'Payment Methods'}
            icon={CreditCard}
            iconColor="text-blue-600 bg-blue-50"
          />
          <CardBody>
            <div className="space-y-4">
              {paymentMethodsData.map((method, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{method.method}</span>
                    <span className="text-sm font-bold text-slate-800">{method.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(method.count / Math.max(...paymentMethodsData.map(m => m.count))) * 100}%`,
                        backgroundColor: method.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader
          title={t.recentActivities[lang]}
          icon={Receipt}
          iconColor="text-orange-600 bg-orange-50"
          action={
            <div className="flex items-center gap-3">
              <SearchInput
                placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth={false}
                className="w-48"
              />
              <Select
                options={[
                  { value: 'all', label: lang === 'ar' ? 'الكل' : 'All Status' },
                  { value: 'PAID', label: lang === 'ar' ? 'مدفوع' : 'Paid' },
                  { value: 'PENDING', label: lang === 'ar' ? 'معلق' : 'Pending' },
                  { value: 'OVERDUE', label: lang === 'ar' ? 'متأخر' : 'Overdue' },
                ]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                fullWidth={false}
                className="w-32"
              />
            </div>
          }
        />
        <CardBody noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>{t.date[lang]}</th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>{lang === 'ar' ? 'الطالب' : 'Student'}</th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>{t.description[lang]}</th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>{t.amount[lang]}</th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>{t.status[lang]}</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">{t.actions[lang]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFinancials.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm text-slate-600">{record.date}</td>
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{record.studentName || 'N/A'}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{record.description}</td>
                    <td className="p-4">
                      <span className={`font-bold ${record.type === 'CREDIT' ? 'text-green-600' : 'text-slate-800'}`}>
                        {formatCurrency(record.amount)}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge
                        status={record.status === 'PAID' ? 'paid' : record.status === 'PENDING' ? 'pending' : 'overdue'}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <IconButton icon={MoreVertical} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </>
  );

  // Render Reports Tab
  const renderReportsTab = () => (
    <>
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" icon={FileSpreadsheet} onClick={() => setShowReportModal(true)}>
          {lang === 'ar' ? 'إنشاء تقرير جديد' : 'Generate New Report'}
        </Button>
        <Button variant="outline" icon={Download} onClick={() => {
          const data = financials.map(f => ({
            [lang === 'ar' ? 'التاريخ' : 'Date']: f.date || f.created_at,
            [lang === 'ar' ? 'الوصف' : 'Description']: f.description,
            [lang === 'ar' ? 'المبلغ' : 'Amount']: f.amount,
            [lang === 'ar' ? 'الحالة' : 'Status']: f.status,
          }));
          exportToCSV(data, `finance-report-${new Date().toISOString().split('T')[0]}`);
        }}>
          {lang === 'ar' ? 'تصدير Excel' : 'Export Excel'}
        </Button>
        <Button variant="outline" icon={Printer} onClick={() => window.print()}>
          {lang === 'ar' ? 'طباعة' : 'Print'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          title={lang === 'ar' ? 'إجمالي الذمم' : 'Total Receivables'}
          value="281.5K USD"
          subtitle={lang === 'ar' ? '100 طالب' : '100 students'}
          icon={DollarSign}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          title={lang === 'ar' ? 'المحصّل هذا الشهر' : 'Collected This Month'}
          value="89.2K USD"
          subtitle={lang === 'ar' ? '+15% عن الشهر الماضي' : '+15% vs last month'}
          icon={CheckCircle}
          iconColor="text-green-600 bg-green-50"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title={lang === 'ar' ? 'متأخر السداد' : 'Overdue Amount'}
          value="78.0K USD"
          subtitle={lang === 'ar' ? '27 طالب' : '27 students'}
          icon={AlertTriangle}
          iconColor="text-red-600 bg-red-50"
          trend={{ value: -8, isPositive: true }}
        />
        <StatCard
          title={lang === 'ar' ? 'نسبة التحصيل' : 'Collection Rate'}
          value="72%"
          subtitle={lang === 'ar' ? 'الهدف: 85%' : 'Target: 85%'}
          icon={TrendingUp}
          iconColor="text-purple-600 bg-purple-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Receivables Aging */}
        <Card>
          <CardHeader
            title={lang === 'ar' ? 'تقادم الذمم المالية' : 'Receivables Aging'}
            icon={Clock}
            iconColor="text-orange-600 bg-orange-50"
          />
          <CardBody>
            <div className="space-y-4">
              {receivablesAgingData.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-medium text-slate-700">{item.range}</span>
                    </div>
                    <div className="text-end">
                      <span className="text-sm font-bold text-slate-800">{formatCurrency(item.amount)}</span>
                      <span className="text-xs text-slate-500 ms-2">({item.count} {lang === 'ar' ? 'طالب' : 'students'})</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.amount / Math.max(...receivablesAgingData.map(r => r.amount))) * 100}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                <span className="text-xl font-bold text-slate-800">
                  {formatCurrency(receivablesAgingData.reduce((sum, item) => sum + item.amount, 0))}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Collection Performance */}
        <Card>
          <CardHeader
            title={lang === 'ar' ? 'أداء التحصيل' : 'Collection Performance'}
            icon={TrendingUp}
            iconColor="text-green-600 bg-green-50"
          />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                <BarChart data={collectionPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    formatter={(value: number) => [formatCurrency(value)]}
                  />
                  <Bar dataKey="collected" fill="#22c55e" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'المحصّل' : 'Collected'} />
                  <Bar dataKey="target" fill="#e2e8f0" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'المستهدف' : 'Target'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Program-wise Receivables */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'الذمم حسب البرنامج' : 'Receivables by Program'}
          icon={Building}
          iconColor="text-indigo-600 bg-indigo-50"
          action={
            <Button variant="outline" size="sm" icon={Download}>
              {lang === 'ar' ? 'تصدير' : 'Export'}
            </Button>
          }
        />
        <CardBody noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'البرنامج' : 'Program'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'عدد الطلاب' : 'Students'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'إجمالي الذمم' : 'Total Receivables'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'النسبة' : 'Percentage'}
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">
                    {t.actions[lang]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {programReceivablesData.map((program, index) => {
                  const totalAmount = programReceivablesData.reduce((sum, p) => sum + p.amount, 0);
                  const percentage = ((program.amount / totalAmount) * 100).toFixed(1);
                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                            {program.program.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-800">{program.program}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{program.students}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800">{formatCurrency(program.amount)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-2">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-600">{percentage}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Button variant="ghost" size="sm" icon={Eye}>
                          {lang === 'ar' ? 'عرض' : 'View'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </>
  );

  // Render Invoices Tab
  const renderInvoicesTab = () => (
    <>
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" icon={Plus} onClick={() => setShowInvoiceModal(true)}>
          {lang === 'ar' ? 'إنشاء فاتورة جديدة' : 'Create New Invoice'}
        </Button>
        <Button variant="outline" icon={Send} onClick={() => toast.success(lang === 'ar' ? 'تم إرسال التذكيرات' : 'Reminders sent!')}>
          {lang === 'ar' ? 'إرسال تذكيرات' : 'Send Reminders'}
        </Button>
        <Button variant="outline" icon={Download} onClick={() => {
          const invoiceData = [
            { id: 'INV-001', student: 'Ahmed Ali', amount: 5000, status: 'Paid' },
            { id: 'INV-002', student: 'Sara Hassan', amount: 4500, status: 'Pending' },
            { id: 'INV-003', student: 'Mohamed Omar', amount: 5500, status: 'Overdue' },
          ];
          exportToCSV(invoiceData, `all-invoices-${new Date().toISOString().split('T')[0]}`);
        }}>
          {lang === 'ar' ? 'تصدير الكل' : 'Export All'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          title={lang === 'ar' ? 'إجمالي الفواتير' : 'Total Invoices'}
          value="156"
          subtitle={lang === 'ar' ? 'هذا الفصل' : 'This semester'}
          icon={FileText}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          title={lang === 'ar' ? 'مدفوعة' : 'Paid'}
          value="98"
          subtitle="62.8%"
          icon={CheckCircle}
          iconColor="text-green-600 bg-green-50"
        />
        <StatCard
          title={lang === 'ar' ? 'معلقة' : 'Pending'}
          value="42"
          subtitle="26.9%"
          icon={Clock}
          iconColor="text-yellow-600 bg-yellow-50"
        />
        <StatCard
          title={lang === 'ar' ? 'متأخرة' : 'Overdue'}
          value="16"
          subtitle="10.3%"
          icon={AlertTriangle}
          iconColor="text-red-600 bg-red-50"
        />
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'قائمة الفواتير' : 'Invoices List'}
          icon={FileText}
          iconColor="text-blue-600 bg-blue-50"
          action={
            <div className="flex items-center gap-3">
              <SearchInput
                placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth={false}
                className="w-48"
              />
              <Select
                options={[
                  { value: 'all', label: lang === 'ar' ? 'الكل' : 'All Status' },
                  { value: 'PAID', label: lang === 'ar' ? 'مدفوع' : 'Paid' },
                  { value: 'PENDING', label: lang === 'ar' ? 'معلق' : 'Pending' },
                  { value: 'OVERDUE', label: lang === 'ar' ? 'متأخر' : 'Overdue' },
                ]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                fullWidth={false}
                className="w-32"
              />
            </div>
          }
        />
        <CardBody noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'رقم الفاتورة' : 'Invoice #'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'الطالب' : 'Student'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {t.description[lang]}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {t.amount[lang]}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {t.status[lang]}
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">
                    {t.actions[lang]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoicesData.filter(inv => filterStatus === 'all' || inv.status === filterStatus).map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-slate-400" />
                        <span className="font-mono text-sm font-medium text-blue-600">{invoice.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-slate-800">{invoice.studentName}</p>
                        <p className="text-xs text-slate-500">{invoice.studentId}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{invoice.description}</td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800">{formatCurrency(invoice.amount)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{invoice.dueDate}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge
                        status={invoice.status === 'PAID' ? 'paid' : invoice.status === 'PENDING' ? 'pending' : 'overdue'}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <IconButton icon={Eye} size="sm" tooltip={lang === 'ar' ? 'عرض' : 'View'} />
                        <IconButton icon={Printer} size="sm" tooltip={lang === 'ar' ? 'طباعة' : 'Print'} />
                        <IconButton icon={Send} size="sm" tooltip={lang === 'ar' ? 'إرسال' : 'Send'} />
                        <IconButton icon={Edit} size="sm" tooltip={lang === 'ar' ? 'تعديل' : 'Edit'} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </>
  );

  // Render Debtors Tab
  const renderDebtorsTab = () => (
    <>
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" icon={Mail} onClick={() => toast.success(lang === 'ar' ? 'تم إرسال التذكير الجماعي' : 'Bulk reminder sent!')}>
          {lang === 'ar' ? 'إرسال تذكير جماعي' : 'Send Bulk Reminder'}
        </Button>
        <Button variant="outline" icon={Download} onClick={() => {
          const debtorsData = [
            { name: 'Ahmed Ali', studentId: 'STU001', amount: 2500, daysOverdue: 30 },
            { name: 'Sara Hassan', studentId: 'STU002', amount: 1800, daysOverdue: 15 },
            { name: 'Mohamed Omar', studentId: 'STU003', amount: 3200, daysOverdue: 45 },
          ];
          exportToCSV(debtorsData, `debtors-list-${new Date().toISOString().split('T')[0]}`);
        }}>
          {lang === 'ar' ? 'تصدير قائمة المدينين' : 'Export Debtors List'}
        </Button>
        <Button variant="outline" icon={RefreshCw} onClick={() => window.location.reload()}>
          {lang === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          title={lang === 'ar' ? 'إجمالي المدينين' : 'Total Debtors'}
          value="127"
          subtitle={lang === 'ar' ? 'طالب' : 'students'}
          icon={Users}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          title={lang === 'ar' ? 'إجمالي المستحقات' : 'Total Outstanding'}
          value="281.5K USD"
          icon={DollarSign}
          iconColor="text-red-600 bg-red-50"
        />
        <StatCard
          title={lang === 'ar' ? 'متأخر > 60 يوم' : 'Overdue > 60 days'}
          value="27"
          subtitle={lang === 'ar' ? 'يحتاج متابعة' : 'Need follow-up'}
          icon={AlertTriangle}
          iconColor="text-orange-600 bg-orange-50"
        />
        <StatCard
          title={lang === 'ar' ? 'حالات حرجة' : 'Critical Cases'}
          value="12"
          subtitle={lang === 'ar' ? '> 90 يوم' : '> 90 days'}
          icon={Ban}
          iconColor="text-red-600 bg-red-50"
        />
      </div>

      {/* Debtors Table */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'قائمة المدينين' : 'Debtors List'}
          icon={Users}
          iconColor="text-red-600 bg-red-50"
          action={
            <div className="flex items-center gap-3">
              <SearchInput
                placeholder={lang === 'ar' ? 'بحث بالاسم أو الرقم...' : 'Search by name or ID...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth={false}
                className="w-64"
              />
              <Select
                options={[
                  { value: 'all', label: lang === 'ar' ? 'الكل' : 'All' },
                  { value: '30', label: lang === 'ar' ? '> 30 يوم' : '> 30 days' },
                  { value: '60', label: lang === 'ar' ? '> 60 يوم' : '> 60 days' },
                  { value: '90', label: lang === 'ar' ? '> 90 يوم' : '> 90 days' },
                ]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                fullWidth={false}
                className="w-32"
              />
            </div>
          }
        />
        <CardBody noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'الطالب' : 'Student'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'البرنامج' : 'Program'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'المبلغ المستحق' : 'Amount Due'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'أيام التأخير' : 'Days Overdue'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'آخر دفعة' : 'Last Payment'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'التواصل' : 'Contact'}
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">
                    {t.actions[lang]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {debtorsData.map((debtor) => (
                  <tr key={debtor.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold">
                          {debtor.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{lang === 'ar' ? debtor.name : debtor.nameEn}</p>
                          <p className="text-xs text-slate-500">{debtor.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm text-slate-600">{debtor.program}</p>
                        <p className="text-xs text-slate-400">{lang === 'ar' ? `المستوى ${debtor.level}` : `Level ${debtor.level}`}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-red-600">{formatCurrency(debtor.totalDue)}</span>
                    </td>
                    <td className="p-4">
                      <Badge variant={debtor.overdueDays > 60 ? 'danger' : debtor.overdueDays > 30 ? 'warning' : 'info'}>
                        {debtor.overdueDays} {lang === 'ar' ? 'يوم' : 'days'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{debtor.lastPayment}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <IconButton icon={Phone} size="sm" tooltip={debtor.phone} />
                        <IconButton icon={Mail} size="sm" tooltip={debtor.email} />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" icon={Send}>
                          {lang === 'ar' ? 'تذكير' : 'Remind'}
                        </Button>
                        <IconButton icon={Eye} size="sm" tooltip={lang === 'ar' ? 'عرض' : 'View'} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </>
  );

  // Render Payments Tab
  const renderPaymentsTab = () => (
    <>
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" icon={Plus} onClick={() => setShowPaymentModal(true)}>
          {lang === 'ar' ? 'تسجيل دفعة يدوية' : 'Record Manual Payment'}
        </Button>
        <Button variant="outline" icon={Download} onClick={() => {
          const paymentData = financials.filter(f => f.type === 'payment' || f.status === 'PAID').map(f => ({
            [lang === 'ar' ? 'التاريخ' : 'Date']: f.date || f.created_at,
            [lang === 'ar' ? 'الوصف' : 'Description']: f.description,
            [lang === 'ar' ? 'المبلغ' : 'Amount']: f.amount,
            [lang === 'ar' ? 'طريقة الدفع' : 'Method']: f.method || 'N/A',
          }));
          exportToCSV(paymentData, `payment-history-${new Date().toISOString().split('T')[0]}`);
        }}>
          {lang === 'ar' ? 'تصدير سجل المدفوعات' : 'Export Payment History'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          title={lang === 'ar' ? 'مدفوعات اليوم' : "Today's Payments"}
          value="45.2K USD"
          subtitle="24 transactions"
          icon={DollarSign}
          iconColor="text-green-600 bg-green-50"
        />
        <StatCard
          title={lang === 'ar' ? 'مدفوعات الأسبوع' : 'This Week'}
          value="189.5K USD"
          subtitle="156 transactions"
          icon={Calendar}
          iconColor="text-blue-600 bg-blue-50"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title={lang === 'ar' ? 'مدفوعات الشهر' : 'This Month'}
          value="524.8K USD"
          subtitle="432 transactions"
          icon={TrendingUp}
          iconColor="text-purple-600 bg-purple-50"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title={lang === 'ar' ? 'معاملات معلقة' : 'Pending Transactions'}
          value="12"
          subtitle={lang === 'ar' ? 'تحتاج مراجعة' : 'Need review'}
          icon={Clock}
          iconColor="text-yellow-600 bg-yellow-50"
        />
      </div>

      {/* Recent Payments Table */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'سجل المدفوعات' : 'Payment History'}
          icon={Receipt}
          iconColor="text-green-600 bg-green-50"
          action={
            <div className="flex items-center gap-3">
              <SearchInput
                placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth={false}
                className="w-48"
              />
              <Select
                options={[
                  { value: 'all', label: lang === 'ar' ? 'جميع الطرق' : 'All Methods' },
                  { value: 'card', label: lang === 'ar' ? 'بطاقة' : 'Card' },
                  { value: 'bank', label: lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer' },
                  { value: 'cash', label: lang === 'ar' ? 'نقدي' : 'Cash' },
                ]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                fullWidth={false}
                className="w-40"
              />
            </div>
          }
        />
        <CardBody noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'رقم المعاملة' : 'Transaction ID'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'الطالب' : 'Student'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {t.amount[lang]}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'طريقة الدفع' : 'Method'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {t.date[lang]}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {t.status[lang]}
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">
                    {t.actions[lang]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { id: 'TXN-2024-001', student: 'أحمد المنصور', amount: 5000, method: 'بطاقة ائتمان', date: '2024-11-29', status: 'completed' },
                  { id: 'TXN-2024-002', student: 'سارة العمري', amount: 3500, method: 'تحويل بنكي', date: '2024-11-29', status: 'completed' },
                  { id: 'TXN-2024-003', student: 'محمد السعيد', amount: 1200, method: 'نقدي', date: '2024-11-28', status: 'pending' },
                  { id: 'TXN-2024-004', student: 'فاطمة الحربي', amount: 8000, method: 'بطاقة ائتمان', date: '2024-11-28', status: 'completed' },
                  { id: 'TXN-2024-005', student: 'عبدالرحمن النمري', amount: 2500, method: 'تحويل بنكي', date: '2024-11-27', status: 'completed' },
                ].map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-sm font-medium text-blue-600">{payment.id}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-800">{payment.student}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-green-600">+{formatCurrency(payment.amount)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{payment.method}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{payment.date}</td>
                    <td className="p-4">
                      <StatusBadge status={payment.status as any} />
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <IconButton icon={Eye} size="sm" tooltip={lang === 'ar' ? 'عرض' : 'View'} />
                        <IconButton icon={Printer} size="sm" tooltip={lang === 'ar' ? 'طباعة إيصال' : 'Print Receipt'} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </>
  );

  // Render Payment Plans Tab (Admin)
  const renderPlansTab = () => (
    <>
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" icon={Plus} onClick={() => setShowCreatePlanModal(true)}>
          {lang === 'ar' ? 'إنشاء خطة دفع' : 'Create Payment Plan'}
        </Button>
        <Button variant="outline" icon={Download} onClick={() => {
          const plansData = paymentPlans.map(p => ({
            [lang === 'ar' ? 'الاسم' : 'Name']: p.name,
            [lang === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount']: p.total_amount,
            [lang === 'ar' ? 'عدد الأقساط' : 'Installments']: p.installments_count,
            [lang === 'ar' ? 'الحالة' : 'Status']: p.status,
          }));
          exportToCSV(plansData, `payment-plans-${new Date().toISOString().split('T')[0]}`);
        }}>
          {lang === 'ar' ? 'تصدير الخطط' : 'Export Plans'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          title={lang === 'ar' ? 'إجمالي الخطط' : 'Total Plans'}
          value={adminPaymentPlans.length.toString()}
          subtitle={lang === 'ar' ? 'خطة' : 'plans'}
          icon={Layers}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          title={lang === 'ar' ? 'الخطط النشطة' : 'Active Plans'}
          value={adminPaymentPlans.filter(p => p.status === 'ACTIVE').length.toString()}
          icon={CheckCircle}
          iconColor="text-green-600 bg-green-50"
        />
        <StatCard
          title={lang === 'ar' ? 'الأقساط المتأخرة' : 'Overdue Installments'}
          value={adminPaymentPlans.reduce((sum, p) => sum + p.installments.filter(i => i.status === 'OVERDUE').length, 0).toString()}
          icon={AlertTriangle}
          iconColor="text-red-600 bg-red-50"
        />
        <StatCard
          title={lang === 'ar' ? 'المبلغ المعلق' : 'Pending Amount'}
          value={formatCurrency(adminPaymentPlans.reduce((sum, p) => sum + p.installments.filter(i => i.status !== 'PAID').reduce((s, i) => s + (i.amount - i.paid_amount), 0), 0))}
          icon={DollarSign}
          iconColor="text-amber-600 bg-amber-50"
        />
      </div>

      {/* Payment Plans Table */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'جميع خطط الدفع' : 'All Payment Plans'}
          icon={Layers}
          iconColor="text-blue-600 bg-blue-50"
          action={
            <div className="flex items-center gap-3">
              <SearchInput
                placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth={false}
                className="w-48"
              />
              <Select
                options={[
                  { value: 'all', label: lang === 'ar' ? 'جميع الحالات' : 'All Status' },
                  { value: 'ACTIVE', label: lang === 'ar' ? 'نشطة' : 'Active' },
                  { value: 'COMPLETED', label: lang === 'ar' ? 'مكتملة' : 'Completed' },
                  { value: 'CANCELLED', label: lang === 'ar' ? 'ملغاة' : 'Cancelled' },
                ]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                fullWidth={false}
                className="w-32"
              />
            </div>
          }
        />
        <CardBody noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'رقم الخطة' : 'Plan ID'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'الطالب' : 'Student'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'الأقساط' : 'Installments'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'التقدم' : 'Progress'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">
                    {t.actions[lang]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminPaymentPlans
                  .filter(p => filterStatus === 'all' || p.status === filterStatus)
                  .map((plan) => {
                    const paidCount = plan.installments.filter(i => i.status === 'PAID').length;
                    const progress = Math.round((paidCount / plan.installments.length) * 100);
                    return (
                      <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-sm font-medium text-blue-600">{plan.id}</span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-slate-800">{plan.student_name || 'N/A'}</p>
                            <p className="text-xs text-slate-500">{plan.student_number || ''}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-800">{formatCurrency(plan.total_amount)}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-slate-600">{paidCount} / {plan.installments.length}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-100 rounded-full h-2">
                              <div className="h-full rounded-full bg-green-500" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-sm text-slate-600">{progress}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={plan.status === 'ACTIVE' ? 'success' : plan.status === 'COMPLETED' ? 'info' : 'danger'}>
                            {plan.status === 'ACTIVE' ? (lang === 'ar' ? 'نشطة' : 'Active') :
                             plan.status === 'COMPLETED' ? (lang === 'ar' ? 'مكتملة' : 'Completed') :
                             (lang === 'ar' ? 'ملغاة' : 'Cancelled')}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <IconButton icon={Eye} size="sm" tooltip={lang === 'ar' ? 'عرض' : 'View'} onClick={() => handleViewPlan(plan)} />
                            <IconButton icon={Edit} size="sm" tooltip={lang === 'ar' ? 'تعديل' : 'Edit'} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </>
  );

  // Render Scholarships Tab (Admin)
  const renderScholarshipsTab = () => (
    <>
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" icon={Plus} onClick={() => setShowCreateScholarshipModal(true)}>
          {lang === 'ar' ? 'إنشاء منحة جديدة' : 'Create Scholarship'}
        </Button>
        <Button variant="outline" icon={Download} onClick={() => {
          const data = adminScholarships.map(s => ({
            code: s.code,
            name: s.name,
            name_ar: s.name_ar,
            type: s.type,
            coverage: `${s.coverage_percentage}%`,
            deadline: s.application_deadline,
            status: s.is_active ? 'Active' : 'Inactive'
          }));
          exportToCSV(data, 'scholarships');
        }}>
          {lang === 'ar' ? 'تصدير المنح' : 'Export Scholarships'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          title={lang === 'ar' ? 'إجمالي المنح' : 'Total Scholarships'}
          value={adminScholarships.length.toString()}
          subtitle={lang === 'ar' ? 'منحة' : 'scholarships'}
          icon={Award}
          iconColor="text-purple-600 bg-purple-50"
        />
        <StatCard
          title={lang === 'ar' ? 'المستفيدون النشطون' : 'Active Recipients'}
          value={allStudentScholarships.filter(s => s.status === 'ACTIVE').length.toString()}
          icon={Users}
          iconColor="text-green-600 bg-green-50"
        />
        <StatCard
          title={lang === 'ar' ? 'طلبات معلقة' : 'Pending Applications'}
          value={allStudentScholarships.filter(s => s.status === 'PENDING').length.toString()}
          icon={Clock}
          iconColor="text-amber-600 bg-amber-50"
        />
        <StatCard
          title={lang === 'ar' ? 'إجمالي المصروف' : 'Total Disbursed'}
          value={formatCurrency(allStudentScholarships.reduce((sum, s) => sum + s.total_disbursed, 0))}
          icon={DollarSign}
          iconColor="text-blue-600 bg-blue-50"
        />
      </div>

      {/* Scholarships Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Scholarships List */}
        <Card>
          <CardHeader
            title={lang === 'ar' ? 'المنح المتاحة' : 'Available Scholarships'}
            icon={Award}
            iconColor="text-purple-600 bg-purple-50"
          />
          <CardBody noPadding>
            <div className="divide-y divide-slate-100">
              {adminScholarships.map((scholarship) => (
                <div key={scholarship.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">
                            {lang === 'ar' ? scholarship.name_ar : scholarship.name}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {getScholarshipTypeLabel(scholarship.type)} • {scholarship.coverage_percentage}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{lang === 'ar' ? 'الكود:' : 'Code:'} {scholarship.code}</span>
                        <span>{lang === 'ar' ? 'آخر موعد:' : 'Deadline:'} {scholarship.application_deadline}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={scholarship.is_active ? 'success' : 'secondary'}>
                        {scholarship.is_active ? (lang === 'ar' ? 'نشطة' : 'Active') : (lang === 'ar' ? 'معطلة' : 'Inactive')}
                      </Badge>
                      <div className="flex gap-1">
                        <IconButton icon={Edit} size="sm" tooltip={lang === 'ar' ? 'تعديل' : 'Edit'} />
                        <IconButton icon={Eye} size="sm" tooltip={lang === 'ar' ? 'عرض' : 'View'} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Student Scholarships / Applications */}
        <Card>
          <CardHeader
            title={lang === 'ar' ? 'طلبات المنح' : 'Scholarship Applications'}
            icon={FileCheck}
            iconColor="text-blue-600 bg-blue-50"
          />
          <CardBody noPadding>
            <div className="divide-y divide-slate-100">
              {allStudentScholarships.map((ss) => (
                <div key={ss.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{ss.student_id}</h4>
                          <p className="text-sm text-slate-500">
                            {lang === 'ar' ? ss.scholarship.name_ar : ss.scholarship.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{lang === 'ar' ? 'المبلغ:' : 'Amount:'} {formatCurrency(ss.total_awarded)}</span>
                        <span>{lang === 'ar' ? 'تاريخ التقديم:' : 'Applied:'} {ss.applied_date}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={
                        ss.status === 'ACTIVE' ? 'success' :
                        ss.status === 'PENDING' ? 'warning' :
                        ss.status === 'APPROVED' ? 'info' :
                        ss.status === 'REJECTED' ? 'danger' : 'secondary'
                      }>
                        {ss.status === 'ACTIVE' ? (lang === 'ar' ? 'نشطة' : 'Active') :
                         ss.status === 'PENDING' ? (lang === 'ar' ? 'قيد المراجعة' : 'Pending') :
                         ss.status === 'APPROVED' ? (lang === 'ar' ? 'موافق عليها' : 'Approved') :
                         ss.status === 'REJECTED' ? (lang === 'ar' ? 'مرفوضة' : 'Rejected') :
                         ss.status}
                      </Badge>
                      {ss.status === 'PENDING' && (
                        <div className="flex gap-1">
                          <Button variant="success" size="sm" icon={CheckCircle}>
                            {lang === 'ar' ? 'قبول' : 'Approve'}
                          </Button>
                          <Button variant="danger" size="sm" icon={XCircle}>
                            {lang === 'ar' ? 'رفض' : 'Reject'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );

  // Admin/Finance View
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t.finance[lang]} - {lang === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard'}</h1>
          <p className="text-slate-500">{lang === 'ar' ? 'نظرة عامة على الأداء المالي' : 'Financial performance overview'}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={FileBarChart} onClick={() => setShowReportModal(true)}>
            {lang === 'ar' ? 'تقرير جديد' : 'New Report'}
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setShowInvoiceModal(true)}>
            {lang === 'ar' ? 'فاتورة جديدة' : 'New Invoice'}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'reports' && renderReportsTab()}
        {activeTab === 'invoices' && renderInvoicesTab()}
        {activeTab === 'debtors' && renderDebtorsTab()}
        {activeTab === 'payments' && renderPaymentsTab()}
        {activeTab === 'plans' && renderPlansTab()}
        {activeTab === 'scholarships' && renderScholarshipsTab()}
      </div>

      {/* Invoice Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title={lang === 'ar' ? 'إنشاء فاتورة جديدة' : 'Create New Invoice'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={lang === 'ar' ? 'رقم الطالب' : 'Student ID'}
              placeholder="STU-2024-XXX"
              value={invoiceForm.studentId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
              icon={Hash}
            />
            <Input
              label={lang === 'ar' ? 'اسم الطالب' : 'Student Name'}
              placeholder={lang === 'ar' ? 'أدخل اسم الطالب' : 'Enter student name'}
              value={invoiceForm.studentName}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, studentName: e.target.value })}
              icon={User}
            />
          </div>

          <Select
            label={lang === 'ar' ? 'نوع الفاتورة' : 'Invoice Type'}
            options={[
              { value: 'TUITION', label: lang === 'ar' ? 'رسوم دراسية' : 'Tuition Fees' },
              { value: 'REGISTRATION', label: lang === 'ar' ? 'رسوم تسجيل' : 'Registration Fees' },
              { value: 'LAB', label: lang === 'ar' ? 'رسوم مختبرات' : 'Lab Fees' },
              { value: 'ACTIVITY', label: lang === 'ar' ? 'رسوم أنشطة' : 'Activity Fees' },
              { value: 'OTHER', label: lang === 'ar' ? 'أخرى' : 'Other' },
            ]}
            value={invoiceForm.type}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, type: e.target.value })}
          />

          <Input
            label={t.description[lang]}
            placeholder={lang === 'ar' ? 'وصف الفاتورة' : 'Invoice description'}
            value={invoiceForm.description}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t.amount[lang]}
              placeholder="0.00"
              type="number"
              value={invoiceForm.amount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
              icon={DollarSign}
            />
            <Input
              label={lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
              type="date"
              value={invoiceForm.dueDate}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
              icon={Calendar}
            />
          </div>

          <Textarea
            label={lang === 'ar' ? 'ملاحظات' : 'Notes'}
            placeholder={lang === 'ar' ? 'ملاحظات إضافية (اختياري)' : 'Additional notes (optional)'}
            value={invoiceForm.notes}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
            rows={3}
          />

          <div className="flex gap-3 mt-6 pt-4 border-t">
            <Button variant="outline" fullWidth onClick={() => setShowInvoiceModal(false)}>
              {t.cancel[lang]}
            </Button>
            <Button variant="primary" fullWidth onClick={handleCreateInvoice} icon={Plus}>
              {lang === 'ar' ? 'إنشاء الفاتورة' : 'Create Invoice'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title={lang === 'ar' ? 'إنشاء تقرير مالي' : 'Generate Financial Report'}
        size="md"
      >
        <div className="space-y-4">
          <Select
            label={lang === 'ar' ? 'نوع التقرير' : 'Report Type'}
            options={[
              { value: 'receivables', label: lang === 'ar' ? 'تقرير الذمم المالية' : 'Receivables Report' },
              { value: 'aging', label: lang === 'ar' ? 'تقرير التقادم' : 'Aging Report' },
              { value: 'collection', label: lang === 'ar' ? 'تقرير التحصيل' : 'Collection Report' },
              { value: 'revenue', label: lang === 'ar' ? 'تقرير الإيرادات' : 'Revenue Report' },
              { value: 'student', label: lang === 'ar' ? 'تقرير مالي للطالب' : 'Student Financial Report' },
            ]}
            value={reportForm.type}
            onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={lang === 'ar' ? 'من تاريخ' : 'From Date'}
              type="date"
              value={reportForm.startDate}
              onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
            />
            <Input
              label={lang === 'ar' ? 'إلى تاريخ' : 'To Date'}
              type="date"
              value={reportForm.endDate}
              onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
            />
          </div>

          <Select
            label={lang === 'ar' ? 'حالة الفاتورة' : 'Invoice Status'}
            options={[
              { value: 'all', label: lang === 'ar' ? 'الكل' : 'All' },
              { value: 'PAID', label: lang === 'ar' ? 'مدفوع' : 'Paid' },
              { value: 'PENDING', label: lang === 'ar' ? 'معلق' : 'Pending' },
              { value: 'OVERDUE', label: lang === 'ar' ? 'متأخر' : 'Overdue' },
            ]}
            value={reportForm.status}
            onChange={(e) => setReportForm({ ...reportForm, status: e.target.value })}
          />

          <Select
            label={lang === 'ar' ? 'البرنامج' : 'Program'}
            options={[
              { value: 'all', label: lang === 'ar' ? 'جميع البرامج' : 'All Programs' },
              { value: 'CS', label: lang === 'ar' ? 'علوم الحاسب' : 'Computer Science' },
              { value: 'ENG', label: lang === 'ar' ? 'الهندسة' : 'Engineering' },
              { value: 'MED', label: lang === 'ar' ? 'الطب' : 'Medicine' },
              { value: 'BUS', label: lang === 'ar' ? 'إدارة الأعمال' : 'Business' },
              { value: 'LAW', label: lang === 'ar' ? 'القانون' : 'Law' },
            ]}
            value={reportForm.program}
            onChange={(e) => setReportForm({ ...reportForm, program: e.target.value })}
          />

          <div className="flex gap-3 mt-6 pt-4 border-t">
            <Button variant="outline" fullWidth onClick={() => setShowReportModal(false)}>
              {t.cancel[lang]}
            </Button>
            <Button variant="outline" fullWidth icon={Eye}>
              {lang === 'ar' ? 'معاينة' : 'Preview'}
            </Button>
            <Button variant="primary" fullWidth onClick={handleGenerateReport} icon={Download}>
              {lang === 'ar' ? 'تحميل التقرير' : 'Download Report'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Payment Plan Modal */}
      <Modal
        isOpen={showCreatePlanModal}
        onClose={() => setShowCreatePlanModal(false)}
        title={lang === 'ar' ? 'إنشاء خطة دفع جديدة' : 'Create New Payment Plan'}
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label={lang === 'ar' ? 'الطالب' : 'Student'}
            options={[
              { value: '', label: lang === 'ar' ? 'اختر الطالب...' : 'Select student...' },
              ...allStudents.map((s: any) => ({
                value: s.id.toString(),
                label: `${s.full_name_en || s.name || 'N/A'} (${s.student_number || s.id})`
              }))
            ]}
            value={planForm.student_id}
            onChange={(e) => setPlanForm({ ...planForm, student_id: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={lang === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}
              type="number"
              placeholder="0.00"
              value={planForm.total_amount}
              onChange={(e) => setPlanForm({ ...planForm, total_amount: e.target.value })}
              icon={DollarSign}
            />
            <Input
              label={lang === 'ar' ? 'الدفعة الأولى' : 'Down Payment'}
              type="number"
              placeholder="0.00"
              value={planForm.down_payment}
              onChange={(e) => setPlanForm({ ...planForm, down_payment: e.target.value })}
              icon={DollarSign}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={lang === 'ar' ? 'عدد الأقساط' : 'Number of Installments'}
              options={[
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '6', label: '6' },
                { value: '8', label: '8' },
                { value: '10', label: '10' },
                { value: '12', label: '12' },
              ]}
              value={planForm.number_of_installments}
              onChange={(e) => setPlanForm({ ...planForm, number_of_installments: e.target.value })}
            />
            <Select
              label={lang === 'ar' ? 'التكرار' : 'Frequency'}
              options={[
                { value: 'WEEKLY', label: lang === 'ar' ? 'أسبوعي' : 'Weekly' },
                { value: 'BI_WEEKLY', label: lang === 'ar' ? 'كل أسبوعين' : 'Bi-Weekly' },
                { value: 'MONTHLY', label: lang === 'ar' ? 'شهري' : 'Monthly' },
              ]}
              value={planForm.frequency}
              onChange={(e) => setPlanForm({ ...planForm, frequency: e.target.value })}
            />
          </div>

          <Input
            label={lang === 'ar' ? 'تاريخ البدء' : 'Start Date'}
            type="date"
            value={planForm.start_date}
            onChange={(e) => setPlanForm({ ...planForm, start_date: e.target.value })}
            icon={Calendar}
          />

          <Textarea
            label={lang === 'ar' ? 'ملاحظات' : 'Notes'}
            placeholder={lang === 'ar' ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
            value={planForm.notes}
            onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })}
            rows={3}
          />

          {/* Preview installments */}
          {planForm.total_amount && planForm.number_of_installments && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">
                {lang === 'ar' ? 'معاينة الأقساط' : 'Installments Preview'}
              </h4>
              <div className="text-sm text-slate-600">
                <p>
                  {lang === 'ar' ? 'المبلغ بعد الدفعة الأولى:' : 'Amount after down payment:'}{' '}
                  <span className="font-semibold">
                    {formatCurrency((parseFloat(planForm.total_amount) || 0) - (parseFloat(planForm.down_payment) || 0))}
                  </span>
                </p>
                <p>
                  {lang === 'ar' ? 'قيمة كل قسط:' : 'Each installment:'}{' '}
                  <span className="font-semibold">
                    {formatCurrency(((parseFloat(planForm.total_amount) || 0) - (parseFloat(planForm.down_payment) || 0)) / parseInt(planForm.number_of_installments))}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-4 border-t">
            <Button variant="outline" fullWidth onClick={() => setShowCreatePlanModal(false)}>
              {t.cancel[lang]}
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleCreatePaymentPlan}
              icon={Plus}
              loading={planFormLoading}
            >
              {lang === 'ar' ? 'إنشاء خطة الدفع' : 'Create Payment Plan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Payment Plan Modal */}
      <Modal
        isOpen={showViewPlanModal}
        onClose={() => { setShowViewPlanModal(false); setViewingPlan(null); }}
        title={lang === 'ar' ? 'تفاصيل خطة الدفع' : 'Payment Plan Details'}
        size="lg"
      >
        {viewingPlan && (
          <div className="space-y-6">
            {/* Plan Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase">{lang === 'ar' ? 'رقم الخطة' : 'Plan ID'}</p>
                <p className="text-lg font-bold text-blue-600">{viewingPlan.id}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase">{lang === 'ar' ? 'الحالة' : 'Status'}</p>
                <Badge variant={viewingPlan.status === 'ACTIVE' ? 'success' : viewingPlan.status === 'COMPLETED' ? 'info' : 'danger'}>
                  {viewingPlan.status}
                </Badge>
              </div>
            </div>

            {/* Student Info */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 uppercase mb-1">{lang === 'ar' ? 'الطالب' : 'Student'}</p>
              <p className="font-semibold text-slate-800">{viewingPlan.student_name || 'N/A'}</p>
              <p className="text-sm text-slate-600">{viewingPlan.student_number || ''}</p>
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase">{lang === 'ar' ? 'الإجمالي' : 'Total'}</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(viewingPlan.total_amount)}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 uppercase">{lang === 'ar' ? 'المدفوع' : 'Paid'}</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency((viewingPlan as any).paid_amount || 0)}</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-xs text-amber-600 uppercase">{lang === 'ar' ? 'المتبقي' : 'Remaining'}</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency((viewingPlan as any).remaining_amount || 0)}</p>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>{lang === 'ar' ? 'التقدم' : 'Progress'}</span>
                <span>{viewingPlan.progress_percentage || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${viewingPlan.progress_percentage || 0}%` }}
                />
              </div>
            </div>

            {/* Installments Table */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                {lang === 'ar' ? 'الأقساط' : 'Installments'} ({viewingPlan.installments.length})
              </h4>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3 text-start text-xs font-semibold text-slate-500">#</th>
                      <th className="p-3 text-start text-xs font-semibold text-slate-500">{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                      <th className="p-3 text-start text-xs font-semibold text-slate-500">{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                      <th className="p-3 text-start text-xs font-semibold text-slate-500">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="p-3 text-start text-xs font-semibold text-slate-500">{lang === 'ar' ? 'تاريخ الدفع' : 'Paid Date'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingPlan.installments.map((inst, idx) => (
                      <tr key={inst.id} className="hover:bg-slate-50">
                        <td className="p-3">{idx + 1}</td>
                        <td className="p-3 font-medium">{formatCurrency(inst.amount)}</td>
                        <td className="p-3">{inst.due_date}</td>
                        <td className="p-3">{getInstallmentBadge(inst.status)}</td>
                        <td className="p-3 text-slate-500">{inst.paid_date || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            {viewingPlan.notes && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase mb-1">{lang === 'ar' ? 'ملاحظات' : 'Notes'}</p>
                <p className="text-sm text-slate-700">{viewingPlan.notes}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" fullWidth onClick={() => { setShowViewPlanModal(false); setViewingPlan(null); }}>
                {t.close ? t.close[lang] : (lang === 'ar' ? 'إغلاق' : 'Close')}
              </Button>
              <Button variant="outline" fullWidth icon={Printer}>
                {lang === 'ar' ? 'طباعة' : 'Print'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Finance;
