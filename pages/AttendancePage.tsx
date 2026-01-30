import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp,
  Download, Filter, ChevronDown, User, BookOpen, AlertTriangle,
  CalendarDays, Percent, FileText, Eye, Info, Search, Users
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { studentsAPI } from '../api/students';
import { attendanceAPI } from '../api/attendance';
import { Card, CardHeader, CardBody, StatCard, GradientCard } from '../components/ui/Card';
import Button, { IconButton } from '../components/ui/Button';
import Badge, { StatusBadge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { Select, SearchInput } from '../components/ui/Input';
import { exportToPDF, exportToCSV, formatTableHTML } from '../utils/exportUtils';
import { UserRole } from '../types';

interface AttendancePageProps {
  lang: 'en' | 'ar';
  role?: UserRole;
}

const AttendancePage: React.FC<AttendancePageProps> = ({ lang, role }) => {
  const isStaff = role === UserRole.STUDENT_AFFAIRS || role === UserRole.ADMIN;
  const t = TRANSLATIONS;
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState({
    totalClasses: 0,
    attended: 0,
    absent: 0,
    excused: 0,
    rate: 0,
  });
  const [courseAttendance, setCourseAttendance] = useState<any[]>([]);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);

  // Staff-specific state
  const [studentSearch, setStudentSearch] = useState('');
  const [studentList, setStudentList] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allStudentsStats, setAllStudentsStats] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    lowAttendanceCount: 0,
    perfectAttendanceCount: 0,
  });

  // Fetch attendance data from LMS and API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch student profile and enrollments from regular API
        // If staff viewing a student, use selected student ID
        let studentId: any;
        if (isStaff && selectedStudent) {
          studentId = selectedStudent.id;
        } else {
          const profileRes = await studentsAPI.getMyProfile().catch(() => null);
          studentId = profileRes?.student?.id || profileRes?.id;
        }

        let apiRecords: any[] = [];
        let enrollments: any[] = [];

        if (studentId) {
          // Fetch enrollments with attendance
          const enrollmentsRes = await studentsAPI.getEnrollments(studentId).catch(() => []);
          enrollments = enrollmentsRes.data || enrollmentsRes || [];

          // Collect API attendance records
          enrollments.forEach((enrollment: any) => {
            const records = enrollment.attendance_records || [];
            records.forEach((record: any) => {
              apiRecords.push({
                ...record,
                course: enrollment.course?.code || enrollment.courseCode,
                title: lang === 'ar'
                  ? (enrollment.course?.name_ar || enrollment.courseName)
                  : (enrollment.course?.name_en || enrollment.courseName),
              });
            });
          });
        }

        // Use API records
        const allRecords = [...apiRecords];
        const uniqueRecords = allRecords.filter((record, index, self) =>
          index === self.findIndex(r =>
            r.date === record.date && r.course === record.course
          )
        );

        // Sort by date and take recent 10
        uniqueRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentRecords(uniqueRecords.slice(0, 10));

        // Calculate course-wise attendance from combined records
        const courseMap = new Map<string, { code: string; name: string; total: number; attended: number; absent: number; excused: number }>();

        uniqueRecords.forEach(record => {
          const code = record.course;
          if (!courseMap.has(code)) {
            courseMap.set(code, {
              code,
              name: record.title,
              total: 0,
              attended: 0,
              absent: 0,
              excused: 0,
            });
          }
          const data = courseMap.get(code)!;
          data.total++;
          if (record.status === 'present') data.attended++;
          else if (record.status === 'excused') data.excused++;
          else data.absent++;
        });

        // Also add course data from enrollments if not in records
        // Use the attendance percentage field directly from enrollments
        if (enrollments.length > 0) {
          enrollments.forEach((enrollment: any) => {
            const code = enrollment.course?.code || enrollment.courseCode;
            if (!courseMap.has(code)) {
              const attendancePercent = parseFloat(enrollment.attendance) || 0;
              // Convert percentage to estimated present/absent counts
              const estimatedTotal = 100;
              const estimatedPresent = Math.round(attendancePercent);
              const estimatedAbsent = estimatedTotal - estimatedPresent;

              courseMap.set(code, {
                code,
                name: lang === 'ar'
                  ? (enrollment.course?.name_ar || enrollment.courseName)
                  : (enrollment.course?.name_en || enrollment.courseName),
                total: estimatedTotal,
                attended: estimatedPresent,
                absent: estimatedAbsent,
                excused: 0,
              });
            }
          });
        }

        const courseData = Array.from(courseMap.values()).map(c => ({
          ...c,
          id: c.code,
          rate: c.total > 0 ? Math.round((c.attended / c.total) * 100) : (parseFloat(String(c.attended)) || 0),
        }));

        setCourseAttendance(courseData);

        // Calculate overall stats
        let totalClasses = 0;
        let totalAttended = 0;
        let totalAbsent = 0;
        let totalExcused = 0;

        courseData.forEach(course => {
          totalClasses += course.total;
          totalAttended += course.attended;
          totalAbsent += course.absent;
          totalExcused += course.excused;
        });

        const rate = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

        setOverallStats({
          totalClasses: totalClasses,
          attended: totalAttended,
          absent: totalAbsent,
          excused: totalExcused,
          rate: rate,
        });

        // Calculate monthly trend
        const monthMap = new Map<string, { total: number; attended: number }>();
        uniqueRecords.forEach(record => {
          const month = new Date(record.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' });
          if (!monthMap.has(month)) {
            monthMap.set(month, { total: 0, attended: 0 });
          }
          const data = monthMap.get(month)!;
          data.total++;
          if (record.status === 'present') data.attended++;
        });

        const trend = Array.from(monthMap.entries()).map(([month, data]) => ({
          month,
          rate: data.total > 0 ? Math.round((data.attended / data.total) * 100) : 0,
        }));
        setMonthlyTrend(trend);

      } catch {
        // Attendance data fetch failed - handled gracefully
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lang, selectedStudent]);

  // Staff: Fetch all students stats
  useEffect(() => {
    const fetchStaffData = async () => {
      if (!isStaff) return;
      try {
        const studentsRes = await studentsAPI.getAll({ per_page: 100 });
        const students = studentsRes.data || studentsRes || [];
        setStudentList(students);

        // Calculate stats
        let totalAttendance = 0;
        let lowAttendance = 0;
        let perfectAttendance = 0;

        students.forEach((s: any) => {
          const rate = s.attendance_rate || 0;
          totalAttendance += rate;
          if (rate > 0 && rate < 75) lowAttendance++;
          if (rate >= 95) perfectAttendance++;
        });

        setAllStudentsStats({
          totalStudents: students.length,
          averageAttendance: students.length > 0 ? Math.round(totalAttendance / students.length) : 0,
          lowAttendanceCount: lowAttendance,
          perfectAttendanceCount: perfectAttendance,
        });
      } catch {
        // Staff data fetch failed - non-critical
      }
    };
    fetchStaffData();
  }, [isStaff]);

  // Staff: Search students
  useEffect(() => {
    const searchStudents = async () => {
      if (!isStaff || !studentSearch.trim()) {
        return;
      }
      setSearchLoading(true);
      try {
        const res = await studentsAPI.getAll({ search: studentSearch, per_page: 20 });
        setStudentList(res.data || res || []);
      } catch {
        // Search failed - show empty results
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(searchStudents, 300);
    return () => clearTimeout(debounce);
  }, [studentSearch, isStaff]);

  // Use only real API data - no mock fallback
  const displayCourseAttendance = courseAttendance;
  const displayMonthlyTrend = monthlyTrend;

  // Attendance breakdown for pie chart
  const attendanceBreakdown = [
    { name: lang === 'ar' ? 'حاضر' : 'Present', value: overallStats.attended, color: '#22c55e' },
    { name: lang === 'ar' ? 'غائب' : 'Absent', value: overallStats.absent, color: '#ef4444' },
    { name: lang === 'ar' ? 'معذور' : 'Excused', value: overallStats.excused, color: '#f59e0b' },
  ];

  // Use only real API data - no mock fallback
  const displayRecentRecords = recentRecords;

  // Weekly attendance - calculated from real data
  const weeklyData = displayCourseAttendance.length > 0 ? [] : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'excused':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present':
        return lang === 'ar' ? 'حاضر' : 'Present';
      case 'absent':
        return lang === 'ar' ? 'غائب' : 'Absent';
      case 'excused':
        return lang === 'ar' ? 'معذور' : 'Excused';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Staff Header Banner */}
      {isStaff && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                {lang === 'ar' ? 'إدارة الحضور' : 'Attendance Management'}
              </h1>
              <p className="text-emerald-100 mt-1 text-sm sm:text-base">
                {lang === 'ar' ? 'متابعة حضور الطلاب وإدارة السجلات' : 'Monitor student attendance and manage records'}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-white/10 rounded-lg p-2 sm:p-3 text-center">
                <p className="text-xl sm:text-2xl font-bold">{allStudentsStats.totalStudents}</p>
                <p className="text-[10px] sm:text-xs text-emerald-100">{lang === 'ar' ? 'إجمالي الطلاب' : 'Total Students'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2 sm:p-3 text-center">
                <p className="text-xl sm:text-2xl font-bold">{allStudentsStats.averageAttendance}%</p>
                <p className="text-[10px] sm:text-xs text-emerald-100">{lang === 'ar' ? 'متوسط الحضور' : 'Avg Attendance'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2 sm:p-3 text-center">
                <p className="text-xl sm:text-2xl font-bold text-red-300">{allStudentsStats.lowAttendanceCount}</p>
                <p className="text-[10px] sm:text-xs text-emerald-100">{lang === 'ar' ? 'حضور منخفض' : 'Low'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2 sm:p-3 text-center">
                <p className="text-xl sm:text-2xl font-bold text-green-300">{allStudentsStats.perfectAttendanceCount}</p>
                <p className="text-[10px] sm:text-xs text-emerald-100">{lang === 'ar' ? 'ممتاز' : 'Perfect'}</p>
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
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                {lang === 'ar' ? 'مسح' : 'Clear'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Header - Student View */}
      {!isStaff && (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {lang === 'ar' ? 'سجل الحضور' : 'Attendance Record'}
          </h1>
          <p className="text-slate-500">
            {lang === 'ar' ? 'تتبع حضورك في المحاضرات والمعامل' : 'Track your class and lab attendance'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" icon={FileText} onClick={() => navigate('/requests')}>
            {lang === 'ar' ? 'طلب عذر' : 'Request Excuse'}
          </Button>
        </div>
      </div>
      )}

      {/* Overall Stats Card */}
      <GradientCard gradient="from-emerald-600 via-green-600 to-teal-600" className="relative overflow-hidden">
        <div className="absolute top-0 end-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="md:col-span-1 text-center md:text-start">
            <p className="text-green-100 text-xs sm:text-sm mb-1 sm:mb-2">{lang === 'ar' ? 'نسبة الحضور الكلية' : 'Overall Attendance Rate'}</p>
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <h2 className="text-4xl sm:text-5xl font-bold">{overallStats.rate}%</h2>
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-200" />
            </div>
            <p className="text-green-100 text-xs sm:text-sm mt-1 sm:mt-2">
              {lang === 'ar' ? `${overallStats.attended} من ${overallStats.totalClasses} محاضرة` : `${overallStats.attended} of ${overallStats.totalClasses} classes`}
            </p>
          </div>

          <div className="md:col-span-3 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-white/10 rounded-lg sm:rounded-xl p-2.5 sm:p-4 text-center">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-200 mx-auto mb-1 sm:mb-2" />
              <p className="text-2xl sm:text-3xl font-bold">{overallStats.attended}</p>
              <p className="text-green-100 text-xs sm:text-sm">{lang === 'ar' ? 'حضور' : 'Present'}</p>
            </div>
            <div className="bg-white/10 rounded-lg sm:rounded-xl p-2.5 sm:p-4 text-center">
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-300 mx-auto mb-1 sm:mb-2" />
              <p className="text-2xl sm:text-3xl font-bold">{overallStats.absent}</p>
              <p className="text-green-100 text-xs sm:text-sm">{lang === 'ar' ? 'غياب' : 'Absent'}</p>
            </div>
            <div className="bg-white/10 rounded-lg sm:rounded-xl p-2.5 sm:p-4 text-center">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 mx-auto mb-1 sm:mb-2" />
              <p className="text-2xl sm:text-3xl font-bold">{overallStats.excused}</p>
              <p className="text-green-100 text-xs sm:text-sm">{lang === 'ar' ? 'معذور' : 'Excused'}</p>
            </div>
          </div>
        </div>
      </GradientCard>

      {/* Warning Alert (if attendance is low) */}
      {overallStats.rate < 85 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800">
              {lang === 'ar' ? 'تحذير: نسبة حضور منخفضة' : 'Warning: Low Attendance Rate'}
            </h4>
            <p className="text-sm text-red-600 mt-1">
              {lang === 'ar'
                ? 'نسبة حضورك أقل من 85%. قد يؤثر ذلك على أهليتك لدخول الاختبارات.'
                : 'Your attendance rate is below 85%. This may affect your exam eligibility.'}
            </p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Monthly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader
            title={lang === 'ar' ? 'تطور نسبة الحضور' : 'Attendance Trend'}
            icon={TrendingUp}
            iconColor="text-blue-600 bg-blue-50"
          />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                <AreaChart data={displayMonthlyTrend}>
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    formatter={(value: number) => [`${value}%`, lang === 'ar' ? 'نسبة الحضور' : 'Attendance Rate']}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={3} fill="url(#attendanceGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader
            title={lang === 'ar' ? 'توزيع الحضور' : 'Attendance Distribution'}
            icon={Percent}
            iconColor="text-purple-600 bg-purple-50"
          />
          <CardBody>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                <PieChart>
                  <Pie
                    data={attendanceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {attendanceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {attendanceBreakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Course-wise Attendance */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'الحضور حسب المقرر' : 'Attendance by Course'}
          icon={BookOpen}
          iconColor="text-indigo-600 bg-indigo-50"
          action={
            <Select
              options={[
                { value: 'all', label: lang === 'ar' ? 'جميع المقررات' : 'All Courses' },
                ...displayCourseAttendance.map(c => ({ value: c.code, label: c.code }))
              ]}
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              fullWidth={false}
              className="w-40"
            />
          }
        />
        <CardBody noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'المقرر' : 'Course'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase text-center`}>
                    {lang === 'ar' ? 'إجمالي المحاضرات' : 'Total Classes'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase text-center`}>
                    {lang === 'ar' ? 'حضور' : 'Present'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase text-center`}>
                    {lang === 'ar' ? 'غياب' : 'Absent'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase text-center`}>
                    {lang === 'ar' ? 'معذور' : 'Excused'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-start' : 'text-end'}`}>
                    {lang === 'ar' ? 'النسبة' : 'Rate'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayCourseAttendance
                  .filter((course: any) => selectedCourse === 'all' || course.code === selectedCourse)
                  .map((course: any) => (
                  <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                          {course.code.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{course.name}</p>
                          <p className="text-xs text-slate-500">{course.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center text-slate-600">{course.total}</td>
                    <td className="p-4 text-center">
                      <span className="text-green-600 font-medium">{course.attended}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-red-600 font-medium">{course.absent}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-yellow-600 font-medium">{course.excused}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-24 bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-full rounded-full ${
                              course.rate >= 90 ? 'bg-green-500' :
                              course.rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${course.rate}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-bold ${
                          course.rate >= 90 ? 'text-green-600' :
                          course.rate >= 75 ? 'text-yellow-600' : 'text-red-600'
                        }`}>{course.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Recent Attendance Records */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'سجل الحضور الأخير' : 'Recent Attendance'}
          icon={CalendarDays}
          iconColor="text-green-600 bg-green-50"
          action={
            <Select
              options={[
                { value: 'all', label: lang === 'ar' ? 'جميع الأشهر' : 'All Months' },
                { value: 'nov', label: lang === 'ar' ? 'نوفمبر' : 'November' },
                { value: 'oct', label: lang === 'ar' ? 'أكتوبر' : 'October' },
                { value: 'sep', label: lang === 'ar' ? 'سبتمبر' : 'September' },
              ]}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              fullWidth={false}
              className="w-32"
            />
          }
        />
        <CardBody noPadding>
          <div className="divide-y divide-slate-100">
            {displayRecentRecords
              .filter((record: any) => {
                if (selectedMonth === 'all') return true;
                const month = new Date(record.date).getMonth();
                if (selectedMonth === 'nov') return month === 10;
                if (selectedMonth === 'oct') return month === 9;
                if (selectedMonth === 'sep') return month === 8;
                return true;
              })
              .map((record: any) => (
              <div
                key={record.id}
                className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedRecord(record);
                  setShowDetailsModal(true);
                }}
              >
                <div className="w-12 text-center">
                  <p className="text-lg font-bold text-slate-800">{new Date(record.date).getDate()}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(record.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' })}
                  </p>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono font-medium text-slate-600">
                      {record.course}
                    </span>
                    <h4 className="font-medium text-slate-800">{record.title}</h4>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {record.time}
                    </span>
                    {record.excuse && (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Info className="w-3 h-3" />
                        {record.excuse}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(record.status)}
                  <Badge variant={
                    record.status === 'present' ? 'success' :
                    record.status === 'absent' ? 'danger' : 'warning'
                  }>
                    {getStatusLabel(record.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={lang === 'ar' ? 'تفاصيل الحضور' : 'Attendance Details'}
        size="md"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              {getStatusIcon(selectedRecord.status)}
              <div>
                <h3 className="font-bold text-slate-800">{selectedRecord.title}</h3>
                <p className="text-sm text-slate-500">{selectedRecord.course}</p>
              </div>
              <Badge variant={
                selectedRecord.status === 'present' ? 'success' :
                selectedRecord.status === 'absent' ? 'danger' : 'warning'
              } className="ms-auto">
                {getStatusLabel(selectedRecord.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">{lang === 'ar' ? 'التاريخ' : 'Date'}</p>
                <p className="font-medium text-slate-800">{selectedRecord.date}</p>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">{lang === 'ar' ? 'الوقت' : 'Time'}</p>
                <p className="font-medium text-slate-800">{selectedRecord.time}</p>
              </div>
            </div>

            {selectedRecord.excuse && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-600 mb-1">{lang === 'ar' ? 'سبب العذر' : 'Excuse Reason'}</p>
                <p className="font-medium text-yellow-800">{selectedRecord.excuse}</p>
              </div>
            )}

            {selectedRecord.status === 'absent' && !selectedRecord.excuse && (
              <Button variant="primary" fullWidth icon={FileText} onClick={() => navigate('/requests')}>
                {lang === 'ar' ? 'تقديم طلب عذر' : 'Submit Excuse Request'}
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AttendancePage;
