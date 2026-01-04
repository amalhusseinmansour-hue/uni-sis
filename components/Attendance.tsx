import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  BarChart3,
  PieChart,
} from 'lucide-react';
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

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface AttendanceRecord {
  id: string;
  date: string;
  courseId: string;
  courseName: string;
  courseNameAr: string;
  status: AttendanceStatus;
  time: string;
  duration: number; // in minutes
  instructor: string;
  notes?: string;
}

interface CourseAttendance {
  courseId: string;
  courseName: string;
  courseNameAr: string;
  totalClasses: number;
  attended: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
  lastAttendance: string;
  instructor: string;
}

interface AttendanceProps {
  lang: 'en' | 'ar';
  records: AttendanceRecord[];
  courseAttendance: CourseAttendance[];
  onExport?: () => void;
}

const t = {
  attendance: { en: 'Attendance', ar: 'الحضور' },
  overview: { en: 'Overview', ar: 'نظرة عامة' },
  byCourse: { en: 'By Course', ar: 'حسب المقرر' },
  history: { en: 'History', ar: 'السجل' },
  totalClasses: { en: 'Total Classes', ar: 'إجمالي الحصص' },
  attended: { en: 'Attended', ar: 'حضور' },
  absent: { en: 'Absent', ar: 'غياب' },
  late: { en: 'Late', ar: 'تأخر' },
  excused: { en: 'Excused', ar: 'عذر' },
  attendanceRate: { en: 'Attendance Rate', ar: 'نسبة الحضور' },
  present: { en: 'Present', ar: 'حاضر' },
  thisMonth: { en: 'This Month', ar: 'هذا الشهر' },
  thisSemester: { en: 'This Semester', ar: 'هذا الفصل' },
  trend: { en: 'Trend', ar: 'الاتجاه' },
  filter: { en: 'Filter', ar: 'تصفية' },
  export: { en: 'Export', ar: 'تصدير' },
  all: { en: 'All', ar: 'الكل' },
  course: { en: 'Course', ar: 'المقرر' },
  date: { en: 'Date', ar: 'التاريخ' },
  time: { en: 'Time', ar: 'الوقت' },
  status: { en: 'Status', ar: 'الحالة' },
  instructor: { en: 'Instructor', ar: 'المحاضر' },
  noRecords: { en: 'No attendance records found', ar: 'لا توجد سجلات حضور' },
  attendanceSummary: { en: 'Attendance Summary', ar: 'ملخص الحضور' },
  weeklyAttendance: { en: 'Weekly Attendance', ar: 'الحضور الأسبوعي' },
  monthlyTrend: { en: 'Monthly Trend', ar: 'الاتجاه الشهري' },
  warningThreshold: { en: 'Warning: Below 75% attendance', ar: 'تحذير: الحضور أقل من 75%' },
  criticalThreshold: { en: 'Critical: Below 60% attendance', ar: 'حرج: الحضور أقل من 60%' },
  goodStanding: { en: 'Good Standing', ar: 'وضع جيد' },
  classesRemaining: { en: 'Classes Remaining', ar: 'الحصص المتبقية' },
  lastUpdated: { en: 'Last Updated', ar: 'آخر تحديث' },
};

