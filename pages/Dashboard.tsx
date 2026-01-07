
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
import { TRANSLATIONS } from '../constants';
import { studentsAPI } from '../api/students';
import { financeAPI } from '../api/finance';
import { dashboardAPI } from '../api/dashboard';
import { scheduleAPI } from '../api/schedule';
import { notificationsAPI, reportsAPI } from '../api/index';
import Schedule, { MiniCalendar } from '../components/Schedule';
import { Card, CardHeader, CardBody, StatCard, GradientCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import DynamicDashboard from '../components/DynamicDashboard';
import { useConfig } from '../context/ConfigContext';
import { LMSSummaryCard } from '../components/LMSWidgets';
import useLMSData from '../hooks/useLMSData';
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleEvents, setScheduleEvents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [announcementsList, setAnnouncementsList] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [gpaHistory, setGpaHistory] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  // LMS Data hook
  const { data: lmsData } = useLMSData();

  // Fetch data from APIs
  useEffect(() => {
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
      console.warn('Dashboard loading timed out - showing with available data');
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
        } catch (e) {
          console.warn('Error fetching common data:', e);
        }

        if (role === UserRole.STUDENT) {
          try {
            // Fetch student profile with fallback
            let studentData = currentUser;
            try {
              const profileData = await studentsAPI.getMyProfile();
              studentData = profileData.student || profileData || currentUser;
            } catch (profileError) {
              console.warn('Could not fetch profile, using current user data:', profileError);
            }
            // Merge data and ensure name comes from student record (name_en) if available
            const mergedStudent = {
              ...currentUser,
              ...studentData,
              // Use student's name_en if available, otherwise fall back to user's name
              name: studentData.name_en || studentData.name || currentUser.student?.name_en || currentUser.name,
            };
            setStudent(mergedStudent);

            // Fetch student-specific data in parallel with individual error handling
            const [enrollmentsData, financialData, timetableData, gradesData] = await Promise.all([
              studentsAPI.getEnrollments(studentData.id || currentUser.id).catch(() => []),
              financeAPI.getStudentFinancials(studentData.id || currentUser.id).catch(() => null),
              scheduleAPI.getMyTimetable().catch(() => []),
              studentsAPI.getMyGrades().catch(() => null),
            ]);

            setEnrollments(enrollmentsData.data || enrollmentsData || []);
            setFinancials(financialData);

            // Transform timetable to schedule events
            const timetable = timetableData.data || timetableData || [];
            if (timetable.length > 0) {
              setScheduleEvents(scheduleAPI.transformToEvents(timetable, lang));
            }

            // Process grades for GPA history
            if (gradesData) {
              const grades = gradesData.data || gradesData || [];
              const semesterGrades = processGradesForChart(grades);
              setGpaHistory(semesterGrades);

              // Calculate attendance data from enrollments
              const attData = processAttendanceData(enrollmentsData.data || enrollmentsData || [], lang);
              setAttendanceData(attData);
            }

          } catch (apiError: any) {
            console.error('Error fetching student data:', apiError);
            setStudent(currentUser);
            setEnrollments([]);
            setFinancials(null);
          }
        } else if (role === UserRole.ADMIN || role === UserRole.FINANCE) {
          try {
            const [statsData, appsData] = await Promise.all([
              dashboardAPI.getStats().catch(() => null),
              import('../api/admissions').then(m => m.admissionsAPI.getAll({ per_page: 10 })).catch(() => []),
            ]);
            setDashboardStats(statsData);
            setApplications(appsData.data || appsData || []);
          } catch (e) {
            console.error('Error fetching admin stats:', e);
          }
          setStudent(currentUser);
        } else {
          setStudent(currentUser);
        }
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
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
  const processGradesForChart = (grades: any[]) => {
    const semesterMap = new Map<string, { total: number; points: number; credits: number }>();

    grades.forEach((grade: any) => {
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

  // Helper function to convert letter grade to points
  const gradeToPoints = (grade: string): number => {
    const gradeMap: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0,
    };
    return gradeMap[grade] || 0;
  };

  // Helper function to process attendance data
  const processAttendanceData = (enrollments: any[], lang: string) => {
    return enrollments.slice(0, 4).map((enrollment: any) => {
      const course = enrollment.course || {};
      const attendance = enrollment.attendance_records || [];
      const present = attendance.filter((a: any) => a.status === 'present').length;
      const total = attendance.length || 24; // Default to 24 if no data
      const rate = total > 0 ? Math.round((present / total) * 100) : 90;

      return {
        name: course.code || enrollment.courseCode || 'Course',
        present: rate,
        absent: 100 - rate,
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

  // Quick Actions
  const studentQuickActions = [
    { icon: BookMarked, label: lang === 'ar' ? 'تسجيل مساقات' : 'Register Courses', color: 'bg-blue-500', path: '/registration' },
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">{t.welcome[lang]}</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{student.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-blue-100">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                {student.major}
              </span>
              <span>â€¢</span>
              <span>{t.level[lang]} {student.level}</span>
              <span>â€¢</span>
              <span>{student.currentSemester || 'Spring 2024'}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={PlusCircle}
              onClick={() => navigate('/academic', { state: { tab: 'register' } })}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              {t.courseReg[lang]}
            </Button>
          </div>
        </div>
      </GradientCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{t.gpa[lang]}</p>
                <p className="text-3xl font-bold text-slate-800">{student.gpa?.toFixed(2) || '--'}</p>
                {gpaHistory.length >= 2 && (
                  <div className={`flex items-center gap-1 mt-2 text-sm ${
                    gpaHistory[gpaHistory.length - 1]?.gpa > gpaHistory[gpaHistory.length - 2]?.gpa
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {gpaHistory[gpaHistory.length - 1]?.gpa > gpaHistory[gpaHistory.length - 2]?.gpa
                      ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{((gpaHistory[gpaHistory.length - 1]?.gpa || 0) - (gpaHistory[gpaHistory.length - 2]?.gpa || 0)).toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl text-white">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
          </CardBody>
        </Card>

        <Card className="relative overflow-hidden">
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{t.credits[lang]}</p>
                <p className="text-3xl font-bold text-slate-800">{completedCredits || '--'}</p>
                <p className="text-sm text-slate-400 mt-2">/ {totalRequired} {lang === 'ar' ? 'ساعة' : 'credits'}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl text-white">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${completedCredits > 0 ? (completedCredits / totalRequired) * 100 : 0}%` }}></div>
          </CardBody>
        </Card>

        <Card className="relative overflow-hidden">
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{t.balance[lang]}</p>
                {financials ? (
                  <>
                    <p className={`text-3xl font-bold ${(financials.balance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(financials.balance || 0)}
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                      {(financials.balance || 0) < 0 ? (lang === 'ar' ? 'مستحق' : 'Due') : (lang === 'ar' ? 'رصيد' : 'Credit')}
                    </p>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-slate-400">--</p>
                )}
              </div>
              <div className={`p-3 rounded-xl text-white ${!financials || (financials.balance || 0) < 0 ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-gradient-to-br from-green-400 to-green-600'}`}>
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="relative overflow-hidden">
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{t.attendance[lang]}</p>
                {displayAttendanceData.length > 0 ? (
                  <>
                    <p className="text-3xl font-bold text-slate-800">
                      {Math.round(displayAttendanceData.reduce((sum, a) => sum + a.present, 0) / displayAttendanceData.length)}%
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'جيد' : 'Good'}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-slate-400">--</p>
                )}
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl text-white">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardBody className="p-4">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {[...studentQuickActions, ...extendedStudentActions].map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className={`p-2.5 ${action.color} rounded-xl text-white group-hover:scale-110 transition-transform shadow-sm`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-700 text-center line-clamp-2">{action.label}</span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="xl:col-span-2 space-y-6">
          {/* GPA Progress */}
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
                    <AreaChart data={gpaProgressData}>
                      <defs>
                        <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="semester" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis domain={[0, 4]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                      />
                      <Area type="monotone" dataKey="gpa" stroke="#3b82f6" strokeWidth={3} fill="url(#gpaGradient)" />
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

          {/* LMS Summary Widget */}
          <LMSSummaryCard
            lang={lang}
            courses={lmsData.courses}
            assignments={lmsData.assignments}
            attendance={lmsData.attendance}
            grades={lmsData.grades}
            isConnected={lmsData.isConnected}
          />
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
                    <p className="text-sm text-slate-500">{course.code} â€¢ {course.instructor || course.instructor_name}</p>
                  </div>
                </div>
                <div className="text-right">
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
                    <p className="text-xs text-slate-400">{ann.date} â€¢ {ann.sender}</p>
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
          value={dashboardStats?.totalStudents?.toString() || '--'}
          subtitle={dashboardStats?.newStudentsThisMonth ? `+${dashboardStats.newStudentsThisMonth} ${lang === 'ar' ? 'هذا الشهر' : 'this month'}` : ''}
          icon={Users}
          iconColor="text-blue-600 bg-blue-50"
          trend={dashboardStats?.studentGrowth ? { value: dashboardStats.studentGrowth, isPositive: dashboardStats.studentGrowth > 0 } : undefined}
        />
        <StatCard
          title={t.pendingApps[lang]}
          value={applications.filter(a => a.status === 'PENDING').length.toString()}
          subtitle={lang === 'ar' ? 'بحاجة للمراجعة' : 'Needs review'}
          icon={FileText}
          iconColor="text-orange-600 bg-orange-50"
        />
        <StatCard
          title={t.monthlyRevenue[lang]}
          value={dashboardStats?.monthlyRevenue ? formatCurrency(dashboardStats.monthlyRevenue) : '--'}
          subtitle={lang === 'ar' ? 'هذا الشهر' : 'This month'}
          icon={DollarSign}
          iconColor="text-green-600 bg-green-50"
          trend={dashboardStats?.revenueGrowth ? { value: dashboardStats.revenueGrowth, isPositive: dashboardStats.revenueGrowth > 0 } : undefined}
        />
        <StatCard
          title={lang === 'ar' ? 'المساقات النشطة' : 'Active Courses'}
          value={dashboardStats?.activeCourses?.toString() || courses.length.toString() || '--'}
          subtitle={dashboardStats?.currentSemester || ''}
          icon={BookOpen}
          iconColor="text-purple-600 bg-purple-50"
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
                <div className="text-right">
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
          {role === UserRole.LECTURER && renderLecturerDashboard()}
        </>
      )}
    </div>
  );
};

export default Dashboard;







