import React, { useState, useEffect } from 'react';
import { Course, EnrolledStudent } from '../types';
import { useToast } from '../hooks/useToast';
import { TRANSLATIONS } from '../constants';
import { exportToCSV } from '../utils/exportUtils';
import {
  Users,
  Calendar,
  Save,
  RefreshCw,
  ChevronLeft,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  Eye,
  Edit3,
  Trash2,
  Plus,
  X,
  Check,
  ChevronDown,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

interface LecturerProps {
  lang: 'en' | 'ar';
}

interface AttendanceSession {
  id: string;
  date: string;
  time: string;
  topic?: string;
  status: 'draft' | 'saved';
}

interface StudentAttendance {
  studentId: string;
  enrollmentId: string;
  name: string;
  status: 'present' | 'absent' | 'late' | 'excused' | null;
}

const t = {
  ...TRANSLATIONS,
  overview: { en: 'Overview', ar: 'نظرة عامة' },
  gradeManagement: { en: 'Grade Management', ar: 'إدارة الدرجات' },
  attendanceTracking: { en: 'Attendance Tracking', ar: 'تتبع الحضور' },
  assignments: { en: 'Assignments', ar: 'الواجبات' },
  announcements: { en: 'Announcements', ar: 'الإعلانات' },
  courseStats: { en: 'Course Statistics', ar: 'إحصائيات المقرر' },
  avgGrade: { en: 'Average Grade', ar: 'متوسط الدرجات' },
  passRate: { en: 'Pass Rate', ar: 'نسبة النجاح' },
  avgAttendance: { en: 'Avg. Attendance', ar: 'متوسط الحضور' },
  pendingGrades: { en: 'Pending Grades', ar: 'درجات معلقة' },
  gradeDistribution: { en: 'Grade Distribution', ar: 'توزيع الدرجات' },
  attendanceTrend: { en: 'Attendance Trend', ar: 'اتجاه الحضور' },
  searchStudents: { en: 'Search students...', ar: 'بحث عن طلاب...' },
  exportGrades: { en: 'Export Grades', ar: 'تصدير الدرجات' },
  importGrades: { en: 'Import Grades', ar: 'استيراد الدرجات' },
  bulkEdit: { en: 'Bulk Edit', ar: 'تعديل جماعي' },
  sendNotification: { en: 'Send Notification', ar: 'إرسال إشعار' },
  atRisk: { en: 'At Risk', ar: 'معرض للخطر' },
  excellent: { en: 'Excellent', ar: 'ممتاز' },
  good: { en: 'Good', ar: 'جيد' },
  needsImprovement: { en: 'Needs Improvement', ar: 'يحتاج تحسين' },
  actions: { en: 'Actions', ar: 'إجراءات' },
  courseDescription: { en: 'Course Description', ar: 'وصف المقرر' },
  classSchedule: { en: 'Class Schedule', ar: 'جدول الحصص' },
  officeHours: { en: 'Office Hours', ar: 'ساعات مكتبية' },
  sendEmail: { en: 'Send Email', ar: 'إرسال بريد' },
  markAttendance: { en: 'Mark Attendance', ar: 'تسجيل الحضور' },
  viewProfile: { en: 'View Profile', ar: 'عرض الملف' },
  addAssignment: { en: 'Add Assignment', ar: 'إضافة واجب' },
  publishGrades: { en: 'Publish Grades', ar: 'نشر الدرجات' },
  draftSaved: { en: 'Draft Saved', ar: 'تم حفظ المسودة' },
  published: { en: 'Published', ar: 'منشور' },
  draft: { en: 'Draft', ar: 'مسودة' },
  letterGrade: { en: 'Letter Grade', ar: 'التقدير' },
  participation: { en: 'Participation', ar: 'المشاركة' },
  quizzes: { en: 'Quizzes', ar: 'اختبارات قصيرة' },
  noStudentsFound: { en: 'No students found', ar: 'لم يتم العثور على طلاب' },
  totalStudents: { en: 'Total Students', ar: 'إجمالي الطلاب' },
  activeAssignments: { en: 'Active Assignments', ar: 'واجبات نشطة' },
  upcomingExams: { en: 'Upcoming Exams', ar: 'اختبارات قادمة' },
  lecturer: { en: 'Lecturer', ar: 'المحاضر' },
  lecturerCourses: { en: 'My Courses', ar: 'مقرراتي' },
  enrolledCount: { en: 'Enrolled', ar: 'مسجلين' },
  cr: { en: 'Credits', ar: 'الساعات' },
  manageGrades: { en: 'Manage Grades', ar: 'إدارة الدرجات' },
  syncMoodle: { en: 'Sync with Moodle', ar: 'مزامنة مع Moodle' },
  saveChanges: { en: 'Save Changes', ar: 'حفظ التغييرات' },
  all: { en: 'All', ar: 'الكل' },
  studentName: { en: 'Student Name', ar: 'اسم الطالب' },
  grade: { en: 'Grade', ar: 'الدرجة' },
  attendance: { en: 'Attendance', ar: 'الحضور' },
  printReport: { en: 'Print Report', ar: 'طباعة التقرير' },
  studentId: { en: 'Student ID', ar: 'رقم الطالب' },
  attendancePct: { en: 'Attendance %', ar: 'نسبة الحضور' },
  midterm: { en: 'Midterm', ar: 'منتصف الفصل' },
  final: { en: 'Final', ar: 'النهائي' },
  total: { en: 'Total', ar: 'المجموع' },
  status: { en: 'Status', ar: 'الحالة' },
  present: { en: 'Present', ar: 'حاضر' },
  absent: { en: 'Absent', ar: 'غائب' },
  statusCompleted: { en: 'Completed', ar: 'مكتمل' },
  statusInProgress: { en: 'In Progress', ar: 'قيد التنفيذ' },
  viewDetails: { en: 'View Details', ar: 'عرض التفاصيل' },
  selectDate: { en: 'Select Date', ar: 'اختر التاريخ' },
  sessionTopic: { en: 'Session Topic', ar: 'موضوع المحاضرة' },
  lectureNumber: { en: 'Lecture', ar: 'المحاضرة' },
  late: { en: 'Late', ar: 'متأخر' },
  excused: { en: 'Excused', ar: 'معذور' },
  saveAttendance: { en: 'Save Attendance', ar: 'حفظ الحضور' },
  attendanceSaved: { en: 'Attendance Saved Successfully', ar: 'تم حفظ الحضور بنجاح' },
  selectAll: { en: 'Select All', ar: 'تحديد الكل' },
  markAllPresent: { en: 'Mark All Present', ar: 'تسجيل الكل حاضر' },
  markAllAbsent: { en: 'Mark All Absent', ar: 'تسجيل الكل غائب' },
  noSessionSelected: { en: 'Select a date to mark attendance', ar: 'اختر تاريخاً لتسجيل الحضور' },
  attendanceHistory: { en: 'Attendance History', ar: 'سجل الحضور' },
  newSession: { en: 'New Session', ar: 'جلسة جديدة' },
  loadingStudents: { en: 'Loading students...', ar: 'جاري تحميل الطلاب...' },
  noStudentsEnrolled: { en: 'No students enrolled in this course', ar: 'لا يوجد طلاب مسجلين في هذا المقرر' },
  previousSessions: { en: 'Previous Sessions', ar: 'الجلسات السابقة' },
  todaySession: { en: "Today's Session", ar: 'جلسة اليوم' },
  viewSession: { en: 'View Session', ar: 'عرض الجلسة' },
  editSession: { en: 'Edit Session', ar: 'تعديل الجلسة' },
};

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#ef4444'];

const Lecturer: React.FC<LecturerProps> = ({ lang }) => {
  const toast = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'attendance' | 'assignments'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'grade' | 'attendance'>('name');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Attendance management state
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionTopic, setSessionTopic] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState<StudentAttendance[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [showAttendanceSaved, setShowAttendanceSaved] = useState(false);

  const isRTL = lang === 'ar';

  // Fetch lecturer courses from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { coursesAPI } = await import('../api/courses');
        const response = await coursesAPI.getAll();
        const allCourses = response.data || response || [];
        setCourses(allCourses);
      } catch (error) {
        console.error('Error fetching lecturer data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter courses for this lecturer (could be filtered by API later)
  const myCourses = courses;

  // Fetch enrolled students when a course is selected and attendance tab is active
  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      if (!selectedCourse || activeTab !== 'attendance') return;

      try {
        setLoadingAttendance(true);
        const { coursesAPI } = await import('../api/courses');
        const response = await coursesAPI.getEnrollments(selectedCourse.id);
        const enrollments = response.data || response || [];

        // Transform enrollments to StudentAttendance format
        const studentList: StudentAttendance[] = enrollments.map((enrollment: any) => ({
          studentId: enrollment.student?.student_id || enrollment.student_id || '',
          enrollmentId: enrollment.id?.toString() || '',
          name: enrollment.student?.name_ar || enrollment.student?.name_en || enrollment.student?.name || enrollment.studentName || '',
          status: null,
        }));

        setEnrolledStudents(studentList);
      } catch (error) {
        console.error('Error fetching enrolled students:', error);
        setEnrolledStudents([]);
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchEnrolledStudents();
  }, [selectedCourse, activeTab]);

  // Function to update individual student attendance
  const updateStudentAttendance = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setEnrolledStudents(prev =>
      prev.map(s => s.studentId === studentId ? { ...s, status } : s)
    );
  };

  // Function to mark all students with same status
  const markAllStudents = (status: 'present' | 'absent' | 'late' | 'excused') => {
    setEnrolledStudents(prev =>
      prev.map(s => ({ ...s, status }))
    );
  };

  // Function to save attendance to backend
  const saveAttendance = async () => {
    if (!selectedCourse || enrolledStudents.length === 0) return;

    // Check if all students have a status
    const unmarkedStudents = enrolledStudents.filter(s => s.status === null);
    if (unmarkedStudents.length > 0) {
      toast.warning(lang === 'ar' ? 'يرجى تسجيل حضور جميع الطلاب' : 'Please mark attendance for all students');
      return;
    }

    try {
      setSavingAttendance(true);
      const { attendanceAPI } = await import('../api/attendance');

      const attendanceData = {
        date: attendanceDate,
        attendance: enrolledStudents.map(s => ({
          student_id: s.studentId,
          enrollment_id: s.enrollmentId,
          status: s.status as 'present' | 'absent' | 'late' | 'excused',
        })),
      };

      await attendanceAPI.bulkUpdateAttendance(selectedCourse.id, attendanceData);

      setShowAttendanceSaved(true);
      setTimeout(() => setShowAttendanceSaved(false), 3000);

      // Add to sessions list
      setAttendanceSessions(prev => [
        {
          id: Date.now().toString(),
          date: attendanceDate,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          topic: sessionTopic || undefined,
          status: 'saved',
        },
        ...prev,
      ]);

      // Reset for next session
      setSessionTopic('');
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء حفظ الحضور' : 'Error saving attendance');
    } finally {
      setSavingAttendance(false);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalMidterm = students.reduce((sum, s) => sum + (s.midterm || 0), 0);
    const totalFinal = students.reduce((sum, s) => sum + (s.final || 0), 0);
    const totalAttendance = students.reduce((sum, s) => sum + s.attendance, 0);
    const studentsWithGrades = students.filter((s) => s.midterm !== undefined || s.final !== undefined).length;
    const passingStudents = students.filter((s) => {
      const total = (s.midterm || 0) + (s.final || 0);
      return total >= 50;
    }).length;

    return {
      avgGrade: studentsWithGrades > 0 ? Math.round((totalMidterm + totalFinal) / studentsWithGrades) : 0,
      passRate: students.length > 0 ? Math.round((passingStudents / students.length) * 100) : 0,
      avgAttendance: students.length > 0 ? Math.round(totalAttendance / students.length) : 0,
      pendingGrades: students.filter((s) => s.midterm === undefined || s.final === undefined).length,
      atRisk: students.filter((s) => s.attendance < 75 || (s.midterm || 0) < 15).length,
    };
  };

  const stats = calculateStats();

  // Grade distribution data
  const gradeDistribution = [
    { name: 'A', value: students.filter((s) => (s.midterm || 0) + (s.final || 0) >= 85).length, color: '#22c55e' },
    { name: 'B', value: students.filter((s) => { const t = (s.midterm || 0) + (s.final || 0); return t >= 70 && t < 85; }).length, color: '#3b82f6' },
    { name: 'C', value: students.filter((s) => { const t = (s.midterm || 0) + (s.final || 0); return t >= 50 && t < 70; }).length, color: '#f97316' },
    { name: 'F', value: students.filter((s) => (s.midterm || 0) + (s.final || 0) < 50).length, color: '#ef4444' },
  ];

  // Attendance trend data
  const attendanceTrend = [
    { week: lang === 'ar' ? 'أسبوع 1' : 'Week 1', rate: 95 },
    { week: lang === 'ar' ? 'أسبوع 2' : 'Week 2', rate: 92 },
    { week: lang === 'ar' ? 'أسبوع 3' : 'Week 3', rate: 88 },
    { week: lang === 'ar' ? 'أسبوع 4' : 'Week 4', rate: 85 },
    { week: lang === 'ar' ? 'أسبوع 5' : 'Week 5', rate: 90 },
    { week: lang === 'ar' ? 'أسبوع 6' : 'Week 6', rate: 87 },
  ];

  const handleGradeChange = (id: string, field: 'midterm' | 'final' | 'quizzes' | 'participation', value: string) => {
    const numVal = parseFloat(value);
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: isNaN(numVal) ? undefined : numVal } : s))
    );
  };

  const handleSave = () => {
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const getStudentStatus = (student: EnrolledStudent) => {
    const total = (student.midterm || 0) + (student.final || 0);
    if (student.attendance < 75 || total < 30) return { status: 'at-risk', color: 'red' };
    if (total >= 70) return { status: 'excellent', color: 'green' };
    if (total >= 50) return { status: 'good', color: 'blue' };
    return { status: 'needs-improvement', color: 'yellow' };
  };

  const getLetterGrade = (total: number) => {
    if (total >= 90) return 'A+';
    if (total >= 85) return 'A';
    if (total >= 80) return 'B+';
    if (total >= 75) return 'B';
    if (total >= 70) return 'C+';
    if (total >= 65) return 'C';
    if (total >= 60) return 'D+';
    if (total >= 50) return 'D';
    return 'F';
  };

  // Filter and sort students
  const filteredStudents = students
    .filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.studentId.includes(searchQuery);
      const status = getStudentStatus(s);
      const matchesFilter = filterRisk === 'all' || status.status === filterRisk;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'grade') return ((b.midterm || 0) + (b.final || 0)) - ((a.midterm || 0) + (a.final || 0));
      return b.attendance - a.attendance;
    });

  // Course List View
  if (!selectedCourse) {
    return (
      <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-800">{t.lecturer[lang]}</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t.officeHours[lang]}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.lecturerCourses[lang]}</p>
                <p className="text-xl font-bold text-slate-800">{myCourses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.totalStudents[lang]}</p>
                <p className="text-xl font-bold text-slate-800">{myCourses.reduce((sum, c) => sum + c.enrolled, 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.activeAssignments[lang]}</p>
                <p className="text-xl font-bold text-slate-800">8</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.upcomingExams[lang]}</p>
                <p className="text-xl font-bold text-slate-800">2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">
                  {course.code}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                {lang === 'en' ? course.name_en : course.name_ar}
              </h3>
              <p className="text-sm text-slate-500 mb-4">{course.schedule}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t.enrolledCount[lang]}</span>
                  <span className="font-medium">{course.enrolled}/{course.capacity}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(course.enrolled / course.capacity) * 100}%` }}
                  />
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4 flex justify-between text-sm">
                <span className="text-slate-500">{course.credits} {t.cr[lang]}</span>
                <span className="text-blue-600 font-medium group-hover:underline">
                  {t.manageGrades[lang]} &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Course Detail View
  const tabs = [
    { id: 'overview', label: t.overview[lang], icon: BarChart3 },
    { id: 'grades', label: t.gradeManagement[lang], icon: Award },
    { id: 'attendance', label: t.attendanceTracking[lang], icon: CheckCircle },
    { id: 'assignments', label: t.assignments[lang], icon: FileText },
  ] as const;

  return (
    <div className={`space-y-6 animate-in fade-in duration-300 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Save Notification */}
      {showSaveNotification && (
        <div className="fixed top-4 end-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>{t.draftSaved[lang]}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSelectedCourse(null)}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
        >
          <ChevronLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-800">
            {lang === 'en' ? selectedCourse.name_en : selectedCourse.name_ar}
          </h2>
          <p className="text-slate-500">{selectedCourse.code} • {selectedCourse.schedule}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-orange-100">
            <RefreshCw className="w-4 h-4" /> {t.syncMoodle[lang]}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700 shadow-sm"
          >
            <Save className="w-4 h-4" /> {t.saveChanges[lang]}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 inline-flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t.avgGrade[lang]}</p>
                  <p className="text-xl font-bold text-blue-600">{stats.avgGrade}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t.passRate[lang]}</p>
                  <p className="text-xl font-bold text-green-600">{stats.passRate}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t.avgAttendance[lang]}</p>
                  <p className="text-xl font-bold text-purple-600">{stats.avgAttendance}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t.pendingGrades[lang]}</p>
                  <p className="text-xl font-bold text-yellow-600">{stats.pendingGrades}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t.atRisk[lang]}</p>
                  <p className="text-xl font-bold text-red-600">{stats.atRisk}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grade Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">{t.gradeDistribution[lang]}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Attendance Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">{t.attendanceTrend[lang]}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Grades Tab */}
      {activeTab === 'grades' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchStudents[lang]}
                    className="w-full ps-10 pe-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">{t.all[lang]}</option>
                <option value="at-risk">{t.atRisk[lang]}</option>
                <option value="excellent">{t.excellent[lang]}</option>
                <option value="good">{t.good[lang]}</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="name">{t.studentName[lang]}</option>
                <option value="grade">{t.grade[lang]}</option>
                <option value="attendance">{t.attendance[lang]}</option>
              </select>
              <div className="flex gap-2">
                <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50" title={t.exportGrades[lang]} onClick={() => {
                  const data = filteredStudents.map(s => ({
                    name: s.name,
                    studentId: s.studentId,
                    attendance: s.attendance,
                    participation: s.participation || 0,
                    quizzes: s.quizzes || 0,
                    midterm: s.midterm || 0,
                    final: s.final || 0,
                    total: ((s.participation || 0) + (s.quizzes || 0) + (s.midterm || 0) + (s.final || 0)),
                    letterGrade: getLetterGrade((s.participation || 0) + (s.quizzes || 0) + (s.midterm || 0) + (s.final || 0))
                  }));
                  exportToCSV(data, 'grades-export');
                }}>
                  <Download className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Grades Table - Read Only */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className={`p-4 ${isRTL ? 'text-end' : 'text-start'} w-12`}>#</th>
                    <th className={`p-4 ${isRTL ? 'text-end' : 'text-start'}`}>{t.studentName[lang]}</th>
                    <th className={`p-4 ${isRTL ? 'text-end' : 'text-start'}`}>{t.studentId[lang]}</th>
                    <th className={`p-4 text-center`}>{t.attendancePct[lang]}</th>
                    <th className={`p-4 text-center`}>{t.participation[lang]}</th>
                    <th className={`p-4 text-center`}>{t.quizzes[lang]}</th>
                    <th className={`p-4 text-center`}>{t.midterm[lang]}</th>
                    <th className={`p-4 text-center`}>{t.final[lang]}</th>
                    <th className={`p-4 text-center`}>{t.total[lang]}</th>
                    <th className={`p-4 text-center`}>{t.letterGrade[lang]}</th>
                    <th className={`p-4 text-center`}>{t.status[lang]}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-500">
                        {t.noStudentsFound[lang]}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => {
                      const total = (student.participation || 0) + (student.quizzes || 0) + (student.midterm || 0) + (student.final || 0);
                      const status = getStudentStatus(student);
                      const letterGrade = getLetterGrade(total);
                      return (
                        <tr key={student.id} className="hover:bg-slate-50">
                          <td className="p-4 text-slate-500">{index + 1}</td>
                          <td className="p-4 font-medium text-slate-800">{student.name}</td>
                          <td className="p-4 text-slate-500 font-mono">{student.studentId}</td>
                          <td className="p-4">
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    student.attendance >= 75 ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${student.attendance}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-600">{student.attendance}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-center font-medium text-slate-700">
                            {student.participation !== undefined ? student.participation : '-'}
                          </td>
                          <td className="p-4 text-center font-medium text-slate-700">
                            {student.quizzes !== undefined ? student.quizzes : '-'}
                          </td>
                          <td className="p-4 text-center font-medium text-slate-700">
                            {student.midterm !== undefined ? student.midterm : '-'}
                          </td>
                          <td className="p-4 text-center font-medium text-slate-700">
                            {student.final !== undefined ? student.final : '-'}
                          </td>
                          <td className="p-4 font-bold text-slate-800 text-center">{total || '-'}</td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-2 py-1 rounded-lg text-sm font-bold ${
                                letterGrade.startsWith('A')
                                  ? 'bg-green-100 text-green-700'
                                  : letterGrade.startsWith('B')
                                  ? 'bg-blue-100 text-blue-700'
                                  : letterGrade.startsWith('C')
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : letterGrade === 'F'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {letterGrade}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                status.color === 'green'
                                  ? 'bg-green-100 text-green-700'
                                  : status.color === 'blue'
                                  ? 'bg-blue-100 text-blue-700'
                                  : status.color === 'yellow'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {t[status.status.replace('-', '') as keyof typeof t]?.[lang] || status.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Attendance Saved Notification */}
          {showAttendanceSaved && (
            <div className="fixed top-4 end-4 z-50 animate-in slide-in-from-top duration-300">
              <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>{t.attendanceSaved[lang]}</span>
              </div>
            </div>
          )}

          {/* Session Header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-bold text-slate-800">{t.markAttendance[lang]}</h3>
              <div className="flex flex-wrap items-center gap-3">
                {/* Date Picker */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                {/* Session Topic */}
                <input
                  type="text"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  placeholder={t.sessionTopic[lang]}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-48"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-slate-100">
              <button
                onClick={() => markAllStudents('present')}
                className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 text-sm font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                {t.markAllPresent[lang]}
              </button>
              <button
                onClick={() => markAllStudents('absent')}
                className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-medium flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                {t.markAllAbsent[lang]}
              </button>
            </div>

            {/* Students List */}
            {loadingAttendance ? (
              <div className="text-center py-12 text-slate-500">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />
                <p>{t.loadingStudents[lang]}</p>
              </div>
            ) : enrolledStudents.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t.noStudentsEnrolled[lang]}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className={`p-4 ${isRTL ? 'text-end' : 'text-start'} w-12`}>#</th>
                      <th className={`p-4 ${isRTL ? 'text-end' : 'text-start'}`}>{t.studentId[lang]}</th>
                      <th className={`p-4 ${isRTL ? 'text-end' : 'text-start'}`}>{t.studentName[lang]}</th>
                      <th className="p-4 text-center">{t.status[lang]}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {enrolledStudents.map((student, index) => (
                      <tr key={student.studentId} className="hover:bg-slate-50">
                        <td className="p-4 text-slate-500">{index + 1}</td>
                        <td className="p-4 font-mono text-slate-600">{student.studentId}</td>
                        <td className="p-4 font-medium text-slate-800">{student.name}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Present */}
                            <button
                              onClick={() => updateStudentAttendance(student.studentId, 'present')}
                              className={`p-2 rounded-lg transition-colors ${
                                student.status === 'present'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                              }`}
                              title={t.present[lang]}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            {/* Absent */}
                            <button
                              onClick={() => updateStudentAttendance(student.studentId, 'absent')}
                              className={`p-2 rounded-lg transition-colors ${
                                student.status === 'absent'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              }`}
                              title={t.absent[lang]}
                            >
                              <X className="w-4 h-4" />
                            </button>
                            {/* Late */}
                            <button
                              onClick={() => updateStudentAttendance(student.studentId, 'late')}
                              className={`p-2 rounded-lg transition-colors ${
                                student.status === 'late'
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200'
                              }`}
                              title={t.late[lang]}
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            {/* Excused */}
                            <button
                              onClick={() => updateStudentAttendance(student.studentId, 'excused')}
                              className={`p-2 rounded-lg transition-colors ${
                                student.status === 'excused'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                              }`}
                              title={t.excused[lang]}
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary & Save */}
            {enrolledStudents.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                {/* Attendance Summary */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-slate-600">{t.present[lang]}:</span>
                      <span className="font-bold">{enrolledStudents.filter(s => s.status === 'present').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-slate-600">{t.absent[lang]}:</span>
                      <span className="font-bold">{enrolledStudents.filter(s => s.status === 'absent').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-slate-600">{t.late[lang]}:</span>
                      <span className="font-bold">{enrolledStudents.filter(s => s.status === 'late').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-slate-600">{t.excused[lang]}:</span>
                      <span className="font-bold">{enrolledStudents.filter(s => s.status === 'excused').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      <span className="text-slate-600">{lang === 'ar' ? 'غير محدد' : 'Unmarked'}:</span>
                      <span className="font-bold">{enrolledStudents.filter(s => s.status === null).length}</span>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={saveAttendance}
                    disabled={savingAttendance || enrolledStudents.every(s => s.status === null)}
                    className={`px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                      savingAttendance || enrolledStudents.every(s => s.status === null)
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    }`}
                  >
                    {savingAttendance ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {t.saveAttendance[lang]}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Previous Sessions */}
          {attendanceSessions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">{t.previousSessions[lang]}</h3>
              <div className="space-y-2">
                {attendanceSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{session.date}</p>
                        {session.topic && <p className="text-xs text-slate-500">{session.topic}</p>}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{session.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">{t.assignments[lang]}</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t.addAssignment[lang]}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 1, title: 'Assignment 1: Introduction', due: '2024-12-01', submissions: 42, total: 45, status: 'active' },
              { id: 2, title: 'Quiz 1: Chapter 1-3', due: '2024-11-28', submissions: 45, total: 45, status: 'completed' },
              { id: 3, title: 'Project Proposal', due: '2024-12-15', submissions: 12, total: 45, status: 'active' },
              { id: 4, title: 'Midterm Exam', due: '2024-12-20', submissions: 0, total: 45, status: 'upcoming' },
            ].map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800">{assignment.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      {lang === 'en' ? 'Due:' : 'الموعد:'} {assignment.due}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      assignment.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : assignment.status === 'active'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {assignment.status === 'completed'
                      ? t.statusCompleted[lang]
                      : assignment.status === 'active'
                      ? t.statusInProgress[lang]
                      : lang === 'en' ? 'Upcoming' : 'قادم'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{lang === 'en' ? 'Submissions' : 'التسليمات'}</span>
                    <span className="font-medium">{assignment.submissions}/{assignment.total}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(assignment.submissions / assignment.total) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button className="flex-1 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">
                    {t.viewDetails[lang]}
                  </button>
                  <button className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium">
                    {lang === 'en' ? 'Grade' : 'تصحيح'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Lecturer;