const statusConfig: Record<AttendanceStatus, { color: string; bgColor: string; icon: typeof CheckCircle }> = {
  present: { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
  absent: { color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle },
  late: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
  excused: { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: AlertCircle },
};

const COLORS = ['#22c55e', '#ef4444', '#eab308', '#3b82f6'];

const Attendance: React.FC<AttendanceProps> = ({ lang, records, courseAttendance, onExport }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'byCourse' | 'history'>('overview');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isRTL = lang === 'ar';

  // Calculate overall statistics
  const totalStats = courseAttendance.reduce(
    (acc, course) => ({
      totalClasses: acc.totalClasses + course.totalClasses,
      attended: acc.attended + course.attended,
      absent: acc.absent + course.absent,
      late: acc.late + course.late,
      excused: acc.excused + course.excused,
    }),
    { totalClasses: 0, attended: 0, absent: 0, late: 0, excused: 0 }
  );

  const overallPercentage = totalStats.totalClasses > 0
    ? Math.round((totalStats.attended / totalStats.totalClasses) * 100)
    : 0;

  // Filter records
  const filteredRecords = records.filter((record) => {
    if (selectedCourse !== 'all' && record.courseId !== selectedCourse) return false;
    if (selectedStatus !== 'all' && record.status !== selectedStatus) return false;
    return true;
  });

  // Weekly attendance data
  const weeklyData = [
    { day: lang === 'ar' ? 'أحد' : 'Sun', present: 2, absent: 0, late: 1 },
    { day: lang === 'ar' ? 'إثنين' : 'Mon', present: 3, absent: 0, late: 0 },
    { day: lang === 'ar' ? 'ثلاثاء' : 'Tue', present: 2, absent: 1, late: 0 },
    { day: lang === 'ar' ? 'أربعاء' : 'Wed', present: 3, absent: 0, late: 0 },
    { day: lang === 'ar' ? 'خميس' : 'Thu', present: 2, absent: 0, late: 1 },
  ];

  // Monthly trend data
  const monthlyTrendData = [
    { month: lang === 'ar' ? 'سبتمبر' : 'Sep', rate: 92 },
    { month: lang === 'ar' ? 'أكتوبر' : 'Oct', rate: 88 },
    { month: lang === 'ar' ? 'نوفمبر' : 'Nov', rate: 85 },
    { month: lang === 'ar' ? 'ديسمبر' : 'Dec', rate: 90 },
  ];

  // Pie chart data
  const pieData = [
    { name: t.present[lang], value: totalStats.attended, color: '#22c55e' },
    { name: t.absent[lang], value: totalStats.absent, color: '#ef4444' },
    { name: t.late[lang], value: totalStats.late, color: '#eab308' },
    { name: t.excused[lang], value: totalStats.excused, color: '#3b82f6' },
  ];

  const getStatusLabel = (status: AttendanceStatus) => {
    return t[status][lang];
  };

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 75) return { label: t.goodStanding[lang], color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 60) return { label: t.warningThreshold[lang], color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: t.criticalThreshold[lang], color: 'text-red-600', bg: 'bg-red-100' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (lang === 'ar') {
      return date.toLocaleDateString('ar-EG');
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calendar view helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getRecordsForDate = (date: Date | null) => {
    if (!date) return [];
    return records.filter((r) => new Date(r.date).toDateString() === date.toDateString());
  };

  const monthNames = lang === 'ar'
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const daysShort = lang === 'ar'
    ? ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const tabs = [
    { id: 'overview', label: t.overview[lang], icon: PieChart },
    { id: 'byCourse', label: t.byCourse[lang], icon: BookOpen },
    { id: 'history', label: t.history[lang], icon: Calendar },
  ] as const;

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">{t.attendance[lang]}</h1>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          {t.export[lang]}
        </button>
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t.totalClasses[lang]}</p>
                  <p className="text-xl font-bold text-slate-800">{totalStats.totalClasses}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t.attended[lang]}</p>
                  <p className="text-xl font-bold text-green-600">{totalStats.attended}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t.absent[lang]}</p>
                  <p className="text-xl font-bold text-red-600">{totalStats.absent}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t.late[lang]}</p>
                  <p className="text-xl font-bold text-yellow-600">{totalStats.late}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t.excused[lang]}</p>
                  <p className="text-xl font-bold text-blue-600">{totalStats.excused}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Rate Circle */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">{t.attendanceRate[lang]}</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="12"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke={overallPercentage >= 75 ? '#22c55e' : overallPercentage >= 60 ? '#eab308' : '#ef4444'}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${(overallPercentage / 100) * 553} 553`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-slate-800">{overallPercentage}%</span>
                    <span className="text-sm text-slate-500">{t.attendanceRate[lang]}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                {(() => {
                  const status = getAttendanceStatus(overallPercentage);
                  return (
                    <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${status.bg}`}>
                      {overallPercentage >= 75 ? (
                        <TrendingUp className={`w-4 h-4 ${status.color}`} />
                      ) : (
                        <TrendingDown className={`w-4 h-4 ${status.color}`} />
                      )}
                      <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">{t.attendanceSummary[lang]}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly & Monthly Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">{t.weeklyAttendance[lang]}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" name={t.present[lang]} fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" name={t.absent[lang]} fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" name={t.late[lang]} fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">{t.monthlyTrend[lang]}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    name={t.attendanceRate[lang]}
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calendar View */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">{t.thisMonth[lang]}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-medium">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {daysShort.map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-slate-400 py-2">
                  {day}
                </div>
              ))}
              {getDaysInMonth(currentMonth).map((date, index) => {
                const dayRecords = getRecordsForDate(date);
                const hasPresent = dayRecords.some((r) => r.status === 'present');
                const hasAbsent = dayRecords.some((r) => r.status === 'absent');
                const hasLate = dayRecords.some((r) => r.status === 'late');
                const isToday = date && date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={`
                      aspect-square p-1 rounded-lg text-center relative
                      ${!date ? 'invisible' : ''}
                      ${isToday ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-slate-50'}
                    `}
                  >
                    {date && (
                      <>
                        <span className={`text-sm ${isToday ? 'font-bold text-blue-700' : 'text-slate-700'}`}>
                          {date.getDate()}
                        </span>
                        {dayRecords.length > 0 && (
                          <div className="flex justify-center gap-0.5 mt-1">
                            {hasPresent && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                            {hasAbsent && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                            {hasLate && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-slate-600">{t.present[lang]}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-slate-600">{t.absent[lang]}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs text-slate-600">{t.late[lang]}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* By Course Tab */}
      {activeTab === 'byCourse' && (
        <div className="space-y-4">
          {courseAttendance.map((course) => {
            const status = getAttendanceStatus(course.percentage);
            return (
              <div
                key={course.courseId}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">
                      {lang === 'ar' ? course.courseNameAr : course.courseName}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {t.instructor[lang]}: {course.instructor}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">{t.attended[lang]}</p>
                      <p className="font-bold text-green-600">{course.attended}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">{t.absent[lang]}</p>
                      <p className="font-bold text-red-600">{course.absent}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">{t.late[lang]}</p>
                      <p className="font-bold text-yellow-600">{course.late}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">{t.excused[lang]}</p>
                      <p className="font-bold text-blue-600">{course.excused}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">{t.attendanceRate[lang]}</span>
                        <span className={`font-bold ${status.color}`}>{course.percentage}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            course.percentage >= 75
                              ? 'bg-green-500'
                              : course.percentage >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${course.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {course.percentage < 75 && (
                  <div className={`mt-4 px-3 py-2 rounded-lg ${status.bg}`}>
                    <p className={`text-sm ${status.color}`}>
                      {course.percentage < 60 ? t.criticalThreshold[lang] : t.warningThreshold[lang]}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">{t.filter[lang]}:</span>
              </div>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{t.all[lang]} {t.course[lang]}</option>
                {courseAttendance.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {lang === 'ar' ? course.courseNameAr : course.courseName}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{t.all[lang]} {t.status[lang]}</option>
                <option value="present">{t.present[lang]}</option>
                <option value="absent">{t.absent[lang]}</option>
                <option value="late">{t.late[lang]}</option>
                <option value="excused">{t.excused[lang]}</option>
              </select>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-start text-xs font-medium text-slate-500 uppercase">
                      {t.date[lang]}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-slate-500 uppercase">
                      {t.course[lang]}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-slate-500 uppercase">
                      {t.time[lang]}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-slate-500 uppercase">
                      {t.instructor[lang]}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-slate-500 uppercase">
                      {t.status[lang]}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        {t.noRecords[lang]}
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => {
                      const config = statusConfig[record.status];
                      const Icon = config.icon;
                      return (
                        <tr key={record.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-700">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-800">
                            {lang === 'ar' ? record.courseNameAr : record.courseName}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{record.time}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{record.instructor}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
                            >
                              <Icon className="w-3 h-3" />
                              {getStatusLabel(record.status)}
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
    </div>
  );
};

export default Attendance;
