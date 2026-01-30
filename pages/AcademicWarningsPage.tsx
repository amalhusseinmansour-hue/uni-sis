import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown,
  FileText, Calendar, User, BookOpen, Target, ArrowRight, ChevronRight,
  Shield, XCircle, Info, MessageSquare, Download, Eye, History,
  Lightbulb, Award, BarChart2, Activity, AlertOctagon, ThumbsUp, Search, Users
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useToast } from '../hooks/useToast';
import { studentsAPI } from '../api/students';
import { academicStatusAPI } from '../api/academicStatus';
import { exportToPDF } from '../utils/exportUtils';
import { Card, CardHeader, CardBody, StatCard, GradientCard } from '../components/ui/Card';
import Button, { IconButton } from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Input';
import { UserRole } from '../types';

interface AcademicWarningsPageProps {
  lang: 'en' | 'ar';
  role?: UserRole;
}

const AcademicWarningsPage: React.FC<AcademicWarningsPageProps> = ({ lang, role }) => {
  const toast = useToast();
  const isStaff = role === UserRole.STUDENT_AFFAIRS || role === UserRole.ADMIN;
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'improvement'>('current');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Staff-specific state
  const [studentSearch, setStudentSearch] = useState('');
  const [studentList, setStudentList] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allWarningsStats, setAllWarningsStats] = useState({
    totalStudents: 0,
    warningStudents: 0,
    probationStudents: 0,
    goodStandingStudents: 0,
  });

  // Staff: Create warning modal
  const [showCreateWarningModal, setShowCreateWarningModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [newWarning, setNewWarning] = useState({
    type: 'academic' as 'academic' | 'attendance' | 'conduct',
    reason: '',
    severity: 'warning' as 'warning' | 'probation',
    deadline: '',
    required_action: '',
    gpa_at_warning: '',
  });
  const [resolveData, setResolveData] = useState({
    resolution: '',
    resolution_notes: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Staff: Fetch all students
  useEffect(() => {
    const fetchStaffData = async () => {
      if (!isStaff) return;
      try {
        const studentsRes = await studentsAPI.getAll({ per_page: 100 });
        setStudentList(studentsRes.data || studentsRes || []);

        // Mock stats
        setAllWarningsStats({
          totalStudents: (studentsRes.data || studentsRes || []).length,
          warningStudents: 5,
          probationStudents: 2,
          goodStandingStudents: (studentsRes.data || studentsRes || []).length - 7,
        });
      } catch (error) {
        console.error('Error fetching staff data:', error);
      }
    };
    fetchStaffData();
  }, [isStaff]);

  // Staff: Search students
  useEffect(() => {
    const searchStudents = async () => {
      if (!isStaff || !studentSearch.trim()) return;
      setSearchLoading(true);
      try {
        const res = await studentsAPI.getAll({ search: studentSearch, per_page: 20 });
        setStudentList(res.data || res || []);
      } catch (error) {
        console.error('Error searching students:', error);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(searchStudents, 300);
    return () => clearTimeout(debounce);
  }, [studentSearch, isStaff]);

  // Academic status
  const academicStatus = {
    gpa: 2.15,
    requiredGPA: 2.0,
    warningsCount: 1,
    maxWarnings: 3,
    status: 'warning', // good, warning, probation, dismissed
    semester: lang === 'ar' ? 'الفصل الأول 2024-2025' : 'Fall 2024-2025',
    previousGPA: 2.45,
    trend: 'down',
  };

  // Current warnings
  const currentWarnings = [
    {
      id: '1',
      type: 'academic',
      title: lang === 'ar' ? 'إنذار أكاديمي - الأول' : 'Academic Warning - First',
      reason: lang === 'ar'
        ? 'انخفاض المعدل التراكمي عن الحد الأدنى المطلوب (2.0)'
        : 'GPA dropped below minimum required (2.0)',
      issuedDate: '2024-11-15',
      semester: lang === 'ar' ? 'الفصل الأول 2024' : 'Fall 2024',
      gpaAtWarning: 1.85,
      status: 'active',
      deadline: '2025-05-30',
      requiredAction: lang === 'ar'
        ? 'رفع المعدل التراكمي إلى 2.0 أو أعلى خلال الفصل القادم'
        : 'Raise GPA to 2.0 or higher within next semester',
    },
  ];

  // Warning history
  const warningHistory = [
    {
      id: '2',
      type: 'attendance',
      title: lang === 'ar' ? 'إنذار حضور' : 'Attendance Warning',
      reason: lang === 'ar'
        ? 'تجاوز الحد المسموح للغياب في مقرر CS201'
        : 'Exceeded absence limit in CS201',
      issuedDate: '2024-03-10',
      semester: lang === 'ar' ? 'الفصل الثاني 2023' : 'Spring 2023',
      status: 'resolved',
      resolvedDate: '2024-05-15',
      resolution: lang === 'ar' ? 'تحسن نسبة الحضور' : 'Attendance improved',
    },
    {
      id: '3',
      type: 'academic',
      title: lang === 'ar' ? 'إنذار أكاديمي تنبيهي' : 'Academic Alert',
      reason: lang === 'ar'
        ? 'معدل الفصل أقل من 2.0'
        : 'Semester GPA below 2.0',
      issuedDate: '2023-12-20',
      semester: lang === 'ar' ? 'الفصل الأول 2023' : 'Fall 2023',
      status: 'resolved',
      resolvedDate: '2024-06-01',
      resolution: lang === 'ar' ? 'تحسن المعدل التراكمي' : 'Cumulative GPA improved',
    },
  ];

  // Improvement plan recommendations
  const improvementPlan = {
    targetGPA: 2.5,
    currentGPA: 2.15,
    semestersLeft: 3,
    recommendations: [
      {
        id: '1',
        category: 'courses',
        priority: 'high',
        title: lang === 'ar' ? 'اختيار المقررات بحكمة' : 'Choose Courses Wisely',
        description: lang === 'ar'
          ? 'ركز على المقررات التي تجيدها وتجنب التحميل الزائد'
          : 'Focus on courses you excel in and avoid overloading',
        actions: [
          lang === 'ar' ? 'لا تسجل أكثر من 15 ساعة' : "Don't register more than 15 credits",
          lang === 'ar' ? 'تجنب المقررات الصعبة معاً' : 'Avoid difficult courses together',
        ],
      },
      {
        id: '2',
        category: 'study',
        priority: 'high',
        title: lang === 'ar' ? 'تحسين طرق الدراسة' : 'Improve Study Methods',
        description: lang === 'ar'
          ? 'خصص وقتاً كافياً للدراسة واستخدم تقنيات فعالة'
          : 'Allocate sufficient study time and use effective techniques',
        actions: [
          lang === 'ar' ? 'ادرس 2-3 ساعات يومياً' : 'Study 2-3 hours daily',
          lang === 'ar' ? 'استخدم مجموعات الدراسة' : 'Use study groups',
          lang === 'ar' ? 'راجع المادة أسبوعياً' : 'Review material weekly',
        ],
      },
      {
        id: '3',
        category: 'support',
        priority: 'medium',
        title: lang === 'ar' ? 'طلب المساعدة' : 'Seek Help',
        description: lang === 'ar'
          ? 'لا تتردد في طلب المساعدة من الأساتذة والمرشد الأكاديمي'
          : "Don't hesitate to ask professors and academic advisor for help",
        actions: [
          lang === 'ar' ? 'احضر الساعات المكتبية' : 'Attend office hours',
          lang === 'ar' ? 'استخدم مركز الدعم الأكاديمي' : 'Use academic support center',
          lang === 'ar' ? 'تواصل مع المرشد الأكاديمي' : 'Contact academic advisor',
        ],
      },
      {
        id: '4',
        category: 'attendance',
        priority: 'medium',
        title: lang === 'ar' ? 'الالتزام بالحضور' : 'Maintain Attendance',
        description: lang === 'ar'
          ? 'الحضور المنتظم يساعد على فهم المادة بشكل أفضل'
          : 'Regular attendance helps understand material better',
        actions: [
          lang === 'ar' ? 'احضر جميع المحاضرات' : 'Attend all lectures',
          lang === 'ar' ? 'كن منتبهاً ومشاركاً' : 'Be attentive and participate',
        ],
      },
    ],
  };

  // GPA projection
  const gpaProjection = [
    { semester: lang === 'ar' ? 'الحالي' : 'Current', gpa: 2.15, projected: false },
    { semester: lang === 'ar' ? 'القادم' : 'Next', gpa: 2.35, projected: true },
    { semester: lang === 'ar' ? 'بعد القادم' : 'Following', gpa: 2.50, projected: true },
  ];

  // Resources
  const resources = [
    {
      id: '1',
      title: lang === 'ar' ? 'مركز الدعم الأكاديمي' : 'Academic Support Center',
      description: lang === 'ar' ? 'دروس خصوصية ومساعدة في المواد الصعبة' : 'Tutoring and help with difficult subjects',
      location: lang === 'ar' ? 'مبنى الخدمات الطلابية - الطابق الثاني' : 'Student Services Building - 2nd Floor',
      hours: lang === 'ar' ? 'الأحد - الخميس: 8 ص - 4 م' : 'Sun - Thu: 8 AM - 4 PM',
    },
    {
      id: '2',
      title: lang === 'ar' ? 'مركز الإرشاد النفسي' : 'Counseling Center',
      description: lang === 'ar' ? 'دعم نفسي وإرشادي للطلاب' : 'Psychological support and guidance',
      location: lang === 'ar' ? 'مبنى العمادة - الطابق الأول' : 'Dean Building - 1st Floor',
      hours: lang === 'ar' ? 'الأحد - الخميس: 9 ص - 3 م' : 'Sun - Thu: 9 AM - 3 PM',
    },
    {
      id: '3',
      title: lang === 'ar' ? 'مهارات الدراسة' : 'Study Skills Workshops',
      description: lang === 'ar' ? 'ورش عمل لتطوير مهارات الدراسة' : 'Workshops to develop study skills',
      location: lang === 'ar' ? 'أونلاين وحضوري' : 'Online and In-person',
      hours: lang === 'ar' ? 'راجع التقويم الأكاديمي' : 'Check academic calendar',
    },
  ];

  // Staff: Create warning handler
  const handleCreateWarning = async () => {
    if (!selectedStudent || !newWarning.reason.trim()) {
      toast.warning(lang === 'ar' ? 'يرجى اختيار طالب وإدخال سبب الإنذار' : 'Please select a student and enter warning reason');
      return;
    }

    setActionLoading(true);
    try {
      await academicStatusAPI.createWarning({
        student_id: selectedStudent.id,
        type: newWarning.type,
        reason: newWarning.reason,
        severity: newWarning.severity,
        deadline: newWarning.deadline || undefined,
        required_action: newWarning.required_action || undefined,
        gpa_at_warning: newWarning.gpa_at_warning ? parseFloat(newWarning.gpa_at_warning) : undefined,
      });

      toast.success(lang === 'ar' ? 'تم إنشاء الإنذار بنجاح!' : 'Warning created successfully!');
      setShowCreateWarningModal(false);
      setNewWarning({
        type: 'academic',
        reason: '',
        severity: 'warning',
        deadline: '',
        required_action: '',
        gpa_at_warning: '',
      });
    } catch (error: any) {
      console.error('Error creating warning:', error);
      toast.error(error?.response?.data?.message || (lang === 'ar' ? 'حدث خطأ' : 'Error occurred'));
    } finally {
      setActionLoading(false);
    }
  };

  // Staff: Resolve warning handler
  const handleResolveWarning = async () => {
    if (!selectedWarning || !resolveData.resolution.trim()) {
      toast.warning(lang === 'ar' ? 'يرجى إدخال قرار الحل' : 'Please enter resolution');
      return;
    }

    setActionLoading(true);
    try {
      await academicStatusAPI.resolveWarning(selectedWarning.id, {
        resolution: resolveData.resolution,
        resolution_notes: resolveData.resolution_notes || undefined,
      });

      toast.success(lang === 'ar' ? 'تم حل الإنذار بنجاح!' : 'Warning resolved successfully!');
      setShowResolveModal(false);
      setShowDetailsModal(false);
      setResolveData({ resolution: '', resolution_notes: '' });
    } catch (error: any) {
      console.error('Error resolving warning:', error);
      toast.error(error?.response?.data?.message || (lang === 'ar' ? 'حدث خطأ' : 'Error occurred'));
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50' };
      case 'warning': return { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50' };
      case 'probation': return { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' };
      case 'dismissed': return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50' };
      default: return { bg: 'bg-slate-500', text: 'text-slate-600', light: 'bg-slate-50' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'good': return lang === 'ar' ? 'وضع أكاديمي جيد' : 'Good Standing';
      case 'warning': return lang === 'ar' ? 'إنذار أكاديمي' : 'Academic Warning';
      case 'probation': return lang === 'ar' ? 'تحت المراقبة' : 'Academic Probation';
      case 'dismissed': return lang === 'ar' ? 'فصل أكاديمي' : 'Academic Dismissal';
      default: return status;
    }
  };

  const renderCurrentTab = () => (
    <div className="space-y-6">
      {/* Status Overview */}
      <GradientCard
        gradient={
          academicStatus.status === 'good' ? 'from-green-600 via-emerald-600 to-teal-600' :
          academicStatus.status === 'warning' ? 'from-yellow-500 via-orange-500 to-amber-500' :
          'from-red-600 via-rose-600 to-pink-600'
        }
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {academicStatus.status === 'good' ? (
                <CheckCircle className="w-8 h-8" />
              ) : academicStatus.status === 'warning' ? (
                <AlertTriangle className="w-8 h-8" />
              ) : (
                <AlertOctagon className="w-8 h-8" />
              )}
              <h2 className="text-2xl font-bold">{getStatusLabel(academicStatus.status)}</h2>
            </div>
            <p className="text-white/80 mt-2">
              {academicStatus.status === 'warning'
                ? (lang === 'ar' ? 'يجب رفع المعدل التراكمي لتجنب المراقبة الأكاديمية' : 'Must raise GPA to avoid academic probation')
                : (lang === 'ar' ? 'أداؤك الأكاديمي ممتاز. استمر!' : 'Your academic performance is excellent. Keep it up!')}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{Number(academicStatus.gpa || 0).toFixed(2)}</p>
              <p className="text-sm text-white/70">{lang === 'ar' ? 'المعدل الحالي' : 'Current GPA'}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{academicStatus.warningsCount}/{academicStatus.maxWarnings}</p>
              <p className="text-sm text-white/70">{lang === 'ar' ? 'الإنذارات' : 'Warnings'}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center flex flex-col items-center justify-center">
              {academicStatus.trend === 'up' ? (
                <TrendingUp className="w-8 h-8" />
              ) : (
                <TrendingDown className="w-8 h-8" />
              )}
              <p className="text-sm text-white/70 mt-1">{lang === 'ar' ? 'الاتجاه' : 'Trend'}</p>
            </div>
          </div>
        </div>
      </GradientCard>

      {/* Active Warnings */}
      {currentWarnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/30">
          <CardHeader
            title={lang === 'ar' ? 'الإنذارات الفعالة' : 'Active Warnings'}
            icon={AlertTriangle}
            iconColor="text-yellow-600 bg-yellow-100"
          />
          <CardBody>
            <div className="space-y-4">
              {currentWarnings.map((warning) => (
                <div
                  key={warning.id}
                  className="p-4 bg-white rounded-xl border border-yellow-200 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedWarning(warning);
                    setShowDetailsModal(true);
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-800">{warning.title}</h4>
                        <Badge variant="warning">{lang === 'ar' ? 'فعال' : 'Active'}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{warning.reason}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-4 h-4" />
                          {warning.issuedDate}
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                          <Clock className="w-4 h-4" />
                          {lang === 'ar' ? 'الموعد النهائي:' : 'Deadline:'} {warning.deadline}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <p className="text-sm font-medium text-yellow-800">
                      {lang === 'ar' ? 'الإجراء المطلوب:' : 'Required Action:'}
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">{warning.requiredAction}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* No Warnings */}
      {currentWarnings.length === 0 && (
        <Card className="border-green-200 bg-green-50/30">
          <CardBody>
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800">
                {lang === 'ar' ? 'لا توجد إنذارات فعالة' : 'No Active Warnings'}
              </h3>
              <p className="text-green-600 mt-2">
                {lang === 'ar' ? 'أداؤك الأكاديمي ممتاز. استمر في العمل الجيد!' : 'Your academic performance is excellent. Keep up the good work!'}
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          title={lang === 'ar' ? 'المعدل المطلوب' : 'Required GPA'}
          value={academicStatus.requiredGPA.toFixed(1)}
          subtitle={lang === 'ar' ? 'الحد الأدنى' : 'Minimum'}
          icon={Target}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          title={lang === 'ar' ? 'معدلك الحالي' : 'Your Current GPA'}
          value={Number(academicStatus.gpa || 0).toFixed(2)}
          subtitle={academicStatus.gpa >= academicStatus.requiredGPA ? (lang === 'ar' ? 'أعلى من المطلوب' : 'Above minimum') : (lang === 'ar' ? 'أقل من المطلوب' : 'Below minimum')}
          icon={BarChart2}
          iconColor={academicStatus.gpa >= academicStatus.requiredGPA ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}
        />
        <StatCard
          title={lang === 'ar' ? 'الفرق' : 'Difference'}
          value={(Number(academicStatus.gpa || 0) - Number(academicStatus.requiredGPA || 0)).toFixed(2)}
          subtitle={academicStatus.gpa >= academicStatus.requiredGPA ? (lang === 'ar' ? 'زيادة' : 'Above') : (lang === 'ar' ? 'نقص' : 'Below')}
          icon={Activity}
          iconColor={academicStatus.gpa >= academicStatus.requiredGPA ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}
        />
        <StatCard
          title={lang === 'ar' ? 'الإنذارات المتبقية' : 'Warnings Left'}
          value={(academicStatus.maxWarnings - academicStatus.warningsCount).toString()}
          subtitle={lang === 'ar' ? `من ${academicStatus.maxWarnings}` : `of ${academicStatus.maxWarnings}`}
          icon={Shield}
          iconColor="text-orange-600 bg-orange-50"
        />
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'سجل الإنذارات' : 'Warning History'}
          icon={History}
          iconColor="text-slate-600 bg-slate-100"
        />
        <CardBody noPadding>
          {warningHistory.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {warningHistory.map((warning) => (
                <div key={warning.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    warning.status === 'resolved' ? 'bg-green-100' : 'bg-slate-100'
                  }`}>
                    {warning.status === 'resolved' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-800">{warning.title}</h4>
                      <Badge variant={warning.status === 'resolved' ? 'success' : 'default'}>
                        {warning.status === 'resolved' ? (lang === 'ar' ? 'تمت معالجته' : 'Resolved') : warning.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{warning.reason}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>{lang === 'ar' ? 'صدر:' : 'Issued:'} {warning.issuedDate}</span>
                      {warning.resolvedDate && (
                        <span>{lang === 'ar' ? 'حُل:' : 'Resolved:'} {warning.resolvedDate}</span>
                      )}
                    </div>
                    {warning.resolution && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                        {warning.resolution}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{lang === 'ar' ? 'لا يوجد سجل إنذارات سابقة' : 'No previous warnings'}</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const renderImprovementTab = () => (
    <div className="space-y-6">
      {/* GPA Improvement Target */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'هدف التحسين' : 'Improvement Target'}
          icon={Target}
          iconColor="text-green-600 bg-green-50"
        />
        <CardBody>
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">{lang === 'ar' ? 'المعدل الحالي' : 'Current GPA'}</span>
                <span className="font-bold text-slate-800">{Number(improvementPlan.currentGPA || 0).toFixed(2)}</span>
              </div>
              <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 start-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                  style={{ width: `${(improvementPlan.currentGPA / 4) * 100}%` }}
                ></div>
                <div
                  className="absolute top-0 bottom-0 w-1 bg-green-600"
                  style={{ left: `${(improvementPlan.targetGPA / 4) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-400">0.0</span>
                <span className="text-xs text-green-600 font-medium">
                  {lang === 'ar' ? 'الهدف:' : 'Target:'} {Number(improvementPlan.targetGPA || 0).toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">4.0</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">+{(Number(improvementPlan.targetGPA || 0) - Number(improvementPlan.currentGPA || 0)).toFixed(2)}</p>
              <p className="text-sm text-slate-500">{lang === 'ar' ? 'المطلوب' : 'Needed'}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* GPA Projection */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'التوقعات' : 'GPA Projection'}
          icon={TrendingUp}
          iconColor="text-blue-600 bg-blue-50"
        />
        <CardBody>
          <div className="flex items-end justify-around gap-4 h-48">
            {gpaProjection.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-16 rounded-t-lg transition-all ${
                    item.projected ? 'bg-blue-300 border-2 border-dashed border-blue-400' : 'bg-blue-500'
                  }`}
                  style={{ height: `${(item.gpa / 4) * 150}px` }}
                ></div>
                <div className="mt-2 text-center">
                  <p className="font-bold text-slate-800">{Number(item.gpa || 0).toFixed(2)}</p>
                  <p className="text-xs text-slate-500">{item.semester}</p>
                  {item.projected && (
                    <Badge variant="info" size="sm" className="mt-1">{lang === 'ar' ? 'متوقع' : 'Projected'}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'خطة التحسين' : 'Improvement Plan'}
          icon={Lightbulb}
          iconColor="text-yellow-600 bg-yellow-50"
        />
        <CardBody>
          <div className="space-y-4">
            {improvementPlan.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    rec.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-800">{rec.title}</h4>
                      <Badge variant={rec.priority === 'high' ? 'danger' : 'warning'} size="sm">
                        {rec.priority === 'high' ? (lang === 'ar' ? 'أولوية عالية' : 'High Priority') : (lang === 'ar' ? 'مهم' : 'Important')}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{rec.description}</p>
                    <ul className="mt-3 space-y-1">
                      {rec.actions.map((action, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                          <ArrowRight className="w-4 h-4 text-blue-500" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Support Resources */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'موارد الدعم' : 'Support Resources'}
          icon={Award}
          iconColor="text-purple-600 bg-purple-50"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <div key={resource.id} className="p-4 bg-slate-50 rounded-xl">
                <h4 className="font-semibold text-slate-800">{resource.title}</h4>
                <p className="text-sm text-slate-500 mt-1">{resource.description}</p>
                <div className="mt-3 space-y-1 text-xs text-slate-400">
                  <p>{resource.location}</p>
                  <p>{resource.hours}</p>
                </div>
                <Button variant="ghost" size="sm" className="mt-3 w-full" icon={ChevronRight}>
                  {lang === 'ar' ? 'المزيد' : 'Learn More'}
                </Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Tabs configuration
  const tabs = [
    { id: 'current', label: lang === 'ar' ? 'الحالة الحالية' : 'Current Status', icon: AlertTriangle },
    { id: 'history', label: lang === 'ar' ? 'السجل' : 'History', icon: History },
    { id: 'improvement', label: lang === 'ar' ? 'خطة التحسين' : 'Improvement Plan', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Staff Header Banner */}
      {isStaff && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                {lang === 'ar' ? 'إدارة الحالات الأكاديمية' : 'Academic Status Management'}
              </h1>
              <p className="text-emerald-100 mt-1">
                {lang === 'ar' ? 'متابعة الإنذارات والحالات الأكاديمية للطلاب' : 'Monitor student warnings and academic status'}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{allWarningsStats.totalStudents}</p>
                <p className="text-xs text-emerald-100">{lang === 'ar' ? 'إجمالي الطلاب' : 'Total Students'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-300">{allWarningsStats.warningStudents}</p>
                <p className="text-xs text-emerald-100">{lang === 'ar' ? 'إنذار' : 'Warning'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-300">{allWarningsStats.probationStudents}</p>
                <p className="text-xs text-emerald-100">{lang === 'ar' ? 'مراقبة' : 'Probation'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-300">{allWarningsStats.goodStandingStudents}</p>
                <p className="text-xs text-emerald-100">{lang === 'ar' ? 'جيد' : 'Good'}</p>
              </div>
            </div>
          </div>

          {/* Student Search */}
          <div className="mt-4 relative">
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
              <Search className="w-5 h-5 text-emerald-200" />
              <input
                type="text"
                placeholder={lang === 'ar' ? 'ابحث عن طالب بالاسم أو الرقم الجامعي...' : 'Search student by name or ID...'}
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-emerald-200 outline-none"
              />
              {searchLoading && (
                <div className="w-5 h-5 border-2 border-emerald-200 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {studentSearch && studentList.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 max-h-64 overflow-y-auto z-50">
                {studentList.map((student: any) => (
                  <div
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                      setStudentSearch('');
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                      {(student.name || student.name_en || 'S').charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{student.name || student.name_en || student.name_ar}</p>
                      <p className="text-sm text-slate-500">{student.student_id || student.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Student */}
          {selectedStudent && (
            <div className="mt-4 bg-white/20 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-xl">
                  {(selectedStudent.name || selectedStudent.name_en || 'S').charAt(0)}
                </div>
                <div>
                  <p className="font-bold">{selectedStudent.name || selectedStudent.name_en || selectedStudent.name_ar}</p>
                  <p className="text-sm text-emerald-100">
                    {lang === 'ar' ? 'الرقم الجامعي: ' : 'Student ID: '}{selectedStudent.student_id || selectedStudent.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateWarningModal(true)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {lang === 'ar' ? 'إنشاء إنذار' : 'Create Warning'}
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  {lang === 'ar' ? 'مسح' : 'Clear'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header - Student View */}
      {!isStaff && (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {lang === 'ar' ? 'الحالة الأكاديمية والإنذارات' : 'Academic Status & Warnings'}
          </h1>
          <p className="text-slate-500">
            {lang === 'ar' ? 'تتبع وضعك الأكاديمي والإنذارات وخطط التحسين' : 'Track your academic standing, warnings, and improvement plans'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={Download} onClick={() => {
            const data = [{
              status: getStatusLabel(academicStatus.status),
              currentGPA: academicStatus.gpa,
              requiredGPA: academicStatus.requiredGPA,
              warningsCount: academicStatus.warningsCount,
              maxWarnings: academicStatus.maxWarnings,
              semester: academicStatus.semester,
              trend: academicStatus.trend
            }];
            exportToPDF(data, 'academic-status-report');
          }}>
            {lang === 'ar' ? 'تحميل التقرير' : 'Download Report'}
          </Button>
          <Button variant="outline" icon={MessageSquare}>
            {lang === 'ar' ? 'تواصل مع المرشد' : 'Contact Advisor'}
          </Button>
        </div>
      </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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
      {activeTab === 'current' && renderCurrentTab()}
      {activeTab === 'history' && renderHistoryTab()}
      {activeTab === 'improvement' && renderImprovementTab()}

      {/* Warning Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={lang === 'ar' ? 'تفاصيل الإنذار' : 'Warning Details'}
        size="md"
      >
        {selectedWarning && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                <div>
                  <h3 className="font-bold text-yellow-800">{selectedWarning.title}</h3>
                  <p className="text-sm text-yellow-600">{selectedWarning.semester}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}</p>
                <p className="font-medium text-slate-800">{selectedWarning.issuedDate}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'المعدل عند الإنذار' : 'GPA at Warning'}</p>
                <p className="font-medium text-slate-800">{selectedWarning.gpaAtWarning ? Number(selectedWarning.gpaAtWarning).toFixed(2) : 'N/A'}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">{lang === 'ar' ? 'سبب الإنذار' : 'Reason'}</p>
              <p className="text-slate-800">{selectedWarning.reason}</p>
            </div>

            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-red-600 mb-1">{lang === 'ar' ? 'الموعد النهائي للتحسين' : 'Improvement Deadline'}</p>
              <p className="font-bold text-red-800">{selectedWarning.deadline}</p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 mb-1">{lang === 'ar' ? 'الإجراء المطلوب' : 'Required Action'}</p>
              <p className="text-blue-800">{selectedWarning.requiredAction}</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" fullWidth onClick={() => setShowDetailsModal(false)}>
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </Button>
              {isStaff && selectedWarning?.status === 'active' && (
                <Button
                  variant="success"
                  fullWidth
                  icon={CheckCircle}
                  onClick={() => setShowResolveModal(true)}
                >
                  {lang === 'ar' ? 'حل الإنذار' : 'Resolve Warning'}
                </Button>
              )}
              {!isStaff && (
                <Button variant="primary" fullWidth icon={MessageSquare}>
                  {lang === 'ar' ? 'تواصل مع المرشد' : 'Contact Advisor'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Warning Modal - Staff Only */}
      <Modal
        isOpen={showCreateWarningModal}
        onClose={() => setShowCreateWarningModal(false)}
        title={lang === 'ar' ? 'إنشاء إنذار جديد' : 'Create New Warning'}
        size="md"
      >
        <div className="space-y-4">
          {/* Student Info */}
          {selectedStudent && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {(selectedStudent.name || selectedStudent.name_en || 'S').charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-blue-800">{selectedStudent.name || selectedStudent.name_en || selectedStudent.name_ar}</p>
                  <p className="text-sm text-blue-600">{selectedStudent.student_id || selectedStudent.id}</p>
                </div>
              </div>
            </div>
          )}

          {/* Warning Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {lang === 'ar' ? 'نوع الإنذار' : 'Warning Type'}
            </label>
            <select
              value={newWarning.type}
              onChange={(e) => setNewWarning({ ...newWarning, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="academic">{lang === 'ar' ? 'أكاديمي' : 'Academic'}</option>
              <option value="attendance">{lang === 'ar' ? 'حضور' : 'Attendance'}</option>
              <option value="conduct">{lang === 'ar' ? 'سلوك' : 'Conduct'}</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {lang === 'ar' ? 'شدة الإنذار' : 'Severity'}
            </label>
            <select
              value={newWarning.severity}
              onChange={(e) => setNewWarning({ ...newWarning, severity: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="warning">{lang === 'ar' ? 'إنذار' : 'Warning'}</option>
              <option value="probation">{lang === 'ar' ? 'مراقبة' : 'Probation'}</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {lang === 'ar' ? 'سبب الإنذار' : 'Warning Reason'} *
            </label>
            <textarea
              value={newWarning.reason}
              onChange={(e) => setNewWarning({ ...newWarning, reason: e.target.value })}
              placeholder={lang === 'ar' ? 'أدخل سبب الإنذار...' : 'Enter warning reason...'}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* GPA at Warning (for academic) */}
          {newWarning.type === 'academic' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {lang === 'ar' ? 'المعدل عند الإنذار' : 'GPA at Warning'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={newWarning.gpa_at_warning}
                onChange={(e) => setNewWarning({ ...newWarning, gpa_at_warning: e.target.value })}
                placeholder="e.g., 1.85"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {lang === 'ar' ? 'الموعد النهائي للتحسين' : 'Improvement Deadline'}
            </label>
            <input
              type="date"
              value={newWarning.deadline}
              onChange={(e) => setNewWarning({ ...newWarning, deadline: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Required Action */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {lang === 'ar' ? 'الإجراء المطلوب' : 'Required Action'}
            </label>
            <textarea
              value={newWarning.required_action}
              onChange={(e) => setNewWarning({ ...newWarning, required_action: e.target.value })}
              placeholder={lang === 'ar' ? 'أدخل الإجراء المطلوب من الطالب...' : 'Enter required action from student...'}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" fullWidth onClick={() => setShowCreateWarningModal(false)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="danger"
              fullWidth
              icon={AlertTriangle}
              onClick={handleCreateWarning}
              disabled={actionLoading || !newWarning.reason.trim()}
            >
              {actionLoading ? (lang === 'ar' ? 'جاري الإنشاء...' : 'Creating...') : (lang === 'ar' ? 'إنشاء الإنذار' : 'Create Warning')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Resolve Warning Modal - Staff Only */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title={lang === 'ar' ? 'حل الإنذار' : 'Resolve Warning'}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-green-700 text-sm">
              {lang === 'ar'
                ? 'سيتم إغلاق هذا الإنذار وإعلام الطالب. يرجى إدخال سبب الحل.'
                : 'This warning will be closed and the student will be notified. Please enter resolution reason.'}
            </p>
          </div>

          {/* Resolution */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {lang === 'ar' ? 'قرار الحل' : 'Resolution'} *
            </label>
            <select
              value={resolveData.resolution}
              onChange={(e) => setResolveData({ ...resolveData, resolution: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{lang === 'ar' ? 'اختر...' : 'Select...'}</option>
              <option value="improved">{lang === 'ar' ? 'تحسن الأداء' : 'Performance Improved'}</option>
              <option value="conditions_met">{lang === 'ar' ? 'تم استيفاء الشروط' : 'Conditions Met'}</option>
              <option value="appeal_accepted">{lang === 'ar' ? 'قُبل الاستئناف' : 'Appeal Accepted'}</option>
              <option value="administrative">{lang === 'ar' ? 'قرار إداري' : 'Administrative Decision'}</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {lang === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
            </label>
            <textarea
              value={resolveData.resolution_notes}
              onChange={(e) => setResolveData({ ...resolveData, resolution_notes: e.target.value })}
              placeholder={lang === 'ar' ? 'أدخل أي ملاحظات إضافية...' : 'Enter any additional notes...'}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" fullWidth onClick={() => setShowResolveModal(false)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="success"
              fullWidth
              icon={CheckCircle}
              onClick={handleResolveWarning}
              disabled={actionLoading || !resolveData.resolution}
            >
              {actionLoading ? (lang === 'ar' ? 'جاري الحل...' : 'Resolving...') : (lang === 'ar' ? 'حل الإنذار' : 'Resolve Warning')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AcademicWarningsPage;
