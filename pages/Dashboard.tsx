
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  BookOpen, Calendar, AlertCircle, CheckCircle, Users, DollarSign, FileText,
  PlusCircle, TrendingUp, TrendingDown, Clock, Award, Target, Bell,
  GraduationCap, CreditCard, ArrowRight, Play, Star, BarChart2,
  Activity, Zap, BookMarked, UserCheck, CalendarDays
} from 'lucide-react';
import { Student, Course, Announcement, UserRole, AdmissionApplication } from '../types';
import { TRANSLATIONS, gradeToPoints } from '../constants';
import { studentsAPI } from '../api/students';
import { financeAPI } from '../api/finance';
import { dashboardAPI } from '../api/dashboard';
import { scheduleAPI } from '../api/schedule';
import { notificationsAPI, reportsAPI } from '../api/index';
import { lmsAPI } from '../api/lms';
import Schedule, { MiniCalendar } from '../components/Schedule';
import { Card, CardHeader, CardBody, StatCard, GradientCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import DynamicDashboard from '../components/DynamicDashboard';
import { useConfig } from '../context/ConfigContext';
import { useBranding } from '../context/BrandingContext';

interface DashboardProps {
  lang: 'en' | 'ar';
  role: UserRole;
  student: any;
}

const Dashboard: React.FC<DashboardProps> = ({
  lang,
  role,
  student: currentUser,
}) => {
  const t = TRANSLATIONS;
  const navigate = useNavigate();
  const { state: configState } = useConfig();
  const { branding } = useBranding();

  // Currency formatting helper
  const formatCurrency = (amount: number) => {
    const symbol = branding?.currencySymbol || '$';
    const position = branding?.currencyPosition || 'before';
    const formattedAmount = Math.abs(amount).toLocaleString();
    return position === 'before'
      ? `${symbol}${formattedAmount}`
      : `${formattedAmount} ${symbol}`;
  };

  const [student, setStudent] = useState<any>(currentUser);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const hasNameSynced = React.useRef(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleEvents, setScheduleEvents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [announcementsList, setAnnouncementsList] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [gpaHistory, setGpaHistory] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [lmsProfile, setLmsProfile] = useState<any>(null);
  const [lmsLoading, setLmsLoading] = useState(false);

  // Fetch data from APIs
  useEffect(() => {
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 15000); // 15 second max loading time

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch common data for all roles
        try {
          const [announcementsRes, eventsRes, coursesRes] = await Promise.all([
            dashboardAPI.getAnnouncements(5).catch(() => []),
            dashboardAPI.getUpcomingEvents(5).catch(() => []),
            import('../api/courses').then(m => m.coursesAPI.getAll({ per_page: 10 })).catch(() => []),
          ]);

          setAnnouncementsList(announcementsRes.data || announcementsRes || []);
          setUpcomingEvents(dashboardAPI.transformEvents(eventsRes.data || eventsRes || [], lang));
          setCourses(coursesRes.data || coursesRes || []);
        } catch {
          // Silently fail
        }

        if (role === UserRole.STUDENT) {
          try {
            // Fetch student profile from /user endpoint
            let studentData = currentUser;
            let fullStudentData: any = null;

            try {
              const profileData = await studentsAPI.getMyProfile();
              // The /user endpoint returns user with student relation
              const userData = profileData?.data || profileData;
              studentData = userData?.student || userData || currentUser;

              // If we have student_id, try to get full student data from admin module
              const studentId = studentData.id || studentData.student_id || userData?.student_id;
              if (studentId) {
                try {
                  fullStudentData = await studentsAPI.getById(studentId);
                  const fullData = fullStudentData?.data || fullStudentData;
                  if (fullData) {
                    studentData = { ...studentData, ...fullData };
                  }
                } catch {
                  // Admin endpoint not accessible for students - use profile data
                }
              }
            } catch {
              // Use current user data as fallback
            }

            // Map backend fields to frontend expected fields
            const mergedStudent = {
              ...currentUser,
              ...studentData,
              // Name mapping
              name: studentData.name_en || studentData.name || currentUser.student?.name_en || currentUser.name,
              nameAr: studentData.name_ar || currentUser.name_ar,
              nameEn: studentData.name_en || currentUser.name_en,
              // Academic fields - map from backend snake_case to frontend camelCase
              gpa: studentData.gpa ?? studentData.cumulative_gpa ?? 0,
              termGpa: studentData.term_gpa ?? studentData.semester_gpa ?? 0,
              level: studentData.level ?? studentData.current_level ?? 1,
              completedCredits: studentData.completed_credits ?? studentData.credits_earned ?? studentData.completedCredits ?? 0,
              registeredCredits: studentData.registered_credits ?? studentData.current_credits ?? studentData.registeredCredits ?? 0,
              totalRequiredCredits: studentData.total_required_credits ?? studentData.total_credits ?? studentData.totalRequiredCredits ?? 132,
              remainingCredits: studentData.remaining_credits ?? studentData.remainingCredits ?? 0,
              // Academic status mapping
              academicStatus: studentData.academic_status ?? studentData.academicStatus ?? 'REGULAR',
              currentSemester: studentData.current_semester ?? studentData.semester?.name ?? studentData.currentSemester ?? '',
              // Program/Major info
              major: studentData.program?.name_en || studentData.major || studentData.program_name || '',
              majorAr: studentData.program?.nameAr || studentData.program?.name_ar || '',
              college: studentData.program?.department?.college?.nameEn || studentData.college?.name_en || studentData.faculty?.name_en || studentData.college || '',
              collegeAr: studentData.program?.department?.college?.nameAr || studentData.college?.name_ar || '',
              department: studentData.program?.department?.nameEn || studentData.department?.name_en || studentData.department || '',
              departmentAr: studentData.program?.department?.nameAr || studentData.department?.name_ar || '',
              programCode: studentData.program?.code || '',
              degree: studentData.program?.degree || 'BACHELOR',
              program: studentData.program || null,
              // Student ID
              studentId: studentData.student_id || studentData.studentId || '',
            };
            setStudent(mergedStudent);

            // Update localStorage to sync navbar with fresh data (only once per session)
            if (!hasNameSynced.current) {
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                try {
                  const parsedUser = JSON.parse(storedUser);
                  const newName = mergedStudent.name;
                  // Only update if name actually changed
                  if (parsedUser.name !== newName) {
                    const updatedUser = {
                      ...parsedUser,
                      name: newName,
                      name_en: studentData.name_en || parsedUser.name_en,
                      name_ar: studentData.name_ar || parsedUser.name_ar,
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    // Dispatch event to notify App.tsx to update navbar
                    window.dispatchEvent(new Event('user-updated'));
                  }
                  hasNameSynced.current = true;
                } catch {
                  // Could not update localStorage
                }
              }
            }

            // Fetch student-specific data in parallel with individual error handling
            // Use /my-* endpoints for student's own data to avoid permission issues
            const studentId = studentData.id || currentUser.student?.id;
            const [enrollmentsData, financialData, timetableData, gradesData, requestsData] = await Promise.all([
              studentId ? studentsAPI.getEnrollments(studentId).catch(() => []) : Promise.resolve([]),
              financeAPI.getMyFinancials().catch(() => null),
              scheduleAPI.getMyTimetable().catch(() => []),
              studentsAPI.getMyGrades().catch(() => null),
              import('../api/studentRequests').then(m => m.studentRequestsAPI.getRequests()).catch(() => ({ data: [] })),
            ]);

            setEnrollments(enrollmentsData.data || enrollmentsData || []);
            setFinancials(financialData?.records || financialData || null);

            // Count pending requests
            const requests = requestsData.data || requestsData || [];
            const pendingCount = requests.filter((r: any) =>
              r.status === 'PENDING' || r.status === 'pending' ||
              r.status === 'SUBMITTED' || r.status === 'submitted' ||
              r.status === 'UNDER_REVIEW' || r.status === 'under_review'
            ).length;
            setPendingRequestsCount(pendingCount);

            // Transform timetable to schedule events
            const timetable = timetableData.data || timetableData || [];
            if (timetable.length > 0) {
              setScheduleEvents(scheduleAPI.transformToEvents(timetable, lang));
            }

            // Process grades for GPA history
            if (gradesData) {
              // Ensure grades is an array
              let grades: any[] = [];
              if (Array.isArray(gradesData)) {
                grades = gradesData;
              } else if (Array.isArray(gradesData.data)) {
                grades = gradesData.data;
              } else if (gradesData.grades && Array.isArray(gradesData.grades)) {
                grades = gradesData.grades;
              }
              const semesterGrades = processGradesForChart(grades);
              setGpaHistory(semesterGrades);

              // Calculate attendance data from enrollments
              const attData = processAttendanceData(enrollmentsData.data || enrollmentsData || [], lang);
              setAttendanceData(attData);
            }

            // Fetch LMS profile data
            try {
              setLmsLoading(true);
              const lmsData = await lmsAPI.getMyLmsProfile();
              if (lmsData.success && lmsData.connected) {
                setLmsProfile(lmsData);
              }
            } catch {
              // LMS not available - silently fail
            } finally {
              setLmsLoading(false);
            }

          } catch {
            setStudent(currentUser);
            setEnrollments([]);
            setFinancials(null);
          }
        } else if (role === UserRole.ADMIN || role === UserRole.FINANCE || role === UserRole.STUDENT_AFFAIRS) {
          try {
            const [statsData, appsData] = await Promise.all([
              dashboardAPI.getStats().catch(() => null),
              import('../api/admissions').then(m => m.admissionsAPI.getAll({ per_page: 10 })).catch(() => []),
            ]);
            setDashboardStats(statsData);
            setApplications(appsData.data || appsData || []);
          } catch (err) {
            // Failed to fetch admin stats
          }
          setStudent(currentUser);
        } else {
          setStudent(currentUser);
        }
      } catch {
        setStudent(currentUser);
      } finally {
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    };
    fetchData();

    // Cleanup function
    return () => {
      clearTimeout(safetyTimeout);
    };
  }, [role, currentUser, lang]);

  // Helper function to process grades for chart
  const processGradesForChart = (grades: any) => {
    const semesterMap = new Map<string, { total: number; points: number; credits: number }>();

    // Ensure grades is an array
    const gradesArray = Array.isArray(grades) ? grades : [];

    gradesArray.forEach((grade: any) => {
      const semester = grade.semester || grade.semester_name || 'Unknown';
      if (!semesterMap.has(semester)) {
        semesterMap.set(semester, { total: 0, points: 0, credits: 0 });
      }
      const data = semesterMap.get(semester)!;
      const credits = grade.credits || grade.course?.credits || 3;
      const points = grade.points || gradeToPoints(grade.grade);
      data.credits += credits;
      data.points += points * credits;
    });

    return Array.from(semesterMap.entries()).map(([semester, data]) => ({
      semester,
      gpa: data.credits > 0 ? Number((data.points / data.credits).toFixed(2)) : 0,
    }));
  };

  // gradeToPoints is now imported from constants.ts (Vertex University grading scale)

  // Helper function to process attendance data
  const processAttendanceData = (enrollments: any, lang: string) => {
    // Ensure enrollments is an array
    const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
    return enrollmentsArray.slice(0, 4).map((enrollment: any) => {
      const course = enrollment.course || {};
      const attendance = enrollment.attendance_records || [];
      const present = attendance.filter((a: any) => a.status === 'present').length;
      const total = attendance.length;
      // Only calculate rate if we have real attendance data
      const rate = total > 0 ? Math.round((present / total) * 100) : null;

      return {
        name: course.code || enrollment.courseCode || 'Course',
        present: rate !== null ? rate : 0,
        absent: rate !== null ? 100 - rate : 0,
        noData: rate === null,
      };
    });
  };

  // Use API data only (no demo fallback)
  const displayScheduleEvents = scheduleEvents;
  const displayAttendanceData = attendanceData;
  const gpaProgressData = gpaHistory;

  // Credit distribution - using real data from student profile
  const completedCredits = student.completedCredits || 0;
  const currentCredits = enrollments.reduce((sum: number, e: any) => sum + (e.credits || e.course?.credits || 0), 0);
  const totalRequired = student.totalRequiredCredits || 130;
  const remainingCredits = Math.max(0, totalRequired - completedCredits - currentCredits);

  const creditDistribution = [
    { name: lang === 'ar' ? 'مكتمل' : 'Completed', value: completedCredits, color: '#3b82f6' },
    { name: lang === 'ar' ? 'مسجل حالياً' : 'Current', value: currentCredits, color: '#8b5cf6' },
    { name: lang === 'ar' ? 'متبقي' : 'Remaining', value: remainingCredits, color: '#e2e8f0' },
  ];

  // Admin trend data from API stats or empty
  const admissionTrendData = dashboardStats?.admissionTrend || [];

  // Quick Actions - Course registration removed, students must go through Student Affairs
  const studentQuickActions = [
    { icon: FileText, label: lang === 'ar' ? 'تقديم طلب' : 'Submit Request', color: 'bg-blue-500', path: '/requests' },
    { icon: CreditCard, label: lang === 'ar' ? 'دفع الرسوم' : 'Pay Fees', color: 'bg-green-500', path: '/finance' },
    { icon: FileText, label: lang === 'ar' ? 'السجل الأكاديمي' : 'Transcript', color: 'bg-purple-500', path: '/transcript' },
    { icon: CalendarDays, label: lang === 'ar' ? 'الجدول الدراسي' : 'View Schedule', color: 'bg-orange-500', path: '/schedule' },
  ];

  // Extended Quick Actions for students
  const extendedStudentActions = [
    { icon: Award, label: lang === 'ar' ? 'البطاقة الجامعية' : 'ID Card', color: 'bg-cyan-500', path: '/id-card' },
    { icon: Clock, label: lang === 'ar' ? 'الحضور والغياب' : 'Attendance', color: 'bg-amber-500', path: '/attendance' },
    { icon: Target, label: lang === 'ar' ? 'الامتحانات' : 'Exams', color: 'bg-rose-500', path: '/exams' },
    { icon: Activity, label: lang === 'ar' ? 'الطلبات الأكاديمية' : 'Requests', color: 'bg-indigo-500', path: '/requests' },
  ];

  // Use API data only (no demo fallback)
  const displayUpcomingEvents = upcomingEvents;

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 font-medium">{lang === 'en' ? 'Loading your dashboard...' : 'جاري تحميل لوحة التحكم...'}</p>
        </div>
      </div>
    );
  }

  // Student Dashboard
  const renderStudentDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <GradientCard gradient="from-blue-600 via-indigo-600 to-purple-600" className="relative overflow-hidden">
        <div className="absolute top-0 end-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 start-0 w-24 sm:w-48 h-24 sm:h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-blue-100 text-xs sm:text-sm font-medium mb-1">{t.welcome[lang]}</p>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{student.name}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-blue-100 text-xs sm:text-sm">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {student.major}
              </span>
              <span>{t.level[lang]} {student.level}</span>
              <span className="hidden sm:inline">{student.currentSemester || ''}</span>
            </div>
          </div>
          {/* Course registration button removed - students cannot self-register */}
        </div>
      </GradientCard>

      {/* Academic Program Info */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-blue-100">
        <CardBody className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg">
              <BookMarked className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 mb-3">
                {lang === 'ar' ? 'البرنامج الأكاديمي' : 'Academic Program'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Program Name */}
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">{lang === 'ar' ? 'البرنامج' : 'Program'}</p>
                  <p className="font-semibold text-slate-800">
                    {lang === 'ar' ? (student.majorAr || student.major || '--') : (student.major || '--')}
                  </p>
                  {student.programCode && (
                    <p className="text-xs text-slate-500 mt-1">({student.programCode})</p>
                  )}
                </div>
                {/* Degree Type */}
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">{lang === 'ar' ? 'الدرجة العلمية' : 'Degree'}</p>
                  <p className="font-semibold text-slate-800">
                    {student.degree === 'BACHELOR' ? (lang === 'ar' ? 'بكالوريوس' : 'Bachelor') :
                     student.degree === 'MASTER' ? (lang === 'ar' ? 'ماجستير' : 'Master') :
                     student.degree === 'DOCTORATE' || student.degree === 'PHD' ? (lang === 'ar' ? 'دكتوراه' : 'Doctorate') :
                     student.degree === 'DIPLOMA' ? (lang === 'ar' ? 'دبلوم' : 'Diploma') :
                     student.degree === 'ASSOCIATE' ? (lang === 'ar' ? 'دبلوم مشارك' : 'Associate') :
                     (lang === 'ar' ? 'بكالوريوس' : 'Bachelor')}
                  </p>
                </div>
                {/* Department */}
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">{lang === 'ar' ? 'القسم' : 'Department'}</p>
                  <p className="font-semibold text-slate-800">
                    {lang === 'ar' ? (student.departmentAr || student.department || '--') : (student.department || '--')}
                  </p>
                </div>
                {/* College/Faculty */}
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">{lang === 'ar' ? 'الكلية' : 'College'}</p>
                  <p className="font-semibold text-slate-800">
                    {lang === 'ar' ? (student.collegeAr || student.college || '--') : (student.college || '--')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* LMS Profile Info */}
      {lmsProfile && lmsProfile.connected && (
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-amber-100">
          <CardBody className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl text-white shadow-lg">
                <Activity className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-800">
                    {lang === 'ar' ? 'بيانات نظام التعلم (LMS)' : 'Learning Management System (LMS)'}
                  </h3>
                  {lmsProfile.profile?.last_access && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lang === 'ar' ? 'آخر دخول:' : 'Last access:'} {new Date(lmsProfile.profile.last_access).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* Enrolled Courses */}
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-orange-600">{lmsProfile.statistics?.enrolled_courses || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">{lang === 'ar' ? 'المواد المسجلة' : 'Enrolled Courses'}</p>
                  </div>
                  {/* Completed Courses */}
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{lmsProfile.statistics?.completed_courses || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">{lang === 'ar' ? 'المواد المكتملة' : 'Completed'}</p>
                  </div>
                  {/* In Progress */}
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{lmsProfile.statistics?.in_progress_courses || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">{lang === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</p>
                  </div>
                  {/* Average Progress */}
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600">{lmsProfile.statistics?.average_progress || 0}%</p>
                    <p className="text-xs text-slate-500 mt-1">{lang === 'ar' ? 'متوسط التقدم' : 'Avg Progress'}</p>
                  </div>
                  {/* Grades Received */}
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-amber-600">{lmsProfile.statistics?.grades_received || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">{lang === 'ar' ? 'الدرجات المستلمة' : 'Grades Received'}</p>
                  </div>
                </div>

                {/* LMS Profile Details */}
                {lmsProfile.profile && (
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <div className="flex items-center gap-4">
                      {lmsProfile.profile.profile_image && !lmsProfile.profile.profile_image.includes('theme/image.php') && (
                        <img
                          src={lmsProfile.profile.profile_image}
                          alt="LMS Profile"
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-200"
                        />
                      )}
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <p className="text-slate-500 text-xs">{lang === 'ar' ? 'اسم المستخدم' : 'Username'}</p>
                          <p className="font-medium text-slate-700">{lmsProfile.profile.username}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</p>
                          <p className="font-medium text-slate-700">{lmsProfile.profile.fullname}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
                          <p className="font-medium text-slate-700 truncate">{lmsProfile.profile.email}</p>
                        </div>
                        {lmsProfile.profile.department && (
                          <div>
                            <p className="text-slate-500 text-xs">{lang === 'ar' ? 'القسم' : 'Department'}</p>
                            <p className="font-medium text-slate-700">{lmsProfile.profile.department}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* LMS Courses Progress */}
                {lmsProfile.courses && lmsProfile.courses.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">{lang === 'ar' ? 'تقدم المواد' : 'Course Progress'}</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {lmsProfile.courses.slice(0, 5).map((course: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700 truncate">{course.fullname || course.shortname}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${course.completed ? 'bg-green-500' : 'bg-orange-500'}`}
                                  style={{ width: `${course.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-slate-500 w-10 text-end">{course.progress || 0}%</span>
                            </div>
                          </div>
                          {course.completed && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-4">
        {/* المعدل التراكمي من 100 */}
        <Card className="relative overflow-hidden">
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{lang === 'ar' ? 'المعدل التراكمي' : 'GPA'}</p>
                <p className="text-3xl font-bold text-slate-800">
                  {typeof student.gpa === 'number' ? Math.round((student.gpa / 4) * 100) : '--'}
                </p>
                <p className="text-sm text-slate-400 mt-2">{lang === 'ar' ? 'من 100' : 'out of 100'}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl text-white">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute bottom-0 start-0 end-0 h-1 bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${typeof student.gpa === 'number' ? (student.gpa / 4) * 100 : 0}%` }}></div>
          </CardBody>
        </Card>

        {/* الساعات التي تم دراستها */}
        <Card className="relative overflow-hidden">
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{lang === 'ar' ? 'ساعات مدروسة' : 'Studied Hours'}</p>
                <p className="text-3xl font-bold text-slate-800">{(completedCredits + currentCredits) || '--'}</p>
                <p className="text-sm text-slate-400 mt-2">{lang === 'ar' ? 'ساعة' : 'credits'}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl text-white">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute bottom-0 start-0 end-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${(completedCredits + currentCredits) > 0 ? ((completedCredits + currentCredits) / totalRequired) * 100 : 0}%` }}></div>
          </CardBody>
        </Card>

        {/* الساعات التي تم اعتمادها */}
        <Card className="relative overflow-hidden">
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{lang === 'ar' ? 'ساعات معتمدة' : 'Earned Credits'}</p>
                <p className="text-3xl font-bold text-slate-800">{completedCredits || '--'}</p>
                <p className="text-sm text-slate-400 mt-2">{lang === 'ar' ? 'ساعة' : 'credits'}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl text-white">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute bottom-0 start-0 end-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${completedCredits > 0 ? (completedCredits / totalRequired) * 100 : 0}%` }}></div>
          </CardBody>
        </Card>

        {/* الساعات المتبقية */}
        <Card className="relative overflow-hidden">
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{lang === 'ar' ? 'ساعات متبقية' : 'Remaining'}</p>
                <p className="text-3xl font-bold text-slate-800">{remainingCredits || '--'}</p>
                <p className="text-sm text-slate-400 mt-2">/ {totalRequired} {lang === 'ar' ? 'ساعة' : 'credits'}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-white">
                <Target className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute bottom-0 start-0 end-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" style={{ width: `${remainingCredits > 0 ? 100 - (remainingCredits / totalRequired) * 100 : 100}%` }}></div>
          </CardBody>
        </Card>

        {/* الحالة الأكاديمية */}
        <Card className="relative overflow-hidden">
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{lang === 'ar' ? 'الحالة الأكاديمية' : 'Academic Status'}</p>
                <p className="text-xl font-bold text-slate-800">
                  {student.academicStatus === 'REGULAR' || !student.academicStatus ? (lang === 'ar' ? 'نظامي' : 'Regular') :
                   student.academicStatus === 'BRIDGING' ? (lang === 'ar' ? 'تجسير' : 'Bridging') :
                   student.academicStatus === 'DEFERRED' ? (lang === 'ar' ? 'مؤجل' : 'Deferred') :
                   student.academicStatus === 'ON_PROBATION' ? (lang === 'ar' ? 'إنذار أكاديمي' : 'Probation') :
                   student.academicStatus === 'SUSPENDED' ? (lang === 'ar' ? 'موقوف' : 'Suspended') :
                   student.academicStatus === 'GRADUATED' ? (lang === 'ar' ? 'متخرج' : 'Graduated') :
                   (lang === 'ar' ? 'نظامي' : 'Regular')}
                </p>
                <p className="text-sm text-slate-400 mt-2">{lang === 'ar' ? 'المستوى' : 'Level'} {student.level || '--'}</p>
              </div>
              <div className={`p-3 rounded-xl text-white ${
                student.academicStatus === 'ON_PROBATION' ? 'bg-gradient-to-br from-red-400 to-red-600' :
                student.academicStatus === 'SUSPENDED' ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                student.academicStatus === 'GRADUATED' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                'bg-gradient-to-br from-purple-400 to-purple-600'
              }`}>
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* طلبات قيد الانتظار */}
        <Card className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/requests')}>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{lang === 'ar' ? 'طلبات قيد الانتظار' : 'Pending Requests'}</p>
                <p className="text-3xl font-bold text-slate-800">{pendingRequestsCount}</p>
                <p className="text-sm text-slate-400 mt-2">{lang === 'ar' ? 'انقر للعرض' : 'Click to view'}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl text-white">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            {pendingRequestsCount > 0 && (
              <div className="absolute bottom-0 start-0 end-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardBody className="p-3 sm:p-4">
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3">
            {[...studentQuickActions, ...extendedStudentActions].map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className={`p-2 sm:p-2.5 ${action.color} rounded-lg sm:rounded-xl text-white group-hover:scale-110 transition-transform shadow-sm`}>
                  <action.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-slate-700 text-center line-clamp-2">{action.label}</span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="xl:col-span-2 space-y-6">
          {/* GPA Progress - Scale 0-100 */}
          <Card>
            <CardHeader
              title={lang === 'ar' ? 'تطور المعدل التراكمي' : 'GPA Progress'}
              icon={TrendingUp}
              iconColor="text-green-600 bg-green-50"
            />
            <CardBody>
              {gpaProgressData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                    <AreaChart data={gpaProgressData.map(d => ({ ...d, gpa100: Math.round((d.gpa / 4) * 100) }))}>
                      <defs>
                        <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="semester" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                        formatter={(value: any) => [`${value}%`, lang === 'ar' ? 'المعدل' : 'GPA']}
                      />
                      <Area type="monotone" dataKey="gpa100" stroke="#3b82f6" strokeWidth={3} fill="url(#gpaGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  {lang === 'ar' ? 'لا توجد بيانات للمعدل' : 'No GPA data available'}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Attendance Chart */}
          <Card>
            <CardHeader
              title={lang === 'ar' ? 'نسبة الحضور' : 'Attendance Rate'}
              icon={BarChart2}
              iconColor="text-blue-600 bg-blue-50"
            />
            <CardBody>
              {displayAttendanceData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                    <BarChart data={displayAttendanceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#94a3b8" width={60} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                      <Bar dataKey="present" fill="#22c55e" radius={[0, 4, 4, 0]} name={lang === 'ar' ? 'حضور' : 'Present'} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  {lang === 'ar' ? 'لا توجد بيانات للحضور' : 'No attendance data available'}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Credit Distribution */}
          <Card>
            <CardHeader
              title={lang === 'ar' ? 'توزيع الساعات' : 'Credit Distribution'}
              icon={Target}
              iconColor="text-purple-600 bg-purple-50"
            />
            <CardBody>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                  <PieChart>
                    <Pie
                      data={creditDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {creditDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {creditDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs text-slate-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Financial Summary */}
          {financials && (
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/finance')}>
              <CardHeader
                title={lang === 'ar' ? 'الملخص المالي' : 'Financial Summary'}
                icon={CreditCard}
                iconColor="text-green-600 bg-green-50"
              />
              <CardBody>
                <div className="space-y-3">
                  {/* Outstanding Balance */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      {lang === 'ar' ? 'الرصيد المستحق' : 'Outstanding Balance'}
                    </span>
                    <span className={`font-bold ${(financials.outstanding_balance || financials.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(financials.outstanding_balance || financials.balance || 0)}
                    </span>
                  </div>
                  {/* Total Fees */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      {lang === 'ar' ? 'إجمالي الرسوم' : 'Total Fees'}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(financials.total_fees || financials.total_amount || 0)}
                    </span>
                  </div>
                  {/* Total Paid */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      {lang === 'ar' ? 'المدفوع' : 'Total Paid'}
                    </span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(financials.total_paid || financials.paid_amount || 0)}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, ((financials.total_paid || financials.paid_amount || 0) / (financials.total_fees || financials.total_amount || 1)) * 100)}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 text-center">
                      {Math.round(((financials.total_paid || financials.paid_amount || 0) / (financials.total_fees || financials.total_amount || 1)) * 100)}% {lang === 'ar' ? 'مدفوع' : 'paid'}
                    </p>
                  </div>
                  {/* View Details Link */}
                  <div className="pt-2 flex justify-center">
                    <span className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      {lang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Mini Calendar */}
          <MiniCalendar
            lang={lang}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            highlightedDates={displayUpcomingEvents.map(e => new Date(e.date))}
          />

          {/* Upcoming Events */}
          <Card>
            <CardHeader
              title={lang === 'ar' ? 'الأحداث القادمة' : 'Upcoming Events'}
              icon={Calendar}
              iconColor="text-orange-600 bg-orange-50"
            />
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                {displayUpcomingEvents.length > 0 ? displayUpcomingEvents.map((event, index) => (
                  <div key={event.id || index} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${
                      event.type === 'exam' ? 'bg-red-500' :
                      event.type === 'assignment' ? 'bg-blue-500' : 'bg-orange-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{event.title}</p>
                      <p className="text-xs text-slate-500">{event.date}</p>
                    </div>
                  </div>
                )) : (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    {lang === 'ar' ? 'لا توجد أحداث قادمة' : 'No upcoming events'}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Schedule */}
      <Schedule lang={lang} events={displayScheduleEvents} />

      {/* Current Courses */}
      <Card>
        <CardHeader
          title={t.courses[lang]}
          icon={BookOpen}
          iconColor="text-indigo-600 bg-indigo-50"
          action={
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/academic')}>
              {lang === 'ar' ? 'عرض الكل' : 'View All'}
            </Button>
          }
        />
        <CardBody noPadding>
          <div className="divide-y divide-slate-100">
            {courses.length > 0 ? courses.slice(0, 4).map((course: any) => (
              <div key={course.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {(course.code || '').slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{lang === 'en' ? course.name_en : course.name_ar}</h4>
                    <p className="text-sm text-slate-500">{course.code} - {course.instructor || course.instructor_name}</p>
                  </div>
                </div>
                <div className="text-end">
                  <Badge variant="primary">{course.credits} {lang === 'ar' ? 'ساعات' : 'Cr'}</Badge>
                  <p className="text-xs text-slate-400 mt-1">{course.schedule}</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500">
                {lang === 'ar' ? 'لا توجد مساقات مسجلة' : 'No courses enrolled'}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Announcements */}
      <Card>
        <CardHeader
          title={t.announcements[lang]}
          icon={Bell}
          iconColor="text-red-600 bg-red-50"
        />
        <CardBody noPadding>
          <div className="divide-y divide-slate-100">
            {announcementsList.length > 0 ? announcementsList.map((ann: any) => (
              <div key={ann.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                    ann.type === 'ACADEMIC' ? 'bg-blue-500' :
                    ann.type === 'FINANCIAL' ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-slate-800">{ann.title}</h4>
                      <Badge variant={ann.type === 'ACADEMIC' ? 'primary' : ann.type === 'FINANCIAL' ? 'danger' : 'success'} size="sm">
                        {ann.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{ann.content}</p>
                    <p className="text-xs text-slate-400">{ann.date} - {ann.sender}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500">
                {lang === 'ar' ? 'لا توجد إعلانات' : 'No announcements'}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Admin Dashboard
  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t.welcome[lang]}, {student.name}</h1>
          <p className="text-slate-500">{t.adminWelcomeMsg[lang]}</p>
        </div>
        <Button icon={PlusCircle} onClick={() => navigate('/admissions')}>
          {lang === 'ar' ? 'إضافة طالب' : 'Add Student'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.totalStudents[lang]}
          value={dashboardStats?.students?.total?.toString() || '--'}
          subtitle={dashboardStats?.students?.active ? `${dashboardStats.students.active} ${lang === 'ar' ? 'نشط' : 'active'}` : ''}
          icon={Users}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          title={lang === 'ar' ? 'طلبات قيد الانتظار' : 'Pending Requests'}
          value={dashboardStats?.service_requests?.pending?.toString() || '0'}
          subtitle={lang === 'ar' ? 'بحاجة للمراجعة' : 'Needs review'}
          icon={Clock}
          iconColor="text-orange-600 bg-orange-50"
        />
        <StatCard
          title={lang === 'ar' ? 'المساقات النشطة' : 'Active Courses'}
          value={dashboardStats?.courses?.active?.toString() || '--'}
          subtitle={`${dashboardStats?.courses?.total || 0} ${lang === 'ar' ? 'إجمالي' : 'total'}`}
          icon={BookOpen}
          iconColor="text-purple-600 bg-purple-50"
        />
        <StatCard
          title={lang === 'ar' ? 'طلبات القبول المعلقة' : 'Pending Admissions'}
          value={dashboardStats?.admissions?.pending?.toString() || '0'}
          subtitle={`${dashboardStats?.admissions?.total || 0} ${lang === 'ar' ? 'إجمالي' : 'total'}`}
          icon={FileText}
          iconColor="text-green-600 bg-green-50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title={t.appsTrend[lang]}
            icon={TrendingUp}
            iconColor="text-blue-600 bg-blue-50"
          />
          <CardBody>
            {admissionTrendData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                  <BarChart data={admissionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="applications" fill="#3b82f6" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'الطلبات' : 'Applications'} />
                    <Bar dataKey="approved" fill="#22c55e" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'المقبولين' : 'Approved'} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-slate-400">
                {lang === 'ar' ? 'لا توجد بيانات' : 'No data available'}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader
            title={lang === 'ar' ? 'آخر الطلبات' : 'Recent Applications'}
            icon={FileText}
            iconColor="text-orange-600 bg-orange-50"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/admissions')}>
                {t.viewAll[lang]}
              </Button>
            }
          />
          <CardBody noPadding>
            <div className="divide-y divide-slate-100">
              {applications.length > 0 ? applications.slice(0, 5).map((app) => (
                <div key={app.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-800">{app.fullName}</p>
                    <p className="text-sm text-slate-500">{app.program} • {app.email}</p>
                  </div>
                  <Badge
                    variant={app.status === 'APPROVED' ? 'success' : app.status === 'REJECTED' ? 'danger' : 'warning'}
                    dot
                  >
                    {app.status}
                  </Badge>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-500">
                  {lang === 'ar' ? 'لا توجد طلبات' : 'No applications'}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader title={t.announcements[lang]} icon={Bell} iconColor="text-red-600 bg-red-50" />
        <CardBody noPadding>
          <div className="divide-y divide-slate-100">
            {announcementsList.length > 0 ? announcementsList.map((ann: any) => (
              <div key={ann.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    ann.type === 'ACADEMIC' ? 'bg-blue-500' : ann.type === 'FINANCIAL' ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{ann.title}</h4>
                    <p className="text-sm text-slate-600">{ann.content}</p>
                    <p className="text-xs text-slate-400 mt-1">{ann.date}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500">
                {lang === 'ar' ? 'لا توجد إعلانات' : 'No announcements'}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Student Affairs Dashboard
  const renderStudentAffairsDashboard = () => {
    // Extract data from dashboardStats (nested structure from studentAffairsStats)
    const studentsData = dashboardStats?.students || {};
    const admissionsData = dashboardStats?.admissions || {};
    const enrollmentsData = dashboardStats?.enrollments || {};
    const serviceRequestsData = dashboardStats?.service_requests || {};
    const recentApps = dashboardStats?.recent_applications || applications.slice(0, 5);

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <GradientCard gradient="from-emerald-600 via-teal-600 to-cyan-600" className="relative overflow-hidden">
          <div className="absolute top-0 end-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 start-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">{t.welcome[lang]}</p>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{student.name}</h1>
              <p className="text-emerald-100">
                {lang === 'ar' ? 'لوحة تحكم شؤون الطلاب' : 'Student Affairs Dashboard'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                icon={Users}
                onClick={() => navigate('/admin/users')}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                {lang === 'ar' ? 'إدارة الطلاب' : 'Manage Students'}
              </Button>
              <Button
                variant="secondary"
                icon={FileText}
                onClick={() => navigate('/admissions')}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                {lang === 'ar' ? 'طلبات القبول' : 'Admissions'}
              </Button>
            </div>
          </div>
        </GradientCard>

        {/* Stats Grid - Row 1: Students */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{lang === 'ar' ? 'إجمالي الطلاب' : 'Total Students'}</p>
                  <p className="text-3xl font-bold text-slate-800">{studentsData.total || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="relative overflow-hidden border-l-4 border-l-green-500">
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{lang === 'ar' ? 'الطلاب النشطين' : 'Active Students'}</p>
                  <p className="text-3xl font-bold text-green-600">{studentsData.active || 0}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="relative overflow-hidden border-l-4 border-l-purple-500">
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{lang === 'ar' ? 'الخريجين' : 'Graduated'}</p>
                  <p className="text-3xl font-bold text-purple-600">{studentsData.graduated || 0}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="relative overflow-hidden border-l-4 border-l-red-500">
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{lang === 'ar' ? 'الموقوفين' : 'Suspended'}</p>
                  <p className="text-3xl font-bold text-red-600">{studentsData.suspended || 0}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Stats Grid - Row 2: Admissions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
          <Card className="relative overflow-hidden">
            <CardBody>
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-1">{lang === 'ar' ? 'إجمالي الطلبات' : 'Total Applications'}</p>
                <p className="text-2xl font-bold text-slate-800">{admissionsData.total || 0}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="relative overflow-hidden bg-yellow-50">
            <CardBody>
              <div className="text-center">
                <p className="text-sm text-yellow-700 mb-1">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</p>
                <p className="text-2xl font-bold text-yellow-700">{admissionsData.pending || 0}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="relative overflow-hidden bg-blue-50">
            <CardBody>
              <div className="text-center">
                <p className="text-sm text-blue-700 mb-1">{lang === 'ar' ? 'قيد المراجعة' : 'Under Review'}</p>
                <p className="text-2xl font-bold text-blue-700">{admissionsData.under_review || 0}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="relative overflow-hidden bg-green-50">
            <CardBody>
              <div className="text-center">
                <p className="text-sm text-green-700 mb-1">{lang === 'ar' ? 'مقبول' : 'Approved'}</p>
                <p className="text-2xl font-bold text-green-700">{admissionsData.approved || 0}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="relative overflow-hidden bg-red-50">
            <CardBody>
              <div className="text-center">
                <p className="text-sm text-red-700 mb-1">{lang === 'ar' ? 'مرفوض' : 'Rejected'}</p>
                <p className="text-2xl font-bold text-red-700">{admissionsData.rejected || 0}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardBody className="p-4">
            <h3 className="font-semibold text-slate-800 mb-4">{lang === 'ar' ? 'الإجراءات السريعة' : 'Quick Actions'}</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
              {[
                { icon: Users, label: lang === 'ar' ? 'إدارة الطلاب' : 'Students', color: 'bg-blue-500', path: '/admin/users' },
                { icon: FileText, label: lang === 'ar' ? 'طلبات القبول' : 'Admissions', color: 'bg-orange-500', path: '/admissions' },
                { icon: BookOpen, label: lang === 'ar' ? 'التسجيل' : 'Registration', color: 'bg-purple-500', path: '/registration' },
                { icon: Calendar, label: lang === 'ar' ? 'الجداول' : 'Schedules', color: 'bg-cyan-500', path: '/schedule' },
                { icon: BarChart2, label: lang === 'ar' ? 'التقارير' : 'Reports', color: 'bg-green-500', path: '/reports' },
                { icon: Activity, label: lang === 'ar' ? 'الطلبات' : 'Requests', color: 'bg-rose-500', path: '/requests' },
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-slate-50 transition-colors group border border-slate-100"
                >
                  <div className={`p-3 ${action.color} rounded-xl text-white group-hover:scale-110 transition-transform shadow-sm`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{action.label}</span>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card>
            <CardHeader
              title={lang === 'ar' ? 'آخر طلبات القبول' : 'Recent Applications'}
              icon={FileText}
              iconColor="text-orange-600 bg-orange-50"
              action={
                <Button variant="ghost" size="sm" onClick={() => navigate('/admissions')}>
                  {t.viewAll[lang]}
                </Button>
              }
            />
            <CardBody noPadding>
              <div className="divide-y divide-slate-100">
                {recentApps.length > 0 ? recentApps.map((app: any) => (
                  <div key={app.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{app.full_name || app.fullName}</p>
                        <p className="text-sm text-slate-500">{app.email}</p>
                      </div>
                    </div>
                    <Badge
                      variant={app.status === 'APPROVED' ? 'success' : app.status === 'REJECTED' ? 'danger' : 'warning'}
                      dot
                    >
                      {app.status === 'PENDING' ? (lang === 'ar' ? 'معلق' : 'Pending') :
                       app.status === 'APPROVED' ? (lang === 'ar' ? 'مقبول' : 'Approved') :
                       app.status === 'REJECTED' ? (lang === 'ar' ? 'مرفوض' : 'Rejected') :
                       app.status === 'UNDER_REVIEW' ? (lang === 'ar' ? 'قيد المراجعة' : 'Under Review') : app.status}
                    </Badge>
                  </div>
                )) : (
                  <div className="p-8 text-center text-slate-500">
                    {lang === 'ar' ? 'لا توجد طلبات' : 'No applications'}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Enrollments & Requests Stats */}
          <div className="space-y-6">
            {/* Enrollments */}
            <Card>
              <CardHeader
                title={lang === 'ar' ? 'التسجيلات' : 'Enrollments'}
                icon={GraduationCap}
                iconColor="text-purple-600 bg-purple-50"
              />
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-slate-800">{enrollmentsData.total || 0}</p>
                    <p className="text-sm text-slate-500">{lang === 'ar' ? 'إجمالي' : 'Total'}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-green-600">{enrollmentsData.enrolled || 0}</p>
                    <p className="text-sm text-green-600">{lang === 'ar' ? 'نشط' : 'Active'}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-blue-600">{enrollmentsData.completed || 0}</p>
                    <p className="text-sm text-blue-600">{lang === 'ar' ? 'مكتمل' : 'Completed'}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-red-600">{enrollmentsData.dropped || 0}</p>
                    <p className="text-sm text-red-600">{lang === 'ar' ? 'منسحب' : 'Dropped'}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Service Requests */}
            <Card>
              <CardHeader
                title={lang === 'ar' ? 'طلبات الخدمة' : 'Service Requests'}
                icon={Activity}
                iconColor="text-rose-600 bg-rose-50"
              />
              <CardBody>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-slate-800">{serviceRequestsData.total || 0}</p>
                    <p className="text-sm text-slate-500">{lang === 'ar' ? 'إجمالي' : 'Total'}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-yellow-600">{serviceRequestsData.pending || 0}</p>
                    <p className="text-sm text-yellow-600">{lang === 'ar' ? 'معلق' : 'Pending'}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-green-600">{serviceRequestsData.completed || 0}</p>
                    <p className="text-sm text-green-600">{lang === 'ar' ? 'مكتمل' : 'Done'}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Today's Stats */}
        <Card>
          <CardHeader
            title={lang === 'ar' ? 'إحصائيات اليوم' : "Today's Statistics"}
            icon={Calendar}
            iconColor="text-cyan-600 bg-cyan-50"
          />
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                  <span className="text-xs sm:text-sm text-emerald-700">{lang === 'ar' ? 'طلبات اليوم' : "Today's Apps"}</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-emerald-700">{admissionsData.today || 0}</p>
              </div>
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                  <span className="text-xs sm:text-sm text-blue-700">{lang === 'ar' ? 'هذا الأسبوع' : 'This Week'}</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-blue-700">{admissionsData.this_week || 0}</p>
              </div>
              <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                  <span className="text-xs sm:text-sm text-purple-700">{lang === 'ar' ? 'طلبات معلقة' : 'Pending'}</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-purple-700">{serviceRequestsData.in_progress || 0}</p>
              </div>
              <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                  <span className="text-xs sm:text-sm text-orange-700">{lang === 'ar' ? 'نسبة القبول' : 'Approval'}</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-orange-700">
                  {admissionsData.total > 0 ? Math.round((admissionsData.approved / admissionsData.total) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader title={t.announcements[lang]} icon={Bell} iconColor="text-red-600 bg-red-50" />
          <CardBody noPadding>
            <div className="divide-y divide-slate-100">
              {announcementsList.length > 0 ? announcementsList.map((ann: any) => (
                <div key={ann.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      ann.type === 'ACADEMIC' ? 'bg-blue-500' : ann.type === 'FINANCIAL' ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{ann.title}</h4>
                      <p className="text-sm text-slate-600">{ann.content}</p>
                      <p className="text-xs text-slate-400 mt-1">{ann.date}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-500">
                  {lang === 'ar' ? 'لا توجد إعلانات' : 'No announcements'}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  // Lecturer Dashboard
  const renderLecturerDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t.welcome[lang]}, {student.name}</h1>
          <p className="text-slate-500">{lang === 'ar' ? 'Ø¥Ù„ÙŠÙƒ Ù…Ù„Ø®Øµ Ù…Ø³Ø§Ù‚Ø§ØªÙƒ' : 'Here\'s your course summary'}</p>
        </div>
        <Button icon={BookOpen} onClick={() => navigate('/lecturer')}>
          {t.manageGrades[lang]}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title={t.lecturerCourses[lang]}
          value={courses.length.toString() || '--'}
          icon={BookOpen}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          title={t.totalStudents[lang]}
          value={dashboardStats?.totalStudentsInCourses?.toString() || '--'}
          subtitle={lang === 'ar' ? 'في جميع المساقات' : 'Across all courses'}
          icon={Users}
          iconColor="text-purple-600 bg-purple-50"
        />
        <StatCard
          title={t.assignmentsToGrade[lang]}
          value={dashboardStats?.pendingAssignments?.toString() || '--'}
          subtitle={lang === 'ar' ? 'بانتظار التقييم' : 'Pending review'}
          icon={FileText}
          iconColor="text-orange-600 bg-orange-50"
        />
      </div>

      {/* Course Performance */}
      <Card>
        <CardHeader
          title={t.coursePerf[lang]}
          icon={BarChart2}
          iconColor="text-green-600 bg-green-50"
        />
        <CardBody>
          {attendanceData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} name={t.present[lang]} />
                  <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name={t.absent[lang]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400">
              {lang === 'ar' ? 'لا توجد بيانات' : 'No data available'}
            </div>
          )}
        </CardBody>
      </Card>

      {/* My Courses */}
      <Card>
        <CardHeader
          title={t.lecturerCourses[lang]}
          icon={BookOpen}
          iconColor="text-indigo-600 bg-indigo-50"
        />
        <CardBody noPadding>
          <div className="divide-y divide-slate-100">
            {courses.length > 0 ? courses.map((course) => (
              <div key={course.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {(course.code || '').slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{lang === 'en' ? course.name_en : course.name_ar}</h4>
                    <p className="text-sm text-slate-500">{course.schedule}</p>
                  </div>
                </div>
                <div className="text-end">
                  <p className="font-semibold text-slate-800">{course.enrolled || 0}/{course.capacity || '--'}</p>
                  <p className="text-xs text-slate-500">{lang === 'ar' ? 'طالب مسجل' : 'Students'}</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500">
                {lang === 'ar' ? 'لا توجد مساقات' : 'No courses assigned'}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Check if we have dynamic dashboard configuration
  const hasDynamicDashboard = configState.dashboard?.widgets && configState.dashboard.widgets.length > 0;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Dynamic Dashboard from Backend (if configured) */}
      {hasDynamicDashboard && (
        <div className="mb-6">
          <DynamicDashboard lang={lang} role={role} />
        </div>
      )}

      {/* Fallback to Static Dashboard */}
      {!hasDynamicDashboard && (
        <>
          {role === UserRole.STUDENT && renderStudentDashboard()}
          {(role === UserRole.ADMIN || role === UserRole.FINANCE) && renderAdminDashboard()}
          {role === UserRole.STUDENT_AFFAIRS && renderStudentAffairsDashboard()}
          {role === UserRole.LECTURER && renderLecturerDashboard()}
        </>
      )}
    </div>
  );
};

export default Dashboard;







