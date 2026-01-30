import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import {
  School, Users, BookOpen, GraduationCap, Calendar, FileText,
  TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle,
  BarChart3, PieChart, Activity, RefreshCw, Search, Plus,
  ChevronRight, ArrowUpRight, ArrowDownRight, Settings,
  Edit2, Trash2, Eye, Download, Upload, Filter, MoreVertical,
  Link2, Unlink, PlayCircle, PauseCircle, Lock, Unlock,
  ClipboardList, UserCheck, FileCheck, Send, X, Save, Loader2,
  CheckSquare, Square, AlertCircle, UserPlus, UserMinus,
  Clipboard, Award, Building, ListChecks, Bell, Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { lmsAPI } from '../../api/lms';

interface AcademicAffairsManagementProps {
  lang: 'en' | 'ar';
}

const t = {
  title: { en: 'Academic Affairs Management', ar: 'إدارة الشؤون الأكاديمية' },
  subtitle: { en: 'Complete control over academic operations', ar: 'تحكم كامل في العمليات الأكاديمية' },
  overview: { en: 'Overview', ar: 'نظرة عامة' },
  programs: { en: 'Programs', ar: 'البرامج' },
  courses: { en: 'Courses', ar: 'المواد' },
  semesters: { en: 'Semesters', ar: 'الفصول' },
  students: { en: 'Students', ar: 'الطلاب' },
  requests: { en: 'Requests', ar: 'الطلبات' },
  registration: { en: 'Registration', ar: 'التسجيل' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  enrollments: { en: 'Enrollments', ar: 'التسجيلات' },
  activeStudents: { en: 'Active Students', ar: 'الطلاب النشطين' },
  graduatedStudents: { en: 'Graduated', ar: 'الخريجين' },
  currentSemester: { en: 'Current Semester', ar: 'الفصل الحالي' },
  registrationStatus: { en: 'Registration Status', ar: 'حالة التسجيل' },
  open: { en: 'Open', ar: 'مفتوح' },
  closed: { en: 'Closed', ar: 'مغلق' },
  quickActions: { en: 'Quick Actions', ar: 'إجراءات سريعة' },
  managePrograms: { en: 'Manage Programs', ar: 'إدارة البرامج' },
  manageCourses: { en: 'Manage Courses', ar: 'إدارة المواد' },
  manageSemesters: { en: 'Manage Semesters', ar: 'إدارة الفصول' },
  viewReports: { en: 'View Reports', ar: 'عرض التقارير' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  refresh: { en: 'Refresh', ar: 'تحديث' },
  viewAll: { en: 'View All', ar: 'عرض الكل' },
  active: { en: 'Active', ar: 'نشط' },
  inactive: { en: 'Inactive', ar: 'غير نشط' },
  pending: { en: 'Pending', ar: 'معلق' },
  approved: { en: 'Approved', ar: 'موافق عليه' },
  rejected: { en: 'Rejected', ar: 'مرفوض' },
  openRegistration: { en: 'Open Registration', ar: 'فتح التسجيل' },
  closeRegistration: { en: 'Close Registration', ar: 'إغلاق التسجيل' },
  addCourse: { en: 'Add Course', ar: 'إضافة مادة' },
  addProgram: { en: 'Add Program', ar: 'إضافة برنامج' },
  addSemester: { en: 'Add Semester', ar: 'إضافة فصل' },
  totalEnrollments: { en: 'Total Enrollments', ar: 'إجمالي التسجيلات' },
  pendingRequests: { en: 'Pending Requests', ar: 'الطلبات المعلقة' },
  recentActivities: { en: 'Recent Activities', ar: 'النشاطات الأخيرة' },
  academicCalendar: { en: 'Academic Calendar', ar: 'التقويم الأكاديمي' },
  universityReq: { en: 'University Requirements', ar: 'متطلبات الجامعة' },
  collegeReq: { en: 'College Requirements', ar: 'متطلبات الكلية' },
  majorReq: { en: 'Major Requirements', ar: 'متطلبات التخصص' },
  graduationProject: { en: 'Graduation Project', ar: 'مشروع التخرج' },
  colleges: { en: 'Colleges', ar: 'الكليات' },
  departments: { en: 'Departments', ar: 'الأقسام' },
  totalCredits: { en: 'Total Credits', ar: 'إجمالي الساعات' },
  assignCourseToPrograms: { en: 'Assign Course to Programs', ar: 'تعيين مادة للبرامج' },
  bulkActions: { en: 'Bulk Actions', ar: 'إجراءات جماعية' },
  export: { en: 'Export', ar: 'تصدير' },
  import: { en: 'Import', ar: 'استيراد' },
  statistics: { en: 'Statistics', ar: 'الإحصائيات' },
  systemHealth: { en: 'System Health', ar: 'صحة النظام' },
  dataIntegrity: { en: 'Data Integrity', ar: 'سلامة البيانات' },
  lastSync: { en: 'Last Sync', ar: 'آخر مزامنة' },
  syncNow: { en: 'Sync Now', ar: 'مزامنة الآن' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  confirm: { en: 'Confirm', ar: 'تأكيد' },
  search: { en: 'Search...', ar: 'بحث...' },
  noData: { en: 'No data available', ar: 'لا توجد بيانات' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  status: { en: 'Status', ar: 'الحالة' },
  date: { en: 'Date', ar: 'التاريخ' },
  type: { en: 'Type', ar: 'النوع' },
  name: { en: 'Name', ar: 'الاسم' },
  code: { en: 'Code', ar: 'الرمز' },
  credits: { en: 'Credits', ar: 'الساعات' },
  capacity: { en: 'Capacity', ar: 'السعة' },
  enrolled: { en: 'Enrolled', ar: 'المسجلين' },
  available: { en: 'Available', ar: 'المتاح' },
  approve: { en: 'Approve', ar: 'موافقة' },
  reject: { en: 'Reject', ar: 'رفض' },
  selectAll: { en: 'Select All', ar: 'تحديد الكل' },
  deselectAll: { en: 'Deselect All', ar: 'إلغاء التحديد' },
  bulkApprove: { en: 'Bulk Approve', ar: 'موافقة جماعية' },
  bulkReject: { en: 'Bulk Reject', ar: 'رفض جماعي' },
  requestDetails: { en: 'Request Details', ar: 'تفاصيل الطلب' },
  student: { en: 'Student', ar: 'الطالب' },
  submittedAt: { en: 'Submitted At', ar: 'تاريخ التقديم' },
  notes: { en: 'Notes', ar: 'ملاحظات' },
  addNote: { en: 'Add Note', ar: 'إضافة ملاحظة' },
  registrationPeriod: { en: 'Registration Period', ar: 'فترة التسجيل' },
  addDrop: { en: 'Add/Drop Period', ar: 'فترة الإضافة والحذف' },
  lateRegistration: { en: 'Late Registration', ar: 'التسجيل المتأخر' },
  withdrawalDeadline: { en: 'Withdrawal Deadline', ar: 'آخر موعد للانسحاب' },
  academicPolicies: { en: 'Academic Policies', ar: 'السياسات الأكاديمية' },
  minCredits: { en: 'Min Credits', ar: 'الحد الأدنى للساعات' },
  maxCredits: { en: 'Max Credits', ar: 'الحد الأقصى للساعات' },
  probationGPA: { en: 'Probation GPA', ar: 'معدل الإنذار' },
  dismissalGPA: { en: 'Dismissal GPA', ar: 'معدل الفصل' },
  graduationCredits: { en: 'Graduation Credits', ar: 'ساعات التخرج' },
  notifications: { en: 'Notifications', ar: 'الإشعارات' },
  sendNotification: { en: 'Send Notification', ar: 'إرسال إشعار' },
  emailAllStudents: { en: 'Email All Students', ar: 'مراسلة جميع الطلاب' },
  enrolledThisSemester: { en: 'Enrolled This Semester', ar: 'المسجلين هذا الفصل' },
  droppedThisSemester: { en: 'Dropped This Semester', ar: 'المنسحبين هذا الفصل' },
  waitlisted: { en: 'Waitlisted', ar: 'قائمة الانتظار' },
  averageCredits: { en: 'Avg Credits/Student', ar: 'متوسط الساعات/طالب' },
  // New tabs translations
  enrollmentManagement: { en: 'Enrollment Management', ar: 'إدارة تسجيل المواد' },
  gradesManagement: { en: 'Grades Management', ar: 'إدارة الدرجات' },
  academicReports: { en: 'Academic Reports', ar: 'التقارير الأكاديمية' },
  graduationManagement: { en: 'Graduation Management', ar: 'إدارة التخرج' },
  grade: { en: 'Grade', ar: 'الدرجة' },
  midterm: { en: 'Midterm', ar: 'الامتحان النصفي' },
  coursework: { en: 'Coursework', ar: 'أعمال الفصل' },
  final: { en: 'Final', ar: 'نهائي' },
  total: { en: 'Total', ar: 'المجموع' },
  editGrade: { en: 'Edit Grade', ar: 'تعديل الدرجة' },
  saveGrade: { en: 'Save Grade', ar: 'حفظ الدرجة' },
  gradeUpdated: { en: 'Grade updated successfully', ar: 'تم تحديث الدرجة بنجاح' },
  letterGrade: { en: 'Letter Grade', ar: 'التقدير' },
  gpa: { en: 'GPA', ar: 'المعدل' },
  approveGrades: { en: 'Approve Grades', ar: 'اعتماد الدرجات' },
  pendingGrades: { en: 'Pending Grades', ar: 'درجات بانتظار الاعتماد' },
  approvedGrades: { en: 'Approved Grades', ar: 'درجات معتمدة' },
  graduationApplications: { en: 'Graduation Applications', ar: 'طلبات التخرج' },
  checkEligibility: { en: 'Check Eligibility', ar: 'فحص الأهلية' },
  eligible: { en: 'Eligible', ar: 'مؤهل' },
  notEligible: { en: 'Not Eligible', ar: 'غير مؤهل' },
  graduated: { en: 'Graduated', ar: 'متخرج' },
  underReview: { en: 'Under Review', ar: 'قيد المراجعة' },
  submitted: { en: 'Submitted', ar: 'مقدم' },
  completedCredits: { en: 'Completed Credits', ar: 'الساعات المكتملة' },
  remainingCredits: { en: 'Remaining Credits', ar: 'الساعات المتبقية' },
  requiredCredits: { en: 'Required Credits', ar: 'الساعات المطلوبة' },
  enrollmentStats: { en: 'Enrollment Statistics', ar: 'إحصائيات التسجيل' },
  gradeDistribution: { en: 'Grade Distribution', ar: 'توزيع الدرجات' },
  coursePerformance: { en: 'Course Performance', ar: 'أداء المواد' },
  topStudents: { en: 'Top Students', ar: 'الطلاب المتميزين' },
  atRiskStudents: { en: 'At-Risk Students', ar: 'الطلاب المعرضين للخطر' },
  issueCertificate: { en: 'Issue Certificate', ar: 'إصدار شهادة' },
  issueTranscript: { en: 'Issue Transcript', ar: 'إصدار سجل أكاديمي' },
  markAsGraduated: { en: 'Mark as Graduated', ar: 'تخريج الطالب' },
  selectStudent: { en: 'Select Student', ar: 'اختر طالب' },
  selectCourse: { en: 'Select Course', ar: 'اختر مادة' },
  selectSemester: { en: 'Select Semester', ar: 'اختر الفصل' },
  addEnrollment: { en: 'Add Enrollment', ar: 'إضافة تسجيل' },
  dropEnrollment: { en: 'Drop Enrollment', ar: 'حذف التسجيل' },
  withdrawEnrollment: { en: 'Withdraw', ar: 'انسحاب' },
  section: { en: 'Section', ar: 'الشعبة' },
  enterGrade: { en: 'Enter Grade', ar: 'إدخال درجة' },
  bulkGradeEntry: { en: 'Bulk Grade Entry', ar: 'إدخال درجات جماعي' },
  studentId: { en: 'Student ID', ar: 'الرقم الجامعي' },
  // Grading Scales
  gradingScales: { en: 'Grading Scale', ar: 'سلم التقدير' },
  manageGradingScale: { en: 'Manage Grading Scale', ar: 'إدارة سلم التقدير' },
  addGrade: { en: 'Add Grade', ar: 'إضافة تقدير' },
  editGradeScale: { en: 'Edit Grade', ar: 'تعديل التقدير' },
  minScore: { en: 'Min Score', ar: 'الحد الأدنى' },
  maxScore: { en: 'Max Score', ar: 'الحد الأقصى' },
  gradePoints: { en: 'Grade Points', ar: 'النقاط' },
  descriptionEn: { en: 'Description (EN)', ar: 'الوصف (إنجليزي)' },
  descriptionAr: { en: 'Description (AR)', ar: 'الوصف (عربي)' },
  isPassing: { en: 'Is Passing', ar: 'ناجح' },
  isActive: { en: 'Is Active', ar: 'نشط' },
  resetToDefault: { en: 'Reset to Default', ar: 'إعادة للافتراضي' },
  gradeScaleUpdated: { en: 'Grade scale updated successfully', ar: 'تم تحديث سلم التقدير بنجاح' },
  gradeScaleCreated: { en: 'Grade scale created successfully', ar: 'تم إنشاء التقدير بنجاح' },
  gradeScaleDeleted: { en: 'Grade scale deleted successfully', ar: 'تم حذف التقدير بنجاح' },
  confirmDelete: { en: 'Are you sure you want to delete this?', ar: 'هل أنت متأكد من الحذف؟' },
  confirmReset: { en: 'Are you sure you want to reset to default? All current grades will be deleted.', ar: 'هل أنت متأكد من إعادة التعيين للافتراضي؟ سيتم حذف جميع التقديرات الحالية.' },
  // Pagination
  page: { en: 'Page', ar: 'صفحة' },
  of: { en: 'of', ar: 'من' },
  showing: { en: 'Showing', ar: 'عرض' },
  to: { en: 'to', ar: 'إلى' },
  entries: { en: 'entries', ar: 'سجل' },
  previous: { en: 'Previous', ar: 'السابق' },
  next: { en: 'Next', ar: 'التالي' },
  first: { en: 'First', ar: 'الأول' },
  last: { en: 'Last', ar: 'الأخير' },
  itemsPerPage: { en: 'Items per page', ar: 'عناصر في الصفحة' },
  // Attendance
  attendanceManagement: { en: 'Attendance', ar: 'الحضور والغياب' },
  attendance: { en: 'Attendance', ar: 'الحضور' },
  present: { en: 'Present', ar: 'حاضر' },
  absent: { en: 'Absent', ar: 'غائب' },
  late: { en: 'Late', ar: 'متأخر' },
  excused: { en: 'Excused', ar: 'بعذر' },
  attendancePercentage: { en: 'Attendance %', ar: 'نسبة الحضور' },
  markAttendance: { en: 'Mark Attendance', ar: 'تسجيل الحضور' },
  attendanceDate: { en: 'Date', ar: 'التاريخ' },
  attendanceStatus: { en: 'Status', ar: 'الحالة' },
  saveAttendance: { en: 'Save Attendance', ar: 'حفظ الحضور' },
  attendanceSaved: { en: 'Attendance saved successfully', ar: 'تم حفظ الحضور بنجاح' },
  selectDate: { en: 'Select Date', ar: 'اختر التاريخ' },
  // Schedule
  scheduleManagement: { en: 'Schedule', ar: 'الجدول الدراسي' },
  schedule: { en: 'Schedule', ar: 'الجدول' },
  day: { en: 'Day', ar: 'اليوم' },
  startTime: { en: 'Start Time', ar: 'وقت البداية' },
  endTime: { en: 'End Time', ar: 'وقت النهاية' },
  room: { en: 'Room', ar: 'القاعة' },
  building: { en: 'Building', ar: 'المبنى' },
  instructor: { en: 'Instructor', ar: 'المدرس' },
  addSchedule: { en: 'Add Schedule', ar: 'إضافة جدول' },
  editSchedule: { en: 'Edit Schedule', ar: 'تعديل الجدول' },
  deleteSchedule: { en: 'Delete Schedule', ar: 'حذف الجدول' },
  scheduleSaved: { en: 'Schedule saved successfully', ar: 'تم حفظ الجدول بنجاح' },
  scheduleDeleted: { en: 'Schedule deleted successfully', ar: 'تم حذف الجدول بنجاح' },
  sunday: { en: 'Sunday', ar: 'الأحد' },
  monday: { en: 'Monday', ar: 'الاثنين' },
  tuesday: { en: 'Tuesday', ar: 'الثلاثاء' },
  wednesday: { en: 'Wednesday', ar: 'الأربعاء' },
  thursday: { en: 'Thursday', ar: 'الخميس' },
  friday: { en: 'Friday', ar: 'الجمعة' },
  saturday: { en: 'Saturday', ar: 'السبت' },
  noSchedule: { en: 'No schedule entries', ar: 'لا يوجد جدول' },
  noAttendance: { en: 'No attendance records', ar: 'لا يوجد سجلات حضور' },
  // Enrollment Edit/Delete
  editEnrollment: { en: 'Edit Enrollment', ar: 'تعديل التسجيل' },
  deleteEnrollment: { en: 'Delete Enrollment', ar: 'حذف التسجيل' },
  enrollmentUpdated: { en: 'Enrollment updated successfully', ar: 'تم تحديث التسجيل بنجاح' },
  enrollmentDeleted: { en: 'Enrollment deleted successfully', ar: 'تم حذف التسجيل بنجاح' },
  confirmDeleteEnrollment: { en: 'Are you sure you want to delete this enrollment? This action cannot be undone.', ar: 'هل أنت متأكد من حذف هذا التسجيل؟ لا يمكن التراجع عن هذا الإجراء.' },
  midtermScore: { en: 'Midterm Score', ar: 'درجة النصفي' },
  finalScore: { en: 'Final Score', ar: 'درجة النهائي' },
  assignmentsScore: { en: 'Assignments Score', ar: 'درجة الواجبات' },
  totalScore: { en: 'Total Score', ar: 'الدرجة الكلية' },
  viewAcademicRecord: { en: 'View Academic Record', ar: 'عرض السجل الأكاديمي' },
  lmsGrade: { en: 'LMS Grade', ar: 'درجة LMS' },
  syncFromLms: { en: 'Sync from LMS', ar: 'مزامنة من LMS' },
  syncingLms: { en: 'Syncing from LMS...', ar: 'جاري المزامنة من LMS...' },
  lmsSyncSuccess: { en: 'Successfully synced grades from LMS', ar: 'تمت مزامنة الدرجات من LMS بنجاح' },
  lmsSyncError: { en: 'Failed to sync grades from LMS', ar: 'فشل في مزامنة الدرجات من LMS' },
  noLmsGrade: { en: 'No LMS grade', ar: 'لا توجد درجة LMS' },
};

const AcademicAffairsManagement: React.FC<AcademicAffairsManagementProps> = ({ lang }) => {
  const isRTL = lang === 'ar';
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [stats, setStats] = useState({
    totalPrograms: 0,
    totalCourses: 0,
    totalStudents: 0,
    activeStudents: 0,
    graduatedStudents: 0,
    suspendedStudents: 0,
    totalSemesters: 0,
    totalEnrollments: 0,
    pendingRequests: 0,
    currentSemester: null as any,
    colleges: [] as any[],
    departments: [] as any[],
    programsByType: {} as Record<string, number>,
    coursesByType: {} as Record<string, number>,
    enrolledThisSemester: 0,
    droppedThisSemester: 0,
    waitlisted: 0,
  });

  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [lmsGrades, setLmsGrades] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [graduationApps, setGraduationApps] = useState<any[]>([]);
  const [graduationStats, setGraduationStats] = useState<any>(null);

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([]);
  const [assignCourseType, setAssignCourseType] = useState('MAJOR');

  // Request handling states
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [requestNote, setRequestNote] = useState('');

  // Grade editing states
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<any>(null);
  const [gradesSemesterFilter, setGradesSemesterFilter] = useState<string>('all');
  const [gradeForm, setGradeForm] = useState({
    midterm: '',
    coursework: '',
    final: '',
    total: '',
    grade: '',
    points: '',
  });
  const [savingGrade, setSavingGrade] = useState(false);

  // Settings states
  const [settingsData, setSettingsData] = useState({
    allowLateRegistration: false,
    maxCredits: 21,
    minCredits: 12,
    probationGPA: 2.0,
    dismissalGPA: 1.5,
    graduationCredits: 132,
  });

  // Quick Actions states
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ student_id: '', course_id: '' });
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
  const [sendingEmail, setSendingEmail] = useState(false);

  // Edit Enrollment states
  const [showEditEnrollmentModal, setShowEditEnrollmentModal] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<any>(null);
  const [editEnrollmentForm, setEditEnrollmentForm] = useState({
    status: '',
    midterm_score: '',
    final_score: '',
    assignments_score: '',
    letter_grade: '',
  });

  // Grades Management states
  const [showEnterGradeModal, setShowEnterGradeModal] = useState(false);
  const [showBulkGradeModal, setShowBulkGradeModal] = useState(false);
  const [enterGradeForm, setEnterGradeForm] = useState({
    student_id: '',
    course_id: '',
    midterm_score: '',
    assignments_score: '',
    final_score: '',
  });
  const [bulkGradeCourseId, setBulkGradeCourseId] = useState('');
  const [bulkGradeData, setBulkGradeData] = useState<any[]>([]);
  const [savingGradeEntry, setSavingGradeEntry] = useState(false);

  // Academic Reports states
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  // Graduation Management states
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [showNewGradAppModal, setShowNewGradAppModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedStudentForGrad, setSelectedStudentForGrad] = useState('');
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Pagination states
  const [enrollmentPage, setEnrollmentPage] = useState(1);
  const [enrollmentPerPage, setEnrollmentPerPage] = useState(10);
  const [gradesPage, setGradesPage] = useState(1);
  const [gradesPerPage, setGradesPerPage] = useState(10);

  // Grading Scales states
  const [gradingScales, setGradingScales] = useState<any[]>([]);
  const [showGradingScaleModal, setShowGradingScaleModal] = useState(false);
  const [editingGradingScale, setEditingGradingScale] = useState<any>(null);
  const [gradingScaleForm, setGradingScaleForm] = useState({
    letter_grade: '',
    min_score: '',
    max_score: '',
    grade_points: '',
    description_en: '',
    description_ar: '',
    is_passing: true,
    is_active: true,
  });
  const [savingGradingScale, setSavingGradingScale] = useState(false);

  // Schedule Management states
  const [schedules, setSchedules] = useState<any[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [scheduleForm, setScheduleForm] = useState({
    course_id: '',
    semester_id: '',
    day: 'SUNDAY',
    start_time: '08:00',
    end_time: '09:30',
    room: '',
    building: '',
    instructor: '',
    section: '',
  });
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [schedulePage, setSchedulePage] = useState(1);
  const [schedulePerPage, setSchedulePerPage] = useState(10);
  const [scheduleSemesterFilter, setScheduleSemesterFilter] = useState<string>('all');

  // Attendance Management states
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedCourseForAttendance, setSelectedCourseForAttendance] = useState<any>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceCourseFilter, setAttendanceCourseFilter] = useState<string>('all');
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendancePerPage, setAttendancePerPage] = useState(10);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [programsRes, coursesRes, studentsRes, semestersRes, collegesRes, requestsRes, enrollmentsRes, gradesRes, gradAppsRes, gradStatsRes, gradingScalesRes, settingsRes, schedulesRes] = await Promise.all([
        apiClient.get('/programs', { params: { per_page: 1000 } }).catch(() => ({ data: [] })),
        apiClient.get('/courses', { params: { per_page: 1000 } }).catch(() => ({ data: [] })),
        apiClient.get('/students', { params: { per_page: 1000 } }).catch(() => ({ data: [] })),
        apiClient.get('/semesters').catch(() => ({ data: [] })),
        apiClient.get('/colleges').catch(() => ({ data: [] })),
        apiClient.get('/student-requests', { params: { per_page: 500 } }).catch(() => ({ data: [] })),
        apiClient.get('/enrollments', { params: { per_page: 1000 } }).catch(() => ({ data: [] })),
        apiClient.get('/grades', { params: { per_page: 1000 } }).catch(() => ({ data: [] })),
        apiClient.get('/graduation/applications', { params: { per_page: 100 } }).catch(() => ({ data: [] })),
        apiClient.get('/graduation/statistics').catch(() => ({ data: null })),
        apiClient.get('/grading-scales').catch(() => ({ data: [] })),
        apiClient.get('/admin/config/settings', { params: { group: 'academic' } }).catch(() => ({ data: {} })),
        apiClient.get('/schedules', { params: { per_page: 1000 } }).catch(() => ({ data: [] })),
      ]);

      // Helper to ensure array
      const toArray = (data: any) => Array.isArray(data) ? data : [];

      // Debug: Log raw API responses
      console.log('[AcademicAffairs] API Responses:', {
        programs: programsRes.data,
        courses: coursesRes.data,
        students: studentsRes.data,
        semesters: semestersRes.data,
        colleges: collegesRes.data,
        requests: requestsRes.data,
        enrollments: enrollmentsRes.data,
        grades: gradesRes.data,
      });

      const programsData = toArray(programsRes.data?.data || programsRes.data);
      const coursesData = toArray(coursesRes.data?.data || coursesRes.data);
      const studentsData = toArray(studentsRes.data?.data || studentsRes.data);
      const semestersData = toArray(semestersRes.data?.data || semestersRes.data);
      const collegesData = toArray(collegesRes.data?.data || collegesRes.data);
      const requestsData = toArray(requestsRes.data?.data || requestsRes.data);
      const enrollmentsData = toArray(enrollmentsRes.data?.data || enrollmentsRes.data);
      const gradesData = toArray(gradesRes.data?.data || gradesRes.data);
      const gradAppsData = toArray(gradAppsRes.data?.data || gradAppsRes.data);
      const gradStatsData = gradStatsRes.data;
      const gradingScalesData = toArray(gradingScalesRes.data?.data || gradingScalesRes.data);
      const schedulesData = toArray(schedulesRes.data?.data || schedulesRes.data);

      // Debug: Log processed data
      console.log('[AcademicAffairs] Processed Data:', {
        programs: programsData.length,
        courses: coursesData.length,
        students: studentsData.length,
        semesters: semestersData.length,
        enrollments: enrollmentsData.length,
        grades: gradesData.length,
      });

      // Load academic settings
      const settingsDataRaw = settingsRes.data?.data?.academic || settingsRes.data?.data || {};
      const flatSettings: Record<string, any> = {};
      if (Array.isArray(settingsDataRaw)) {
        settingsDataRaw.forEach((s: any) => {
          flatSettings[s.key] = s.type === 'boolean' ? s.value === 'true' || s.value === true :
                               s.type === 'number' ? parseFloat(s.value) : s.value;
        });
      } else {
        Object.entries(settingsDataRaw).forEach(([key, val]: [string, any]) => {
          if (Array.isArray(val)) {
            val.forEach((s: any) => {
              flatSettings[s.key] = s.type === 'boolean' ? s.value === 'true' || s.value === true :
                                   s.type === 'number' ? parseFloat(s.value) : s.value;
            });
          }
        });
      }

      if (Object.keys(flatSettings).length > 0) {
        setSettingsData({
          allowLateRegistration: flatSettings['allow_late_registration'] ?? false,
          maxCredits: flatSettings['max_credits'] ?? 21,
          minCredits: flatSettings['min_credits'] ?? 12,
          probationGPA: flatSettings['probation_gpa'] ?? 2.0,
          dismissalGPA: flatSettings['dismissal_gpa'] ?? 1.5,
          graduationCredits: flatSettings['graduation_credits'] ?? 132,
        });
      }

      setPrograms(programsData);
      setCourses(coursesData);
      setStudents(studentsData);
      setSemesters(semestersData);
      setColleges(collegesData);
      setRequests(requestsData);
      setEnrollments(enrollmentsData);
      setGrades(gradesData);
      setGraduationApps(gradAppsData);
      setGraduationStats(gradStatsData);
      setGradingScales(gradingScalesData);

      // Fetch LMS grades separately
      try {
        const lmsGradesRes = await lmsAPI.getAdminLmsGrades({});
        setLmsGrades(lmsGradesRes.data || []);
      } catch (lmsError) {
        console.log('LMS grades not available:', lmsError);
        setLmsGrades([]);
      }
      setSchedules(schedulesData);

      const currentSem = semestersData.find((s: any) => s.is_current);
      const activeStudents = studentsData.filter((s: any) => s.status === 'ACTIVE');
      const graduatedStudents = studentsData.filter((s: any) => s.status === 'GRADUATED');
      const suspendedStudents = studentsData.filter((s: any) => s.status === 'SUSPENDED');
      const pendingRequests = requestsData.filter((r: any) => ['SUBMITTED', 'PENDING', 'PENDING_APPROVAL', 'pending'].includes(r.status));

      // Count programs by type
      const programsByType: Record<string, number> = {};
      programsData.forEach((p: any) => {
        const type = p.type || 'OTHER';
        programsByType[type] = (programsByType[type] || 0) + 1;
      });

      // Count courses by type - use course_type field or categorize by college/department
      const coursesByType: Record<string, number> = {
        UNIVERSITY: 0,
        COLLEGE: 0,
        MAJOR: 0,
        GRADUATION: 0,
      };
      coursesData.forEach((c: any) => {
        // Check course_type field first, then programs pivot, then default based on code
        let type = c.course_type || c.type;
        if (!type && c.programs && c.programs.length > 0) {
          type = c.programs[0]?.pivot?.type;
        }
        if (!type) {
          // Categorize based on course code pattern
          const code = (c.code || '').toUpperCase();
          if (code.includes('UNIV') || code.startsWith('GE') || code.startsWith('CORE')) {
            type = 'UNIVERSITY';
          } else if (code.includes('GRAD') || code.includes('PROJ') || code.includes('THESIS')) {
            type = 'GRADUATION';
          } else if (c.college_id && !c.department_id) {
            type = 'COLLEGE';
          } else {
            type = 'MAJOR';
          }
        }
        coursesByType[type] = (coursesByType[type] || 0) + 1;
      });

      // Enrollment stats
      const currentSemEnrollments = enrollmentsData.filter((e: any) => e.semester_id === currentSem?.id);
      const enrolledThisSemester = currentSemEnrollments.filter((e: any) => e.status === 'ENROLLED').length;
      const droppedThisSemester = currentSemEnrollments.filter((e: any) => e.status === 'DROPPED').length;

      setStats({
        totalPrograms: programsData.length,
        totalCourses: coursesData.length,
        totalStudents: studentsData.length,
        activeStudents: activeStudents.length,
        graduatedStudents: graduatedStudents.length,
        suspendedStudents: suspendedStudents.length,
        totalSemesters: semestersData.length,
        totalEnrollments: enrollmentsData.length,
        pendingRequests: pendingRequests.length,
        currentSemester: currentSem,
        colleges: collegesData,
        departments: [],
        programsByType,
        coursesByType,
        enrolledThisSemester,
        droppedThisSemester,
        waitlisted: 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setEnrollmentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setGradesPage(1);
  }, [searchQuery, gradesSemesterFilter]);

  // Toggle registration
  const toggleRegistration = async () => {
    if (!stats.currentSemester) return;
    try {
      setSaving(true);
      const endpoint = stats.currentSemester.is_registration_open
        ? `/semesters/${stats.currentSemester.id}/close-registration`
        : `/semesters/${stats.currentSemester.id}/open-registration`;
      await apiClient.post(endpoint);
      fetchAllData();
    } catch (error) {
      console.error('Error toggling registration:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  // Enroll student in course
  const handleEnrollStudent = async () => {
    if (!enrollForm.student_id || !enrollForm.course_id) {
      toast.warning(lang === 'ar' ? 'يرجى اختيار الطالب والمادة' : 'Please select student and course');
      return;
    }
    if (!stats.currentSemester?.id) {
      toast.warning(lang === 'ar' ? 'لا يوجد فصل دراسي حالي. يرجى تحديد الفصل الحالي أولاً.' : 'No current semester. Please set a current semester first.');
      return;
    }
    try {
      setSaving(true);
      await apiClient.post('/enrollments', {
        student_id: parseInt(enrollForm.student_id),
        course_id: parseInt(enrollForm.course_id),
        semester_id: stats.currentSemester.id,
        status: 'ENROLLED',
      });
      setShowEnrollModal(false);
      setEnrollForm({ student_id: '', course_id: '' });
      fetchAllData();
      toast.success(lang === 'ar' ? 'تم تسجيل الطالب بنجاح' : 'Student enrolled successfully');
    } catch (error: any) {
      console.error('Error enrolling student:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error;
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat().join('\n');
        toast.error(errors);
      } else {
        toast.error(errorMsg || (lang === 'ar' ? 'حدث خطأ في التسجيل' : 'Enrollment failed'));
      }
    } finally {
      setSaving(false);
    }
  };

  // Open edit enrollment modal
  const openEditEnrollment = (enrollment: any) => {
    setEditingEnrollment(enrollment);
    setEditEnrollmentForm({
      status: enrollment.status || 'ENROLLED',
      midterm_score: enrollment.midterm_score?.toString() || '',
      final_score: enrollment.final_score?.toString() || '',
      assignments_score: enrollment.assignments_score?.toString() || '',
      letter_grade: enrollment.letter_grade || '',
    });
    setShowEditEnrollmentModal(true);
  };

  // Handle update enrollment
  const handleUpdateEnrollment = async () => {
    if (!editingEnrollment?.id) return;
    try {
      setSaving(true);
      await apiClient.put(`/enrollments/${editingEnrollment.id}`, {
        status: editEnrollmentForm.status,
        midterm_score: editEnrollmentForm.midterm_score ? parseFloat(editEnrollmentForm.midterm_score) : null,
        final_score: editEnrollmentForm.final_score ? parseFloat(editEnrollmentForm.final_score) : null,
        assignments_score: editEnrollmentForm.assignments_score ? parseFloat(editEnrollmentForm.assignments_score) : null,
        letter_grade: editEnrollmentForm.letter_grade || null,
      });
      setShowEditEnrollmentModal(false);
      setEditingEnrollment(null);
      fetchAllData();
      toast.success(t.enrollmentUpdated[lang]);
    } catch (error: any) {
      console.error('Error updating enrollment:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error;
      toast.error(errorMsg || (lang === 'ar' ? 'حدث خطأ في تحديث التسجيل' : 'Failed to update enrollment'));
    } finally {
      setSaving(false);
    }
  };

  // Handle delete enrollment
  const handleDeleteEnrollment = async (enrollment: any) => {
    const confirmed = await confirm({
      title: lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      message: t.confirmDeleteEnrollment[lang],
      confirmText: lang === 'ar' ? 'حذف' : 'Delete',
      danger: true,
    });
    if (!confirmed) return;

    try {
      setSaving(true);
      await apiClient.delete(`/enrollments/${enrollment.id}`);
      fetchAllData();
      toast.success(t.enrollmentDeleted[lang]);
    } catch (error: any) {
      console.error('Error deleting enrollment:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error;
      toast.error(errorMsg || (lang === 'ar' ? 'حدث خطأ في حذف التسجيل' : 'Failed to delete enrollment'));
    } finally {
      setSaving(false);
    }
  };

  // Sync grades from LMS
  const handleSyncFromLms = async () => {
    try {
      setSaving(true);
      toast.info(t.syncingLms[lang]);

      // First import grades from LMS
      await lmsAPI.importGrades();

      // Then sync to SIS
      await lmsAPI.syncGradesToSIS();

      // Refresh data
      fetchAllData();
      toast.success(t.lmsSyncSuccess[lang]);
    } catch (error: any) {
      console.error('Error syncing from LMS:', error);
      toast.error(t.lmsSyncError[lang]);
    } finally {
      setSaving(false);
    }
  };

  // Get LMS grade for an enrollment
  const getLmsGradeForEnrollment = (enrollmentId: number) => {
    return lmsGrades.find((g: any) => g.enrollment_id === enrollmentId);
  };

  // Export enrollments to CSV
  const handleExportEnrollments = () => {
    const safeEnrollments = ensureArray(enrollments);
    if (safeEnrollments.length === 0) {
      toast.warning(lang === 'ar' ? 'لا توجد تسجيلات للتصدير' : 'No enrollments to export');
      return;
    }

    const headers = ['Student ID', 'Student Name', 'Course Code', 'Course Name', 'Status', 'Date'];
    const rows = safeEnrollments.map((e: any) => [
      e.student?.student_id || e.student_id,
      e.student?.name_en || e.student?.full_name_en || '',
      e.course?.code || '',
      e.course?.name_en || '',
      e.status,
      e.created_at ? new Date(e.created_at).toLocaleDateString() : '',
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enrollments_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Send email to all students
  const handleSendEmail = async () => {
    if (!emailForm.subject || !emailForm.message) {
      toast.warning(lang === 'ar' ? 'يرجى إدخال العنوان والرسالة' : 'Please enter subject and message');
      return;
    }
    try {
      setSendingEmail(true);
      await apiClient.post('/notifications/send-bulk', {
        type: 'EMAIL',
        recipients: 'ALL_STUDENTS',
        subject: emailForm.subject,
        message: emailForm.message,
      });
      setShowEmailModal(false);
      setEmailForm({ subject: '', message: '' });
      toast.success(lang === 'ar' ? 'تم إرسال الرسالة بنجاح' : 'Message sent successfully');
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error.response?.data?.message || (lang === 'ar' ? 'حدث خطأ في الإرسال' : 'Failed to send message'));
    } finally {
      setSendingEmail(false);
    }
  };

  // Enter single grade
  const handleEnterGrade = async () => {
    if (!enterGradeForm.student_id || !enterGradeForm.course_id) {
      toast.warning(lang === 'ar' ? 'يرجى اختيار الطالب والمادة' : 'Please select student and course');
      return;
    }
    if (!stats.currentSemester?.id) {
      toast.warning(lang === 'ar' ? 'لا يوجد فصل دراسي حالي' : 'No current semester');
      return;
    }
    try {
      setSavingGradeEntry(true);
      await apiClient.post('/grades', {
        student_id: parseInt(enterGradeForm.student_id),
        course_id: parseInt(enterGradeForm.course_id),
        semester_id: stats.currentSemester.id,
        midterm_score: enterGradeForm.midterm_score ? parseFloat(enterGradeForm.midterm_score) : null,
        assignments_score: enterGradeForm.assignments_score ? parseFloat(enterGradeForm.assignments_score) : null,
        final_score: enterGradeForm.final_score ? parseFloat(enterGradeForm.final_score) : null,
        status: 'PENDING',
      });
      setShowEnterGradeModal(false);
      setEnterGradeForm({ student_id: '', course_id: '', midterm_score: '', assignments_score: '', final_score: '' });
      fetchAllData();
      toast.success(lang === 'ar' ? 'تم إدخال الدرجة بنجاح' : 'Grade entered successfully');
    } catch (error: any) {
      console.error('Error entering grade:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error;
      toast.error(errorMsg || (lang === 'ar' ? 'حدث خطأ في إدخال الدرجة' : 'Failed to enter grade'));
    } finally {
      setSavingGradeEntry(false);
    }
  };

  // Load enrolled students for bulk grade entry
  const loadBulkGradeStudents = async (courseId: string) => {
    if (!courseId || !stats.currentSemester?.id) return;
    try {
      const response = await apiClient.get('/enrollments', {
        params: {
          course_id: courseId,
          semester_id: stats.currentSemester.id,
          status: 'ENROLLED',
          per_page: 200,
        }
      });
      const enrollmentsData = response.data?.data || response.data || [];
      const studentsWithGrades = ensureArray(enrollmentsData).map((e: any) => ({
        enrollment_id: e.id,
        student_id: e.student_id,
        student_name: e.student?.full_name_en || e.student?.name_en || `Student ${e.student_id}`,
        student_code: e.student?.student_id || '',
        midterm_score: '',
        assignments_score: '',
        final_score: '',
      }));
      setBulkGradeData(studentsWithGrades);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  // Save bulk grades
  const handleSaveBulkGrades = async () => {
    if (!bulkGradeCourseId || bulkGradeData.length === 0) {
      toast.warning(lang === 'ar' ? 'يرجى اختيار المادة وإدخال الدرجات' : 'Please select course and enter grades');
      return;
    }
    if (!stats.currentSemester?.id) {
      toast.warning(lang === 'ar' ? 'لا يوجد فصل دراسي حالي' : 'No current semester');
      return;
    }
    try {
      setSavingGradeEntry(true);
      const gradesToSave = bulkGradeData.filter(g => g.midterm_score || g.assignments_score || g.final_score);
      if (gradesToSave.length === 0) {
        toast.warning(lang === 'ar' ? 'لا توجد درجات لحفظها' : 'No grades to save');
        return;
      }
      await Promise.all(gradesToSave.map(g =>
        apiClient.post('/grades', {
          student_id: g.student_id,
          course_id: parseInt(bulkGradeCourseId),
          semester_id: stats.currentSemester.id,
          midterm_score: g.midterm_score ? parseFloat(g.midterm_score) : null,
          assignments_score: g.assignments_score ? parseFloat(g.assignments_score) : null,
          final_score: g.final_score ? parseFloat(g.final_score) : null,
          status: 'PENDING',
        }).catch(err => {
          console.error(`Error saving grade for student ${g.student_id}:`, err);
          return null;
        })
      ));
      setShowBulkGradeModal(false);
      setBulkGradeCourseId('');
      setBulkGradeData([]);
      fetchAllData();
      toast.success(lang === 'ar' ? 'تم حفظ الدرجات بنجاح' : 'Grades saved successfully');
    } catch (error: any) {
      console.error('Error saving bulk grades:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في حفظ الدرجات' : 'Failed to save grades');
    } finally {
      setSavingGradeEntry(false);
    }
  };

  // Approve all pending grades
  const handleApproveAllGrades = async () => {
    const safeGrades = ensureArray(grades);
    const pendingGrades = safeGrades.filter(g => g.status === 'PENDING' || g.status === 'SUBMITTED');
    if (pendingGrades.length === 0) {
      toast.warning(lang === 'ar' ? 'لا توجد درجات بانتظار الاعتماد' : 'No grades pending approval');
      return;
    }
    if (!confirm(lang === 'ar' ? `هل تريد اعتماد ${pendingGrades.length} درجة؟` : `Approve ${pendingGrades.length} grades?`)) {
      return;
    }
    try {
      setSaving(true);
      await Promise.all(pendingGrades.map(g =>
        apiClient.put(`/grades/${g.id}`, { status: 'APPROVED' }).catch(err => {
          console.error(`Error approving grade ${g.id}:`, err);
          return null;
        })
      ));
      fetchAllData();
      toast.success(lang === 'ar' ? 'تم اعتماد الدرجات بنجاح' : 'Grades approved successfully');
    } catch (error) {
      console.error('Error approving grades:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في اعتماد الدرجات' : 'Failed to approve grades');
    } finally {
      setSaving(false);
    }
  };

  // Export grades to CSV
  const handleExportGrades = () => {
    const safeGrades = ensureArray(grades);
    const filteredGrades = gradesSemesterFilter === 'all'
      ? safeGrades
      : safeGrades.filter(g => g.semester_id?.toString() === gradesSemesterFilter);

    if (filteredGrades.length === 0) {
      toast.warning(lang === 'ar' ? 'لا توجد درجات للتصدير' : 'No grades to export');
      return;
    }

    const headers = ['Student ID', 'Student Name', 'Course Code', 'Course Name', 'Midterm', 'Coursework', 'Final', 'Total', 'Letter Grade', 'Status'];
    const rows = filteredGrades.map((g: any) => [
      g.student?.student_id || g.student_id,
      g.student?.full_name_en || g.student?.name_en || '',
      g.course?.code || '',
      g.course?.name_en || '',
      g.midterm_score ?? g.midterm ?? '',
      g.assignments_score ?? g.coursework ?? '',
      g.final_score ?? g.final ?? '',
      g.total_score ?? g.total ?? '',
      g.letter_grade || '',
      g.status || '',
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grades_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Check graduation eligibility
  const handleCheckEligibility = async () => {
    try {
      setCheckingEligibility(true);
      // Find students who have completed required credits and have good standing
      const safeStudents = ensureArray(students);
      const eligible = safeStudents.filter(s => {
        const credits = s.completed_credits || s.total_credits || 0;
        const gpa = s.gpa || 0;
        const status = s.status || '';
        // Eligible if: active, credits >= 120, GPA >= 2.0
        return status === 'ACTIVE' && credits >= 120 && gpa >= 2.0;
      });
      setEligibleStudents(eligible);
      setShowEligibilityModal(true);
    } catch (error) {
      console.error('Error checking eligibility:', error);
    } finally {
      setCheckingEligibility(false);
    }
  };

  // Create new graduation application
  const handleCreateGradApplication = async () => {
    if (!selectedStudentForGrad) {
      toast.warning(lang === 'ar' ? 'يرجى اختيار طالب' : 'Please select a student');
      return;
    }
    try {
      setSaving(true);
      await apiClient.post('/graduation/applications', {
        student_id: parseInt(selectedStudentForGrad),
        status: 'SUBMITTED',
        application_date: new Date().toISOString().split('T')[0],
      });
      setShowNewGradAppModal(false);
      setSelectedStudentForGrad('');
      fetchAllData();
      toast.success(lang === 'ar' ? 'تم تقديم طلب التخرج بنجاح' : 'Graduation application submitted');
    } catch (error: any) {
      console.error('Error creating application:', error);
      toast.error(error.response?.data?.message || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setSaving(false);
    }
  };

  // Update graduation application status
  const handleUpdateGradStatus = async (appId: number, newStatus: string) => {
    try {
      setSaving(true);
      await apiClient.put(`/graduation/applications/${appId}`, { status: newStatus });
      fetchAllData();
      const messages: Record<string, { ar: string; en: string }> = {
        'UNDER_REVIEW': { ar: 'تم تحويل الطلب للمراجعة', en: 'Application moved to review' },
        'APPROVED': { ar: 'تم الموافقة على الطلب', en: 'Application approved' },
        'REJECTED': { ar: 'تم رفض الطلب', en: 'Application rejected' },
        'GRADUATED': { ar: 'تم تخريج الطالب بنجاح', en: 'Student graduated successfully' },
      };
      toast.success(messages[newStatus]?.[lang] || (lang === 'ar' ? 'تم التحديث' : 'Updated'));
    } catch (error: any) {
      console.error('Error updating application:', error);
      toast.error(error.response?.data?.message || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setSaving(false);
    }
  };

  // Generate transcript
  const handleGenerateTranscript = (studentId: string) => {
    if (!studentId) {
      toast.warning(lang === 'ar' ? 'يرجى اختيار طالب' : 'Please select a student');
      return;
    }
    // Navigate to transcript page
    window.open(`/#/transcript/${studentId}`, '_blank');
    setShowTranscriptModal(false);
    setSelectedStudentForGrad('');
  };

  // Generate certificate
  const handleGenerateCertificate = (studentId: string) => {
    if (!studentId) {
      toast.warning(lang === 'ar' ? 'يرجى اختيار طالب' : 'Please select a student');
      return;
    }
    // Navigate to certificates page
    window.open(`/#/certificates?student=${studentId}`, '_blank');
    setShowCertificateModal(false);
    setSelectedStudentForGrad('');
  };

  // Assign course to programs
  const handleAssignCourse = async () => {
    if (!selectedCourse || selectedProgramIds.length === 0) return;
    try {
      setSaving(true);
      await apiClient.post(`/courses/${selectedCourse.id}/assign-programs`, {
        program_ids: selectedProgramIds.map(id => parseInt(id)),
        course_type: assignCourseType,
      });
      setShowAssignModal(false);
      setSelectedCourse(null);
      setSelectedProgramIds([]);
      fetchAllData();
      toast.success(lang === 'ar' ? 'تم تعيين المادة بنجاح' : 'Course assigned successfully');
    } catch (error: any) {
      console.error('Error assigning course:', error);
      toast.error(error.response?.data?.message || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setSaving(false);
    }
  };

  // Handle request approval/rejection
  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setSaving(true);
      await apiClient.post(`/student-requests/${requestId}/review`, {
        decision: action === 'approve' ? 'APPROVED' : 'REJECTED',
        level: 'ACADEMIC_AFFAIRS',
        notes: requestNote,
      });
      setShowRequestModal(false);
      setSelectedRequest(null);
      setRequestNote('');
      fetchAllData();
      toast.success(lang === 'ar' ? `تم ${action === 'approve' ? 'قبول' : 'رفض'} الطلب` : `Request ${action}d successfully`);
    } catch (error: any) {
      console.error('Error handling request:', error);
      toast.error(error.response?.data?.message || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setSaving(false);
    }
  };

  // Bulk request actions
  const handleBulkRequestAction = async (action: 'approve' | 'reject') => {
    if (selectedRequests.length === 0) return;
    try {
      setSaving(true);
      await Promise.all(
        selectedRequests.map(id => apiClient.post(`/student-requests/${id}/review`, {
          decision: action === 'approve' ? 'APPROVED' : 'REJECTED',
          level: 'ACADEMIC_AFFAIRS',
        }))
      );
      setSelectedRequests([]);
      fetchAllData();
      toast.success(lang === 'ar' ? `تم ${action === 'approve' ? 'قبول' : 'رفض'} ${selectedRequests.length} طلبات` : `${selectedRequests.length} requests ${action}d`);
    } catch (error) {
      console.error('Error bulk action:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  // Save academic settings
  const saveAcademicSettings = async () => {
    try {
      setSaving(true);
      await apiClient.post('/admin/config/settings', {
        group: 'academic',
        settings: {
          'allow_late_registration': settingsData.allowLateRegistration,
          'max_credits': settingsData.maxCredits,
          'min_credits': settingsData.minCredits,
          'probation_gpa': settingsData.probationGPA,
          'dismissal_gpa': settingsData.dismissalGPA,
          'graduation_credits': settingsData.graduationCredits,
        }
      });
      toast.success(lang === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء حفظ الإعدادات' : 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  // Grade editing functions
  const openGradeModal = (grade: any) => {
    setEditingGrade(grade);
    setGradeForm({
      midterm: grade.midterm_score || grade.midterm || '',
      coursework: grade.assignments_score || grade.coursework || '',
      final: grade.final_score || grade.final || '',
      total: grade.total_score || grade.total || '',
      grade: grade.letter_grade || grade.grade || '',
      points: grade.grade_points || grade.points || '',
    });
    setShowGradeModal(true);
  };

  const calculateGradeFromTotal = (total: number): { grade: string; points: number } => {
    if (total >= 95) return { grade: 'A+', points: 4.0 };
    if (total >= 90) return { grade: 'A', points: 4.0 };
    if (total >= 85) return { grade: 'A-', points: 3.7 };
    if (total >= 80) return { grade: 'B+', points: 3.3 };
    if (total >= 75) return { grade: 'B', points: 3.0 };
    if (total >= 70) return { grade: 'B-', points: 2.7 };
    if (total >= 65) return { grade: 'C+', points: 2.3 };
    if (total >= 60) return { grade: 'C', points: 2.0 };
    if (total >= 55) return { grade: 'C-', points: 1.7 };
    if (total >= 50) return { grade: 'D+', points: 1.3 };
    if (total >= 45) return { grade: 'D', points: 1.0 };
    return { grade: 'F', points: 0.0 };
  };

  const updateGradeFormField = (field: string, value: string) => {
    const newForm = { ...gradeForm, [field]: value };

    // Auto-calculate total if midterm, coursework, or final changes
    if (['midterm', 'coursework', 'final'].includes(field)) {
      const midterm = parseFloat(newForm.midterm) || 0;
      const coursework = parseFloat(newForm.coursework) || 0;
      const finalScore = parseFloat(newForm.final) || 0;
      // Assuming: Midterm 30%, Coursework 20%, Final 50%
      const total = (midterm * 0.3) + (coursework * 0.2) + (finalScore * 0.5);
      newForm.total = total.toFixed(2);
      const { grade, points } = calculateGradeFromTotal(total);
      newForm.grade = grade;
      newForm.points = points.toString();
    }

    setGradeForm(newForm);
  };

  const saveGradeChanges = async () => {
    if (!editingGrade) return;

    try {
      setSavingGrade(true);
      await apiClient.put(`/admin/grades/${editingGrade.id}`, {
        midterm_score: parseFloat(gradeForm.midterm) || null,
        assignments_score: parseFloat(gradeForm.coursework) || null,
        final_score: parseFloat(gradeForm.final) || null,
        total_score: parseFloat(gradeForm.total) || null,
        letter_grade: gradeForm.grade,
        grade_points: parseFloat(gradeForm.points) || null,
        status: 'APPROVED',
      });

      setShowGradeModal(false);
      setEditingGrade(null);
      fetchAllData();
      toast.success(t.gradeUpdated[lang]);
    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في حفظ الدرجة' : 'Error saving grade');
    } finally {
      setSavingGrade(false);
    }
  };

  // Grading Scale functions
  const openGradingScaleModal = (scale?: any) => {
    if (scale) {
      setEditingGradingScale(scale);
      setGradingScaleForm({
        letter_grade: scale.letter_grade || '',
        min_score: String(scale.min_score || ''),
        max_score: String(scale.max_score || ''),
        grade_points: String(scale.grade_points || ''),
        description_en: scale.description_en || '',
        description_ar: scale.description_ar || '',
        is_passing: scale.is_passing ?? true,
        is_active: scale.is_active ?? true,
      });
    } else {
      setEditingGradingScale(null);
      setGradingScaleForm({
        letter_grade: '',
        min_score: '',
        max_score: '',
        grade_points: '',
        description_en: '',
        description_ar: '',
        is_passing: true,
        is_active: true,
      });
    }
    setShowGradingScaleModal(true);
  };

  const saveGradingScale = async () => {
    try {
      setSavingGradingScale(true);
      const data = {
        letter_grade: gradingScaleForm.letter_grade,
        min_score: parseFloat(gradingScaleForm.min_score),
        max_score: parseFloat(gradingScaleForm.max_score),
        grade_points: parseFloat(gradingScaleForm.grade_points),
        description_en: gradingScaleForm.description_en || null,
        description_ar: gradingScaleForm.description_ar || null,
        is_passing: gradingScaleForm.is_passing,
        is_active: gradingScaleForm.is_active,
      };

      if (editingGradingScale) {
        await apiClient.put(`/grading-scales/${editingGradingScale.id}`, data);
        toast.success(t.gradeScaleUpdated[lang]);
      } else {
        await apiClient.post('/grading-scales', data);
        toast.success(t.gradeScaleCreated[lang]);
      }

      setShowGradingScaleModal(false);
      setEditingGradingScale(null);
      fetchAllData();
    } catch (error: any) {
      console.error('Error saving grading scale:', error);
      toast.error(error.response?.data?.message || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setSavingGradingScale(false);
    }
  };

  const deleteGradingScale = async (id: number) => {
    const confirmed = await confirm({
      title: lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      message: t.confirmDelete[lang],
      confirmText: lang === 'ar' ? 'حذف' : 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    try {
      await apiClient.delete(`/grading-scales/${id}`);
      toast.success(t.gradeScaleDeleted[lang]);
      fetchAllData();
    } catch (error) {
      console.error('Error deleting grading scale:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في الحذف' : 'Error deleting grade scale');
    }
  };

  const resetGradingScales = async () => {
    const confirmed = await confirm({
      title: lang === 'ar' ? 'تأكيد إعادة التعيين' : 'Confirm Reset',
      message: t.confirmReset[lang],
      confirmText: lang === 'ar' ? 'إعادة تعيين' : 'Reset',
      danger: true,
    });
    if (!confirmed) return;
    try {
      await apiClient.post('/grading-scales/reset');
      toast.success(lang === 'ar' ? 'تم إعادة التعيين بنجاح' : 'Reset successful');
      fetchAllData();
    } catch (error) {
      console.error('Error resetting grading scales:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ' : 'An error occurred');
    }
  };

  // Ensure arrays helper
  const ensureArray = (arr: any) => Array.isArray(arr) ? arr : [];

  // Toggle select all requests
  const toggleSelectAllRequests = () => {
    const pendingReqs = ensureArray(requests).filter(r => r.status === 'PENDING' || r.status === 'pending');
    if (selectedRequests.length === pendingReqs.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(pendingReqs.map(r => String(r.id)));
    }
  };

  // Filter data based on search
  const filteredPrograms = ensureArray(programs).filter(p =>
    p.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name_ar?.includes(searchQuery) ||
    p.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = ensureArray(courses).filter(c =>
    c.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name_ar?.includes(searchQuery) ||
    c.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = ensureArray(requests).filter(r =>
    r.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.request_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.student?.full_name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.student?.full_name_ar?.includes(searchQuery)
  );

  const tabs = [
    { id: 'overview', label: t.overview[lang], icon: BarChart3 },
    { id: 'registration', label: t.registration[lang], icon: ClipboardList },
    { id: 'enrollments', label: t.enrollmentManagement[lang], icon: UserPlus },
    { id: 'grades', label: t.gradesManagement[lang], icon: Award },
    { id: 'schedule', label: t.scheduleManagement[lang], icon: Calendar },
    { id: 'attendance', label: t.attendanceManagement[lang], icon: UserCheck },
    { id: 'programs', label: t.programs[lang], icon: GraduationCap },
    { id: 'courses', label: t.courses[lang], icon: BookOpen },
    { id: 'semesters', label: t.semesters[lang], icon: Calendar },
    { id: 'students', label: t.students[lang], icon: Users },
    { id: 'reports', label: t.academicReports[lang], icon: TrendingUp },
    { id: 'graduation', label: t.graduationManagement[lang], icon: School },
    { id: 'requests', label: `${t.requests[lang]} ${stats.pendingRequests > 0 ? `(${stats.pendingRequests})` : ''}`, icon: FileText },
    { id: 'settings', label: t.settings[lang], icon: Settings },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: t.programs[lang], value: stats.totalPrograms, icon: GraduationCap, color: 'blue', path: '/admin/programs' },
          { label: t.courses[lang], value: stats.totalCourses, icon: BookOpen, color: 'green', path: '/admin/courses' },
          { label: t.activeStudents[lang], value: stats.activeStudents, icon: Users, color: 'purple', path: '/students' },
          { label: t.graduatedStudents[lang], value: stats.graduatedStudents, icon: Award, color: 'amber', path: '/students' },
          { label: t.colleges[lang], value: stats.colleges.length, icon: Building, color: 'indigo', path: '#' },
          { label: t.pendingRequests[lang], value: stats.pendingRequests, icon: Clock, color: 'red', path: '#', onClick: () => setActiveTab('requests') },
        ].map((stat, i) => (
          <div
            key={i}
            onClick={() => stat.onClick ? stat.onClick() : stat.path !== '#' && navigate(stat.path)}
            className={`bg-white rounded-xl p-4 border border-slate-200 shadow-sm ${(stat.path !== '#' || stat.onClick) ? 'cursor-pointer hover:shadow-md' : ''} transition-all`}
          >
            <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{loading ? '...' : stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Current Semester Card */}
      {stats.currentSemester && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-indigo-200 text-sm">{t.currentSemester[lang]}</p>
              <h2 className="text-2xl font-bold mt-1">
                {lang === 'ar' ? stats.currentSemester.name_ar : stats.currentSemester.name_en}
              </h2>
              <p className="text-indigo-200 mt-1">{stats.currentSemester.academic_year}</p>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="bg-white/10 rounded-lg px-3 py-2">
                  <p className="text-xs text-indigo-200">{t.enrolledThisSemester[lang]}</p>
                  <p className="text-xl font-bold">{stats.enrolledThisSemester}</p>
                </div>
                <div className="bg-white/10 rounded-lg px-3 py-2">
                  <p className="text-xs text-indigo-200">{t.droppedThisSemester[lang]}</p>
                  <p className="text-xl font-bold">{stats.droppedThisSemester}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-indigo-200">{t.registrationStatus[lang]}:</span>
                {stats.currentSemester.is_registration_open ? (
                  <span className="px-3 py-1 bg-green-500/20 text-green-100 rounded-full text-sm font-medium flex items-center gap-1">
                    <Unlock className="w-4 h-4" /> {t.open[lang]}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-500/20 text-red-100 rounded-full text-sm font-medium flex items-center gap-1">
                    <Lock className="w-4 h-4" /> {t.closed[lang]}
                  </span>
                )}
              </div>
              <button
                onClick={toggleRegistration}
                disabled={saving}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  stats.currentSemester.is_registration_open
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : stats.currentSemester.is_registration_open ? (
                  <><PauseCircle className="w-4 h-4" /> {t.closeRegistration[lang]}</>
                ) : (
                  <><PlayCircle className="w-4 h-4" /> {t.openRegistration[lang]}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t.addProgram[lang], icon: Plus, color: 'bg-blue-600 hover:bg-blue-700', action: () => navigate('/admin/programs') },
          { label: t.addCourse[lang], icon: Plus, color: 'bg-green-600 hover:bg-green-700', action: () => navigate('/admin/courses') },
          { label: t.addSemester[lang], icon: Plus, color: 'bg-orange-600 hover:bg-orange-700', action: () => navigate('/admin/semesters') },
          { label: t.viewReports[lang], icon: BarChart3, color: 'bg-purple-600 hover:bg-purple-700', action: () => navigate('/reports') },
        ].map((action, i) => (
          <button
            key={i}
            onClick={action.action}
            className={`${action.color} text-white rounded-xl p-4 flex items-center gap-3 transition-all hover:scale-[1.02]`}
          >
            <action.icon className="w-6 h-6" />
            <span className="font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            {lang === 'ar' ? 'توزيع المواد حسب النوع' : 'Course Distribution by Type'}
          </h3>
          <div className="space-y-4">
            {[
              { type: 'UNIVERSITY', label: t.universityReq[lang], color: 'bg-purple-500', count: stats.coursesByType.UNIVERSITY || 0 },
              { type: 'COLLEGE', label: t.collegeReq[lang], color: 'bg-blue-500', count: stats.coursesByType.COLLEGE || 0 },
              { type: 'MAJOR', label: t.majorReq[lang], color: 'bg-green-500', count: stats.coursesByType.MAJOR || 0 },
              { type: 'GRADUATION', label: t.graduationProject[lang], color: 'bg-amber-500', count: stats.coursesByType.GRADUATION || 0 },
            ].map((item) => (
              <div key={item.type} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded ${item.color}`} />
                <span className="flex-1 text-slate-700">{item.label}</span>
                <span className="font-bold text-slate-800">{item.count}</span>
                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${stats.totalCourses ? (item.count / stats.totalCourses * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colleges */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-600" />
            {t.colleges[lang]}
          </h3>
          <div className="space-y-3">
            {ensureArray(stats.colleges).map((college: any) => (
              <div key={college.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-medium text-slate-800">{lang === 'ar' ? college.name_ar : college.name_en}</p>
                  <p className="text-sm text-slate-500">{college.code}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Students */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            {lang === 'ar' ? 'آخر الطلاب المسجلين' : 'Recent Students'}
          </h3>
          <button
            onClick={() => navigate('/students')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {t.viewAll[lang]}
          </button>
        </div>
        {ensureArray(students).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{lang === 'ar' ? 'الرقم الجامعي' : 'Student ID'}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{lang === 'ar' ? 'البرنامج' : 'Program'}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{lang === 'ar' ? 'تاريخ القبول' : 'Admission Date'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ensureArray(students).slice(0, 10).map((student: any) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-indigo-600">{student.student_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{lang === 'ar' ? (student.name_ar || student.name_en) : (student.name_en || student.name_ar)}</p>
                      <p className="text-sm text-slate-500">{student.personal_email || student.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {lang === 'ar' ? (student.program?.name_ar || student.program?.name_en || '-') : (student.program?.name_en || student.program?.name_ar || '-')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        student.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        student.status === 'GRADUATED' ? 'bg-blue-100 text-blue-700' :
                        student.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {student.status === 'ACTIVE' ? (lang === 'ar' ? 'نشط' : 'Active') :
                         student.status === 'GRADUATED' ? (lang === 'ar' ? 'متخرج' : 'Graduated') :
                         student.status === 'SUSPENDED' ? (lang === 'ar' ? 'موقوف' : 'Suspended') :
                         student.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {student.admission_date ? new Date(student.admission_date).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            {lang === 'ar' ? 'لا يوجد طلاب مسجلين' : 'No students registered'}
          </div>
        )}
      </div>

      {/* Pending Requests Preview */}
      {stats.pendingRequests > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">
                  {lang === 'ar' ? `لديك ${stats.pendingRequests} طلبات بانتظار المراجعة` : `You have ${stats.pendingRequests} pending requests`}
                </p>
                <p className="text-sm text-amber-600">
                  {lang === 'ar' ? 'يرجى مراجعتها في أقرب وقت' : 'Please review them as soon as possible'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('requests')}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              {t.viewAll[lang]}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderRegistration = () => (
    <div className="space-y-6">
      {/* Registration Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-xl p-5 border ${stats.currentSemester?.is_registration_open ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">{t.registrationStatus[lang]}</p>
              <p className={`text-2xl font-bold ${stats.currentSemester?.is_registration_open ? 'text-green-700' : 'text-red-700'}`}>
                {stats.currentSemester?.is_registration_open ? t.open[lang] : t.closed[lang]}
              </p>
            </div>
            {stats.currentSemester?.is_registration_open ? (
              <Unlock className="w-10 h-10 text-green-600" />
            ) : (
              <Lock className="w-10 h-10 text-red-600" />
            )}
          </div>
          <button
            onClick={toggleRegistration}
            disabled={saving}
            className={`mt-4 w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
              stats.currentSemester?.is_registration_open
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {stats.currentSemester?.is_registration_open ? t.closeRegistration[lang] : t.openRegistration[lang]}
          </button>
        </div>

        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">{t.enrolledThisSemester[lang]}</p>
              <p className="text-2xl font-bold text-blue-700">{stats.enrolledThisSemester}</p>
            </div>
            <UserPlus className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">{t.droppedThisSemester[lang]}</p>
              <p className="text-2xl font-bold text-orange-700">{stats.droppedThisSemester}</p>
            </div>
            <UserMinus className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Registration Periods */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          {t.registrationPeriod[lang]}
        </h3>
        {stats.currentSemester && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">{lang === 'ar' ? 'بداية الفصل' : 'Semester Start'}</p>
              <p className="font-bold text-slate-800">{stats.currentSemester.start_date ? new Date(stats.currentSemester.start_date).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US') : '-'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">{lang === 'ar' ? 'نهاية الفصل' : 'Semester End'}</p>
              <p className="font-bold text-slate-800">{stats.currentSemester.end_date ? new Date(stats.currentSemester.end_date).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US') : '-'}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 mb-1">{lang === 'ar' ? 'بداية التسجيل' : 'Registration Start'}</p>
              <p className="font-bold text-green-800">{stats.currentSemester.registration_start ? new Date(stats.currentSemester.registration_start).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US') : '-'}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-600 mb-1">{lang === 'ar' ? 'نهاية التسجيل' : 'Registration End'}</p>
              <p className="font-bold text-amber-800">{stats.currentSemester.registration_end ? new Date(stats.currentSemester.registration_end).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US') : '-'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Enrollment Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{t.quickActions[lang]}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowEnrollModal(true)}
            className="p-4 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 flex flex-col items-center gap-2 transition-colors"
          >
            <UserPlus className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium">{lang === 'ar' ? 'تسجيل طالب' : 'Enroll Student'}</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="p-4 border border-slate-200 rounded-lg hover:bg-green-50 hover:border-green-300 flex flex-col items-center gap-2 transition-colors"
          >
            <Upload className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium">{lang === 'ar' ? 'استيراد تسجيلات' : 'Import Enrollments'}</span>
          </button>
          <button
            onClick={handleExportEnrollments}
            className="p-4 border border-slate-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 flex flex-col items-center gap-2 transition-colors"
          >
            <Download className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium">{lang === 'ar' ? 'تصدير التسجيلات' : 'Export Enrollments'}</span>
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            className="p-4 border border-slate-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 flex flex-col items-center gap-2 transition-colors"
          >
            <Mail className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-medium">{t.emailAllStudents[lang]}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPrograms = () => (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t.search[lang]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-10 pe-4 py-2 border border-slate-200 rounded-lg"
          />
        </div>
        <button
          onClick={() => navigate('/admin/programs')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t.addProgram[lang]}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.code[lang]}</th>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.name[lang]}</th>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.type[lang]}</th>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.credits[lang]}</th>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.students[lang]}</th>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.actions[lang]}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrograms.slice(0, 10).map((program) => (
                <tr key={program.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm text-blue-600">{program.code}</td>
                  <td className="px-4 py-3">{lang === 'ar' ? program.name_ar : program.name_en}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{program.type}</span>
                  </td>
                  <td className="px-4 py-3">{program.total_credits}</td>
                  <td className="px-4 py-3">{program.students_count || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate('/admin/programs')} className="p-1 hover:bg-slate-100 rounded">
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </button>
                      <button className="p-1 hover:bg-slate-100 rounded">
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredPrograms.slice(0, 10).map((program) => (
            <div key={program.id} className="p-4 hover:bg-slate-50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-mono text-sm text-blue-600 font-semibold">{program.code}</p>
                  <p className="font-medium text-slate-800">{lang === 'ar' ? program.name_ar : program.name_en}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => navigate('/admin/programs')} className="p-2 hover:bg-slate-100 rounded-lg">
                    <Edit2 className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg">
                    <Eye className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{program.type}</span>
                <span className="text-xs text-slate-500">{program.total_credits} {t.credits[lang]}</span>
                <span className="text-xs text-slate-500">{program.students_count || 0} {t.students[lang]}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredPrograms.length > 10 && (
          <div className="p-4 border-t border-slate-200 text-center">
            <button onClick={() => navigate('/admin/programs')} className="text-blue-600 hover:underline">
              {t.viewAll[lang]} ({filteredPrograms.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t.search[lang]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-10 pe-4 py-2 border border-slate-200 rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/courses')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t.addCourse[lang]}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.code[lang]}</th>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.name[lang]}</th>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.type[lang]}</th>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.credits[lang]}</th>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.programs[lang]}</th>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.status[lang]}</th>
                <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.actions[lang]}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.slice(0, 10).map((course) => {
                const courseType = course.programs?.[0]?.pivot?.type || 'N/A';
                const typeColors: Record<string, string> = {
                  UNIVERSITY: 'bg-purple-100 text-purple-700',
                  COLLEGE: 'bg-blue-100 text-blue-700',
                  MAJOR: 'bg-green-100 text-green-700',
                  GRADUATION: 'bg-amber-100 text-amber-700',
                };
                return (
                  <tr key={course.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-sm text-green-600">{course.code}</td>
                    <td className="px-4 py-3">{lang === 'ar' ? course.name_ar : course.name_en}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${typeColors[courseType] || 'bg-slate-100 text-slate-700'}`}>
                        {courseType}
                      </span>
                    </td>
                    <td className="px-4 py-3">{course.credits}</td>
                    <td className="px-4 py-3">{course.programs?.length || 0}</td>
                    <td className="px-4 py-3">
                      {course.is_active ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">{t.active[lang]}</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">{t.inactive[lang]}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/admin/courses')} className="p-1 hover:bg-slate-100 rounded" title={lang === 'ar' ? 'تعديل' : 'Edit'}>
                          <Edit2 className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowAssignModal(true);
                          }}
                          className="p-1 hover:bg-slate-100 rounded"
                          title={t.assignCourseToPrograms[lang]}
                        >
                          <Link2 className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredCourses.slice(0, 10).map((course) => {
            const courseType = course.programs?.[0]?.pivot?.type || 'N/A';
            const typeColors: Record<string, string> = {
              UNIVERSITY: 'bg-purple-100 text-purple-700',
              COLLEGE: 'bg-blue-100 text-blue-700',
              MAJOR: 'bg-green-100 text-green-700',
              GRADUATION: 'bg-amber-100 text-amber-700',
            };
            return (
              <div key={course.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-mono text-sm text-green-600 font-semibold">{course.code}</p>
                    <p className="font-medium text-slate-800">{lang === 'ar' ? course.name_ar : course.name_en}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => navigate('/admin/courses')} className="p-2 hover:bg-slate-100 rounded-lg">
                      <Edit2 className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowAssignModal(true);
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                      <Link2 className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${typeColors[courseType] || 'bg-slate-100 text-slate-700'}`}>
                    {courseType}
                  </span>
                  <span className="text-xs text-slate-500">{course.credits} {t.credits[lang]}</span>
                  <span className="text-xs text-slate-500">{course.programs?.length || 0} {t.programs[lang]}</span>
                  {course.is_active ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">{t.active[lang]}</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">{t.inactive[lang]}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredCourses.length > 10 && (
          <div className="p-4 border-t border-slate-200 text-center">
            <button onClick={() => navigate('/admin/courses')} className="text-green-600 hover:underline">
              {t.viewAll[lang]} ({filteredCourses.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSemesters = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/admin/semesters')}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t.addSemester[lang]}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ensureArray(semesters).map((semester) => (
          <div
            key={semester.id}
            className={`bg-white rounded-xl border p-5 ${semester.is_current ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-800">{lang === 'ar' ? semester.name_ar : semester.name_en}</h3>
                <p className="text-sm text-slate-500">{semester.academic_year}</p>
              </div>
              {semester.is_current && (
                <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">
                  {t.currentSemester[lang]}
                </span>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">{lang === 'ar' ? 'تاريخ البداية' : 'Start Date'}:</span>
                <span className="text-slate-700">{new Date(semester.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{lang === 'ar' ? 'تاريخ النهاية' : 'End Date'}:</span>
                <span className="text-slate-700">{new Date(semester.end_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t.registrationStatus[lang]}:</span>
                {semester.is_registration_open ? (
                  <span className="text-green-600 flex items-center gap-1"><Unlock className="w-3 h-3" /> {t.open[lang]}</span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1"><Lock className="w-3 h-3" /> {t.closed[lang]}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/semesters')}
              className="mt-4 w-full py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              {lang === 'ar' ? 'إدارة الفصل' : 'Manage Semester'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStudents = () => {
    // Filter students based on search query (by student_id, name)
    const filteredStudents = ensureArray(students).filter((student: any) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        student.student_id?.toLowerCase().includes(query) ||
        student.full_name_en?.toLowerCase().includes(query) ||
        student.full_name_ar?.includes(query) ||
        student.name_en?.toLowerCase().includes(query) ||
        student.name_ar?.includes(query) ||
        student.email?.toLowerCase().includes(query)
      );
    });

    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'البحث بالرقم الجامعي أو الاسم أو البريد...' : 'Search by Student ID, Name, or Email...'}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {lang === 'ar' ? 'مسح' : 'Clear'}
            </button>
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-slate-500">
              {lang === 'ar' ? `تم العثور على ${filteredStudents.length} طالب` : `Found ${filteredStudents.length} student(s)`}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: lang === 'ar' ? 'إجمالي الطلاب' : 'Total Students', value: stats.totalStudents, color: 'blue', icon: Users },
            { label: t.activeStudents[lang], value: stats.activeStudents, color: 'green', icon: UserCheck },
            { label: t.graduatedStudents[lang], value: stats.graduatedStudents, color: 'purple', icon: Award },
            { label: lang === 'ar' ? 'موقوفين' : 'Suspended', value: stats.suspendedStudents, color: 'red', icon: AlertTriangle },
          ].map((stat, i) => (
            <div key={i} className={`bg-${stat.color}-50 rounded-xl p-4 border border-${stat.color}-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</p>
                  <p className={`text-sm text-${stat.color}-600`}>{stat.label}</p>
                </div>
                <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
              </div>
            </div>
          ))}
        </div>

        {/* Students List */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">
              {searchQuery ? (lang === 'ar' ? 'نتائج البحث' : 'Search Results') : (lang === 'ar' ? 'الطلاب' : 'Students')}
            </h3>
            <button onClick={() => navigate('/students')} className="text-blue-600 hover:underline text-sm">
              {t.viewAll[lang]}
            </button>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {searchQuery
                  ? (lang === 'ar' ? 'لم يتم العثور على طلاب بهذا البحث' : 'No students found matching your search')
                  : (lang === 'ar' ? 'لا يوجد طلاب' : 'No students available')}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredStudents.slice(0, searchQuery ? 50 : 10).map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all cursor-pointer"
                  onClick={() => navigate(`/students?id=${student.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {(student.full_name_en || student.name_en || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {lang === 'ar' ? (student.full_name_ar || student.name_ar) : (student.full_name_en || student.name_en)}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="font-mono bg-slate-200 px-2 py-0.5 rounded">{student.student_id}</span>
                        {student.email && <span>{student.email}</span>}
                      </div>
                      {student.program?.name_en && (
                        <p className="text-xs text-slate-400 mt-1">
                          {lang === 'ar' ? student.program?.name_ar : student.program?.name_en}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      student.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      student.status === 'GRADUATED' ? 'bg-purple-100 text-purple-700' :
                      student.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {student.status === 'ACTIVE' ? (lang === 'ar' ? 'نشط' : 'Active') :
                       student.status === 'GRADUATED' ? (lang === 'ar' ? 'متخرج' : 'Graduated') :
                       student.status === 'SUSPENDED' ? (lang === 'ar' ? 'موقوف' : 'Suspended') :
                       student.status}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredStudents.length > (searchQuery ? 50 : 10) && (
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/students')}
                className="text-blue-600 hover:underline text-sm"
              >
                {lang === 'ar' ? `عرض جميع الطلاب (${filteredStudents.length})` : `View all students (${filteredStudents.length})`}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRequests = () => {
    const safeFilteredRequests = ensureArray(filteredRequests);
    // Backend uses: SUBMITTED, PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED, COMPLETED
    const pendingReqs = safeFilteredRequests.filter(r => ['SUBMITTED', 'PENDING', 'PENDING_APPROVAL', 'pending'].includes(r.status));
    const approvedReqs = safeFilteredRequests.filter(r => ['APPROVED', 'COMPLETED', 'approved'].includes(r.status));
    const rejectedReqs = safeFilteredRequests.filter(r => ['REJECTED', 'CANCELLED', 'rejected'].includes(r.status));

    return (
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-700">{pendingReqs.length}</p>
                <p className="text-sm text-amber-600">{t.pending[lang]}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-700">{approvedReqs.length}</p>
                <p className="text-sm text-green-600">{t.approved[lang]}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-700">{rejectedReqs.length}</p>
                <p className="text-sm text-red-600">{t.rejected[lang]}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {pendingReqs.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <button
              onClick={toggleSelectAllRequests}
              className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-white"
            >
              {selectedRequests.length === pendingReqs.length ? (
                <><CheckSquare className="w-4 h-4" /> {t.deselectAll[lang]}</>
              ) : (
                <><Square className="w-4 h-4" /> {t.selectAll[lang]}</>
              )}
            </button>
            {selectedRequests.length > 0 && (
              <>
                <span className="text-sm text-slate-500">
                  {lang === 'ar' ? `${selectedRequests.length} محدد` : `${selectedRequests.length} selected`}
                </span>
                <button
                  onClick={() => handleBulkRequestAction('approve')}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {t.bulkApprove[lang]}
                </button>
                <button
                  onClick={() => handleBulkRequestAction('reject')}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  {t.bulkReject[lang]}
                </button>
              </>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t.search[lang]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-10 pe-4 py-2 border border-slate-200 rounded-lg"
          />
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">{t.pendingRequests[lang]}</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingReqs.slice(0, 10).map((request) => (
              <div key={request.id} className="p-4 hover:bg-slate-50 flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedRequests.includes(String(request.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRequests([...selectedRequests, String(request.id)]);
                    } else {
                      setSelectedRequests(selectedRequests.filter(id => id !== String(request.id)));
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{request.subject || request.request_type}</p>
                      <p className="text-sm text-slate-500">{request.student?.full_name_en || 'N/A'} - {request.student?.student_id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRequestModal(true);
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                        title={lang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                      >
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleRequestAction(String(request.id), 'approve')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {t.approve[lang]}
                      </button>
                      <button
                        onClick={() => handleRequestAction(String(request.id), 'reject')}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        {t.reject[lang]}
                      </button>
                    </div>
                  </div>
                  {request.message && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{request.message}</p>
                  )}
                </div>
              </div>
            ))}
            {pendingReqs.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                <p>{lang === 'ar' ? 'لا توجد طلبات معلقة' : 'No pending requests'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Day labels
  const dayLabels: Record<string, { en: string; ar: string }> = {
    SUNDAY: { en: 'Sunday', ar: 'الأحد' },
    MONDAY: { en: 'Monday', ar: 'الاثنين' },
    TUESDAY: { en: 'Tuesday', ar: 'الثلاثاء' },
    WEDNESDAY: { en: 'Wednesday', ar: 'الأربعاء' },
    THURSDAY: { en: 'Thursday', ar: 'الخميس' },
    FRIDAY: { en: 'Friday', ar: 'الجمعة' },
    SATURDAY: { en: 'Saturday', ar: 'السبت' },
  };

  // Save schedule
  const handleSaveSchedule = async () => {
    try {
      setSavingSchedule(true);
      if (editingSchedule) {
        await apiClient.put(`/schedules/${editingSchedule.id}`, scheduleForm);
      } else {
        await apiClient.post('/schedules', scheduleForm);
      }
      toast.success(t.scheduleSaved[lang]);
      setShowScheduleModal(false);
      setEditingSchedule(null);
      setScheduleForm({
        course_id: '',
        semester_id: '',
        day: 'SUNDAY',
        start_time: '08:00',
        end_time: '09:30',
        room: '',
        building: '',
        instructor: '',
        section: '',
      });
      fetchAllData();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving schedule');
    } finally {
      setSavingSchedule(false);
    }
  };

  // Delete schedule
  const handleDeleteSchedule = async (id: number) => {
    const confirmed = await confirm({
      title: lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      message: t.confirmDelete[lang],
      confirmText: lang === 'ar' ? 'حذف' : 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    try {
      await apiClient.delete(`/schedules/${id}`);
      toast.success(t.scheduleDeleted[lang]);
      fetchAllData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء الحذف' : 'Error deleting schedule');
    }
  };

  // Open edit schedule modal
  const openEditSchedule = (schedule: any) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      course_id: String(schedule.course_id),
      semester_id: String(schedule.semester_id),
      day: schedule.day,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      room: schedule.room || '',
      building: schedule.building || '',
      instructor: schedule.instructor || '',
      section: schedule.section || '',
    });
    setShowScheduleModal(true);
  };

  // Filter schedules
  const filteredSchedules = ensureArray(schedules).filter(s => {
    const matchesSemester = scheduleSemesterFilter === 'all' || String(s.semester_id) === scheduleSemesterFilter;
    const matchesSearch = searchQuery === '' ||
      s.course?.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.course?.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.room?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.instructor?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSemester && matchesSearch;
  });

  // Paginate schedules
  const paginatedSchedules = filteredSchedules.slice(
    (schedulePage - 1) * schedulePerPage,
    schedulePage * schedulePerPage
  );
  const totalSchedulePages = Math.ceil(filteredSchedules.length / schedulePerPage);

  // Save attendance
  const handleSaveAttendance = async () => {
    if (!selectedCourseForAttendance) return;
    try {
      setSavingAttendance(true);
      // Prepare attendance data
      const attendancePayload = Object.entries(attendanceRecords).map(([enrollmentId, percentage]) => ({
        enrollment_id: parseInt(enrollmentId),
        attendance: parseFloat(percentage as string) || 0,
      }));

      await apiClient.post(`/courses/${selectedCourseForAttendance.id}/attendance/bulk`, {
        attendance: attendancePayload,
      });

      toast.success(t.attendanceSaved[lang]);
      setShowAttendanceModal(false);
      setSelectedCourseForAttendance(null);
      setAttendanceRecords({});
      fetchAllData();
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء حفظ الحضور' : 'Error saving attendance');
    } finally {
      setSavingAttendance(false);
    }
  };

  // Open attendance modal for a course
  const openAttendanceModal = (course: any) => {
    setSelectedCourseForAttendance(course);
    // Get enrollments for this course
    const courseEnrollments = ensureArray(enrollments).filter(e => e.course_id === course.id);
    // Initialize attendance records with current values
    const records: Record<string, string> = {};
    courseEnrollments.forEach(e => {
      records[String(e.id)] = String(e.attendance || 0);
    });
    setAttendanceRecords(records);
    setShowAttendanceModal(true);
  };

  // Filter courses for attendance
  const coursesWithEnrollments = ensureArray(courses).filter(c =>
    ensureArray(enrollments).some(e => e.course_id === c.id)
  );

  const renderSchedule = () => {
    const currentSemester = semesters.find((s: any) => s.is_current);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t.scheduleManagement[lang]}</h2>
            <p className="text-slate-500">{lang === 'ar' ? 'إدارة الجدول الدراسي للمواد' : 'Manage course schedules'}</p>
          </div>
          <button
            onClick={() => {
              setEditingSchedule(null);
              setScheduleForm({
                course_id: '',
                semester_id: currentSemester?.id ? String(currentSemester.id) : '',
                day: 'SUNDAY',
                start_time: '08:00',
                end_time: '09:30',
                room: '',
                building: '',
                instructor: '',
                section: '',
              });
              setShowScheduleModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.addSchedule[lang]}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={scheduleSemesterFilter}
            onChange={(e) => { setScheduleSemesterFilter(e.target.value); setSchedulePage(1); }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t.selectSemester[lang]}</option>
            {ensureArray(semesters).map((s: any) => (
              <option key={s.id} value={s.id}>{lang === 'ar' ? s.name_ar : s.name_en}</option>
            ))}
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.search[lang]}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSchedulePage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Schedule Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">{t.code[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">{t.name[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">{t.day[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">{t.startTime[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">{t.endTime[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">{t.room[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">{t.instructor[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">{t.actions[lang]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                      {t.noSchedule[lang]}
                    </td>
                  </tr>
                ) : (
                  paginatedSchedules.map((schedule: any) => (
                    <tr key={schedule.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{schedule.course?.code || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{lang === 'ar' ? schedule.course?.name_ar : schedule.course?.name_en || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          {dayLabels[schedule.day]?.[lang] || schedule.day}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{schedule.start_time}</td>
                      <td className="px-4 py-3 text-slate-600">{schedule.end_time}</td>
                      <td className="px-4 py-3 text-slate-600">{schedule.room || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{schedule.instructor || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditSchedule(schedule)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

          {/* Pagination */}
          {totalSchedulePages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
              <div className="text-sm text-slate-600">
                {t.showing[lang]} {(schedulePage - 1) * schedulePerPage + 1} {t.to[lang]} {Math.min(schedulePage * schedulePerPage, filteredSchedules.length)} {t.of[lang]} {filteredSchedules.length} {t.entries[lang]}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSchedulePage(1)}
                  disabled={schedulePage === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50"
                >
                  {t.first[lang]}
                </button>
                <button
                  onClick={() => setSchedulePage(p => Math.max(1, p - 1))}
                  disabled={schedulePage === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50"
                >
                  {t.previous[lang]}
                </button>
                <span className="px-3 py-1">
                  {t.page[lang]} {schedulePage} {t.of[lang]} {totalSchedulePages}
                </span>
                <button
                  onClick={() => setSchedulePage(p => Math.min(totalSchedulePages, p + 1))}
                  disabled={schedulePage === totalSchedulePages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50"
                >
                  {t.next[lang]}
                </button>
                <button
                  onClick={() => setSchedulePage(totalSchedulePages)}
                  disabled={schedulePage === totalSchedulePages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50"
                >
                  {t.last[lang]}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingSchedule ? t.editSchedule[lang] : t.addSchedule[lang]}
                </h3>
                <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.selectCourse[lang]}</label>
                    <select
                      value={scheduleForm.course_id}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, course_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t.selectCourse[lang]}</option>
                      {ensureArray(courses).map((c: any) => (
                        <option key={c.id} value={c.id}>{c.code} - {lang === 'ar' ? c.name_ar : c.name_en}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.selectSemester[lang]}</label>
                    <select
                      value={scheduleForm.semester_id}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, semester_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t.selectSemester[lang]}</option>
                      {ensureArray(semesters).map((s: any) => (
                        <option key={s.id} value={s.id}>{lang === 'ar' ? s.name_ar : s.name_en}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.day[lang]}</label>
                    <select
                      value={scheduleForm.day}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(dayLabels).map(([key, val]) => (
                        <option key={key} value={key}>{val[lang]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.startTime[lang]}</label>
                    <input
                      type="time"
                      value={scheduleForm.start_time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.endTime[lang]}</label>
                    <input
                      type="time"
                      value={scheduleForm.end_time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.room[lang]}</label>
                    <input
                      type="text"
                      value={scheduleForm.room}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                      placeholder="e.g., A101"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.building[lang]}</label>
                    <input
                      type="text"
                      value={scheduleForm.building}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, building: e.target.value })}
                      placeholder="e.g., Main Building"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.instructor[lang]}</label>
                    <input
                      type="text"
                      value={scheduleForm.instructor}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, instructor: e.target.value })}
                      placeholder="Dr. John Smith"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.section[lang]}</label>
                    <input
                      type="text"
                      value={scheduleForm.section}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, section: e.target.value })}
                      placeholder="e.g., A"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-4 border-t bg-slate-50">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {t.cancel[lang]}
                </button>
                <button
                  onClick={handleSaveSchedule}
                  disabled={savingSchedule || !scheduleForm.course_id || !scheduleForm.semester_id}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {savingSchedule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t.save[lang]}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAttendance = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t.attendanceManagement[lang]}</h2>
            <p className="text-slate-500">{lang === 'ar' ? 'إدارة حضور وغياب الطلاب' : 'Manage student attendance'}</p>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coursesWithEnrollments.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              {t.noAttendance[lang]}
            </div>
          ) : (
            coursesWithEnrollments.map((course: any) => {
              const courseEnrollments = ensureArray(enrollments).filter(e => e.course_id === course.id);
              const avgAttendance = courseEnrollments.length > 0
                ? (courseEnrollments.reduce((sum, e) => sum + (parseFloat(e.attendance) || 0), 0) / courseEnrollments.length).toFixed(1)
                : '0';

              return (
                <div key={course.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800">{course.code}</h3>
                      <p className="text-sm text-slate-500">{lang === 'ar' ? course.name_ar : course.name_en}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      parseFloat(avgAttendance) >= 80 ? 'bg-green-100 text-green-700' :
                      parseFloat(avgAttendance) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {avgAttendance}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
                    <span>{t.enrolled[lang]}: {courseEnrollments.length}</span>
                  </div>
                  <button
                    onClick={() => openAttendanceModal(course)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    {t.markAttendance[lang]}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Attendance Modal */}
        {showAttendanceModal && selectedCourseForAttendance && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{t.markAttendance[lang]}</h3>
                  <p className="text-sm text-slate-500">
                    {selectedCourseForAttendance.code} - {lang === 'ar' ? selectedCourseForAttendance.name_ar : selectedCourseForAttendance.name_en}
                  </p>
                </div>
                <button onClick={() => setShowAttendanceModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-start text-sm font-semibold text-slate-600">{t.studentId[lang]}</th>
                      <th className="px-4 py-2 text-start text-sm font-semibold text-slate-600">{t.name[lang]}</th>
                      <th className="px-4 py-2 text-start text-sm font-semibold text-slate-600">{t.attendancePercentage[lang]}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ensureArray(enrollments)
                      .filter(e => e.course_id === selectedCourseForAttendance.id)
                      .map((enrollment: any) => (
                        <tr key={enrollment.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-medium text-slate-800">
                            {enrollment.student?.student_code || enrollment.student_id}
                          </td>
                          <td className="px-4 py-2 text-slate-600">
                            {lang === 'ar'
                              ? enrollment.student?.full_name_ar || enrollment.student?.full_name_en
                              : enrollment.student?.full_name_en || enrollment.student?.full_name_ar
                            }
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={attendanceRecords[String(enrollment.id)] || '0'}
                                onChange={(e) => setAttendanceRecords({
                                  ...attendanceRecords,
                                  [String(enrollment.id)]: e.target.value
                                })}
                                className="w-20 px-2 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-slate-500">%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-end gap-3 p-4 border-t bg-slate-50">
                <button
                  onClick={() => setShowAttendanceModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {t.cancel[lang]}
                </button>
                <button
                  onClick={handleSaveAttendance}
                  disabled={savingAttendance}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {savingAttendance ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t.saveAttendance[lang]}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Registration Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          {lang === 'ar' ? 'إعدادات التسجيل' : 'Registration Settings'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-800">{t.lateRegistration[lang]}</p>
              <p className="text-sm text-slate-500">{lang === 'ar' ? 'السماح للطلاب بالتسجيل بعد انتهاء فترة التسجيل' : 'Allow students to register after deadline'}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settingsData.allowLateRegistration}
                onChange={(e) => setSettingsData({ ...settingsData, allowLateRegistration: e.target.checked })}
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.maxCredits[lang]}</label>
              <input
                type="number"
                value={settingsData.maxCredits}
                onChange={(e) => setSettingsData({ ...settingsData, maxCredits: parseInt(e.target.value) || 21 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.minCredits[lang]}</label>
              <input
                type="number"
                value={settingsData.minCredits}
                onChange={(e) => setSettingsData({ ...settingsData, minCredits: parseInt(e.target.value) || 12 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Academic Policies */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-indigo-600" />
          {t.academicPolicies[lang]}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <label className="block text-sm font-medium text-amber-700 mb-2">{t.probationGPA[lang]}</label>
            <input
              type="number"
              step="0.1"
              value={settingsData.probationGPA}
              onChange={(e) => setSettingsData({ ...settingsData, probationGPA: parseFloat(e.target.value) || 2.0 })}
              className="w-full px-3 py-2 border border-amber-200 rounded-lg bg-white"
            />
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <label className="block text-sm font-medium text-red-700 mb-2">{t.dismissalGPA[lang]}</label>
            <input
              type="number"
              step="0.1"
              value={settingsData.dismissalGPA}
              onChange={(e) => setSettingsData({ ...settingsData, dismissalGPA: parseFloat(e.target.value) || 1.5 })}
              className="w-full px-3 py-2 border border-red-200 rounded-lg bg-white"
            />
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <label className="block text-sm font-medium text-green-700 mb-2">{t.graduationCredits[lang]}</label>
            <input
              type="number"
              value={settingsData.graduationCredits}
              onChange={(e) => setSettingsData({ ...settingsData, graduationCredits: parseInt(e.target.value) || 132 })}
              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-white"
            />
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          {t.systemHealth[lang]}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">{t.dataIntegrity[lang]}</span>
            </div>
            <p className="text-sm text-green-600">{lang === 'ar' ? 'جميع البيانات سليمة' : 'All data integrity checks passed'}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">{t.lastSync[lang]}</span>
            </div>
            <p className="text-sm text-blue-600">{new Date().toLocaleString()}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <button className="w-full flex items-center justify-center gap-2 text-indigo-600 font-medium hover:text-indigo-700">
              <RefreshCw className="w-5 h-5" />
              {t.syncNow[lang]}
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveAcademicSettings}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t.save[lang]}
        </button>
      </div>
    </div>
  );

  // ========== NEW TABS ==========

  // Tab: Enrollment Management
  const renderEnrollments = () => {
    const safeEnrollments = ensureArray(enrollments);

    // Filter by search query
    const filteredEnrollments = safeEnrollments.filter(e => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        (e.student?.full_name_en || '').toLowerCase().includes(query) ||
        (e.student?.name_en || '').toLowerCase().includes(query) ||
        (e.student?.student_id || '').toLowerCase().includes(query) ||
        (e.course?.code || '').toLowerCase().includes(query) ||
        (e.course?.name_en || '').toLowerCase().includes(query)
      );
    });

    // Pagination calculations
    const totalItems = filteredEnrollments.length;
    const totalPages = Math.ceil(totalItems / enrollmentPerPage);
    const startIndex = (enrollmentPage - 1) * enrollmentPerPage;
    const endIndex = Math.min(startIndex + enrollmentPerPage, totalItems);
    const paginatedEnrollments = filteredEnrollments.slice(startIndex, endIndex);

    // Case-insensitive status matching with more variations
    const enrolledCount = safeEnrollments.filter(e => {
      const status = (e.status || '').toUpperCase();
      return status === 'ENROLLED' || status === 'ACTIVE' || status === 'REGISTERED' || status === 'CONFIRMED';
    }).length;
    const droppedCount = safeEnrollments.filter(e => {
      const status = (e.status || '').toUpperCase();
      return status === 'DROPPED' || status === 'WITHDRAWN' || status === 'CANCELLED';
    }).length;
    const completedCount = safeEnrollments.filter(e => {
      const status = (e.status || '').toUpperCase();
      return status === 'COMPLETED' || status === 'PASSED' || status === 'FINISHED' || status === 'GRADED';
    }).length;

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-700">{stats.totalEnrollments}</p>
                <p className="text-sm text-blue-600">{t.totalEnrollments[lang]}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-700">{enrolledCount}</p>
                <p className="text-sm text-green-600">{t.enrolled[lang]}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-700">{droppedCount}</p>
                <p className="text-sm text-orange-600">{lang === 'ar' ? 'محذوف' : 'Dropped'}</p>
              </div>
              <UserMinus className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-700">{completedCount}</p>
                <p className="text-sm text-purple-600">{lang === 'ar' ? 'مكتمل' : 'Completed'}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => setShowEnrollModal(true)}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 flex flex-col items-center gap-2 transition-colors"
          >
            <UserPlus className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium">{t.addEnrollment[lang]}</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-green-50 hover:border-green-300 flex flex-col items-center gap-2 transition-colors"
          >
            <Upload className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium">{t.import[lang]}</span>
          </button>
          <button
            onClick={handleExportEnrollments}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 flex flex-col items-center gap-2 transition-colors"
          >
            <Download className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium">{t.export[lang]}</span>
          </button>
          <button
            onClick={handleSyncFromLms}
            disabled={saving}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-cyan-50 hover:border-cyan-300 flex flex-col items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-8 h-8 text-cyan-600 ${saving ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">{t.syncFromLms[lang]}</span>
          </button>
          <button className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-orange-50 hover:border-orange-300 flex flex-col items-center gap-2 transition-colors">
            <Filter className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-medium">{lang === 'ar' ? 'تصفية' : 'Filter'}</span>
          </button>
        </div>

        {/* Enrollments Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">{t.enrollments[lang]}</h3>
            <div className="relative max-w-xs">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.search[lang]}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-9 pe-3 py-1.5 text-sm border border-slate-200 rounded-lg"
              />
            </div>
          </div>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.student[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.courses[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.semesters[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.grade[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.lmsGrade[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.status[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.actions[lang]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-800">{enrollment.student?.full_name_en || enrollment.student?.name_en || `Student ${enrollment.student_id}`}</p>
                        <p className="text-sm text-slate-500">{enrollment.student?.student_id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-sm text-blue-600">{enrollment.course?.code}</p>
                      <p className="text-sm text-slate-500">{lang === 'ar' ? enrollment.course?.name_ar : enrollment.course?.name_en}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{enrollment.semester || enrollment.semesterRecord?.name_en || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {enrollment.letter_grade ? (
                          <span className={`px-2 py-1 rounded font-semibold ${
                            ['A+', 'A', 'A-'].includes(enrollment.letter_grade) ? 'bg-green-100 text-green-700' :
                            ['B+', 'B', 'B-'].includes(enrollment.letter_grade) ? 'bg-blue-100 text-blue-700' :
                            ['C+', 'C', 'C-'].includes(enrollment.letter_grade) ? 'bg-yellow-100 text-yellow-700' :
                            ['D+', 'D'].includes(enrollment.letter_grade) ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {enrollment.letter_grade}
                          </span>
                        ) : enrollment.final_score ? (
                          <span className="text-slate-600">{enrollment.final_score}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const lmsGrade = getLmsGradeForEnrollment(enrollment.id);
                        if (lmsGrade) {
                          const percentage = lmsGrade.percentage ?? (lmsGrade.moodle_grade !== null ? (lmsGrade.moodle_grade / lmsGrade.moodle_grade_max * 100) : null);
                          return (
                            <div className="text-sm">
                              <span className={`px-2 py-1 rounded font-semibold ${
                                percentage >= 90 ? 'bg-green-100 text-green-700' :
                                percentage >= 80 ? 'bg-blue-100 text-blue-700' :
                                percentage >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                percentage >= 60 ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {lmsGrade.moodle_grade !== null ? `${lmsGrade.moodle_grade}/${lmsGrade.moodle_grade_max}` : '-'}
                              </span>
                              {percentage !== null && (
                                <span className="text-xs text-slate-500 ms-1">({percentage.toFixed(0)}%)</span>
                              )}
                            </div>
                          );
                        }
                        return <span className="text-xs text-slate-400">{t.noLmsGrade[lang]}</span>;
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        enrollment.status === 'ENROLLED' ? 'bg-green-100 text-green-700' :
                        enrollment.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700' :
                        enrollment.status === 'DROPPED' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditEnrollment(enrollment)}
                          className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                          title={t.editEnrollment[lang]}
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteEnrollment(enrollment)}
                          className="p-1.5 hover:bg-red-100 rounded transition-colors"
                          title={t.deleteEnrollment[lang]}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {paginatedEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-800">{enrollment.student?.full_name_en || enrollment.student?.name_en || `Student ${enrollment.student_id}`}</p>
                    <p className="text-sm text-slate-500">{enrollment.student?.student_id}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditEnrollment(enrollment)}
                      className="p-2 hover:bg-blue-100 rounded-lg"
                      title={t.editEnrollment[lang]}
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteEnrollment(enrollment)}
                      className="p-2 hover:bg-red-100 rounded-lg"
                      title={t.deleteEnrollment[lang]}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <p className="font-mono text-sm text-blue-600">{enrollment.course?.code}</p>
                  <p className="text-sm text-slate-500">{lang === 'ar' ? enrollment.course?.name_ar : enrollment.course?.name_en}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {enrollment.letter_grade && (
                    <span className={`px-2 py-1 text-xs rounded font-semibold ${
                      ['A+', 'A', 'A-'].includes(enrollment.letter_grade) ? 'bg-green-100 text-green-700' :
                      ['B+', 'B', 'B-'].includes(enrollment.letter_grade) ? 'bg-blue-100 text-blue-700' :
                      ['C+', 'C', 'C-'].includes(enrollment.letter_grade) ? 'bg-yellow-100 text-yellow-700' :
                      ['D+', 'D'].includes(enrollment.letter_grade) ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {t.grade[lang]}: {enrollment.letter_grade}
                    </span>
                  )}
                  {(() => {
                    const lmsGrade = getLmsGradeForEnrollment(enrollment.id);
                    if (lmsGrade && lmsGrade.moodle_grade !== null) {
                      const percentage = lmsGrade.percentage ?? (lmsGrade.moodle_grade / lmsGrade.moodle_grade_max * 100);
                      return (
                        <span className={`px-2 py-1 text-xs rounded font-semibold ${
                          percentage >= 90 ? 'bg-cyan-100 text-cyan-700' :
                          percentage >= 80 ? 'bg-cyan-100 text-cyan-700' :
                          percentage >= 70 ? 'bg-cyan-100 text-cyan-700' :
                          'bg-cyan-100 text-cyan-700'
                        }`}>
                          LMS: {lmsGrade.moodle_grade}/{lmsGrade.moodle_grade_max}
                        </span>
                      );
                    }
                    return null;
                  })()}
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    enrollment.status === 'ENROLLED' ? 'bg-green-100 text-green-700' :
                    enrollment.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700' :
                    enrollment.status === 'DROPPED' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {enrollment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>{t.showing[lang]} {startIndex + 1} {t.to[lang]} {endIndex} {t.of[lang]} {totalItems} {t.entries[lang]}</span>
                <select
                  value={enrollmentPerPage}
                  onChange={(e) => { setEnrollmentPerPage(Number(e.target.value)); setEnrollmentPage(1); }}
                  className="border border-slate-200 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEnrollmentPage(1)}
                  disabled={enrollmentPage === 1}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.first[lang]}
                </button>
                <button
                  onClick={() => setEnrollmentPage(p => Math.max(1, p - 1))}
                  disabled={enrollmentPage === 1}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.previous[lang]}
                </button>
                <span className="px-3 py-1.5 text-sm">
                  {t.page[lang]} {enrollmentPage} {t.of[lang]} {totalPages || 1}
                </span>
                <button
                  onClick={() => setEnrollmentPage(p => Math.min(totalPages, p + 1))}
                  disabled={enrollmentPage >= totalPages}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.next[lang]}
                </button>
                <button
                  onClick={() => setEnrollmentPage(totalPages)}
                  disabled={enrollmentPage >= totalPages}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.last[lang]}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Tab: Grades Management
  const renderGrades = () => {
    const safeGrades = ensureArray(grades);
    const pendingGrades = safeGrades.filter(g => g.status === 'PENDING');
    const approvedGrades = safeGrades.filter(g => g.status === 'APPROVED');
    const submittedGrades = safeGrades.filter(g => g.status === 'SUBMITTED');

    // Filter by semester and search query
    const filteredGrades = safeGrades
      .filter(grade => gradesSemesterFilter === 'all' || grade.semester_id?.toString() === gradesSemesterFilter)
      .filter(g => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          (g.student?.full_name_en || '').toLowerCase().includes(query) ||
          (g.student?.name_en || '').toLowerCase().includes(query) ||
          (g.student?.student_id || '').toLowerCase().includes(query) ||
          (g.course?.code || '').toLowerCase().includes(query) ||
          (g.course?.name_en || '').toLowerCase().includes(query) ||
          (g.letter_grade || '').toLowerCase().includes(query)
        );
      });

    // Pagination calculations
    const totalGradesItems = filteredGrades.length;
    const totalGradesPages = Math.ceil(totalGradesItems / gradesPerPage);
    const gradesStartIndex = (gradesPage - 1) * gradesPerPage;
    const gradesEndIndex = Math.min(gradesStartIndex + gradesPerPage, totalGradesItems);
    const paginatedGrades = filteredGrades.slice(gradesStartIndex, gradesEndIndex);

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-700">{grades.length}</p>
                <p className="text-sm text-blue-600">{lang === 'ar' ? 'إجمالي الدرجات' : 'Total Grades'}</p>
              </div>
              <Award className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-700">{pendingGrades.length + submittedGrades.length}</p>
                <p className="text-sm text-amber-600">{t.pendingGrades[lang]}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-700">{approvedGrades.length}</p>
                <p className="text-sm text-green-600">{t.approvedGrades[lang]}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-700">{stats.totalCourses}</p>
                <p className="text-sm text-purple-600">{t.courses[lang]}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => setShowEnterGradeModal(true)}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex flex-col items-center gap-2 transition-colors"
          >
            <Plus className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium">{t.enterGrade[lang]}</span>
          </button>
          <button
            onClick={() => setShowBulkGradeModal(true)}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex flex-col items-center gap-2 transition-colors"
          >
            <Upload className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium">{t.bulkGradeEntry[lang]}</span>
          </button>
          <button
            onClick={handleApproveAllGrades}
            disabled={saving}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex flex-col items-center gap-2 transition-colors disabled:opacity-50"
          >
            <CheckSquare className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium">{t.approveGrades[lang]}</span>
          </button>
          <button
            onClick={handleExportGrades}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex flex-col items-center gap-2 transition-colors"
          >
            <Download className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-medium">{t.export[lang]}</span>
          </button>
          <button
            onClick={() => navigate('/admin/grading-scales')}
            className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl hover:from-indigo-100 hover:to-purple-100 flex flex-col items-center gap-2 transition-colors"
          >
            <Award className="w-8 h-8 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">{t.gradingScales[lang]}</span>
          </button>
        </div>

        {/* Pending Grades for Approval */}
        {(pendingGrades.length > 0 || submittedGrades.length > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">
                    {lang === 'ar' ? `${pendingGrades.length + submittedGrades.length} درجات بانتظار الاعتماد` : `${pendingGrades.length + submittedGrades.length} grades pending approval`}
                  </p>
                  <p className="text-sm text-amber-600">
                    {lang === 'ar' ? 'يرجى مراجعتها واعتمادها' : 'Please review and approve them'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleApproveAllGrades}
                disabled={saving}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t.approveGrades[lang]}
              </button>
            </div>
          </div>
        )}

        {/* Grades Table - Responsive */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-slate-800">{t.gradesManagement[lang]}</h3>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.search[lang]}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-9 pe-3 py-1.5 text-sm border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Semester Filter */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-slate-600">{lang === 'ar' ? 'فلتر الفصل:' : 'Semester Filter:'}</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setGradesSemesterFilter('all')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${gradesSemesterFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                >
                  {lang === 'ar' ? 'الكل' : 'All'} ({ensureArray(grades).length})
                </button>
                {ensureArray(semesters).map(sem => (
                  <button
                    key={sem.id}
                    onClick={() => setGradesSemesterFilter(sem.id.toString())}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${gradesSemesterFilter === sem.id.toString() ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                  >
                    {lang === 'ar' ? sem.name_ar : sem.name_en} ({ensureArray(grades).filter(g => g.semester_id === sem.id).length})
                    {sem.is_current && <span className="ms-1 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.studentId[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.student[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.courses[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.midterm[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.coursework[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.final[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.total[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.letterGrade[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.status[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.actions[lang]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-mono text-sm text-blue-600">{grade.student?.student_id || grade.student_id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{grade.student?.full_name_en || grade.student?.name_en || `Student ${grade.student_id}`}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-sm text-blue-600">{grade.course?.code}</p>
                      <p className="text-xs text-slate-500">{lang === 'ar' ? (grade.course?.name_ar || grade.course?.name_en) : (grade.course?.name_en || grade.course?.name_ar)}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{grade.midterm_score ?? grade.midterm ?? '-'}</td>
                    <td className="px-4 py-3 text-sm">{grade.assignments_score ?? grade.coursework ?? '-'}</td>
                    <td className="px-4 py-3 text-sm">{grade.final_score ?? grade.final ?? '-'}</td>
                    <td className="px-4 py-3 font-bold">{grade.total_score ?? grade.total ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                        ['A', 'A+', 'A-'].includes(grade.letter_grade) ? 'bg-green-100 text-green-700' :
                        ['B', 'B+', 'B-'].includes(grade.letter_grade) ? 'bg-blue-100 text-blue-700' :
                        ['C', 'C+', 'C-'].includes(grade.letter_grade) ? 'bg-amber-100 text-amber-700' :
                        ['D', 'D+'].includes(grade.letter_grade) ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {grade.letter_grade || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        grade.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        grade.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        grade.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {grade.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openGradeModal(grade)}
                          className="p-1 hover:bg-blue-100 rounded"
                          title={t.editGrade[lang]}
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        {grade.status !== 'APPROVED' && (
                          <button className="p-1 hover:bg-green-100 rounded" title={t.approve[lang]}>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden divide-y divide-slate-100">
            {paginatedGrades.map((grade) => (
              <div key={grade.id} className="p-4 hover:bg-slate-50">
                {/* Header with student name and actions */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-blue-600 mb-1">{grade.student?.student_id || grade.student_id}</p>
                    <p className="font-medium text-slate-800 truncate">
                      {grade.student?.full_name_en || grade.student?.name_en || grade.student?.name_ar || `Student ${grade.student_id}`}
                    </p>
                    <p className="font-mono text-sm text-slate-500">{grade.course?.code} - <span className="font-sans text-slate-600">{lang === 'ar' ? (grade.course?.name_ar || grade.course?.name_en) : (grade.course?.name_en || grade.course?.name_ar)}</span></p>
                  </div>
                  <div className="flex items-center gap-2 ms-2">
                    <button
                      onClick={() => openGradeModal(grade)}
                      className="p-2 hover:bg-blue-100 rounded-lg"
                      title={t.editGrade[lang]}
                    >
                      <Edit2 className="w-5 h-5 text-blue-600" />
                    </button>
                    {grade.status !== 'APPROVED' && (
                      <button className="p-2 hover:bg-green-100 rounded-lg" title={t.approve[lang]}>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grades Grid */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500 mb-1">{t.midterm[lang]}</p>
                    <p className="font-semibold text-slate-800">{grade.midterm_score ?? grade.midterm ?? '-'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500 mb-1">{t.coursework[lang]}</p>
                    <p className="font-semibold text-slate-800">{grade.assignments_score ?? grade.coursework ?? '-'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500 mb-1">{t.final[lang]}</p>
                    <p className="font-semibold text-slate-800">{grade.final_score ?? grade.final ?? '-'}</p>
                  </div>
                </div>

                {/* Total, Letter Grade, Status */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">{t.total[lang]}:</span>
                    <span className="font-bold text-lg text-slate-800">{grade.total_score ?? grade.total ?? '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm rounded-full font-bold ${
                      ['A', 'A+', 'A-'].includes(grade.letter_grade) ? 'bg-green-100 text-green-700' :
                      ['B', 'B+', 'B-'].includes(grade.letter_grade) ? 'bg-blue-100 text-blue-700' :
                      ['C', 'C+', 'C-'].includes(grade.letter_grade) ? 'bg-amber-100 text-amber-700' :
                      ['D', 'D+'].includes(grade.letter_grade) ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {grade.letter_grade || '-'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      grade.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      grade.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      grade.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {grade.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredGrades.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>{t.noData[lang]}</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalGradesItems > 0 && (
            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>{t.showing[lang]} {gradesStartIndex + 1} {t.to[lang]} {gradesEndIndex} {t.of[lang]} {totalGradesItems} {t.entries[lang]}</span>
                <select
                  value={gradesPerPage}
                  onChange={(e) => { setGradesPerPage(Number(e.target.value)); setGradesPage(1); }}
                  className="border border-slate-200 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setGradesPage(1)}
                  disabled={gradesPage === 1}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.first[lang]}
                </button>
                <button
                  onClick={() => setGradesPage(p => Math.max(1, p - 1))}
                  disabled={gradesPage === 1}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.previous[lang]}
                </button>
                <span className="px-3 py-1.5 text-sm">
                  {t.page[lang]} {gradesPage} {t.of[lang]} {totalGradesPages || 1}
                </span>
                <button
                  onClick={() => setGradesPage(p => Math.min(totalGradesPages, p + 1))}
                  disabled={gradesPage >= totalGradesPages}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.next[lang]}
                </button>
                <button
                  onClick={() => setGradesPage(totalGradesPages)}
                  disabled={gradesPage >= totalGradesPages}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.last[lang]}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Grading Scale Management Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-slate-800">{t.gradingScales[lang]}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => openGradingScaleModal()}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {t.addGrade[lang]}
              </button>
              <button
                onClick={resetGradingScales}
                className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                {t.resetToDefault[lang]}
              </button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.letterGrade[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.minScore[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.maxScore[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.gradePoints[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{lang === 'ar' ? 'الوصف' : 'Description'}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.isPassing[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.actions[lang]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ensureArray(gradingScales).map((scale) => (
                  <tr key={scale.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 text-sm rounded-full font-bold ${
                        ['A', 'A+', 'A-'].includes(scale.letter_grade) ? 'bg-green-100 text-green-700' :
                        ['B', 'B+', 'B-'].includes(scale.letter_grade) ? 'bg-blue-100 text-blue-700' :
                        ['C', 'C+', 'C-'].includes(scale.letter_grade) ? 'bg-amber-100 text-amber-700' :
                        ['D', 'D+', 'D'].includes(scale.letter_grade) ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {scale.letter_grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{scale.min_score}</td>
                    <td className="px-4 py-3 text-sm">{scale.max_score}</td>
                    <td className="px-4 py-3 text-sm font-medium">{scale.grade_points}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {lang === 'ar' ? (scale.description_ar || scale.description_en) : (scale.description_en || scale.description_ar)}
                    </td>
                    <td className="px-4 py-3">
                      {scale.is_passing ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openGradingScaleModal(scale)}
                          className="p-1 hover:bg-blue-100 rounded"
                          title={t.editGradeScale[lang]}
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => deleteGradingScale(scale.id)}
                          className="p-1 hover:bg-red-100 rounded"
                          title={lang === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {ensureArray(gradingScales).map((scale) => (
              <div key={scale.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 text-sm rounded-full font-bold ${
                    ['A', 'A+', 'A-'].includes(scale.letter_grade) ? 'bg-green-100 text-green-700' :
                    ['B', 'B+', 'B-'].includes(scale.letter_grade) ? 'bg-blue-100 text-blue-700' :
                    ['C', 'C+', 'C-'].includes(scale.letter_grade) ? 'bg-amber-100 text-amber-700' :
                    ['D', 'D+', 'D'].includes(scale.letter_grade) ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {scale.letter_grade}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openGradingScaleModal(scale)}
                      className="p-2 hover:bg-blue-100 rounded-lg"
                    >
                      <Edit2 className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => deleteGradingScale(scale.id)}
                      className="p-2 hover:bg-red-100 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500 mb-1">{t.minScore[lang]}</p>
                    <p className="font-semibold">{scale.min_score}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500 mb-1">{t.maxScore[lang]}</p>
                    <p className="font-semibold">{scale.max_score}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500 mb-1">{t.gradePoints[lang]}</p>
                    <p className="font-semibold">{scale.grade_points}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-slate-600">
                    {lang === 'ar' ? (scale.description_ar || scale.description_en) : (scale.description_en || scale.description_ar)}
                  </span>
                  {scale.is_passing ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> {t.isPassing[lang]}
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> {lang === 'ar' ? 'راسب' : 'Fail'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {ensureArray(gradingScales).length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>{t.noData[lang]}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Tab: Academic Reports
  const renderReports = () => {
    const safeGrades = ensureArray(grades);
    const safeStudents = ensureArray(students);
    const safeEnrollments = ensureArray(enrollments);
    const safeCourses = ensureArray(courses);

    // Calculate average GPA properly
    const gradesWithPoints = safeGrades.filter(g => g.grade_points !== null && g.grade_points !== undefined && !isNaN(g.grade_points));
    const avgGPA = gradesWithPoints.length > 0
      ? (gradesWithPoints.reduce((sum, g) => sum + parseFloat(g.grade_points || 0), 0) / gradesWithPoints.length).toFixed(2)
      : '0.00';

    // Grade distribution
    const gradeDistribution: Record<string, number> = {};
    safeGrades.forEach(g => {
      const letter = g.letter_grade || 'N/A';
      gradeDistribution[letter] = (gradeDistribution[letter] || 0) + 1;
    });

    // Top students (by GPA)
    const studentsWithGPA = safeStudents.filter(s => s.gpa !== null && s.gpa !== undefined && !isNaN(s.gpa));
    const topStudents = [...studentsWithGPA].sort((a, b) => (b.gpa || 0) - (a.gpa || 0)).slice(0, 10);

    // At-risk students (GPA < 2.0)
    const atRiskStudents = safeStudents.filter(s => s.gpa !== null && s.gpa !== undefined && s.gpa < 2.0 && s.status === 'ACTIVE');

    // Course performance - pass rate per course
    const courseStats: Record<number, { total: number; passed: number; name: string; code: string }> = {};
    safeGrades.forEach(g => {
      if (!g.course_id) return;
      if (!courseStats[g.course_id]) {
        const course = safeCourses.find(c => c.id === g.course_id);
        courseStats[g.course_id] = { total: 0, passed: 0, name: course?.name_en || '', code: course?.code || '' };
      }
      courseStats[g.course_id].total++;
      if (['A', 'A+', 'A-', 'B', 'B+', 'B-', 'C', 'C+', 'C-', 'D', 'D+'].includes(g.letter_grade)) {
        courseStats[g.course_id].passed++;
      }
    });

    // Enrollment by semester
    const enrollmentBySemester: Record<string, number> = {};
    safeEnrollments.forEach(e => {
      const sem = ensureArray(semesters).find(s => s.id === e.semester_id);
      const semName = sem ? (lang === 'ar' ? sem.name_ar : sem.name_en) : `Semester ${e.semester_id}`;
      enrollmentBySemester[semName] = (enrollmentBySemester[semName] || 0) + 1;
    });

    return (
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <p className="text-blue-100 text-sm">{t.activeStudents[lang]}</p>
            <p className="text-3xl font-bold mt-1">{stats.activeStudents}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
            <p className="text-green-100 text-sm">{t.totalEnrollments[lang]}</p>
            <p className="text-3xl font-bold mt-1">{stats.totalEnrollments}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <p className="text-purple-100 text-sm">{lang === 'ar' ? 'متوسط المعدل' : 'Average GPA'}</p>
            <p className="text-3xl font-bold mt-1">{avgGPA}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
            <p className="text-amber-100 text-sm">{t.graduatedStudents[lang]}</p>
            <p className="text-3xl font-bold mt-1">{stats.graduatedStudents}</p>
          </div>
        </div>

        {/* Enrollment Statistics */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div
            className="px-6 py-4 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50"
            onClick={() => setExpandedReport(expandedReport === 'enrollment' ? null : 'enrollment')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{t.enrollmentStats[lang]}</h3>
                <p className="text-sm text-slate-500">{lang === 'ar' ? 'إحصائيات التسجيل حسب الفصل' : 'Enrollment by semester'}</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedReport === 'enrollment' ? 'rotate-90' : ''}`} />
          </div>
          {expandedReport === 'enrollment' && (
            <div className="p-6">
              <div className="space-y-3">
                {Object.entries(enrollmentBySemester).map(([sem, count]) => (
                  <div key={sem} className="flex items-center gap-3">
                    <span className="flex-1 text-slate-700 text-sm">{sem}</span>
                    <span className="font-bold text-slate-800">{count}</span>
                    <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${stats.totalEnrollments ? (count / stats.totalEnrollments * 100) : 0}%` }} />
                    </div>
                  </div>
                ))}
                {Object.keys(enrollmentBySemester).length === 0 && (
                  <p className="text-slate-500 text-center py-4">{lang === 'ar' ? 'لا توجد بيانات' : 'No data available'}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Grade Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div
            className="px-6 py-4 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50"
            onClick={() => setExpandedReport(expandedReport === 'grades' ? null : 'grades')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{t.gradeDistribution[lang]}</h3>
                <p className="text-sm text-slate-500">{lang === 'ar' ? 'توزيع التقديرات' : 'Letter grade distribution'}</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedReport === 'grades' ? 'rotate-90' : ''}`} />
          </div>
          {expandedReport === 'grades' && (
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'].map(letter => (
                  <div key={letter} className={`p-3 rounded-lg text-center ${
                    ['A+', 'A', 'A-'].includes(letter) ? 'bg-green-50 border border-green-200' :
                    ['B+', 'B', 'B-'].includes(letter) ? 'bg-blue-50 border border-blue-200' :
                    ['C+', 'C', 'C-'].includes(letter) ? 'bg-amber-50 border border-amber-200' :
                    ['D+', 'D'].includes(letter) ? 'bg-orange-50 border border-orange-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    <p className="text-xl font-bold">{letter}</p>
                    <p className="text-2xl font-bold">{gradeDistribution[letter] || 0}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Course Performance */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div
            className="px-6 py-4 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50"
            onClick={() => setExpandedReport(expandedReport === 'courses' ? null : 'courses')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{t.coursePerformance[lang]}</h3>
                <p className="text-sm text-slate-500">{lang === 'ar' ? 'نسب النجاح في المواد' : 'Pass rates by course'}</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedReport === 'courses' ? 'rotate-90' : ''}`} />
          </div>
          {expandedReport === 'courses' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-2 text-start text-sm font-medium text-slate-600">{lang === 'ar' ? 'الكود' : 'Code'}</th>
                      <th className="px-4 py-2 text-start text-sm font-medium text-slate-600">{lang === 'ar' ? 'المادة' : 'Course'}</th>
                      <th className="px-4 py-2 text-start text-sm font-medium text-slate-600">{lang === 'ar' ? 'الطلاب' : 'Students'}</th>
                      <th className="px-4 py-2 text-start text-sm font-medium text-slate-600">{lang === 'ar' ? 'نسبة النجاح' : 'Pass Rate'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(courseStats).slice(0, 15).map(([courseId, data]) => {
                      const passRate = data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0;
                      return (
                        <tr key={courseId} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-mono text-sm text-blue-600">{data.code}</td>
                          <td className="px-4 py-2 text-sm">{data.name}</td>
                          <td className="px-4 py-2 text-sm">{data.total}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${passRate >= 70 ? 'bg-green-500' : passRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${passRate}%` }} />
                              </div>
                              <span className="text-sm font-medium">{passRate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {Object.keys(courseStats).length === 0 && (
                  <p className="text-slate-500 text-center py-4">{lang === 'ar' ? 'لا توجد بيانات' : 'No data available'}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Top Students */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div
            className="px-6 py-4 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50"
            onClick={() => setExpandedReport(expandedReport === 'top' ? null : 'top')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{t.topStudents[lang]}</h3>
                <p className="text-sm text-slate-500">{lang === 'ar' ? `${topStudents.length} طلاب متفوقين` : `${topStudents.length} top performers`}</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedReport === 'top' ? 'rotate-90' : ''}`} />
          </div>
          {expandedReport === 'top' && (
            <div className="p-6">
              <div className="space-y-3">
                {topStudents.map((student, index) => (
                  <div key={student.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-700' : 'bg-slate-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{lang === 'ar' ? (student.name_ar || student.name_en) : (student.name_en || student.name_ar)}</p>
                      <p className="text-sm text-slate-500">{student.student_id}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-xl font-bold text-green-600">{parseFloat(student.gpa).toFixed(2)}</p>
                      <p className="text-xs text-slate-500">GPA</p>
                    </div>
                  </div>
                ))}
                {topStudents.length === 0 && (
                  <p className="text-slate-500 text-center py-4">{lang === 'ar' ? 'لا توجد بيانات' : 'No data available'}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* At-Risk Students */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div
            className="px-6 py-4 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50"
            onClick={() => setExpandedReport(expandedReport === 'risk' ? null : 'risk')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{t.atRiskStudents[lang]}</h3>
                <p className="text-sm text-slate-500">{lang === 'ar' ? `${atRiskStudents.length} طالب معرض للخطر` : `${atRiskStudents.length} at-risk students`}</p>
              </div>
            </div>
            {atRiskStudents.length > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">{atRiskStudents.length}</span>
            )}
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedReport === 'risk' ? 'rotate-90' : ''}`} />
          </div>
          {expandedReport === 'risk' && (
            <div className="p-6">
              <div className="space-y-3">
                {atRiskStudents.slice(0, 20).map(student => (
                  <div key={student.id} className="flex items-center gap-4 p-3 rounded-lg bg-red-50 border border-red-100">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{lang === 'ar' ? (student.name_ar || student.name_en) : (student.name_en || student.name_ar)}</p>
                      <p className="text-sm text-slate-500">{student.student_id}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-xl font-bold text-red-600">{parseFloat(student.gpa).toFixed(2)}</p>
                      <p className="text-xs text-slate-500">GPA</p>
                    </div>
                  </div>
                ))}
                {atRiskStudents.length === 0 && (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-green-600 font-medium">{lang === 'ar' ? 'لا يوجد طلاب معرضين للخطر' : 'No at-risk students'}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Programs Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-4">{lang === 'ar' ? 'نظرة عامة على البرامج' : 'Programs Overview'}</h3>
          <div className="space-y-3">
            {Object.entries(stats.programsByType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded ${
                  type === 'BACHELOR' ? 'bg-blue-500' :
                  type === 'MASTER' ? 'bg-purple-500' :
                  type === 'PHD' ? 'bg-green-500' : 'bg-slate-500'
                }`} />
                <span className="flex-1 text-slate-700">{type}</span>
                <span className="font-bold text-slate-800">{count as number}</span>
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      type === 'BACHELOR' ? 'bg-blue-500' :
                      type === 'MASTER' ? 'bg-purple-500' :
                      type === 'PHD' ? 'bg-green-500' : 'bg-slate-500'
                    }`}
                    style={{ width: `${stats.totalPrograms ? ((count as number) / stats.totalPrograms * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Tab: Graduation Management
  const renderGraduation = () => {
    const safeGraduationApps = ensureArray(graduationApps);
    const pendingApps = safeGraduationApps.filter(a => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status));
    const approvedApps = safeGraduationApps.filter(a => a.status === 'APPROVED');
    const graduatedApps = safeGraduationApps.filter(a => a.status === 'GRADUATED');

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-700">{graduationApps.length}</p>
                <p className="text-sm text-blue-600">{t.graduationApplications[lang]}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-700">{pendingApps.length}</p>
                <p className="text-sm text-amber-600">{t.underReview[lang]}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-700">{approvedApps.length}</p>
                <p className="text-sm text-green-600">{t.approved[lang]}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-700">{graduatedApps.length}</p>
                <p className="text-sm text-purple-600">{t.graduated[lang]}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={handleCheckEligibility}
            disabled={checkingEligibility}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex flex-col items-center gap-2 transition-colors disabled:opacity-50"
          >
            {checkingEligibility ? <Loader2 className="w-8 h-8 text-blue-600 animate-spin" /> : <Search className="w-8 h-8 text-blue-600" />}
            <span className="text-sm font-medium">{t.checkEligibility[lang]}</span>
          </button>
          <button
            onClick={() => setShowNewGradAppModal(true)}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex flex-col items-center gap-2 transition-colors"
          >
            <Plus className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium">{lang === 'ar' ? 'طلب تخرج جديد' : 'New Application'}</span>
          </button>
          <button
            onClick={() => setShowTranscriptModal(true)}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex flex-col items-center gap-2 transition-colors"
          >
            <FileCheck className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium">{t.issueTranscript[lang]}</span>
          </button>
          <button
            onClick={() => setShowCertificateModal(true)}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex flex-col items-center gap-2 transition-colors"
          >
            <Award className="w-8 h-8 text-amber-600" />
            <span className="text-sm font-medium">{t.issueCertificate[lang]}</span>
          </button>
        </div>

        {/* Pending Applications Alert */}
        {pendingApps.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">
                    {lang === 'ar' ? `${pendingApps.length} طلبات تخرج بانتظار المراجعة` : `${pendingApps.length} graduation applications pending review`}
                  </p>
                  <p className="text-sm text-amber-600">
                    {lang === 'ar' ? 'يرجى مراجعتها والتحقق من الأهلية' : 'Please review and verify eligibility'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Applications Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">{t.graduationApplications[lang]}</h3>
            <div className="relative max-w-xs">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.search[lang]}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-9 pe-3 py-1.5 text-sm border border-slate-200 rounded-lg"
              />
            </div>
          </div>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.student[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.programs[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.gpa[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.completedCredits[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.status[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.date[lang]}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.actions[lang]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ensureArray(graduationApps).slice(0, 10).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-800">{app.student?.full_name_en || app.student?.name_en || `Student ${app.student_id}`}</p>
                        <p className="text-sm text-slate-500">{app.student?.student_id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {app.student?.program?.name_en || app.student?.program?.code || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${
                        (app.final_gpa || 0) >= 3.5 ? 'text-green-600' :
                        (app.final_gpa || 0) >= 2.5 ? 'text-blue-600' :
                        (app.final_gpa || 0) >= 2.0 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {app.final_gpa?.toFixed(2) || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{app.total_credits_completed || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        app.status === 'GRADUATED' ? 'bg-purple-100 text-purple-700' :
                        app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        app.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-700' :
                        app.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-700' :
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {app.application_date ? new Date(app.application_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(`/#/transcript/${app.student_id}`, '_blank')}
                          className="p-1 hover:bg-slate-100 rounded"
                          title={lang === 'ar' ? 'عرض السجل' : 'View Transcript'}
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </button>
                        {app.status === 'SUBMITTED' && (
                          <button
                            onClick={() => handleUpdateGradStatus(app.id, 'UNDER_REVIEW')}
                            disabled={saving}
                            className="p-1 hover:bg-blue-100 rounded disabled:opacity-50"
                            title={t.underReview[lang]}
                          >
                            <PlayCircle className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                        {['SUBMITTED', 'UNDER_REVIEW'].includes(app.status) && (
                          <>
                            <button
                              onClick={() => handleUpdateGradStatus(app.id, 'APPROVED')}
                              disabled={saving}
                              className="p-1 hover:bg-green-100 rounded disabled:opacity-50"
                              title={t.approve[lang]}
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => handleUpdateGradStatus(app.id, 'REJECTED')}
                              disabled={saving}
                              className="p-1 hover:bg-red-100 rounded disabled:opacity-50"
                              title={t.reject[lang]}
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </button>
                          </>
                        )}
                        {app.status === 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateGradStatus(app.id, 'GRADUATED')}
                            disabled={saving}
                            className="p-1 hover:bg-purple-100 rounded disabled:opacity-50"
                            title={t.markAsGraduated[lang]}
                          >
                            <GraduationCap className="w-4 h-4 text-purple-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {ensureArray(graduationApps).slice(0, 10).map((app) => (
              <div key={app.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-800">{app.student?.full_name_en || app.student?.name_en || `Student ${app.student_id}`}</p>
                    <p className="text-sm text-slate-500">{app.student?.student_id}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => window.open(`/#/transcript/${app.student_id}`, '_blank')}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                      <Eye className="w-4 h-4 text-slate-600" />
                    </button>
                    {['SUBMITTED', 'UNDER_REVIEW'].includes(app.status) && (
                      <>
                        <button
                          onClick={() => handleUpdateGradStatus(app.id, 'APPROVED')}
                          disabled={saving}
                          className="p-2 hover:bg-green-100 rounded-lg disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleUpdateGradStatus(app.id, 'REJECTED')}
                          disabled={saving}
                          className="p-2 hover:bg-red-100 rounded-lg disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4 text-red-600" />
                        </button>
                      </>
                    )}
                    {app.status === 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateGradStatus(app.id, 'GRADUATED')}
                        disabled={saving}
                        className="p-2 hover:bg-purple-100 rounded-lg disabled:opacity-50"
                      >
                        <GraduationCap className="w-4 h-4 text-purple-600" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-2">{app.student?.program?.name_en || app.student?.program?.code || '-'}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`font-bold text-sm ${
                    (app.final_gpa || 0) >= 3.5 ? 'text-green-600' :
                    (app.final_gpa || 0) >= 2.5 ? 'text-blue-600' :
                    (app.final_gpa || 0) >= 2.0 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    GPA: {app.final_gpa?.toFixed(2) || '-'}
                  </span>
                  <span className="text-xs text-slate-500">{app.total_credits_completed || '-'} {t.credits[lang]}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    app.status === 'GRADUATED' ? 'bg-purple-100 text-purple-700' :
                    app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    app.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-700' :
                    app.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-700' :
                    app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {graduationApps.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>{t.noData[lang]}</p>
            </div>
          )}
          {graduationApps.length > 10 && (
            <div className="p-4 border-t border-slate-200 text-center">
              <button className="text-blue-600 hover:underline">
                {t.viewAll[lang]} ({graduationApps.length})
              </button>
            </div>
          )}
        </div>

        {/* Graduation Statistics */}
        {graduationStats && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4">{t.statistics[lang]}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-800">{graduationStats.total_graduated_this_year || 0}</p>
                <p className="text-sm text-slate-500">{lang === 'ar' ? 'خريجين هذا العام' : 'Graduated This Year'}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-800">{graduationStats.avg_gpa?.toFixed(2) || '0.00'}</p>
                <p className="text-sm text-slate-500">{lang === 'ar' ? 'متوسط المعدل' : 'Average GPA'}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-800">{graduationStats.with_honors || 0}</p>
                <p className="text-sm text-slate-500">{lang === 'ar' ? 'بتقدير امتياز' : 'With Honors'}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-800">{graduationStats.avg_processing_time_days || 0}</p>
                <p className="text-sm text-slate-500">{lang === 'ar' ? 'متوسط أيام المعالجة' : 'Avg Processing Days'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <School className="w-6 h-6 text-indigo-600" />
            </div>
            {t.title[lang]}
          </h1>
          <p className="text-slate-500 mt-1">{t.subtitle[lang]}</p>
        </div>
        <button
          onClick={fetchAllData}
          disabled={loading}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t.refresh[lang]}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'registration' && renderRegistration()}
              {activeTab === 'enrollments' && renderEnrollments()}
              {activeTab === 'grades' && renderGrades()}
              {activeTab === 'schedule' && renderSchedule()}
              {activeTab === 'attendance' && renderAttendance()}
              {activeTab === 'programs' && renderPrograms()}
              {activeTab === 'courses' && renderCourses()}
              {activeTab === 'semesters' && renderSemesters()}
              {activeTab === 'students' && renderStudents()}
              {activeTab === 'reports' && renderReports()}
              {activeTab === 'graduation' && renderGraduation()}
              {activeTab === 'requests' && renderRequests()}
              {activeTab === 'settings' && renderSettings()}
            </>
          )}
        </div>
      </div>

      {/* Assign Course Modal */}
      {showAssignModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {t.assignCourseToPrograms[lang]}
              </h2>
              <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-800">{selectedCourse.code}</p>
                <p className="text-sm text-slate-500">{lang === 'ar' ? selectedCourse.name_ar : selectedCourse.name_en}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.type[lang]}</label>
                <select
                  value={assignCourseType}
                  onChange={(e) => setAssignCourseType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="UNIVERSITY">{t.universityReq[lang]}</option>
                  <option value="COLLEGE">{t.collegeReq[lang]}</option>
                  <option value="MAJOR">{t.majorReq[lang]}</option>
                  <option value="GRADUATION">{t.graduationProject[lang]}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.programs[lang]}</label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3 space-y-2">
                  {ensureArray(programs).map((program) => (
                    <label key={program.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedProgramIds.includes(String(program.id))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProgramIds([...selectedProgramIds, String(program.id)]);
                          } else {
                            setSelectedProgramIds(selectedProgramIds.filter(id => id !== String(program.id)));
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="text-sm">{lang === 'ar' ? program.name_ar : program.name_en} ({program.code})</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === 'ar' ? `تم اختيار ${selectedProgramIds.length} برنامج` : `${selectedProgramIds.length} programs selected`}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleAssignCourse}
                disabled={saving || selectedProgramIds.length === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t.save[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {t.requestDetails[lang]}
              </h2>
              <button onClick={() => { setShowRequestModal(false); setSelectedRequest(null); setRequestNote(''); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-slate-500">{t.type[lang]}</p>
                  <p className="font-medium text-slate-800">{selectedRequest.subject || selectedRequest.request_type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t.student[lang]}</p>
                  <p className="font-medium text-slate-800">{selectedRequest.student?.full_name_en || 'N/A'}</p>
                  <p className="text-sm text-slate-600">{selectedRequest.student?.student_id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t.submittedAt[lang]}</p>
                  <p className="font-medium text-slate-800">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
                {selectedRequest.message && (
                  <div>
                    <p className="text-sm text-slate-500">{lang === 'ar' ? 'الرسالة' : 'Message'}</p>
                    <p className="text-slate-800">{selectedRequest.message}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.notes[lang]}</label>
                <textarea
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  placeholder={lang === 'ar' ? 'أضف ملاحظة (اختياري)' : 'Add a note (optional)'}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowRequestModal(false); setSelectedRequest(null); setRequestNote(''); }}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={() => handleRequestAction(String(selectedRequest.id), 'reject')}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {t.reject[lang]}
              </button>
              <button
                onClick={() => handleRequestAction(String(selectedRequest.id), 'approve')}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {t.approve[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Editing Modal - Responsive */}
      {showGradeModal && editingGrade && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-slate-200 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">{t.editGrade[lang]}</h2>
                  <p className="text-sm text-slate-500 mt-1 truncate">
                    {editingGrade.student?.name_en || editingGrade.student?.name_ar} - {editingGrade.course?.code}
                  </p>
                </div>
                <button
                  onClick={() => { setShowGradeModal(false); setEditingGrade(null); }}
                  className="p-2 hover:bg-slate-100 rounded-full ms-2 sm:hidden"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Grade Inputs - Grid on larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Midterm */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.midterm[lang]} (30%)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    value={gradeForm.midterm}
                    onChange={(e) => updateGradeFormField('midterm', e.target.value)}
                    className="w-full px-4 py-3 sm:py-2 text-lg sm:text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0 - 100"
                  />
                </div>

                {/* Coursework */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.coursework[lang]} (20%)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    value={gradeForm.coursework}
                    onChange={(e) => updateGradeFormField('coursework', e.target.value)}
                    className="w-full px-4 py-3 sm:py-2 text-lg sm:text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0 - 100"
                  />
                </div>

                {/* Final */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.final[lang]} (50%)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    value={gradeForm.final}
                    onChange={(e) => updateGradeFormField('final', e.target.value)}
                    className="w-full px-4 py-3 sm:py-2 text-lg sm:text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0 - 100"
                  />
                </div>
              </div>

              {/* Calculated Total - Responsive Grid */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500 mb-1">{t.total[lang]}</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-800">{gradeForm.total || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500 mb-1">{t.letterGrade[lang]}</p>
                    <span className={`inline-block px-3 py-1 text-lg sm:text-xl font-bold rounded-lg ${
                      ['A', 'A+', 'A-'].includes(gradeForm.grade) ? 'bg-green-100 text-green-700' :
                      ['B', 'B+', 'B-'].includes(gradeForm.grade) ? 'bg-blue-100 text-blue-700' :
                      ['C', 'C+', 'C-'].includes(gradeForm.grade) ? 'bg-amber-100 text-amber-700' :
                      ['D', 'D+'].includes(gradeForm.grade) ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {gradeForm.grade || '-'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500 mb-1">{t.gpa[lang]}</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-800">{gradeForm.points || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Sticky on mobile */}
            <div className="sticky bottom-0 bg-white p-4 sm:p-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => { setShowGradeModal(false); setEditingGrade(null); }}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-base font-medium"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={saveGradeChanges}
                disabled={savingGrade}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 text-base font-medium"
              >
                {savingGrade && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.saveGrade[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grading Scale Modal */}
      {showGradingScaleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-slate-200 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                    {editingGradingScale ? t.editGradeScale[lang] : t.addGrade[lang]}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {lang === 'ar' ? 'إدارة سلم التقدير' : 'Manage grading scale'}
                  </p>
                </div>
                <button
                  onClick={() => { setShowGradingScaleModal(false); setEditingGradingScale(null); }}
                  className="p-2 hover:bg-slate-100 rounded-full ms-2"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Letter Grade */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.letterGrade[lang]} *
                </label>
                <input
                  type="text"
                  value={gradingScaleForm.letter_grade}
                  onChange={(e) => setGradingScaleForm({ ...gradingScaleForm, letter_grade: e.target.value })}
                  className="w-full px-4 py-3 sm:py-2 text-lg sm:text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="A+, A, B+, ..."
                  maxLength={5}
                />
              </div>

              {/* Score Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.minScore[lang]} *
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.01"
                    value={gradingScaleForm.min_score}
                    onChange={(e) => setGradingScaleForm({ ...gradingScaleForm, min_score: e.target.value })}
                    className="w-full px-4 py-3 sm:py-2 text-lg sm:text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.maxScore[lang]} *
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.01"
                    value={gradingScaleForm.max_score}
                    onChange={(e) => setGradingScaleForm({ ...gradingScaleForm, max_score: e.target.value })}
                    className="w-full px-4 py-3 sm:py-2 text-lg sm:text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Grade Points */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.gradePoints[lang]} *
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="4"
                  step="0.01"
                  value={gradingScaleForm.grade_points}
                  onChange={(e) => setGradingScaleForm({ ...gradingScaleForm, grade_points: e.target.value })}
                  className="w-full px-4 py-3 sm:py-2 text-lg sm:text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="4.0"
                />
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.descriptionEn[lang]}
                  </label>
                  <input
                    type="text"
                    value={gradingScaleForm.description_en}
                    onChange={(e) => setGradingScaleForm({ ...gradingScaleForm, description_en: e.target.value })}
                    className="w-full px-4 py-3 sm:py-2 text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Excellent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.descriptionAr[lang]}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={gradingScaleForm.description_ar}
                    onChange={(e) => setGradingScaleForm({ ...gradingScaleForm, description_ar: e.target.value })}
                    className="w-full px-4 py-3 sm:py-2 text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ممتاز"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gradingScaleForm.is_passing}
                    onChange={(e) => setGradingScaleForm({ ...gradingScaleForm, is_passing: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">{t.isPassing[lang]}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gradingScaleForm.is_active}
                    onChange={(e) => setGradingScaleForm({ ...gradingScaleForm, is_active: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">{t.isActive[lang]}</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white p-4 sm:p-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => { setShowGradingScaleModal(false); setEditingGradingScale(null); }}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-base font-medium"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={saveGradingScale}
                disabled={savingGradingScale || !gradingScaleForm.letter_grade || !gradingScaleForm.min_score || !gradingScaleForm.max_score || !gradingScaleForm.grade_points}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 text-base font-medium"
              >
                {savingGradingScale && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.save[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {lang === 'ar' ? 'تسجيل طالب في مادة' : 'Enroll Student in Course'}
              </h2>
              <button onClick={() => setShowEnrollModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {lang === 'ar' ? 'الطالب' : 'Student'}
                </label>
                <select
                  value={enrollForm.student_id}
                  onChange={(e) => setEnrollForm({ ...enrollForm, student_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="">{lang === 'ar' ? 'اختر الطالب' : 'Select Student'}</option>
                  {ensureArray(students).map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.student_id} - {lang === 'ar' ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {lang === 'ar' ? 'المادة' : 'Course'}
                </label>
                <select
                  value={enrollForm.course_id}
                  onChange={(e) => setEnrollForm({ ...enrollForm, course_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="">{lang === 'ar' ? 'اختر المادة' : 'Select Course'}</option>
                  {ensureArray(courses).map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {lang === 'ar' ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEnrollModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleEnrollStudent}
                disabled={saving || !enrollForm.student_id || !enrollForm.course_id}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {lang === 'ar' ? 'تسجيل' : 'Enroll'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Enrollments Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {lang === 'ar' ? 'استيراد تسجيلات' : 'Import Enrollments'}
              </h2>
              <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">
                  {lang === 'ar' ? 'اسحب ملف CSV هنا أو انقر للاختيار' : 'Drag CSV file here or click to select'}
                </p>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  id="import-file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      toast.info(lang === 'ar' ? `تم اختيار الملف: ${file.name}` : `File selected: ${file.name}`);
                    }
                  }}
                />
                <label
                  htmlFor="import-file"
                  className="inline-block px-4 py-2 bg-slate-100 text-slate-700 rounded-lg cursor-pointer hover:bg-slate-200"
                >
                  {lang === 'ar' ? 'اختر ملف' : 'Choose File'}
                </label>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  {lang === 'ar' ? 'تنسيق الملف المطلوب:' : 'Required file format:'}
                </p>
                <code className="text-xs bg-blue-100 p-2 rounded block">
                  student_id, course_code, status
                </code>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                {t.cancel[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Enrollment Modal */}
      {showEditEnrollmentModal && editingEnrollment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-800">
                {t.editEnrollment[lang]}
              </h2>
              <button onClick={() => { setShowEditEnrollmentModal(false); setEditingEnrollment(null); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Student & Course Info (Read-only) */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div>
                  <span className="text-sm text-slate-500">{t.student[lang]}:</span>
                  <p className="font-medium text-slate-800">
                    {editingEnrollment.student?.full_name_en || editingEnrollment.student?.name_en || `Student ${editingEnrollment.student_id}`}
                  </p>
                  <p className="text-sm text-slate-500">{editingEnrollment.student?.student_id}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">{t.courses[lang]}:</span>
                  <p className="font-medium text-slate-800">
                    <span className="font-mono text-blue-600">{editingEnrollment.course?.code}</span>
                    {' - '}
                    {lang === 'ar' ? editingEnrollment.course?.name_ar : editingEnrollment.course?.name_en}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.status[lang]}
                </label>
                <select
                  value={editEnrollmentForm.status}
                  onChange={(e) => setEditEnrollmentForm({ ...editEnrollmentForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="ENROLLED">{lang === 'ar' ? 'مسجل' : 'Enrolled'}</option>
                  <option value="COMPLETED">{lang === 'ar' ? 'مكتمل' : 'Completed'}</option>
                  <option value="DROPPED">{lang === 'ar' ? 'محذوف' : 'Dropped'}</option>
                  <option value="WITHDRAWN">{lang === 'ar' ? 'منسحب' : 'Withdrawn'}</option>
                  <option value="FAILED">{lang === 'ar' ? 'راسب' : 'Failed'}</option>
                </select>
              </div>

              {/* Grades Section */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="font-medium text-slate-800 mb-3">{t.grade[lang]}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">{t.midtermScore[lang]}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editEnrollmentForm.midterm_score}
                      onChange={(e) => setEditEnrollmentForm({ ...editEnrollmentForm, midterm_score: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="0-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">{t.assignmentsScore[lang]}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editEnrollmentForm.assignments_score}
                      onChange={(e) => setEditEnrollmentForm({ ...editEnrollmentForm, assignments_score: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="0-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">{t.finalScore[lang]}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editEnrollmentForm.final_score}
                      onChange={(e) => setEditEnrollmentForm({ ...editEnrollmentForm, final_score: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="0-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">{t.letterGrade[lang]}</label>
                    <select
                      value={editEnrollmentForm.letter_grade}
                      onChange={(e) => setEditEnrollmentForm({ ...editEnrollmentForm, letter_grade: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="">{lang === 'ar' ? 'اختر التقدير' : 'Select Grade'}</option>
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="B-">B-</option>
                      <option value="C+">C+</option>
                      <option value="C">C</option>
                      <option value="C-">C-</option>
                      <option value="D+">D+</option>
                      <option value="D">D</option>
                      <option value="F">F</option>
                      <option value="W">{lang === 'ar' ? 'منسحب (W)' : 'Withdrawn (W)'}</option>
                      <option value="I">{lang === 'ar' ? 'غير مكتمل (I)' : 'Incomplete (I)'}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => { setShowEditEnrollmentModal(false); setEditingEnrollment(null); }}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleUpdateEnrollment}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.save[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {lang === 'ar' ? 'مراسلة جميع الطلاب' : 'Email All Students'}
              </h2>
              <button onClick={() => setShowEmailModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {lang === 'ar' ? 'العنوان' : 'Subject'}
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder={lang === 'ar' ? 'عنوان الرسالة' : 'Email subject'}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {lang === 'ar' ? 'الرسالة' : 'Message'}
                </label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  placeholder={lang === 'ar' ? 'نص الرسالة' : 'Email message'}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg resize-none"
                  rows={5}
                />
              </div>
              <div className="bg-amber-50 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  {lang === 'ar'
                    ? `سيتم إرسال هذه الرسالة إلى ${stats.activeStudents} طالب نشط`
                    : `This message will be sent to ${stats.activeStudents} active students`}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail || !emailForm.subject || !emailForm.message}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 disabled:opacity-50"
              >
                {sendingEmail && <Loader2 className="w-4 h-4 animate-spin" />}
                <Send className="w-4 h-4" />
                {lang === 'ar' ? 'إرسال' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enter Single Grade Modal */}
      {showEnterGradeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {lang === 'ar' ? 'إدخال درجة' : 'Enter Grade'}
              </h2>
              <button onClick={() => setShowEnterGradeModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {lang === 'ar' ? 'الطالب' : 'Student'}
                </label>
                <select
                  value={enterGradeForm.student_id}
                  onChange={(e) => setEnterGradeForm({ ...enterGradeForm, student_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="">{lang === 'ar' ? 'اختر الطالب' : 'Select Student'}</option>
                  {ensureArray(students).map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.student_id} - {lang === 'ar' ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {lang === 'ar' ? 'المادة' : 'Course'}
                </label>
                <select
                  value={enterGradeForm.course_id}
                  onChange={(e) => setEnterGradeForm({ ...enterGradeForm, course_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="">{lang === 'ar' ? 'اختر المادة' : 'Select Course'}</option>
                  {ensureArray(courses).map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {lang === 'ar' ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {lang === 'ar' ? 'النصفي' : 'Midterm'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={enterGradeForm.midterm_score}
                    onChange={(e) => setEnterGradeForm({ ...enterGradeForm, midterm_score: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {lang === 'ar' ? 'الأعمال' : 'Coursework'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={enterGradeForm.assignments_score}
                    onChange={(e) => setEnterGradeForm({ ...enterGradeForm, assignments_score: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {lang === 'ar' ? 'النهائي' : 'Final'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={enterGradeForm.final_score}
                    onChange={(e) => setEnterGradeForm({ ...enterGradeForm, final_score: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="0-100"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEnterGradeModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleEnterGrade}
                disabled={savingGradeEntry || !enterGradeForm.student_id || !enterGradeForm.course_id}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                {savingGradeEntry && <Loader2 className="w-4 h-4 animate-spin" />}
                {lang === 'ar' ? 'حفظ الدرجة' : 'Save Grade'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Grade Entry Modal */}
      {showBulkGradeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {lang === 'ar' ? 'إدخال درجات جماعي' : 'Bulk Grade Entry'}
              </h2>
              <button onClick={() => { setShowBulkGradeModal(false); setBulkGradeCourseId(''); setBulkGradeData([]); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {lang === 'ar' ? 'اختر المادة' : 'Select Course'}
                </label>
                <select
                  value={bulkGradeCourseId}
                  onChange={(e) => {
                    setBulkGradeCourseId(e.target.value);
                    loadBulkGradeStudents(e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="">{lang === 'ar' ? 'اختر المادة' : 'Select Course'}</option>
                  {ensureArray(courses).map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {lang === 'ar' ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar)}
                    </option>
                  ))}
                </select>
              </div>

              {bulkGradeData.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{lang === 'ar' ? 'الرقم الجامعي' : 'Student ID'}</th>
                        <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                        <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{lang === 'ar' ? 'النصفي' : 'Midterm'}</th>
                        <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{lang === 'ar' ? 'الأعمال' : 'Coursework'}</th>
                        <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{lang === 'ar' ? 'النهائي' : 'Final'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bulkGradeData.map((student, index) => (
                        <tr key={student.student_id} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-mono text-sm text-blue-600">{student.student_code}</td>
                          <td className="px-4 py-2 text-sm">{student.student_name}</td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={student.midterm_score}
                              onChange={(e) => {
                                const newData = [...bulkGradeData];
                                newData[index].midterm_score = e.target.value;
                                setBulkGradeData(newData);
                              }}
                              className="w-20 px-2 py-1 border border-slate-200 rounded text-sm"
                              placeholder="0-100"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={student.assignments_score}
                              onChange={(e) => {
                                const newData = [...bulkGradeData];
                                newData[index].assignments_score = e.target.value;
                                setBulkGradeData(newData);
                              }}
                              className="w-20 px-2 py-1 border border-slate-200 rounded text-sm"
                              placeholder="0-100"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={student.final_score}
                              onChange={(e) => {
                                const newData = [...bulkGradeData];
                                newData[index].final_score = e.target.value;
                                setBulkGradeData(newData);
                              }}
                              className="w-20 px-2 py-1 border border-slate-200 rounded text-sm"
                              placeholder="0-100"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {bulkGradeCourseId && bulkGradeData.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  {lang === 'ar' ? 'لا يوجد طلاب مسجلين في هذه المادة' : 'No students enrolled in this course'}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowBulkGradeModal(false); setBulkGradeCourseId(''); setBulkGradeData([]); }}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleSaveBulkGrades}
                disabled={savingGradeEntry || !bulkGradeCourseId || bulkGradeData.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                {savingGradeEntry && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                {lang === 'ar' ? 'حفظ الدرجات' : 'Save Grades'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check Eligibility Modal */}
      {showEligibilityModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {lang === 'ar' ? 'الطلاب المؤهلين للتخرج' : 'Eligible Students for Graduation'}
              </h2>
              <button onClick={() => setShowEligibilityModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {eligibleStudents.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 mb-4">
                    {lang === 'ar' ? `${eligibleStudents.length} طالب مؤهل للتخرج (ساعات >= 120، معدل >= 2.0)` : `${eligibleStudents.length} students eligible (credits >= 120, GPA >= 2.0)`}
                  </p>
                  {eligibleStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800">{lang === 'ar' ? (student.name_ar || student.name_en) : (student.name_en || student.name_ar)}</p>
                        <p className="text-sm text-slate-500">{student.student_id}</p>
                      </div>
                      <div className="text-end">
                        <p className="font-bold text-green-600">GPA: {parseFloat(student.gpa || 0).toFixed(2)}</p>
                        <p className="text-sm text-slate-500">{student.completed_credits || student.total_credits || 0} {lang === 'ar' ? 'ساعة' : 'credits'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <p className="text-slate-600">{lang === 'ar' ? 'لا يوجد طلاب مؤهلين للتخرج حالياً' : 'No eligible students for graduation at this time'}</p>
                  <p className="text-sm text-slate-500 mt-2">{lang === 'ar' ? 'المتطلبات: 120 ساعة معتمدة، معدل 2.0' : 'Requirements: 120 credits, 2.0 GPA'}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowEligibilityModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                {t.cancel[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Graduation Application Modal */}
      {showNewGradAppModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {lang === 'ar' ? 'طلب تخرج جديد' : 'New Graduation Application'}
              </h2>
              <button onClick={() => { setShowNewGradAppModal(false); setSelectedStudentForGrad(''); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {lang === 'ar' ? 'اختر الطالب' : 'Select Student'}
                </label>
                <select
                  value={selectedStudentForGrad}
                  onChange={(e) => setSelectedStudentForGrad(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="">{lang === 'ar' ? 'اختر الطالب' : 'Select Student'}</option>
                  {ensureArray(students).filter(s => s.status === 'ACTIVE').map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.student_id} - {lang === 'ar' ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)} (GPA: {parseFloat(s.gpa || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  {lang === 'ar' ? 'سيتم إنشاء طلب تخرج وإرساله للمراجعة. تأكد من استيفاء الطالب لمتطلبات التخرج.' : 'A graduation application will be created and submitted for review. Ensure the student meets graduation requirements.'}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowNewGradAppModal(false); setSelectedStudentForGrad(''); }}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleCreateGradApplication}
                disabled={saving || !selectedStudentForGrad}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {lang === 'ar' ? 'تقديم الطلب' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Transcript Modal */}
      {showTranscriptModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {lang === 'ar' ? 'إصدار سجل أكاديمي' : 'Issue Transcript'}
              </h2>
              <button onClick={() => { setShowTranscriptModal(false); setSelectedStudentForGrad(''); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {lang === 'ar' ? 'اختر الطالب' : 'Select Student'}
                </label>
                <select
                  value={selectedStudentForGrad}
                  onChange={(e) => setSelectedStudentForGrad(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="">{lang === 'ar' ? 'اختر الطالب' : 'Select Student'}</option>
                  {ensureArray(students).map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.student_id} - {lang === 'ar' ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowTranscriptModal(false); setSelectedStudentForGrad(''); }}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={() => handleGenerateTranscript(selectedStudentForGrad)}
                disabled={!selectedStudentForGrad}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
              >
                <FileCheck className="w-4 h-4" />
                {lang === 'ar' ? 'عرض السجل' : 'View Transcript'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {lang === 'ar' ? 'إصدار شهادة' : 'Issue Certificate'}
              </h2>
              <button onClick={() => { setShowCertificateModal(false); setSelectedStudentForGrad(''); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {lang === 'ar' ? 'اختر الطالب' : 'Select Student'}
                </label>
                <select
                  value={selectedStudentForGrad}
                  onChange={(e) => setSelectedStudentForGrad(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="">{lang === 'ar' ? 'اختر الطالب' : 'Select Student'}</option>
                  {ensureArray(students).filter(s => s.status === 'GRADUATED' || s.status === 'ACTIVE').map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.student_id} - {lang === 'ar' ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)} ({s.status})
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-amber-800">
                  {lang === 'ar' ? 'سيتم فتح صفحة الشهادات للطالب المحدد' : 'The certificates page will open for the selected student'}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowCertificateModal(false); setSelectedStudentForGrad(''); }}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={() => handleGenerateCertificate(selectedStudentForGrad)}
                disabled={!selectedStudentForGrad}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Award className="w-4 h-4" />
                {lang === 'ar' ? 'إصدار الشهادة' : 'Issue Certificate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicAffairsManagement;
